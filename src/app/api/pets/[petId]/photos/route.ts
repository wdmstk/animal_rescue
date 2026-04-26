import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const photoSchema = z.object({
  photoUrl: z.string().url(),
  sortOrder: z.number().int().min(0).default(0)
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const pet = await prisma.pet.findUnique({
    where: { id: parsedParams.data.petId },
    select: { id: true }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const data = await prisma.petPhoto.findMany({
    where: { petId: parsedParams.data.petId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const body = await request.json();
  const parsed = photoSchema.safeParse(body);

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

  const photo = await prisma.petPhoto.create({
    data: {
      petId: parsedParams.data.petId,
      photoUrl: parsed.data.photoUrl,
      sortOrder: parsed.data.sortOrder
    }
  });

  return NextResponse.json({ data: photo }, { status: 201 });
}
