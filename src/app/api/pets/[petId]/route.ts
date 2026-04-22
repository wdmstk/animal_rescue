import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const pet = await prisma.pet.findUnique({
    where: { id: params.petId },
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
