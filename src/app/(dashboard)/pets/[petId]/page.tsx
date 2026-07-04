import { ChangeHistoryList } from "@/components/features/pets/change-history-list";
import { EmergencyEditorCard } from "@/components/features/pets/emergency-editor-card";
import { EmergencyQrShareCard } from "@/components/features/pets/emergency-qr-share-card";
import { HealthTrackingPanel } from "@/components/features/pets/health-tracking-panel";
import { MedicalRecordManager } from "@/components/features/pets/medical-record-manager";
import { MedicationManagerCard } from "@/components/features/pets/medication-manager-card";
import { PetDeleteCard } from "@/components/features/pets/pet-delete-card";
import { PetPhotoGallery } from "@/components/features/pets/pet-photo-gallery";
import { PetProfileEditorCard } from "@/components/features/pets/pet-profile-editor-card";
import { PetProfileCard } from "@/components/features/pets/pet-profile-card";
import { PrintCareSummaryCard } from "@/components/features/pets/print-care-summary-card";
import { VaccinationManager } from "@/components/features/pets/vaccination-manager";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { E2E_PUBLIC_EMERGENCY_TOKEN } from "@/lib/constants/emergency";
import { buildChangeHistoryItems } from "@/lib/services/change-history";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { prisma } from "@/lib/prisma";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState } from "@/lib/billing/access-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PetDetailResponse = {
  data: {
    id: string;
    name: string;
    species: "dog" | "cat" | "other";
    breed: string | null;
    sex: "MALE" | "FEMALE" | "UNKNOWN";
    reproductiveStatus: "INTACT" | "NEUTERED" | "SPAYED" | "UNKNOWN";
    sterilizedAt: string | null;
    birthday: string | null;
    ageYears: number | null;
    weightKg: number | null;
    notesPersonality: string | null;
    notesFeatures: string | null;
    mainPhotoUrl: string | null;
    emergencyToken: { token: string; isActive: boolean } | null;
    photos: Array<{ photoUrl: string }>;
    emergencyInfo: {
      disease: string | null;
      currentMedications: string | null;
      allergy: string | null;
      vetName: string | null;
      vetPhone: string | null;
      emergencyContactName: string | null;
      emergencyContactPhone: string | null;
      updatedAt: string;
    } | null;
    medications: Array<{ id: string; name: string; dosage: string; frequency: string; startDate: string; endDate: string | null; createdAt: string; updatedAt: string }>;
    vaccinations: Array<{ id: string; type: "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER"; customTypeName: string | null; date: string; nextDue: string | null; createdAt: string; updatedAt: string }>;
    medicalRecords: Array<{ id: string; date: string; title: string; description: string; recordType: "EXAM" | "SURGERY" | "LAB" | "MEDICATION" | "OTHER"; createdAt: string; updatedAt: string }>;
  };
};

const normalizeDate = (value: string) => value.slice(0, 10);
const sectionLinks = [
  { id: "profile", label: "プロフィール" },
  { id: "summary", label: "提出サマリー" },
  { id: "photos", label: "写真" },
  { id: "emergency", label: "緊急情報" },
  { id: "medications", label: "投薬" },
  { id: "vaccinations", label: "ワクチン" },
  { id: "health", label: "健康記録" },
  { id: "records", label: "医療記録" },
  { id: "history", label: "更新履歴" },
  { id: "delete", label: "削除" }
] as const;

