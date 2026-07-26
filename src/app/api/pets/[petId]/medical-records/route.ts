import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState, requireCreateAccess } from "@/lib/billing/access-guard";
import { badRequest } from "@/lib/api-error";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const recordSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  recordType: z.enum(["EXAM", "SURGERY", "LAB", "MEDICATION", "OTHER"]).default("OTHER"),
  photoUrl: z.string().url().optional().nullable()
});

import { paginationQuerySchema, buildPaginatedResponse } from "@/lib/pagination";

export async function GET(request: Request | undefined, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }
  const billing = await getUserBillingAccessState(auth.userId);
  const historyWindowStart = getHistoryWindowStartDate(billing.accessPolicy.historyWindowDays);

  const url = new URL(request?.url ?? "http://localhost");
  const parsedQuery = paginationQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined
  });
  const { limit, cursor } = parsedQuery.success ? parsedQuery.data : { limit: 20, cursor: undefined };

  const data = await prisma.petMedicalRecord.findMany({
    where: {
      petId: access.petId,
      date: historyWindowStart ? { gte: historyWindowStart } : undefined
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: [{ date: "desc" }, { id: "desc" }]
  });

  const paginated = buildPaginatedResponse(data, limit);
  return NextResponse.json(paginated);
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) {
    return createAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = recordSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const created = await prisma.petMedicalRecord.create({
    data: {
      ...parsed.data,
      petId: access.petId,
      date: new Date(parsed.data.date)
    }
  });

  void createAuditLog({
    userId: auth.userId,
    action: AuditAction.MEDICAL_RECORD_CREATE,
    entityType: EntityType.MEDICAL_RECORD,
    entityId: created.id,
    changes: parsed.data
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
