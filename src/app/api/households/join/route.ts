import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinByInviteSchema } from "@/lib/validators/invite";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = joinByInviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const invite = await prisma.householdInviteCode.findUnique({ where: { code: parsed.data.code } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "招待コードが無効です" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.householdMember.create({
      data: {
        householdId: invite.householdId,
        userId: parsed.data.userId,
        role: "FAMILY"
      }
    }),
    prisma.householdInviteCode.update({
      where: { id: invite.id },
      data: {
        usedAt: new Date(),
        usedBy: parsed.data.userId
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}
