import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { badRequest, notFound } from "@/lib/api-error";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id }
  });

  if (!ticket) {
    return notFound("Ticket");
  }

  try {
    const json = await request.json();
    const result = updateStatusSchema.safeParse(json);
    if (!result.success) {
      return badRequest(result.error);
    }

    const { status } = result.data;

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    // Write audit log
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await createAuditLog({
      userId: admin.id,
      action: AuditAction.ADMIN_TICKET_STATUS_CHANGE,
      entityType: EntityType.TICKET,
      entityId: id,
      changes: { oldStatus: ticket.status, newStatus: status },
      ipAddress,
      userAgent
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return badRequest("不正なリクエスト形式です");
  }
}
