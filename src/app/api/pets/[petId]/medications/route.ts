import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const medicationSchema = z.object({
  name: z.string().min(1).max(120),
  dosage: z.string().min(1).max(80),
  frequency: z.string().min(1).max(120),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable()
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const data = await prisma.petMedication.findMany({
    where: { petId: parsedParams.data.petId },
    orderBy: { startDate: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const body = await request.json();
  const parsed = medicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petMedication.create({
    data: {
      ...parsed.data,
      petId: parsedParams.data.petId,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
