import type { PrismaClient } from "@prisma/client";

export const SEED_PREFIX = "seed:";
export const SEED_IMAGE_URLS = {
  dogMain: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
  dogPhoto1: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
  dogPhoto2: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42"
} as const;

export type SeedScenario = "baseline" | "showcase";

type SeedTargetIds = {
  householdIds: string[];
  petIds: string[];
};

type SeedResult = {
  householdCount: number;
  petCount: number;
};

const seedIds = {
  households: {
    baseline: "10000000-0000-4000-8000-000000000001",
    showcase: "10000000-0000-4000-8000-000000000002"
  },
  members: {
    baselineOwner: "10000000-0000-4000-8000-000000000011",
    showcaseOwner: "10000000-0000-4000-8000-000000000012"
  },
  users: {
    baselineOwner: "20000000-0000-4000-8000-000000000001",
    showcaseOwner: "20000000-0000-4000-8000-000000000002"
  },
  pets: {
    baselineCat: "30000000-0000-4000-8000-000000000001",
    showcaseDog: "30000000-0000-4000-8000-000000000002",
    showcaseRabbit: "30000000-0000-4000-8000-000000000003"
  }
} as const;

const baselineInviteCode = "SEEDBASE01";
const showcaseInviteCodes = {
  active: "SEEDSHOW1",
  expired: "SEEDSHOW2",
  used: "SEEDSHOW3"
} as const;

const seedPetIds = [
  seedIds.pets.baselineCat,
  seedIds.pets.showcaseDog,
  seedIds.pets.showcaseRabbit
] as const;

const seedHouseholdIds = [seedIds.households.baseline, seedIds.households.showcase] as const;

const seedMemberIds = [seedIds.members.baselineOwner, seedIds.members.showcaseOwner] as const;

const seedInviteCodes = [baselineInviteCode, showcaseInviteCodes.active, showcaseInviteCodes.expired, showcaseInviteCodes.used] as const;

const now = new Date();
const plusDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const minusDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const isSeedTagged = (value: string | null | undefined): boolean =>
  typeof value === "string" && value.trim().toLowerCase().startsWith(SEED_PREFIX);

export const collectSeedTargetIds = async (prisma: PrismaClient): Promise<SeedTargetIds> => {
  return {
    householdIds: [...seedHouseholdIds],
    petIds: [...seedPetIds]
  };
};

export const resetSeedData = async (prisma: PrismaClient): Promise<SeedTargetIds> => {
  const targetIds = await collectSeedTargetIds(prisma);

  if (targetIds.petIds.length > 0) {
    await prisma.$transaction([
      prisma.petPhoto.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petEmergencyInfo.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petMedicalRecord.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petMedication.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petVaccination.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petEmergencyToken.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petCoreMetricEntry.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petLabResultEntry.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.petHealthExtensionEntry.deleteMany({ where: { petId: { in: targetIds.petIds } } }),
      prisma.pet.deleteMany({ where: { id: { in: targetIds.petIds } } })
    ]);
  }

  if (targetIds.householdIds.length > 0) {
    await prisma.$transaction([
      prisma.householdInviteCode.deleteMany({ where: { code: { in: [...seedInviteCodes] } } }),
      prisma.householdMember.deleteMany({ where: { id: { in: [...seedMemberIds] } } }),
      prisma.household.deleteMany({ where: { id: { in: targetIds.householdIds } } })
    ]);
  }

  return targetIds;
};

