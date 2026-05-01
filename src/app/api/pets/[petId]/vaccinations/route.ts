import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState, requireCreateAccess, requireEditAccess } from "@/lib/billing/access-guard";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const validateOtherType = (value: { type: "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER"; customTypeName?: string | null }, ctx: z.RefinementCtx) => {
  if (value.type === "OTHER" && !value.customTypeName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customTypeName"],
      message: "customTypeName is required when type is OTHER"
    });
  }
};

const vaccinationBaseSchema = z.object({
  type: z.enum(["RABIES", "CORE", "HEARTWORM", "FLEA_TICK", "OTHER"]),
  customTypeName: z.string().trim().min(1).max(50).optional().nullable(),
  date: z.string().date(),
  nextDue: z.string().date().optional().nullable()
});

const vaccinationSchema = vaccinationBaseSchema.superRefine(validateOtherType);

const vaccinationUpdateSchema = vaccinationBaseSchema.extend({
  id: z.string().uuid()
}).superRefine(validateOtherType);

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
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

  const data = await prisma.petVaccination.findMany({
    where: {
      petId: access.petId,
      date: historyWindowStart ? { gte: historyWindowStart } : undefined
    },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
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
  const parsed = vaccinationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petVaccination.create({
    data: {
      ...parsed.data,
      petId: access.petId,
      customTypeName: parsed.data.type === "OTHER" ? parsed.data.customTypeName ?? null : null,
      date: new Date(parsed.data.date),
      nextDue: parsed.data.nextDue ? new Date(parsed.data.nextDue) : null
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const editAccess = await requireEditAccess(auth.userId);
  if (editAccess instanceof NextResponse) {
    return editAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = vaccinationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.petVaccination.findFirst({
    where: {
      id: parsed.data.id,
      petId: access.petId
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Vaccination record not found" }, { status: 404 });
  }

  const updated = await prisma.petVaccination.update({
    where: { id: parsed.data.id },
    data: {
      type: parsed.data.type,
      customTypeName: parsed.data.type === "OTHER" ? parsed.data.customTypeName ?? null : null,
      date: new Date(parsed.data.date),
      nextDue: parsed.data.nextDue ? new Date(parsed.data.nextDue) : null
    }
  });

  return NextResponse.json({ data: updated });
}
