import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unauthorized, apiError } from "@/lib/api-error";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  const result = await prisma.$transaction(async (tx) => {
    const membership = await tx.householdMember.findFirst({
      where: { userId: user.id },
      select: { id: true, householdId: true, userId: true },
      orderBy: { createdAt: "asc" }
    });

    if (!membership) {
      return { status: 400 as const, error: "所属世帯が見つかりません" };
    }

    const ownerCount = await tx.householdMember.count({
      where: {
        householdId: membership.householdId,
        role: "OWNER"
      }
    });

    if (ownerCount > 0) {
      return { status: 409 as const, error: "OWNERはすでに存在します" };
    }

    const oldestMember = await tx.householdMember.findFirst({
      where: { householdId: membership.householdId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, userId: true }
    });

    if (!oldestMember) {
      return { status: 404 as const, error: "メンバーが見つかりません" };
    }

    if (oldestMember.userId !== user.id) {
      return { status: 403 as const, error: "最古メンバーのみ復旧できます" };
    }

    const updated = await tx.householdMember.update({
      where: { id: membership.id },
      data: { role: "OWNER" },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true
      }
    });

    await tx.householdRoleRecoveryLog.create({
      data: {
        householdId: membership.householdId,
        recoveredUserId: membership.userId,
        triggeredByUserId: membership.userId,
        reason: "OWNER_MISSING"
      }
    });

    return { status: 200 as const, data: updated };
  });

  if (result.status !== 200) {
    return apiError(result.error, result.status);
  }

  return NextResponse.json({ data: result.data });
}
