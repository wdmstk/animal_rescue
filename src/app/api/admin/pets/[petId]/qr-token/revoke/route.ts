import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) return admin;

  const { petId } = await params;

  const token = await prisma.petEmergencyToken.findUnique({
    where: { petId },
    select: { id: true, isActive: true, token: true }
  });

  if (!token) {
    return NextResponse.json({ error: "QR token not found" }, { status: 404 });
  }

  await prisma.petEmergencyToken.update({
    where: { petId },
    data: { isActive: false }
  });

  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await createAuditLog({
    userId: admin.id,
    action: AuditAction.ADMIN_QR_REVOKE,
    entityType: EntityType.PET,
    entityId: petId,
    changes: { revokedToken: token.token, wasActive: token.isActive },
    ipAddress,
    userAgent
  });

  return NextResponse.json({ data: { revoked: true } });
}
