import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { badRequest, notFound } from "@/lib/api-error";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";
import { z } from "zod";

const createMessageSchema = z.object({
  body: z.string().min(1, "メッセージ内容は必須です").max(2000, "メッセージは2000文字以内で入力してください")
});

export async function POST(
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
    const result = createMessageSchema.safeParse(json);
    if (!result.success) {
      return badRequest(result.error);
    }

    const { body } = result.data;

    // Use transaction to add message and set status to IN_PROGRESS (if not already closed or resolved)
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: admin.id,
          isAdmin: true,
          body
        }
      });

      // Update ticket status to IN_PROGRESS when admin replies
      await tx.ticket.update({
        where: { id },
        data: {
          status: "IN_PROGRESS",
          updatedAt: new Date()
        }
      });

      return msg;
    });

    // Write audit log
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await createAuditLog({
      userId: admin.id,
      action: AuditAction.ADMIN_TICKET_REPLY,
      entityType: EntityType.TICKET,
      entityId: id,
      changes: { replyLength: body.length },
      ipAddress,
      userAgent
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error: any) {
    return badRequest("不正なリクエスト形式です");
  }
}