const upsertBaseline = async (prisma: PrismaClient): Promise<void> => {
  await prisma.household.upsert({
    where: { id: seedIds.households.baseline },
    create: { id: seedIds.households.baseline, name: `${SEED_PREFIX} baseline household` },
    update: { name: `${SEED_PREFIX} baseline household` }
  });

  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: seedIds.households.baseline,
        userId: seedIds.users.baselineOwner
      }
    },
    create: {
      id: seedIds.members.baselineOwner,
      householdId: seedIds.households.baseline,
      userId: seedIds.users.baselineOwner,
      role: "OWNER"
    },
    update: { role: "OWNER" }
  });

  await prisma.pet.upsert({
    where: { id: seedIds.pets.baselineCat },
    create: {
      id: seedIds.pets.baselineCat,
      householdId: seedIds.households.baseline,
      name: `${SEED_PREFIX} baseline cat`,
      species: "cat",
      sex: "FEMALE",
      ageYears: 7,
      weightKg: 3.9,
      notesPersonality: `${SEED_PREFIX} calm and friendly`
    },
    update: {
      name: `${SEED_PREFIX} baseline cat`,
      species: "cat",
      sex: "FEMALE",
      ageYears: 7,
      weightKg: 3.9,
      notesPersonality: `${SEED_PREFIX} calm and friendly`
    }
  });

  await prisma.petEmergencyInfo.upsert({
    where: { petId: seedIds.pets.baselineCat },
    create: {
      petId: seedIds.pets.baselineCat,
      disease: "CKD stage 2",
      allergy: "none",
      currentMedications: "benazepril",
      vetName: "Seed Vet Clinic",
      vetPhone: "03-1111-2222",
      emergencyContactName: "Seed Owner",
      emergencyContactPhone: "090-0000-0000"
    },
    update: {
      disease: "CKD stage 2",
      allergy: "none",
      currentMedications: "benazepril",
      vetName: "Seed Vet Clinic",
      vetPhone: "03-1111-2222",
      emergencyContactName: "Seed Owner",
      emergencyContactPhone: "090-0000-0000"
    }
  });

  await prisma.householdInviteCode.upsert({
    where: { code: baselineInviteCode },
    create: {
      householdId: seedIds.households.baseline,
      code: baselineInviteCode,
      expiresAt: plusDays(7),
      createdBy: seedIds.users.baselineOwner
    },
    update: {
      householdId: seedIds.households.baseline,
      expiresAt: plusDays(7),
      usedAt: null,
      usedBy: null,
      createdBy: seedIds.users.baselineOwner
    }
  });

  await prisma.petMedication.upsert({
    where: { id: "41000000-0000-4000-8000-000000000001" },
    create: {
      id: "41000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.baselineCat,
      name: "Renal Support",
      dosage: "1 tablet",
      frequency: "daily",
      startDate: minusDays(20)
    },
    update: {
      name: "Renal Support",
      dosage: "1 tablet",
      frequency: "daily",
      startDate: minusDays(20),
      endDate: null
    }
  });

  await prisma.petVaccination.upsert({
    where: { id: "42000000-0000-4000-8000-000000000001" },
    create: {
      id: "42000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.baselineCat,
      type: "CORE",
      date: minusDays(180),
      nextDue: plusDays(180)
    },
    update: {
      type: "CORE",
      date: minusDays(180),
      nextDue: plusDays(180)
    }
  });

  await prisma.petCoreMetricEntry.upsert({
    where: { id: "43000000-0000-4000-8000-000000000001" },
    create: {
      id: "43000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.baselineCat,
      type: "WEIGHT_KG",
      value: 3.9,
      recordedAt: minusDays(7),
      note: `${SEED_PREFIX} baseline weight`
    },
    update: {
      type: "WEIGHT_KG",
      value: 3.9,
      recordedAt: minusDays(7),
      note: `${SEED_PREFIX} baseline weight`
    }
  });

  await prisma.petLabResultEntry.upsert({
    where: { id: "44000000-0000-4000-8000-000000000001" },
    create: {
      id: "44000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.baselineCat,
      category: "BLOOD",
      marker: "CRE",
      value: 1.8,
      unit: "mg/dL",
      recordedAt: minusDays(7),
      note: `${SEED_PREFIX} baseline lab`
    },
    update: {
      category: "BLOOD",
      marker: "CRE",
      value: 1.8,
      unit: "mg/dL",
      recordedAt: minusDays(7),
      note: `${SEED_PREFIX} baseline lab`
    }
  });
};

