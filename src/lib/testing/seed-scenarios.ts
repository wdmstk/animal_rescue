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
    showcaseOwner: "10000000-0000-4000-8000-000000000012",
    showcaseFamily: "10000000-0000-4000-8000-000000000013"
  },
  users: {
    baselineOwner: "20000000-0000-4000-8000-000000000001",
    showcaseOwner: "20000000-0000-4000-8000-000000000002",
    showcaseFamily: "20000000-0000-4000-8000-000000000004"
  },
  pets: {
    baselineCat: "30000000-0000-4000-8000-000000000001"
  }
} as const;

const showcasePetIds = Array.from({ length: 10 }, (_, index) => `30000000-0000-4000-8000-${(index + 2).toString().padStart(12, "0")}`);

const baselineInviteCode = "SEEDBASE01";
const showcaseInviteCodes = {
  active: "SEEDSHOW1",
  expired: "SEEDSHOW2",
  used: "SEEDSHOW3"
} as const;

const seedPetIds = [
  seedIds.pets.baselineCat,
  ...showcasePetIds
] as const;

const seedHouseholdIds = [seedIds.households.baseline, seedIds.households.showcase] as const;

const seedMemberIds = [seedIds.members.baselineOwner, seedIds.members.showcaseOwner, seedIds.members.showcaseFamily] as const;

const seedInviteCodes = [
  baselineInviteCode,
  showcaseInviteCodes.active,
  showcaseInviteCodes.expired,
  showcaseInviteCodes.used
] as const;

const now = new Date();
const plusDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const minusDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const isSeedTagged = (value: string | null | undefined): boolean =>
  typeof value === "string" && value.trim().toLowerCase().startsWith(SEED_PREFIX);

