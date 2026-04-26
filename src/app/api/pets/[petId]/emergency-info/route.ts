import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emergencyInfoInputSchema } from "@/lib/validators/emergency";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function PUT(request: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const body = await request.json();
  const parsed = emergencyInfoInputSchema.safeParse(body);

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

  const emergencyInfo = await prisma.petEmergencyInfo.upsert({
    where: { petId: parsedParams.data.petId },
    update: parsed.data,
    create: {
      petId: parsedParams.data.petId,
      ...parsed.data
    }
  });

  return NextResponse.json({ data: emergencyInfo });
}
