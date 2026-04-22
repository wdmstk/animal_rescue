import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmergencyToken } from "@/lib/security/emergency-token";

export async function POST(_: Request, { params }: { params: { petId: string } }) {
  const token = generateEmergencyToken();

  const updated = await prisma.petEmergencyToken.upsert({
    where: { petId: params.petId },
    update: {
      token,
      isActive: true,
      rotatedAt: new Date()
    },
    create: {
      petId: params.petId,
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
