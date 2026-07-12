import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signupInputSchema } from "@/lib/validators/auth";
import { badRequest, unauthorized } from "@/lib/api-error";
import { checkRateLimit, createRateLimitResponse, createRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, 'signup');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const body = await request.json();
  const parsed = signupInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return unauthorized(error.message);
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

  return NextResponse.json({ ok: true }, {
    headers: createRateLimitHeaders(rateLimitResult),
  });
}
