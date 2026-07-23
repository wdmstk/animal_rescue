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
import { PetDetailTabs } from "@/components/features/pets/pet-detail-tabs";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { E2E_PUBLIC_EMERGENCY_TOKEN } from "@/lib/constants/emergency";
import { buildChangeHistoryItems } from "@/lib/services/change-history";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { prisma } from "@/lib/prisma";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState } from "@/lib/billing/access-guard";

const normalizeDate = (value: string) => value.slice(0, 10);

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
        isArchived: false,
        emergencyInfo: {
          disease: "僧帽弁閉鎖不全症（軽度）",
          currentMedications: "ピモベンダン 1日2回",
          allergy: "鶏肉アレルギー",
          vetName: "みなと動物病院",
          vetPhone: "03-1234-5678",
          emergencyContactName: "山田 花子",
          emergencyContactPhone: "090-1234-5678"
        },
        medications: [
          { id: "1", name: "ピモベンダン", dosage: "1mg", frequency: "1日2回", startDate: "2026-01-01", endDate: null },
          { id: "2", name: "整腸剤", dosage: "1包", frequency: "1日1回", startDate: "2026-04-20", endDate: "2026-04-25" }
        ],
        vaccinations: [
          { type: "狂犬病", date: "2026-03-20", nextDue: "2027-03-20" },
          { type: "混合ワクチン", date: "2025-04-10", nextDue: "2026-04-10" }
        ],
        medicalRecords: [
          { id: "1", date: "2026-04-01", title: "定期健診", description: "血液検査、尿検査ともに大きな異常なし。" }
        ],
        photos: [
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          "https://images.unsplash.com/photo-1548681528-6a5c45b66b42"
        ]
      };

      return (
        <div className="space-y-4">
          <Link
            href={`/e/${e2eToken}`}
            className="sticky top-[68px] z-10 block rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:opacity-95 active:scale-95 transition-all"
          >
            🚨 緊急情報を確認（緊急パス画面を開く）
          </Link>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700/50 pb-3">{e2ePet.name}のカルテ情報</h2>
            <PetDetailTabs
              petId={petId}
              pet={e2ePet}
              activeToken={e2eToken}
              changeHistoryItems={[]}
              isE2E={true}
            />
          </div>
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
          className="sticky top-[68px] z-10 block rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-4.5 text-center text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:opacity-95 active:scale-95 transition-all"
        >
          🚨 緊急情報を確認（緊急パス画面を開く）
        </Link>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
          <h2 className="text-xl font-bold text-white">{pet.name}の情報</h2>
          {pet.isArchived && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400 flex items-center gap-1 shadow-sm">
              🕯️ 思い出モード
            </span>
          )}
        </div>
        
        <PetDetailTabs
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
        />
      </div>
    </div>
  );
}
