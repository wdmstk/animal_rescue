import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const photoSchema = z.object({
  photoUrl: z.string().url(),
  sortOrder: z.number().int().min(0).default(0)
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const data = await prisma.petPhoto.findMany({
    where: { petId: params.petId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const body = await request.json();
  const parsed = photoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const photo = await prisma.petPhoto.create({
    data: {
      petId: params.petId,
      photoUrl: parsed.data.photoUrl,
      sortOrder: parsed.data.sortOrder
    }
  });

  return NextResponse.json({ data: photo }, { status: 201 });
}
