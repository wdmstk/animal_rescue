import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateEmergencyToken } from "@/lib/security/emergency-token";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const resolvePet = async (petId: string) =>
  prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true }
  });

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const petId = parsedParams.data.petId;
  const pet = await resolvePet(petId);

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const existing = await prisma.petEmergencyToken.findUnique({
    where: { petId }
  });

  if (existing) {
    return NextResponse.json({
      data: {
        token: existing.token,
        publicUrl: `/e/${existing.token}`
      }
    });
  }

  const token = generateEmergencyToken();
  const created = await prisma.petEmergencyToken.create({
    data: {
      petId,
      token,
      isActive: true
    }
  });

  return NextResponse.json({
    data: {
      token: created.token,
      publicUrl: `/e/${created.token}`
    }
  });
}

export async function POST(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const petId = parsedParams.data.petId;
  const pet = await resolvePet(petId);

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const token = generateEmergencyToken();
  const updated = await prisma.petEmergencyToken.upsert({
    where: { petId },
    update: {
      token,
      isActive: true,
      rotatedAt: new Date()
    },
    create: {
      petId,
      token,
      isActive: true
    }
  });

  return NextResponse.json({
    data: {
      token: updated.token,
      publicUrl: `/e/${updated.token}`
    }
  });
}
