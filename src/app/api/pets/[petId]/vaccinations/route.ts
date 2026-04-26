import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const vaccinationSchema = z.object({
  type: z.enum(["RABIES", "CORE", "HEARTWORM", "FLEA_TICK", "OTHER"]),
  date: z.string().date(),
  nextDue: z.string().date().optional().nullable()
});

const vaccinationUpdateSchema = vaccinationSchema.extend({
  id: z.string().uuid()
});

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const data = await prisma.petVaccination.findMany({
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
  const parsed = vaccinationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petVaccination.create({
    data: {
      ...parsed.data,
      petId: parsedParams.data.petId,
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

  const body = await request.json();
  const parsed = vaccinationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.petVaccination.findFirst({
    where: {
      id: parsed.data.id,
      petId: parsedParams.data.petId
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Vaccination record not found" }, { status: 404 });
  }

  const updated = await prisma.petVaccination.update({
    where: { id: parsed.data.id },
    data: {
      type: parsed.data.type,
      date: new Date(parsed.data.date),
      nextDue: parsed.data.nextDue ? new Date(parsed.data.nextDue) : null
    }
  });

  return NextResponse.json({ data: updated });
}
