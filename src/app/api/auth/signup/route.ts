import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signupInputSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (data.user?.id) {
    const existingMembership = await prisma.householdMember.findFirst({
      where: { userId: data.user.id },
      select: { id: true }
    });

    if (!existingMembership) {
      const householdNameBase = (data.user.email ?? "My").split("@")[0] || "My";
      const household = await prisma.household.create({
        data: {
          name: `${householdNameBase} household`
        },
        select: { id: true }
      });

      await prisma.householdMember.create({
        data: {
          householdId: household.id,
          userId: data.user.id,
          role: "OWNER"
        }
      });
    }

    await prisma.userSubscription.upsert({
      where: { userId: data.user.id },
      create: {
        userId: data.user.id,
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      update: {
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        graceUntil: null
      }
    });
  }

  return NextResponse.json({ ok: true });
}
