import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import {
  petDisplaySettingsParamSchema,
  petDisplaySettingsPatchSchema,
  petDisplaySettingsSchema
} from "@/lib/validators/pet-display-settings";

const DEFAULT_SETTINGS = petDisplaySettingsSchema.parse({
  showMedicationCard: true,
  showVaccinationCard: true,
  showHealthCard: true,
  showMedicalRecordCard: true,
  showEmergencyMedicationSummary: true,
  showEmergencyVaccinationSummary: true,
  showEmergencyMedicalRecordSummary: true
});

function toResponseData(
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
) {
  return {
    ownerUserId,
    showMedicationCard: value.showMedicationCard,
    showVaccinationCard: value.showVaccinationCard,
    showHealthCard: value.showHealthCard,
    showMedicalRecordCard: value.showMedicalRecordCard,
    showEmergencyMedicationSummary: value.showEmergencyMedicationSummary,
    showEmergencyVaccinationSummary: value.showEmergencyVaccinationSummary,
    showEmergencyMedicalRecordSummary: value.showEmergencyMedicalRecordSummary
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petDisplaySettingsParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const editAccess = await requireEditAccess(auth.userId);
  if (editAccess instanceof NextResponse) {
    return editAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const ownerMembership = await prisma.householdMember.findFirst({
    where: {
      householdId: access.householdId,
      role: "OWNER"
    },
    select: { userId: true },
    orderBy: { createdAt: "asc" }
  });
  if (!ownerMembership) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  const settings = await prisma.ownerDisplaySettings.findUnique({
    where: { ownerUserId: ownerMembership.userId }
  });

  return NextResponse.json({ data: toResponseData(ownerMembership.userId, settings ?? DEFAULT_SETTINGS) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petDisplaySettingsParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const body = await request.json();
  const parsedBody = petDisplaySettingsPatchSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const ownerMembership = await prisma.householdMember.findFirst({
    where: {
      householdId: access.householdId,
      role: "OWNER"
    },
    select: { userId: true },
    orderBy: { createdAt: "asc" }
  });
  if (!ownerMembership) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }
  if (ownerMembership.userId !== auth.userId) {
    return NextResponse.json({ error: "Only owner can update display settings" }, { status: 403 });
  }

  const updated = await prisma.ownerDisplaySettings.upsert({
    where: { ownerUserId: ownerMembership.userId },
    update: parsedBody.data,
    create: {
      ownerUserId: ownerMembership.userId,
      ...DEFAULT_SETTINGS,
      ...parsedBody.data
    }
  });

  return NextResponse.json({ data: toResponseData(updated.ownerUserId, updated) });
}
