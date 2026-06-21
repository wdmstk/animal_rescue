import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState, requireCreateAccess } from "@/lib/billing/access-guard";
import { coreHealthEntryInputSchema, coreMetricTypeFilterSchema, healthPetIdParamSchema } from "@/lib/validators/health";
import { badRequest } from "@/lib/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
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

  const url = new URL(request.url);
  const parsedFilter = coreMetricTypeFilterSchema.safeParse({
    type: url.searchParams.get("type") ?? undefined
  });

  if (!parsedFilter.success) {
    return badRequest(parsedFilter.error);
  }

  const data = await prisma.petCoreMetricEntry.findMany({
    where: {
      petId: access.petId,
      type: parsedFilter.data.type,
      recordedAt: historyWindowStart ? { gte: historyWindowStart } : undefined
    },
    orderBy: { recordedAt: "desc" }
  });

  return NextResponse.json({
    data: data.map((item) => ({
      id: item.id,
      petId: item.petId,
      type: item.type,
      value: Number(item.value),
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    }))
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
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
  const parsed = coreHealthEntryInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const created = await prisma.petCoreMetricEntry.create({
    data: {
      petId: access.petId,
      type: parsed.data.type,
      value: parsed.data.value,
      recordedAt: parsed.data.recordedAt,
      note: parsed.data.note || null
    }
  });

  return NextResponse.json(
    {
      data: {
        id: created.id,
        petId: created.petId,
        type: created.type,
        value: Number(created.value),
        recordedAt: created.recordedAt.toISOString(),
        note: created.note
      }
    },
    { status: 201 }
  );
}
