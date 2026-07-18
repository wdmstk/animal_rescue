import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable()
});

export async function GET(request: Request) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(request.url);
  const onlyPublished = searchParams.get("published") === "true";

  const announcements = await prisma.announcement.findMany({
    where: onlyPublished ? { isPublished: true } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({ data: announcements });
}

export async function POST(request: Request) {
  const admin = await requireAdminUserForApi();
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, body: announcementBody, isPublished, publishedAt, expiresAt } = parsed.data;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body: announcementBody,
      isPublished,
      publishedAt: isPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: admin.id
    }
  });

  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  await createAuditLog({
    userId: admin.id,
    action: AuditAction.ADMIN_ANNOUNCEMENT_CREATE,
    entityType: EntityType.ANNOUNCEMENT,
    entityId: announcement.id,
    changes: { title, isPublished },
    ipAddress
  });

  return NextResponse.json({ data: announcement }, { status: 201 });
}