export const collectSeedTargetIds = async (prisma: PrismaClient): Promise<SeedTargetIds> => {
  const dynamicHouseholds =
    "household" in prisma && typeof prisma.household.findMany === "function"
      ? await prisma.household.findMany({
          where: { name: { startsWith: SEED_PREFIX, mode: "insensitive" } },
          select: { id: true }
        })
      : [];
  const dynamicPets =
    "pet" in prisma && typeof prisma.pet.findMany === "function"
      ? await prisma.pet.findMany({
          where: { name: { startsWith: SEED_PREFIX, mode: "insensitive" } },
          select: { id: true }
        })
      : [];

  return {
    householdIds: [...new Set([...seedHouseholdIds, ...dynamicHouseholds.map((row) => row.id)])],
    petIds: [...new Set([...seedPetIds, ...dynamicPets.map((row) => row.id)])]
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

  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: seedIds.households.showcase,
        userId: seedIds.users.showcaseFamily
      }
    },
    create: {
      id: seedIds.members.showcaseFamily,
      householdId: seedIds.households.showcase,
      userId: seedIds.users.showcaseFamily,
      role: "FAMILY"
    },
    update: { role: "FAMILY" }
  });

  const petProfiles = [
    { id: showcasePetIds[0], name: `${SEED_PREFIX} senior dog`, species: "dog", sex: "MALE", ageYears: 13, weightKg: 19.1, disease: "arthritis", medication: "joint support", marker: 2.3 },
    { id: showcasePetIds[1], name: `${SEED_PREFIX} young cat`, species: "cat", sex: "FEMALE", ageYears: 1, weightKg: 2.7, disease: null, medication: null, marker: 1.1 },
    { id: showcasePetIds[2], name: `${SEED_PREFIX} diabetic cat`, species: "cat", sex: "MALE", ageYears: 9, weightKg: 5.8, disease: "diabetes", medication: "insulin", marker: 2.6 },
    { id: showcasePetIds[3], name: `${SEED_PREFIX} rabbit check`, species: "rabbit", sex: "UNKNOWN", ageYears: 3, weightKg: 1.9, disease: null, medication: null, marker: 1.0 },
    { id: showcasePetIds[4], name: `${SEED_PREFIX} post surgery dog`, species: "dog", sex: "FEMALE", ageYears: 7, weightKg: 16.4, disease: "post-op care", medication: "antibiotic", marker: 1.7 },
    { id: showcasePetIds[5], name: `${SEED_PREFIX} allergy dog`, species: "dog", sex: "MALE", ageYears: 5, weightKg: 14.2, disease: "skin allergy", medication: "antihistamine", marker: 1.4 },
    { id: showcasePetIds[6], name: `${SEED_PREFIX} rescue kitten`, species: "cat", sex: "FEMALE", ageYears: 0, weightKg: 1.2, disease: "under observation", medication: null, marker: 0.9 },
    { id: showcasePetIds[7], name: `${SEED_PREFIX} large dog`, species: "dog", sex: "MALE", ageYears: 6, weightKg: 28.4, disease: null, medication: "omega 3", marker: 1.8 },
    { id: showcasePetIds[8], name: `${SEED_PREFIX} chronic kidney cat`, species: "cat", sex: "FEMALE", ageYears: 11, weightKg: 3.4, disease: "CKD stage 2", medication: "renal support", marker: 2.8 },
    { id: showcasePetIds[9], name: `${SEED_PREFIX} inactive rabbit`, species: "rabbit", sex: "UNKNOWN", ageYears: 4, weightKg: 2.1, disease: "reduced appetite", medication: "digestive aid", marker: 1.2 }
  ] as const;

  for (const [index, profile] of petProfiles.entries()) {
    await prisma.pet.upsert({
      where: { id: profile.id },
      create: {
        id: profile.id,
        householdId: seedIds.households.showcase,
        name: profile.name,
        species: profile.species,
        sex: profile.sex,
        ageYears: profile.ageYears,
        weightKg: profile.weightKg,
        mainPhotoUrl: profile.species === "dog" ? SEED_IMAGE_URLS.dogMain : null,
        notesPersonality: `${SEED_PREFIX} profile case ${index + 1}`,
        notesFeatures: index % 2 === 0 ? `${SEED_PREFIX} feature tag ${index + 1}` : null
      },
      update: {
        name: profile.name,
        species: profile.species,
        sex: profile.sex,
        ageYears: profile.ageYears,
        weightKg: profile.weightKg,
        mainPhotoUrl: profile.species === "dog" ? SEED_IMAGE_URLS.dogMain : null,
        notesPersonality: `${SEED_PREFIX} profile case ${index + 1}`,
        notesFeatures: index % 2 === 0 ? `${SEED_PREFIX} feature tag ${index + 1}` : null
      }
    });

    await prisma.petEmergencyInfo.upsert({
      where: { petId: profile.id },
      create: {
        petId: profile.id,
        disease: profile.disease,
        allergy: index % 3 === 0 ? "chicken" : null,
        currentMedications: profile.medication,
        vetName: `Showcase Vet ${String(index + 1).padStart(2, "0")}`,
        vetPhone: "03-2222-3333",
        emergencyContactName: "Showcase Family",
        emergencyContactPhone: "090-1111-1111"
      },
      update: {
        disease: profile.disease,
        allergy: index % 3 === 0 ? "chicken" : null,
        currentMedications: profile.medication,
        vetName: `Showcase Vet ${String(index + 1).padStart(2, "0")}`,
        vetPhone: "03-2222-3333",
        emergencyContactName: "Showcase Family",
        emergencyContactPhone: "090-1111-1111"
      }
    });

    await prisma.petMedication.upsert({
      where: { id: `46000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}` },
      create: {
        id: `46000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}`,
        petId: profile.id,
        name: profile.medication ?? "observation only",
        dosage: profile.medication ? "1 dose" : "n/a",
        frequency: profile.medication ? "daily" : "none",
        startDate: minusDays(45 - index),
        endDate: profile.medication && index % 4 === 0 ? plusDays(14) : null
      },
      update: {
        name: profile.medication ?? "observation only",
        dosage: profile.medication ? "1 dose" : "n/a",
        frequency: profile.medication ? "daily" : "none",
        startDate: minusDays(45 - index),
        endDate: profile.medication && index % 4 === 0 ? plusDays(14) : null
      }
    });

    await prisma.petVaccination.upsert({
      where: { id: `47000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}` },
      create: {
        id: `47000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}`,
        petId: profile.id,
        type: index % 2 === 0 ? "RABIES" : "CORE",
        date: minusDays(120 + index * 10),
        nextDue: index % 3 === 0 ? minusDays(5) : plusDays(60 - index * 2)
      },
      update: {
        type: index % 2 === 0 ? "RABIES" : "CORE",
        date: minusDays(120 + index * 10),
        nextDue: index % 3 === 0 ? minusDays(5) : plusDays(60 - index * 2)
      }
    });

    await prisma.petCoreMetricEntry.upsert({
      where: { id: `48000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}` },
      create: {
        id: `48000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}`,
        petId: profile.id,
        type: "WEIGHT_KG",
        value: profile.weightKg,
        recordedAt: minusDays(7 + index),
        note: `${SEED_PREFIX} weight snapshot ${index + 1}`
      },
      update: {
        type: "WEIGHT_KG",
        value: profile.weightKg,
        recordedAt: minusDays(7 + index),
        note: `${SEED_PREFIX} weight snapshot ${index + 1}`
      }
    });

    await prisma.petLabResultEntry.upsert({
      where: { id: `49000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}` },
      create: {
        id: `49000000-0000-4000-8000-${(index + 1).toString().padStart(12, "0")}`,
        petId: profile.id,
        category: "BLOOD",
        marker: "CRE",
        value: profile.marker,
        unit: "mg/dL",
        recordedAt: minusDays(5 + index),
        note: `${SEED_PREFIX} lab case ${index + 1}`
      },
      update: {
        category: "BLOOD",
        marker: "CRE",
        value: profile.marker,
        unit: "mg/dL",
        recordedAt: minusDays(5 + index),
        note: `${SEED_PREFIX} lab case ${index + 1}`
      }
    });
  }

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
  if (scenario === "baseline") await upsertBaseline(prisma);
  if (scenario === "showcase") await upsertShowcase(prisma);

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
