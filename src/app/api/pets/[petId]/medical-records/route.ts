import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

  const data = await prisma.petMedicalRecord.findMany({
    where: { petId: parsedParams.data.petId },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const body = await request.json();
  const parsed = recordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pet = await prisma.pet.findUnique({
    where: { id: parsedParams.data.petId },
    select: { id: true }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const created = await prisma.petMedicalRecord.create({
    data: {
      ...parsed.data,
      petId: parsedParams.data.petId,
      date: new Date(parsed.data.date)
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
