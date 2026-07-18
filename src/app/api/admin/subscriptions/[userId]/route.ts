import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

const patchBodySchema = z.object({
  status: z
    .enum(["INCOMPLETE", "TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID"])
    .optional(),
  trialEndsAt: z.string().datetime().optional().nullable(),
  graceUntil: z.string().datetime().optional().nullable()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) return admin;

  const { userId } = await params;

  const body = await request.json();
  const parsed = patchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, trialEndsAt, graceUntil } = parsed.data;

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { id: true, status: true }
  });

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (trialEndsAt !== undefined) updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
  if (graceUntil !== undefined) updateData.graceUntil = graceUntil ? new Date(graceUntil) : null;

  const updated = await prisma.userSubscription.update({
    where: { userId },
    data: updateData
  });

  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await createAuditLog({
    userId: admin.id,
    action: AuditAction.ADMIN_SUBSCRIPTION_CHANGE,
    entityType: EntityType.SUBSCRIPTION,
    entityId: userId,
    changes: { before: { status: subscription.status }, after: updateData },
    ipAddress,
    userAgent
  });

  return NextResponse.json({ data: updated });
}
