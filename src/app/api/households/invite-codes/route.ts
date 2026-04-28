import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInviteCodeSchema } from "@/lib/validators/invite";
import { calculateExpiry, generateInviteCode } from "@/lib/services/invite-code";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createInviteCodeSchema.partial({ householdId: true }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const householdId =
    parsed.data.householdId ??
    (
      await prisma.householdMember.findFirst({
        where: { userId: user.id },
        select: { householdId: true },
        orderBy: { createdAt: "asc" }
      })
    )?.householdId;

  if (!householdId) {
    return NextResponse.json({ error: "所属世帯が見つかりません" }, { status: 400 });
  }

  const code = generateInviteCode();
  const invite = await prisma.householdInviteCode.create({
    data: {
      householdId,
      createdBy: user.id,
      code,
      expiresAt: calculateExpiry(parsed.data.expiresInHours)
    }
  });

  return NextResponse.json({ data: invite }, { status: 201 });
}
