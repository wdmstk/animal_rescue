import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState, requireCreateAccess } from "@/lib/billing/access-guard";
import { badRequest } from "@/lib/api-error";

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

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
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

  const data = await prisma.petMedicalRecord.findMany({
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

  return NextResponse.json({ data: created }, { status: 201 });
}