const upsertShowcase = async (prisma: PrismaClient): Promise<void> => {
  await prisma.household.upsert({
    where: { id: seedIds.households.showcase },
    create: { id: seedIds.households.showcase, name: `${SEED_PREFIX} showcase household` },
    update: { name: `${SEED_PREFIX} showcase household` }
  });

  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: seedIds.households.showcase,
        userId: seedIds.users.showcaseOwner
      }
    },
    create: {
      id: seedIds.members.showcaseOwner,
      householdId: seedIds.households.showcase,
      userId: seedIds.users.showcaseOwner,
      role: "OWNER"
    },
    update: { role: "OWNER" }
  });

  await prisma.pet.upsert({
    where: { id: seedIds.pets.showcaseDog },
    create: {
      id: seedIds.pets.showcaseDog,
      householdId: seedIds.households.showcase,
      name: `${SEED_PREFIX} showcase dog`,
      species: "dog",
      sex: "MALE",
      ageYears: 12,
      weightKg: 18.3,
      mainPhotoUrl: SEED_IMAGE_URLS.dogMain,
      notesPersonality: `${SEED_PREFIX} active and vocal`,
      notesFeatures: `${SEED_PREFIX} white patch on chest`
    },
    update: {
      name: `${SEED_PREFIX} showcase dog`,
      species: "dog",
      sex: "MALE",
      ageYears: 12,
      weightKg: 18.3,
      mainPhotoUrl: SEED_IMAGE_URLS.dogMain,
      notesPersonality: `${SEED_PREFIX} active and vocal`,
      notesFeatures: `${SEED_PREFIX} white patch on chest`
    }
  });

  await prisma.pet.upsert({
    where: { id: seedIds.pets.showcaseRabbit },
    create: {
      id: seedIds.pets.showcaseRabbit,
      householdId: seedIds.households.showcase,
      name: `${SEED_PREFIX} showcase rabbit`,
      species: "rabbit",
      sex: "UNKNOWN",
      ageYears: 2,
      notesPersonality: `${SEED_PREFIX} timid`,
      notesFeatures: null
    },
    update: {
      name: `${SEED_PREFIX} showcase rabbit`,
      species: "rabbit",
      sex: "UNKNOWN",
      ageYears: 2,
      notesPersonality: `${SEED_PREFIX} timid`,
      notesFeatures: null
    }
  });

  await prisma.petPhoto.upsert({
    where: { id: "45000000-0000-4000-8000-000000000001" },
    create: {
      id: "45000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      photoUrl: SEED_IMAGE_URLS.dogPhoto1,
      sortOrder: 0
    },
    update: {
      photoUrl: SEED_IMAGE_URLS.dogPhoto1,
      sortOrder: 0
    }
  });

  await prisma.petPhoto.upsert({
    where: { id: "45000000-0000-4000-8000-000000000002" },
    create: {
      id: "45000000-0000-4000-8000-000000000002",
      petId: seedIds.pets.showcaseDog,
      photoUrl: SEED_IMAGE_URLS.dogPhoto2,
      sortOrder: 1
    },
    update: {
      photoUrl: SEED_IMAGE_URLS.dogPhoto2,
      sortOrder: 1
    }
  });

  await prisma.petEmergencyInfo.upsert({
    where: { petId: seedIds.pets.showcaseDog },
    create: {
      petId: seedIds.pets.showcaseDog,
      disease: "arthritis",
      allergy: null,
      currentMedications: "pain reliever",
      vetName: "Showcase Animal Hospital",
      vetPhone: "03-2222-3333",
      emergencyContactName: "Showcase Owner",
      emergencyContactPhone: "090-1111-1111"
    },
    update: {
      disease: "arthritis",
      allergy: null,
      currentMedications: "pain reliever",
      vetName: "Showcase Animal Hospital",
      vetPhone: "03-2222-3333",
      emergencyContactName: "Showcase Owner",
      emergencyContactPhone: "090-1111-1111"
    }
  });

  await prisma.petEmergencyInfo.upsert({
    where: { petId: seedIds.pets.showcaseRabbit },
    create: {
      petId: seedIds.pets.showcaseRabbit,
      disease: null,
      allergy: null,
      currentMedications: null,
      vetName: "Showcase Rabbit Clinic",
      vetPhone: "03-2222-4444",
      emergencyContactName: "Showcase Owner",
      emergencyContactPhone: "090-1111-1111"
    },
    update: {
      disease: null,
      allergy: null,
      currentMedications: null,
      vetName: "Showcase Rabbit Clinic",
      vetPhone: "03-2222-4444",
      emergencyContactName: "Showcase Owner",
      emergencyContactPhone: "090-1111-1111"
    }
  });

  await prisma.petMedication.upsert({
    where: { id: "46000000-0000-4000-8000-000000000001" },
    create: {
      id: "46000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      name: "Joint Support A",
      dosage: "1 tablet",
      frequency: "morning",
      startDate: minusDays(40)
    },
    update: {
      name: "Joint Support A",
      dosage: "1 tablet",
      frequency: "morning",
      startDate: minusDays(40),
      endDate: null
    }
  });

  await prisma.petMedication.upsert({
    where: { id: "46000000-0000-4000-8000-000000000002" },
    create: {
      id: "46000000-0000-4000-8000-000000000002",
      petId: seedIds.pets.showcaseDog,
      name: "Joint Support B",
      dosage: "0.5 tablet",
      frequency: "morning",
      startDate: minusDays(10),
      endDate: plusDays(20)
    },
    update: {
      name: "Joint Support B",
      dosage: "0.5 tablet",
      frequency: "morning",
      startDate: minusDays(10),
      endDate: plusDays(20)
    }
  });

  await prisma.petMedication.upsert({
    where: { id: "46000000-0000-4000-8000-000000000003" },
    create: {
      id: "46000000-0000-4000-8000-000000000003",
      petId: seedIds.pets.showcaseDog,
      name: "Old Antibiotic",
      dosage: "1 capsule",
      frequency: "night",
      startDate: minusDays(90),
      endDate: minusDays(60)
    },
    update: {
      name: "Old Antibiotic",
      dosage: "1 capsule",
      frequency: "night",
      startDate: minusDays(90),
      endDate: minusDays(60)
    }
  });

  await prisma.petVaccination.upsert({
    where: { id: "47000000-0000-4000-8000-000000000001" },
    create: {
      id: "47000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      type: "RABIES",
      date: minusDays(380),
      nextDue: minusDays(15)
    },
    update: {
      type: "RABIES",
      date: minusDays(380),
      nextDue: minusDays(15)
    }
  });

  await prisma.petVaccination.upsert({
    where: { id: "47000000-0000-4000-8000-000000000002" },
    create: {
      id: "47000000-0000-4000-8000-000000000002",
      petId: seedIds.pets.showcaseDog,
      type: "HEARTWORM",
      date: minusDays(120),
      nextDue: plusDays(30)
    },
    update: {
      type: "HEARTWORM",
      date: minusDays(120),
      nextDue: plusDays(30)
    }
  });

  await prisma.petVaccination.upsert({
    where: { id: "47000000-0000-4000-8000-000000000003" },
    create: {
      id: "47000000-0000-4000-8000-000000000003",
      petId: seedIds.pets.showcaseRabbit,
      type: "OTHER",
      customTypeName: "ウサギ用ワクチン",
      date: minusDays(45),
      nextDue: null
    },
    update: {
      type: "OTHER",
      customTypeName: "ウサギ用ワクチン",
      date: minusDays(45),
      nextDue: null
    }
  });

  await prisma.petCoreMetricEntry.upsert({
    where: { id: "48000000-0000-4000-8000-000000000001" },
    create: {
      id: "48000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      type: "WEIGHT_KG",
      value: 18.7,
      recordedAt: minusDays(21),
      note: `${SEED_PREFIX} trend start`
    },
    update: {
      type: "WEIGHT_KG",
      value: 18.7,
      recordedAt: minusDays(21),
      note: `${SEED_PREFIX} trend start`
    }
  });

  await prisma.petCoreMetricEntry.upsert({
    where: { id: "48000000-0000-4000-8000-000000000002" },
    create: {
      id: "48000000-0000-4000-8000-000000000002",
      petId: seedIds.pets.showcaseDog,
      type: "WEIGHT_KG",
      value: 18.1,
      recordedAt: minusDays(7),
      note: `${SEED_PREFIX} trend down`
    },
    update: {
      type: "WEIGHT_KG",
      value: 18.1,
      recordedAt: minusDays(7),
      note: `${SEED_PREFIX} trend down`
    }
  });

  await prisma.petCoreMetricEntry.upsert({
    where: { id: "48000000-0000-4000-8000-000000000003" },
    create: {
      id: "48000000-0000-4000-8000-000000000003",
      petId: seedIds.pets.showcaseDog,
      type: "WATER_INTAKE_ML",
      value: 900,
      recordedAt: minusDays(1),
      note: `${SEED_PREFIX} high boundary`
    },
    update: {
      type: "WATER_INTAKE_ML",
      value: 900,
      recordedAt: minusDays(1),
      note: `${SEED_PREFIX} high boundary`
    }
  });

  await prisma.petLabResultEntry.upsert({
    where: { id: "49000000-0000-4000-8000-000000000001" },
    create: {
      id: "49000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      category: "BLOOD",
      marker: "CRE",
      value: 1.5,
      unit: "mg/dL",
      recordedAt: minusDays(21),
      note: `${SEED_PREFIX} lab normal-ish`
    },
    update: {
      category: "BLOOD",
      marker: "CRE",
      value: 1.5,
      unit: "mg/dL",
      recordedAt: minusDays(21),
      note: `${SEED_PREFIX} lab normal-ish`
    }
  });

  await prisma.petLabResultEntry.upsert({
    where: { id: "49000000-0000-4000-8000-000000000002" },
    create: {
      id: "49000000-0000-4000-8000-000000000002",
      petId: seedIds.pets.showcaseDog,
      category: "BLOOD",
      marker: "CRE",
      value: 2.4,
      unit: "mg/dL",
      recordedAt: minusDays(2),
      note: `${SEED_PREFIX} lab elevated`
    },
    update: {
      category: "BLOOD",
      marker: "CRE",
      value: 2.4,
      unit: "mg/dL",
      recordedAt: minusDays(2),
      note: `${SEED_PREFIX} lab elevated`
    }
  });

  await prisma.petHealthExtensionEntry.upsert({
    where: { id: "50000000-0000-4000-8000-000000000001" },
    create: {
      id: "50000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      name: "点滴量",
      value: 120,
      unit: "mL",
      recordedAt: minusDays(3),
      note: `${SEED_PREFIX} extension sample`
    },
    update: {
      name: "点滴量",
      value: 120,
      unit: "mL",
      recordedAt: minusDays(3),
      note: `${SEED_PREFIX} extension sample`
    }
  });

  await prisma.petMedicalRecord.upsert({
    where: { id: "51000000-0000-4000-8000-000000000001" },
    create: {
      id: "51000000-0000-4000-8000-000000000001",
      petId: seedIds.pets.showcaseDog,
      date: minusDays(30),
      recordType: "EXAM",
      title: "Routine check",
      description: `${SEED_PREFIX} no major issues`
    },
    update: {
      date: minusDays(30),
      recordType: "EXAM",
      title: "Routine check",
      description: `${SEED_PREFIX} no major issues`
    }
  });

  await prisma.householdInviteCode.upsert({
    where: { code: showcaseInviteCodes.active },
    create: {
      householdId: seedIds.households.showcase,
      code: showcaseInviteCodes.active,
      expiresAt: plusDays(5),
      createdBy: seedIds.users.showcaseOwner
    },
    update: {
      householdId: seedIds.households.showcase,
      expiresAt: plusDays(5),
      usedAt: null,
      usedBy: null,
      createdBy: seedIds.users.showcaseOwner
    }
  });

  await prisma.householdInviteCode.upsert({
    where: { code: showcaseInviteCodes.expired },
    create: {
      householdId: seedIds.households.showcase,
      code: showcaseInviteCodes.expired,
      expiresAt: minusDays(1),
      createdBy: seedIds.users.showcaseOwner
    },
    update: {
      householdId: seedIds.households.showcase,
      expiresAt: minusDays(1),
      usedAt: null,
      usedBy: null,
      createdBy: seedIds.users.showcaseOwner
    }
  });

  await prisma.householdInviteCode.upsert({
    where: { code: showcaseInviteCodes.used },
    create: {
      householdId: seedIds.households.showcase,
      code: showcaseInviteCodes.used,
      expiresAt: plusDays(4),
      usedAt: minusDays(1),
      usedBy: "20000000-0000-4000-8000-000000000003",
      createdBy: seedIds.users.showcaseOwner
    },
    update: {
      householdId: seedIds.households.showcase,
      expiresAt: plusDays(4),
      usedAt: minusDays(1),
      usedBy: "20000000-0000-4000-8000-000000000003",
      createdBy: seedIds.users.showcaseOwner
    }
  });
};

export const seedScenario = async (prisma: PrismaClient, scenario: SeedScenario): Promise<SeedResult> => {
  await upsertBaseline(prisma);

  if (scenario === "showcase") {
    await upsertShowcase(prisma);
  }

  const [householdCount, petCount] = await Promise.all([
    prisma.household.count({ where: { name: { startsWith: SEED_PREFIX, mode: "insensitive" } } }),
    prisma.pet.count({ where: { name: { startsWith: SEED_PREFIX, mode: "insensitive" } } })
  ]);

  return {
    householdCount,
    petCount
  };
};

export const seedScenarios = {
  ids: seedIds,
  baselineInviteCode,
  showcaseInviteCodes
};
