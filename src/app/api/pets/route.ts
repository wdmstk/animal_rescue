import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petInputSchema } from "@/lib/validators/pet";

export async function GET() {
  const pets = await prisma.pet.findMany({
    include: {
      emergencyInfo: true,
      emergencyToken: true,
      photos: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: pets });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = petInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pet = await prisma.pet.create({
    data: {
      ...parsed.data,
      birthday: parsed.data.birthday ? new Date(parsed.data.birthday) : null
    }
  });

  return NextResponse.json({ data: pet }, { status: 201 });
}
