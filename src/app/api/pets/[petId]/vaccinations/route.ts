import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const vaccinationSchema = z.object({
  type: z.enum(["RABIES", "CORE", "HEARTWORM", "FLEA_TICK", "OTHER"]),
  date: z.string().date(),
  nextDue: z.string().date().optional().nullable()
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const data = await prisma.petVaccination.findMany({
    where: { petId: params.petId },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const body = await request.json();
  const parsed = vaccinationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petVaccination.create({
    data: {
      ...parsed.data,
      petId: params.petId,
      date: new Date(parsed.data.date),
      nextDue: parsed.data.nextDue ? new Date(parsed.data.nextDue) : null
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
