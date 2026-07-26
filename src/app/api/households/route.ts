import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { badRequest, unauthorized, forbidden } from "@/lib/api-error";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

export async function DELETE(_request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    select: { householdId: true, role: true },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) {
    return badRequest("所属世帯が見つかりません");
  }

  if (membership.role !== "OWNER") {
    return forbidden();
  }

  const householdId = membership.householdId;

  await prisma.$transaction(async (tx) => {
    // 関連するペットを全削除（Prisma Cascade により関連写真・記録・投薬等も削除される）
    await tx.pet.deleteMany({
      where: { householdId }
    });

    // メンバー全削除
    await tx.householdMember.deleteMany({
      where: { householdId }
    });

    // 世帯削除
    await tx.household.delete({
      where: { id: householdId }
    });
  });

  void createAuditLog({
    userId: user.id,
    action: AuditAction.HOUSEHOLD_DELETE,
    entityType: EntityType.HOUSEHOLD,
    entityId: householdId,
    changes: { deletedByUserId: user.id }
  });

  return new NextResponse(null, { status: 204 });
}
