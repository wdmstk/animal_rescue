import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { toPublicEmergencyView } from "@/lib/services/public-emergency";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  if (!isEmergencyToken(params.token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const token = await prisma.petEmergencyToken.findUnique({
    where: { token: params.token },
    include: {
      pet: {
        include: {
          emergencyInfo: true
        }
      }
    }
  });

  if (!token || !token.isActive || !token.pet.emergencyInfo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload = toPublicEmergencyView({
    petName: token.pet.name,
    disease: token.pet.emergencyInfo.disease,
    allergy: token.pet.emergencyInfo.allergy,
    currentMedications: token.pet.emergencyInfo.currentMedications,
    vetName: token.pet.emergencyInfo.vetName,
    vetPhone: token.pet.emergencyInfo.vetPhone,
    emergencyContactName: token.pet.emergencyInfo.emergencyContactName,
    emergencyContactPhone: token.pet.emergencyInfo.emergencyContactPhone
  });

  return NextResponse.json({ data: payload });
}
