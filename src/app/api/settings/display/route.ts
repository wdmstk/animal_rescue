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

type OwnerDisplaySettingsDelegate = {
  findUnique: (args: { where: { ownerUserId: string } }) => Promise<(typeof DEFAULT_SETTINGS & { ownerUserId: string }) | null>;
  upsert: (args: {
    where: { ownerUserId: string };
    update: Partial<typeof DEFAULT_SETTINGS>;
    create: { ownerUserId: string } & typeof DEFAULT_SETTINGS;
  }) => Promise<{ ownerUserId: string } & typeof DEFAULT_SETTINGS>;
};

const getOwnerDisplaySettingsDelegate = (): OwnerDisplaySettingsDelegate | null => {
  const delegate = (prisma as unknown as { ownerDisplaySettings?: OwnerDisplaySettingsDelegate }).ownerDisplaySettings;
  if (!delegate?.findUnique || !delegate?.upsert) {
    return null;
  }
  return delegate;
};

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

  const ownerDisplaySettings = getOwnerDisplaySettingsDelegate();
  if (!ownerDisplaySettings) {
    return NextResponse.json({ data: toResponseData(ownerUserId, DEFAULT_SETTINGS) });
  }

  const settings = await ownerDisplaySettings.findUnique({
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

  const ownerDisplaySettings = getOwnerDisplaySettingsDelegate();
  if (!ownerDisplaySettings) {
    return NextResponse.json({ error: "Display settings model is unavailable. Regenerate Prisma Client." }, { status: 503 });
  }

  const updated = await ownerDisplaySettings.upsert({
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
