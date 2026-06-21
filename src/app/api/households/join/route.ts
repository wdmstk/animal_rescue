import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { joinByInviteSchema } from "@/lib/validators/invite";
import { badRequest, unauthorized } from "@/lib/api-error";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = joinByInviteSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  const invite = await prisma.householdInviteCode.findUnique({ where: { code: parsed.data.code } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return badRequest("招待コードが無効です");
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
