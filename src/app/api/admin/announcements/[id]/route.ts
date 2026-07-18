import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(5000).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.body !== undefined) updateData.body = parsed.data.body;
  if (parsed.data.isPublished !== undefined) {
    updateData.isPublished = parsed.data.isPublished;
    if (parsed.data.isPublished && !existing.publishedAt) {
      updateData.publishedAt = parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : new Date();
    }
  }
  if (parsed.data.expiresAt !== undefined) {
    updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  }

  const updated = await prisma.announcement.update({ where: { id }, data: updateData });

  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  await createAuditLog({
    userId: admin.id,
    action: AuditAction.ADMIN_ANNOUNCEMENT_UPDATE,
    entityType: EntityType.ANNOUNCEMENT,
    entityId: id,
    changes: updateData,
    ipAddress
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  await prisma.announcement.delete({ where: { id } });

  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  await createAuditLog({
    userId: admin.id,
    action: AuditAction.ADMIN_ANNOUNCEMENT_DELETE,
    entityType: EntityType.ANNOUNCEMENT,
    entityId: id,
    changes: { title: existing.title },
    ipAddress
  });

  return NextResponse.json({ data: { deleted: true } });
}
