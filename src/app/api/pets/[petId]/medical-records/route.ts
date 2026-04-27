import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";

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

  const data = await prisma.petMedicalRecord.findMany({
    where: { petId: access.petId },
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

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = recordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
