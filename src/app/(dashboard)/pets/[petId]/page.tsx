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
import { PetExportCard } from "@/components/features/pets/pet-export-card";
import { PrintCareSummaryCard } from "@/components/features/pets/print-care-summary-card";
import { VaccinationManager } from "@/components/features/pets/vaccination-manager";
import { Tabs } from "@/components/ui/tabs";
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

const tabGroups = [
  {
    id: "basic",
    label: "基本情報",
    tabs: [
      { id: "profile", label: "プロフィール" },
      { id: "photos", label: "写真" }
    ]
  },
  {
    id: "emergency",
    label: "緊急",
    tabs: [
      { id: "emergency", label: "緊急情報" },
      { id: "qr", label: "QR共有" }
    ]
  },
  {
    id: "medical",
    label: "医療",
    tabs: [
      { id: "medications", label: "投薬" },
      { id: "vaccinations", label: "ワクチン" },
      { id: "health", label: "健康記録" },
      { id: "records", label: "医療記録" }
    ]
  },
  {
    id: "management",
    label: "管理",
    tabs: [
      { id: "history", label: "更新履歴" },
      { id: "export", label: "データ出力" },
      { id: "delete", label: "削除" }
    ]
  }
] as const;

function TabContent({ tabId, petId, pet, activeToken, changeHistoryItems, normalizeDate }: {
  tabId: string;
  petId: string;
  pet: any;
  activeToken: string | null;
  changeHistoryItems: any;
  normalizeDate: (value: string) => string;
}) {
  switch (tabId) {
    case "profile":
      return <PetProfileEditorCard petId={petId} initialPet={pet} />;
    case "photos":
      return <PetPhotoGallery petId={petId} photos={pet.photos.map((photo: any) => photo.photoUrl)} />;
    case "emergency":
      return <EmergencyEditorCard petId={petId} initialEmergencyInfo={pet.emergencyInfo} />;
    case "qr":
      return <EmergencyQrShareCard petId={petId} initialToken={activeToken ?? undefined} />;
    case "medications":
      return (
        <MedicationManagerCard
          petId={petId}
          initialItems={pet.medications.map((item: any) => ({
            id: item.id,
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            startDate: normalizeDate(item.startDate.toISOString()),
            endDate: item.endDate ? normalizeDate(item.endDate.toISOString()) : null
          }))}
        />
      );
    case "vaccinations":
      return (
        <VaccinationManager
          petId={petId}
          initialItems={pet.vaccinations.map((item: any) => ({
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
      );
    case "health":
      return <HealthTrackingPanel petId={petId} />;
    case "records":
      return (
        <MedicalRecordManager
          petId={petId}
          initialItems={pet.medicalRecords.map((item: any) => ({
            id: item.id,
            date: normalizeDate(item.date.toISOString()),
            title: item.title,
            description: item.description,
            recordType: item.recordType
          }))}
        />
      );
    case "history":
      return <ChangeHistoryList items={changeHistoryItems} />;
    case "export":
      return <PetExportCard petId={petId} />;
    case "delete":
      return <PetDeleteCard petId={petId} petName={pet.name} />;
    default:
      return null;
  }
}

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
        photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
        isArchived: false
      };

      return (
        <div className="space-y-4">
          <Link
            href={`/e/${e2eToken}`}
            className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
          >
            緊急情報を確認
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{e2ePet.name}の情報</h2>
            
            <Tabs
              tabs={tabGroups.map((group) => ({
                id: group.id,
                label: group.label,
                content: (
                  <div key={group.id} className="space-y-4">
                    {group.tabs.map((tab) => (
                      <div key={tab.id} id={tab.id} className="scroll-mt-4">
                        {tab.id === "profile" && (
                          <PetProfileCard pet={e2ePet} />
                        )}
                        {tab.id === "photos" && (
                          <PetPhotoGallery
                            petId={petId}
                            photos={[
                              "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
                              "https://images.unsplash.com/photo-1548681528-6a5c45b66b42",
                              "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8"
                            ]}
                          />
                        )}
                        {tab.id === "emergency" && (
                          <EmergencyEditorCard
                            petId={petId}
                            initialEmergencyInfo={{
                              disease: "僧帽弁閉鎖不全症（軽度）",
                              currentMedications: "ピモベンダン 1日2回",
                              allergy: "鶏肉アレルギー",
                              vetName: "みなと動物病院",
                              vetPhone: "03-1234-5678",
                              emergencyContactName: "山田 花子",
                              emergencyContactPhone: "090-1234-5678",
                              bloodType: null,
                              emergencyVetName: null,
                              emergencyVetPhone: null,
                              emergencyContactName2: null,
                              emergencyContactPhone2: null,
                              insuranceCompany: null,
                              insurancePolicyNumber: null
                            }}
                          />
                        )}
                        {tab.id === "qr" && (
                          <EmergencyQrShareCard petId={petId} initialToken={e2eToken} />
                        )}
                        {tab.id === "medications" && (
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
                        )}
                        {tab.id === "vaccinations" && (
                          <VaccinationManager
                            petId={petId}
                            initialItems={[
                              { type: "狂犬病", customTypeName: null, date: "2026-03-20", nextDue: "2027-03-20" },
                              { type: "混合ワクチン", customTypeName: null, date: "2025-04-10", nextDue: "2026-04-10" },
                              { type: "フィラリア", customTypeName: null, date: "2026-04-01", nextDue: "2026-05-01" }
                            ]}
                          />
                        )}
                        {tab.id === "health" && (
                          <HealthTrackingPanel petId={petId} />
                        )}
                        {tab.id === "records" && (
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
                        )}
                        {tab.id === "history" && (
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
                        )}
                        {tab.id === "export" && (
                          <PetExportCard petId={petId} />
                        )}
                        {tab.id === "delete" && (
                          <PetDeleteCard petId={petId} petName={e2ePet.name} />
                        )}
                      </div>
                    ))}
                  </div>
                )
              }))}
              defaultTab="basic"
            />
          </div>

          <section id="summary" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">提出サマリー</h2>
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
      {emergencyLinkToken && !pet.isArchived ? (
        <Link
          href={`/e/${emergencyLinkToken}`}
          className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
        >
          緊急情報を確認
        </Link>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h2 className="text-lg font-bold text-slate-900">{pet.name}の情報</h2>
          {pet.isArchived && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800 flex items-center gap-1 shadow-sm">
              🕯️ 思い出モード
            </span>
          )}
        </div>
        
        <Tabs
          tabs={tabGroups.map((group) => ({
            id: group.id,
            label: group.label,
            content: (
              <div key={group.id} className="space-y-4">
                {group.tabs.map((tab) => (
                  <div key={tab.id} id={tab.id} className="scroll-mt-4">
                    <TabContent
                      tabId={tab.id}
                      petId={petId}
                      pet={{
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
                        sterilizedAt: pet.sterilizedAt ? pet.sterilizedAt.toISOString() : null,
                        emergencyInfo: pet.emergencyInfo,
                        medications: pet.medications,
                        vaccinations: pet.vaccinations,
                        medicalRecords: pet.medicalRecords
                      }}
                      activeToken={activeToken}
                      changeHistoryItems={changeHistoryItems}
                      normalizeDate={normalizeDate}
                    />
                  </div>
                ))}
              </div>
            )
          }))}
          defaultTab="basic"
        />
      </div>

      <section id="summary" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">提出サマリー</h2>
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

    </div>
  );
}
