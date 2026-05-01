import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState, requireCreateAccess } from "@/lib/billing/access-guard";
import { healthPetIdParamSchema, labResultEntryInputSchema } from "@/lib/validators/health";
import type { LabMarkerType } from "@/types/health";

const defaultUnitMap: Record<LabMarkerType, string> = {
  CRE: "mg/dL",
  BUN: "mg/dL",
  SDMA: "ug/dL",
  PHOSPHORUS: "mg/dL",
  ALT: "U/L",
  AST: "U/L",
  ALP: "U/L",
  GLU: "mg/dL",
  WBC: "10^3/uL",
  HCT: "%",
  TP: "g/dL",
  ALB: "g/dL",
  TCHO: "mg/dL",
  TG: "mg/dL",
  Na: "mEq/L",
  K: "mEq/L",
  Cl: "mEq/L",
  CRP: "mg/dL",
  URINE_GLUCOSE: "mg/dL",
  URINE_KETONE: "mg/dL",
  USG: "SG",
  URINE_PROTEIN: "mg/dL",
  UPCR: "ratio",
  FRUCTOSAMINE: "umol/L",
  T4: "ug/dL",
  FT4: "ng/dL",
  TSH: "ng/mL",
  CORTISOL: "ug/dL",
  INSULIN: "uIU/mL",
  ACTH: "pg/mL"
};

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
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

  const data = await prisma.petLabResultEntry.findMany({
    where: {
      petId: access.petId,
      recordedAt: historyWindowStart ? { gte: historyWindowStart } : undefined
    },
    orderBy: { recordedAt: "desc" }
  });

  return NextResponse.json({
    data: data.map((item) => ({
      id: item.id,
      petId: item.petId,
      category: item.category,
      marker: item.marker,
      value: Number(item.value),
      unit: item.unit,
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    }))
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
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
  const parsed = labResultEntryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petLabResultEntry.create({
    data: {
      petId: access.petId,
      category: parsed.data.category,
      marker: parsed.data.marker,
      value: parsed.data.value,
      unit: parsed.data.unit ?? defaultUnitMap[parsed.data.marker],
      recordedAt: parsed.data.recordedAt,
      note: parsed.data.note || null
    }
  });

  return NextResponse.json(
    {
      data: {
        id: created.id,
        petId: created.petId,
        category: created.category,
        marker: created.marker,
        value: Number(created.value),
        unit: created.unit,
        recordedAt: created.recordedAt.toISOString(),
        note: created.note
      }
    },
    { status: 201 }
  );
}
