import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emergencyInfoInputSchema } from "@/lib/validators/emergency";

export async function PUT(request: Request, { params }: { params: { petId: string } }) {
  const body = await request.json();
  const parsed = emergencyInfoInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const emergencyInfo = await prisma.petEmergencyInfo.upsert({
    where: { petId: params.petId },
    update: parsed.data,
    create: {
      petId: params.petId,
      ...parsed.data
    }
  });

  return NextResponse.json({ data: emergencyInfo });
}
