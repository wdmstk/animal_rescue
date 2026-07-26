import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const SEED_PREFIX = "seed:lp:";

const DEMO_HOUSEHOLD_ID = "50000000-0000-4000-8000-000000000001";
const DEFAULT_USER_ID = "60000000-0000-4000-8000-000000000001";

export async function seedLpDemoData(targetArg?: string) {
  const { prisma } = await import("../src/lib/prisma");
  const targetUser = targetArg ?? process.argv[2] ?? process.env.DEMO_USER_ID;

  if (targetUser === "clear" || targetUser === "clean") {
    console.log("Clearing LP Demo Data (household, 4 pets, and all related medical/health records)...");
    const demoPets = await prisma.pet.findMany({
      where: {
        OR: [
          { householdId: DEMO_HOUSEHOLD_ID },
          { name: { startsWith: SEED_PREFIX } }
        ]
      },
      select: { id: true }
    });
    const petIds = demoPets.map(p => p.id);

    if (petIds.length > 0) {
      await prisma.petPhoto.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petEmergencyInfo.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petMedicalRecord.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petMedication.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petVaccination.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petEmergencyToken.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petCoreMetricEntry.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petLabResultEntry.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.petHealthExtensionEntry.deleteMany({ where: { petId: { in: petIds } } });
      await prisma.pet.deleteMany({ where: { id: { in: petIds } } });
    }

    await prisma.householdMember.deleteMany({ where: { householdId: DEMO_HOUSEHOLD_ID } });
    await prisma.household.deleteMany({ where: { id: DEMO_HOUSEHOLD_ID } });

    console.log(" Successfully cleared LP Demo Data!");
    return;
  }

  let targetUserId = DEFAULT_USER_ID;

  if (targetUser && targetUser !== "default") {
    if (targetUser.includes("@")) {
      // Find user in Supabase or HouseholdMember
      console.log(`Searching user by email: ${targetUser}...`);
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const foundUser = usersData?.users?.find(u => u.email === targetUser);
        if (foundUser) {
          targetUserId = foundUser.id;
          console.log(`Found Supabase user ID for ${targetUser}: ${targetUserId}`);
        } else {
          targetUserId = DEFAULT_USER_ID;
        }
      } else {
        targetUserId = DEFAULT_USER_ID;
      }
    } else {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(targetUser);
      if (isUuid) {
        targetUserId = targetUser;
      }
    }
  }

  console.log(`Starting LP Demo Data Seeding (Target User ID: ${targetUserId})...`);

  // 1. Upsert Household & Member
  await prisma.household.upsert({
    where: { id: DEMO_HOUSEHOLD_ID },
    create: { id: DEMO_HOUSEHOLD_ID, name: `${SEED_PREFIX}山田家ファミリー` },
    update: { name: `${SEED_PREFIX}山田家ファミリー` }
  });

  const memberId = `70000000-0000-4000-8000-${targetUserId.replace(/[^0-9a-fA-F]/g, "0").padStart(12, "0").slice(-12)}`;

  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: DEMO_HOUSEHOLD_ID,
        userId: targetUserId
      }
    },
    create: {
      id: memberId,
      householdId: DEMO_HOUSEHOLD_ID,
      userId: targetUserId,
      role: "OWNER"
    },
    update: { role: "OWNER" }
  });

  // Helper to generate past dates
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // 2. Define 2 Dogs & 2 Cats with multi-day time-series health records for graphs
  const petsData = [
    {
      id: "71000000-0000-4000-8000-000000000001",
      name: `${SEED_PREFIX}ポチ`,
      species: "dog",
      breed: "柴犬",
      sex: "MALE" as const,
      ageYears: 5,
      weightKg: 10.5,
      microchipId: "992001234567891",
      isNeutered: true,
      neuteredDate: new Date("2021-06-15"),
      notesPersonality: "明るく人懐っこい。ドッグランが大好き。",
      notesFeatures: "赤柴・右耳の後ろに小さな白斑点あり",
      emergency: {
        disease: "特になし（健康診断良好）",
        allergy: "なし",
        currentMedications: "フィラリア予防薬（月1回）",
        vetName: "さくら動物病院",
        vetPhone: "03-1234-5678",
        emergencyContactName: "山田 太郎",
        emergencyContactPhone: "090-1234-5678"
      },
      medications: [
        { name: "カルドメックチュワブル (フィラリア予防)", dosage: "1個", frequency: "毎月1回", startDate: daysAgo(180) }
      ],
      vaccinations: [
        { type: "RABIES", date: daysAgo(280), nextDue: daysAgo(-85) },
        { type: "CORE", date: daysAgo(200), nextDue: daysAgo(-165) }
      ],
      metrics: [
        { type: "WEIGHT_KG", value: 10.1, recordedAt: daysAgo(120), note: "4ヶ月前健康診断" },
        { type: "WEIGHT_KG", value: 10.2, recordedAt: daysAgo(90), note: "3ヶ月前測定" },
        { type: "WEIGHT_KG", value: 10.3, recordedAt: daysAgo(60), note: "2ヶ月前測定" },
        { type: "WEIGHT_KG", value: 10.4, recordedAt: daysAgo(30), note: "1ヶ月前測定" },
        { type: "WEIGHT_KG", value: 10.5, recordedAt: daysAgo(7), note: "直近定期測定" },
        { type: "BODY_TEMPERATURE_C", value: 38.3, recordedAt: daysAgo(60), note: "検温" },
        { type: "BODY_TEMPERATURE_C", value: 38.5, recordedAt: daysAgo(7), note: "検温平熱" }
      ],
      labs: [
        { category: "BLOOD", marker: "CRE", value: 1.0, recordedAt: daysAgo(120), unit: "mg/dL", note: "血液検査正常" },
        { category: "BLOOD", marker: "CRE", value: 1.1, recordedAt: daysAgo(30), unit: "mg/dL", note: "血液検査正常" },
        { category: "BLOOD", marker: "BUN", value: 14.8, recordedAt: daysAgo(120), unit: "mg/dL", note: "血液検査正常" },
        { category: "BLOOD", marker: "BUN", value: 15.2, recordedAt: daysAgo(30), unit: "mg/dL", note: "血液検査正常" }
      ]
    },
    {
      id: "71000000-0000-4000-8000-000000000002",
      name: `${SEED_PREFIX}チョコ`,
      species: "dog",
      breed: "トイプードル",
      sex: "FEMALE" as const,
      ageYears: 3,
      weightKg: 3.8,
      microchipId: "992001234567892",
      isNeutered: true,
      neuteredDate: new Date("2023-04-10"),
      notesPersonality: "甘えん坊で室内で元気に遊ぶのが好き。",
      notesFeatures: "アプリコット毛色・赤い首輪着用",
      emergency: {
        disease: "外耳炎（治療中）",
        allergy: "鶏肉アレルギーあり",
        currentMedications: "ウェルメイト伊 (耳用点眼液)",
        vetName: "みどり動物クリニック",
        vetPhone: "03-9876-5432",
        emergencyContactName: "山田 花子",
        emergencyContactPhone: "090-8765-4321"
      },
      medications: [
        { name: "ウェルメイト伊 (点耳薬)", dosage: "2滴", frequency: "1日2回", startDate: daysAgo(20) }
      ],
      vaccinations: [
        { type: "CORE", date: daysAgo(220), nextDue: daysAgo(-145) }
      ],
      metrics: [
        { type: "WEIGHT_KG", value: 3.6, recordedAt: daysAgo(90), note: "3ヶ月前測定" },
        { type: "WEIGHT_KG", value: 3.7, recordedAt: daysAgo(45), note: "1.5ヶ月前測定" },
        { type: "WEIGHT_KG", value: 3.8, recordedAt: daysAgo(10), note: "直近測定" }
      ],
      labs: [
        { category: "BLOOD", marker: "ALT", value: 40, recordedAt: daysAgo(90), unit: "U/L", note: "肝機能" },
        { category: "BLOOD", marker: "ALT", value: 42, recordedAt: daysAgo(10), unit: "U/L", note: "肝機能正常" }
      ]
    },
    {
      id: "71000000-0000-4000-8000-000000000003",
      name: `${SEED_PREFIX}タマ`,
      species: "cat",
      breed: "日本猫 (キジトラ)",
      sex: "MALE" as const,
      ageYears: 7,
      weightKg: 4.2,
      microchipId: "992001234567893",
      isNeutered: true,
      neuteredDate: new Date("2019-11-20"),
      notesPersonality: "日当たりが良い場所でお昼寝するのがお気に入り。",
      notesFeatures: "キジトラ柄・カギ尾",
      emergency: {
        disease: "慢性腎臓病 (CKD Stage 2)",
        allergy: "なし",
        currentMedications: "セミントラ / 活性炭サプリメント",
        vetName: "ひまわりペットクリニック",
        vetPhone: "03-5555-4444",
        emergencyContactName: "山田 太郎",
        emergencyContactPhone: "090-1234-5678"
      },
      medications: [
        { name: "セミントラ (内服液)", dosage: "0.25ml", frequency: "1日1回", startDate: daysAgo(180) },
        { name: "活性炭製剤", dosage: "1包", frequency: "1日2回", startDate: daysAgo(180) }
      ],
      vaccinations: [
        { type: "CORE", date: daysAgo(300), nextDue: daysAgo(-65) }
      ],
      metrics: [
        { type: "WEIGHT_KG", value: 4.6, recordedAt: daysAgo(150), note: "5ヶ月前測定" },
        { type: "WEIGHT_KG", value: 4.4, recordedAt: daysAgo(100), note: "経過観察中" },
        { type: "WEIGHT_KG", value: 4.3, recordedAt: daysAgo(50), note: "経過観察中" },
        { type: "WEIGHT_KG", value: 4.2, recordedAt: daysAgo(5), note: "直近測定" }
      ],
      labs: [
        { category: "BLOOD", marker: "CRE", value: 1.7, recordedAt: daysAgo(150), unit: "mg/dL", note: "腎検査初期" },
        { category: "BLOOD", marker: "CRE", value: 1.9, recordedAt: daysAgo(100), unit: "mg/dL", note: "腎検査" },
        { category: "BLOOD", marker: "CRE", value: 2.1, recordedAt: daysAgo(5), unit: "mg/dL", note: "CKD Stage 2注意" },
        { category: "BLOOD", marker: "BUN", value: 25.0, recordedAt: daysAgo(150), unit: "mg/dL", note: "BUN" },
        { category: "BLOOD", marker: "BUN", value: 28.5, recordedAt: daysAgo(100), unit: "mg/dL", note: "BUN" },
        { category: "BLOOD", marker: "BUN", value: 32.0, recordedAt: daysAgo(5), unit: "mg/dL", note: "BUN高め" }
      ]
    },
    {
      id: "71000000-0000-4000-8000-000000000004",
      name: `${SEED_PREFIX}ルナ`,
      species: "cat",
      breed: "アメリカンショートヘア",
      sex: "FEMALE" as const,
      ageYears: 2,
      weightKg: 3.2,
      microchipId: "992001234567894",
      isNeutered: true,
      neuteredDate: new Date("2024-08-05"),
      notesPersonality: "好奇心旺盛でキャットタワーによく登る。",
      notesFeatures: "シルバータビー模様・緑色の目",
      emergency: {
        disease: "なし（良好）",
        allergy: "なし",
        currentMedications: "なし",
        vetName: "さくら動物病院",
        vetPhone: "03-1234-5678",
        emergencyContactName: "山田 花子",
        emergencyContactPhone: "090-8765-4321"
      },
      medications: [],
      vaccinations: [
        { type: "CORE", date: daysAgo(160), nextDue: daysAgo(-205) }
      ],
      metrics: [
        { type: "WEIGHT_KG", value: 3.0, recordedAt: daysAgo(120), note: "4ヶ月前測定" },
        { type: "WEIGHT_KG", value: 3.1, recordedAt: daysAgo(60), note: "2ヶ月前測定" },
        { type: "WEIGHT_KG", value: 3.2, recordedAt: daysAgo(12), note: "直近測定" }
      ],
      labs: [
        { category: "BLOOD", marker: "CRE", value: 0.9, recordedAt: daysAgo(120), unit: "mg/dL", note: "正常値" },
        { category: "BLOOD", marker: "CRE", value: 1.0, recordedAt: daysAgo(12), unit: "mg/dL", note: "正常値" }
      ]
    }
  ];

  for (const p of petsData) {
    await prisma.pet.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        householdId: DEMO_HOUSEHOLD_ID,
        name: p.name,
        species: p.species,
        sex: p.sex,
        ageYears: p.ageYears,
        weightKg: p.weightKg,
        notesPersonality: p.notesPersonality,
        notesFeatures: p.notesFeatures
      },
      update: {
        name: p.name,
        species: p.species,
        sex: p.sex,
        ageYears: p.ageYears,
        weightKg: p.weightKg,
        notesPersonality: p.notesPersonality,
        notesFeatures: p.notesFeatures
      }
    });

    await prisma.petEmergencyInfo.upsert({
      where: { petId: p.id },
      create: {
        petId: p.id,
        disease: p.emergency.disease,
        allergy: p.emergency.allergy,
        currentMedications: p.emergency.currentMedications,
        vetName: p.emergency.vetName,
        vetPhone: p.emergency.vetPhone,
        emergencyContactName: p.emergency.emergencyContactName,
        emergencyContactPhone: p.emergency.emergencyContactPhone
      },
      update: {
        disease: p.emergency.disease,
        allergy: p.emergency.allergy,
        currentMedications: p.emergency.currentMedications,
        vetName: p.emergency.vetName,
        vetPhone: p.emergency.vetPhone,
        emergencyContactName: p.emergency.emergencyContactName,
        emergencyContactPhone: p.emergency.emergencyContactPhone
      }
    });

    for (const [index, med] of p.medications.entries()) {
      const medId = `72000000-0000-4000-8000-${p.id.slice(-4)}${(index + 1).toString().padStart(8, "0")}`;
      await prisma.petMedication.upsert({
        where: { id: medId },
        create: {
          id: medId,
          petId: p.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate
        },
        update: {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate
        }
      });
    }

    for (const [index, vac] of p.vaccinations.entries()) {
      const vacId = `73000000-0000-4000-8000-${p.id.slice(-4)}${(index + 1).toString().padStart(8, "0")}`;
      await prisma.petVaccination.upsert({
        where: { id: vacId },
        create: {
          id: vacId,
          petId: p.id,
          type: vac.type as any,
          date: vac.date,
          nextDue: vac.nextDue
        },
        update: {
          type: vac.type as any,
          date: vac.date,
          nextDue: vac.nextDue
        }
      });
    }

    for (const [index, m] of p.metrics.entries()) {
      const metId = `74000000-0000-4000-8000-${p.id.slice(-4)}${(index + 1).toString().padStart(8, "0")}`;
      await prisma.petCoreMetricEntry.upsert({
        where: { id: metId },
        create: {
          id: metId,
          petId: p.id,
          type: m.type as any,
          value: m.value,
          recordedAt: m.recordedAt ?? new Date(),
          note: m.note
        },
        update: {
          type: m.type as any,
          value: m.value,
          recordedAt: m.recordedAt ?? new Date(),
          note: m.note
        }
      });
    }

    const tokenId = `76000000-0000-4000-8000-${p.id.slice(-12)}`;
    const tokenValue = `80000000-0000-4100-a000-${p.id.slice(-12)}`;
    await prisma.petEmergencyToken.upsert({
      where: { petId: p.id },
      create: {
        id: tokenId,
        petId: p.id,
        token: tokenValue,
        isActive: true
      },
      update: {
        token: tokenValue,
        isActive: true
      }
    });

    for (const [index, l] of p.labs.entries()) {
      const labId = `75000000-0000-4000-8000-${p.id.slice(-4)}${(index + 1).toString().padStart(8, "0")}`;
      await prisma.petLabResultEntry.upsert({
        where: { id: labId },
        create: {
          id: labId,
          petId: p.id,
          category: l.category as any,
          marker: l.marker as any,
          value: l.value,
          unit: l.unit,
          recordedAt: l.recordedAt ?? new Date(),
          note: l.note
        },
        update: {
          category: l.category as any,
          marker: l.marker as any,
          value: l.value,
          unit: l.unit,
          recordedAt: l.recordedAt ?? new Date(),
          note: l.note
        }
      });
    }
  }

  console.log(" Successfully seeded 4 pets (2 Dogs: ポチ, チョコ & 2 Cats: タマ, ルナ) with complete medical and health data!");
}

if (require.main === module || (typeof process.argv[1] === "string" && process.argv[1].endsWith("seed-lp-demo.ts"))) {
  seedLpDemoData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

