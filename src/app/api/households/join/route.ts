import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { joinByInviteSchema } from "@/lib/validators/invite";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = joinByInviteSchema.safeParse(body);

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

  const invite = await prisma.householdInviteCode.findUnique({ where: { code: parsed.data.code } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "招待コードが無効です" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.householdMember.create({
      data: {
        householdId: invite.householdId,
        userId: user.id,
        role: "FAMILY"
      }
    }),
    prisma.householdInviteCode.update({
      where: { id: invite.id },
      data: {
        usedAt: new Date(),
        usedBy: user.id
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}
