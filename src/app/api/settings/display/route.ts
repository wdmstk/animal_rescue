import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { petDisplaySettingsPatchSchema, petDisplaySettingsSchema } from "@/lib/validators/pet-display-settings";

const DEFAULT_SETTINGS = petDisplaySettingsSchema.parse({
  showMedicationCard: true,
  showVaccinationCard: true,
  showHealthCard: true,
  showMedicalRecordCard: true,
  showEmergencyMedicationSummary: true,
  showEmergencyVaccinationSummary: true,
  showEmergencyMedicalRecordSummary: true
});

const toResponseData = (
  ownerUserId: string,
  value: {
    showMedicationCard: boolean;
    showVaccinationCard: boolean;
    showHealthCard: boolean;
    showMedicalRecordCard: boolean;
    showEmergencyMedicationSummary: boolean;
    showEmergencyVaccinationSummary: boolean;
    showEmergencyMedicalRecordSummary: boolean;
  }
) => ({
  ownerUserId,
  ...value
});

const findOwnerUserId = async (userId: string): Promise<string | NextResponse> => {
  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    select: { householdId: true },
    orderBy: { createdAt: "asc" }
  });
  if (!membership) {
    return NextResponse.json({ error: "所属世帯が見つかりません" }, { status: 400 });
  }

  const ownerMembership = await prisma.householdMember.findFirst({
    where: {
      householdId: membership.householdId,
      role: "OWNER"
    },
    select: { userId: true },
    orderBy: { createdAt: "asc" }
  });

  if (!ownerMembership) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  return ownerMembership.userId;
};

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const ownerUserId = await findOwnerUserId(auth.userId);
  if (ownerUserId instanceof NextResponse) {
    return ownerUserId;
  }

  const settings = await prisma.ownerDisplaySettings.findUnique({
    where: { ownerUserId }
  });

  return NextResponse.json({ data: toResponseData(ownerUserId, settings ?? DEFAULT_SETTINGS) });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsedBody = petDisplaySettingsPatchSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const ownerUserId = await findOwnerUserId(auth.userId);
  if (ownerUserId instanceof NextResponse) {
    return ownerUserId;
  }

  if (ownerUserId !== auth.userId) {
    return NextResponse.json({ error: "Only owner can update display settings" }, { status: 403 });
  }

  const updated = await prisma.ownerDisplaySettings.upsert({
    where: { ownerUserId },
    update: parsedBody.data,
    create: {
      ownerUserId,
      ...DEFAULT_SETTINGS,
      ...parsedBody.data
    }
  });

  return NextResponse.json({ data: toResponseData(updated.ownerUserId, updated) });
}