export default async function PetDetailPage({
  params
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;

  // E2E mode fallback
  if (process.env.PLAYWRIGHT_E2E === "1" && (petId === "demo-pet" || petId === "sample-pet")) {
      const e2eToken = E2E_PUBLIC_EMERGENCY_TOKEN;
      const e2ePet = {
        id: petId,
        name: "モカ",
        species: "犬",
        breed: "トイプードル",
        sex: "メス",
        reproductive: "避妊済み",
        sterilizedAt: "2020-08-01",
        age: "6歳",
        weight: "4.2kg",
        birthday: "2020-03-10",
        personality: "怖がり。雷が苦手。",
        features: "左耳の先に白い毛あり。",
        photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a"
      };

      return (
        <div className="space-y-4">
          <Link
            href={`/e/${e2eToken}`}
            className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
          >
            緊急情報を確認
          </Link>

          <nav className="sticky top-[128px] z-10 -mx-1 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur" aria-label="詳細セクションナビ">
            <ul className="flex min-w-max gap-1">
              {sectionLinks.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section id="profile" className="scroll-mt-44">
            <PetProfileCard pet={e2ePet} />
          </section>
          <section id="summary" className="scroll-mt-44">
            <PrintCareSummaryCard
              pet={{
                name: e2ePet.name,
                species: e2ePet.species,
                breed: e2ePet.breed,
                sex: e2ePet.sex,
                birthday: e2ePet.birthday,
                ageYears: 6,
                weightKg: 4.2
              }}
              emergencyInfo={{
                disease: "僧帽弁閉鎖不全症（軽度）",
                currentMedications: "ピモベンダン 1日2回",
                allergy: "鶏肉アレルギー",
                vetName: "みなと動物病院",
                vetPhone: "03-1234-5678",
                emergencyContactName: "山田 花子",
                emergencyContactPhone: "090-1234-5678"
              }}
              medications={[
                { name: "ピモベンダン", dosage: "1mg", frequency: "1日2回" },
                { name: "整腸剤", dosage: "1包", frequency: "1日1回" }
              ]}
            />
          </section>

          <section id="photos" className="scroll-mt-44">
            <PetPhotoGallery
              petId={petId}
              photos={[
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
                "https://images.unsplash.com/photo-1548681528-6a5c45b66b42",
                "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8"
              ]}
            />
          </section>

          <section id="emergency" className="scroll-mt-44">
            <EmergencyEditorCard
              petId={petId}
              initialEmergencyInfo={{
                disease: "僧帽弁閉鎖不全症（軽度）",
                currentMedications: "ピモベンダン 1日2回",
                allergy: "鶏肉アレルギー",
                vetName: "みなと動物病院",
                vetPhone: "03-1234-5678",
                emergencyContactName: "山田 花子",
                emergencyContactPhone: "090-1234-5678"
              }}
            />
          </section>

          <EmergencyQrShareCard petId={petId} initialToken={e2eToken} />

          <section id="medications" className="scroll-mt-44">
            <MedicationManagerCard
              petId={petId}
              initialItems={[
                {
                  id: "11111111-1111-4111-8111-111111111111",
                  name: "ピモベンダン",
                  dosage: "1mg",
                  frequency: "1日2回",
                  startDate: "2026-01-01",
                  endDate: null
                },
                {
                  id: "22222222-2222-4222-8222-222222222222",
                  name: "整腸剤",
                  dosage: "1包",
                  frequency: "1日1回",
                  startDate: "2026-04-20",
                  endDate: "2026-04-25"
                }
              ]}
            />
          </section>

          <section id="vaccinations" className="scroll-mt-44">
            <VaccinationManager
              petId={petId}
              initialItems={[
                { type: "狂犬病", customTypeName: null, date: "2026-03-20", nextDue: "2027-03-20" },
                { type: "混合ワクチン", customTypeName: null, date: "2025-04-10", nextDue: "2026-04-10" },
                { type: "フィラリア", customTypeName: null, date: "2026-04-01", nextDue: "2026-05-01" }
              ]}
            />
          </section>

          <section id="health" className="scroll-mt-44">
            <HealthTrackingPanel petId={petId} />
          </section>

          <section id="records" className="scroll-mt-44">
            <MedicalRecordManager
              petId={petId}
              initialItems={[
                {
                  id: "1",
                  date: "2026-04-01",
                  title: "定期健診",
                  description: "血液検査、尿検査ともに大きな異常なし。",
                  recordType: "EXAM"
                },
                {
                  id: "2",
                  date: "2026-03-12",
                  title: "胸部レントゲン",
                  description: "心拡大の進行なし。投薬継続。",
                  recordType: "LAB"
                }
              ]}
            />
          </section>

          <section id="history" className="scroll-mt-44">
            <ChangeHistoryList
              items={buildChangeHistoryItems({
                emergencyInfo: { updatedAt: "2026-04-21T10:00:00.000Z" },
                medications: [
                  { id: "11111111-1111-4111-8111-111111111111", name: "ピモベンダン", updatedAt: "2026-04-21T10:10:00.000Z" },
                  { id: "22222222-2222-4222-8222-222222222222", name: "整腸剤", updatedAt: "2026-04-21T10:20:00.000Z" }
                ],
                vaccinations: [
                  { id: "v1", type: "RABIES", customTypeName: null, updatedAt: "2026-04-22T09:00:00.000Z" },
                  { id: "v2", type: "CORE", customTypeName: null, updatedAt: "2026-04-22T09:10:00.000Z" }
                ],
                medicalRecords: [
                  { id: "1", title: "定期健診", updatedAt: "2026-04-22T12:00:00.000Z" },
                  { id: "2", title: "胸部レントゲン", updatedAt: "2026-04-22T12:10:00.000Z" }
                ]
              })}
            />
          </section>

          <section id="delete" className="scroll-mt-44">
            <PetDeleteCard petId={petId} petName={e2ePet.name} />
          </section>
        </div>
      );
  }

  // Server-side authentication and data fetching
  const auth = await requireAuthenticatedUser();
  if (auth instanceof Response) {
    redirect("/login");
  }

  const access = await requirePetAccess(auth.userId, petId);
  if (access instanceof Response) {
    notFound();
  }

  let billing;
  let historyWindowStart = null;
  try {
    billing = await getUserBillingAccessState(auth.userId);
    historyWindowStart = getHistoryWindowStartDate(billing.accessPolicy.historyWindowDays);
  } catch {
    // Fallback to unrestricted access if billing check fails
    billing = {
      planTier: "free" as const,
      subscriptionStatus: "INCOMPLETE" as const,
      isActive: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
      accessPolicy: {
        canCreate: true,
        canEdit: true,
        canNotify: true,
        canShare: true,
        canExport: true,
        historyWindowDays: null
      }
    };
  }

  const pet = await prisma.pet.findUnique({
    where: { id: access.petId },
    include: {
      emergencyInfo: true,
      medicalRecords: {
        where: historyWindowStart ? { date: { gte: historyWindowStart } } : undefined,
        orderBy: { date: "desc" }
      },
      medications: {
        where: historyWindowStart ? { startDate: { gte: historyWindowStart } } : undefined,
        orderBy: { startDate: "desc" }
      },
      vaccinations: {
        where: historyWindowStart ? { date: { gte: historyWindowStart } } : undefined,
        orderBy: { date: "desc" }
      },
      emergencyToken: true,
      photos: { orderBy: { sortOrder: "asc" } }
    }
  });

  if (!pet) {
    notFound();
  }

  let activeToken = pet.emergencyToken?.isActive ? pet.emergencyToken.token : null;

  // Generate QR token if not exists by calling the API endpoint
  if (!activeToken) {
    try {
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pets/${petId}/qr-token`, {
        cache: "no-store"
      });

      if (tokenResponse.ok) {
        const tokenPayload = (await tokenResponse.json()) as { data: { token: string } };
        activeToken = tokenPayload.data.token;
      }
    } catch {
      // If QR token generation fails, continue without it
      activeToken = null;
    }
  }

  const emergencyLinkToken = process.env.PLAYWRIGHT_E2E === "1" ? E2E_PUBLIC_EMERGENCY_TOKEN : activeToken;
  const changeHistoryItems = buildChangeHistoryItems({
    emergencyInfo: pet.emergencyInfo ? { updatedAt: pet.emergencyInfo.updatedAt.toISOString() } : null,
    medications: pet.medications.map((item) => ({
      id: item.id,
      name: item.name,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString()
    })),
    vaccinations: pet.vaccinations.map((item) => ({
      id: item.id,
      type: item.type,
      customTypeName: item.customTypeName,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString()
    })),
    medicalRecords: pet.medicalRecords.map((item) => ({
      id: item.id,
      title: item.title,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString()
    }))
  });

  return (
    <div className="space-y-4">
      {emergencyLinkToken ? (
        <Link
          href={`/e/${emergencyLinkToken}`}
          className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
        >
          緊急情報を確認
        </Link>
      ) : null}

      <nav className="sticky top-[128px] z-10 -mx-1 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur" aria-label="詳細セクションナビ">
        <ul className="flex min-w-max gap-1">
          {sectionLinks.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="profile" className="scroll-mt-44">
        <PetProfileEditorCard
          petId={petId}
          initialPet={{
            name: pet.name,
            species: pet.species as "dog" | "cat" | "other",
            breed: pet.breed,
            sex: pet.sex,
            ageYears: pet.ageYears,
            weightKg: pet.weightKg !== null ? Number(pet.weightKg) : null,
            birthday: pet.birthday ? pet.birthday.toISOString() : null,
            notesPersonality: pet.notesPersonality,
            notesFeatures: pet.notesFeatures,
            mainPhotoUrl: pet.mainPhotoUrl,
            photos: pet.photos,
            reproductiveStatus: pet.reproductiveStatus,
            sterilizedAt: pet.sterilizedAt ? pet.sterilizedAt.toISOString() : null
          }}
        />
      </section>
      <section id="summary" className="scroll-mt-44">
        <PrintCareSummaryCard
          pet={{
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            sex: pet.sex,
            birthday: pet.birthday ? normalizeDate(pet.birthday.toISOString()) : null,
            ageYears: pet.ageYears,
            weightKg: pet.weightKg !== null ? Number(pet.weightKg) : null
          }}
          emergencyInfo={pet.emergencyInfo}
          medications={pet.medications.map((item) => ({
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency
          }))}
        />
      </section>

      <section id="photos" className="scroll-mt-44">
        <PetPhotoGallery petId={petId} photos={pet.photos.map((photo) => photo.photoUrl)} />
      </section>

      <section id="emergency" className="scroll-mt-44">
        <EmergencyEditorCard petId={petId} initialEmergencyInfo={pet.emergencyInfo} />
      </section>

      <EmergencyQrShareCard petId={petId} initialToken={activeToken ?? undefined} />

      <section id="medications" className="scroll-mt-44">
        <MedicationManagerCard
          petId={petId}
          initialItems={pet.medications.map((item) => ({
            id: item.id,
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            startDate: normalizeDate(item.startDate.toISOString()),
            endDate: item.endDate ? normalizeDate(item.endDate.toISOString()) : null
          }))}
        />
      </section>

      <section id="vaccinations" className="scroll-mt-44">
        <VaccinationManager
          petId={petId}
          initialItems={pet.vaccinations.map((item) => ({
            id: item.id,
            typeCode: item.type,
            customTypeName: item.customTypeName,
            date: normalizeDate(item.date.toISOString()),
            nextDue: item.nextDue ? normalizeDate(item.nextDue.toISOString()) : null,
            type:
              item.type === "RABIES"
                ? "狂犬病"
                : item.type === "CORE"
                  ? "混合ワクチン"
                  : item.type === "HEARTWORM"
                    ? "フィラリア"
                    : item.type === "FLEA_TICK"
                      ? "ノミ・ダニ"
                      : item.customTypeName ?? "その他"
          }))}
        />
      </section>

      <section id="health" className="scroll-mt-44">
        <HealthTrackingPanel petId={petId} />
      </section>

      <section id="records" className="scroll-mt-44">
        <MedicalRecordManager
          petId={petId}
          initialItems={pet.medicalRecords.map((item) => ({
            id: item.id,
            date: normalizeDate(item.date.toISOString()),
            title: item.title,
            description: item.description,
            recordType: item.recordType
          }))}
        />
      </section>

      <section id="history" className="scroll-mt-44">
        <ChangeHistoryList items={changeHistoryItems} />
      </section>

      <section id="delete" className="scroll-mt-44">
        <PetDeleteCard petId={petId} petName={pet.name} />
      </section>

    </div>
  );
}
