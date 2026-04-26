import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const pet = await prisma.pet.findUnique({
    where: { id: parsedParams.data.petId },
    include: {
      emergencyInfo: true,
      medicalRecords: { orderBy: { date: "desc" } },
      medications: { orderBy: { startDate: "desc" } },
      vaccinations: { orderBy: { date: "desc" } },
      emergencyToken: true,
      photos: { orderBy: { sortOrder: "asc" } }
    }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return NextResponse.json({ data: pet });
}
