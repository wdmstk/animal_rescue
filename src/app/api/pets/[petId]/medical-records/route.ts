import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const recordSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  recordType: z.enum(["EXAM", "SURGERY", "LAB", "MEDICATION", "OTHER"]).default("OTHER"),
  photoUrl: z.string().url().optional().nullable()
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const data = await prisma.petMedicalRecord.findMany({
    where: { petId: params.petId },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const body = await request.json();
  const parsed = recordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petMedicalRecord.create({
    data: {
      ...parsed.data,
      petId: params.petId,
      date: new Date(parsed.data.date)
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
