import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
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
  petId: string,
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
    petId,
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

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const settings = await prisma.petDisplaySettings.findUnique({
    where: { petId: access.petId }
  });

  return NextResponse.json({ data: toResponseData(access.petId, settings ?? DEFAULT_SETTINGS) });
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

  const updated = await prisma.petDisplaySettings.upsert({
    where: { petId: access.petId },
    update: parsedBody.data,
    create: {
      petId: access.petId,
      ...DEFAULT_SETTINGS,
      ...parsedBody.data
    }
  });

  return NextResponse.json({ data: toResponseData(updated.petId, updated) });
}
