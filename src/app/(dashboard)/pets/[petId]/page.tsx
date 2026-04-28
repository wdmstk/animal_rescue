import { EmergencyEditorCard } from "@/components/features/pets/emergency-editor-card";
import { EmergencyQrShareCard } from "@/components/features/pets/emergency-qr-share-card";
import { HealthTrackingPanel } from "@/components/features/pets/health-tracking-panel";
import { MedicalRecordManager } from "@/components/features/pets/medical-record-manager";
import { MedicationManagerCard } from "@/components/features/pets/medication-manager-card";
import { PetPhotoGallery } from "@/components/features/pets/pet-photo-gallery";
import { PetProfileEditorCard } from "@/components/features/pets/pet-profile-editor-card";
import { PetProfileCard } from "@/components/features/pets/pet-profile-card";
import { VaccinationManager } from "@/components/features/pets/vaccination-manager";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { E2E_PUBLIC_EMERGENCY_TOKEN } from "@/lib/constants/emergency";

type PetDetailResponse = {
  data: {
    id: string;
    name: string;
    species: "dog" | "cat" | "other";
    breed: string | null;
    sex: "MALE" | "FEMALE" | "UNKNOWN";
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
    } | null;
    medications: Array<{ id: string; name: string; dosage: string; frequency: string; startDate: string; endDate: string | null }>;
    vaccinations: Array<{ id: string; type: "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER"; date: string; nextDue: string | null }>;
    medicalRecords: Array<{ id: string; date: string; title: string; description: string; recordType: "EXAM" | "SURGERY" | "LAB" | "MEDICATION" | "OTHER" }>;
  };
};

const normalizeDate = (value: string) => value.slice(0, 10);

const resolveOriginAndCookie = async () => {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";

  return {
    origin: `${protocol}://${host}`,
    cookie: requestHeaders.get("cookie") ?? ""
  };
};

export default async function PetDetailPage({
  params
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const { origin, cookie } = await resolveOriginAndCookie();
  const response = await fetch(`${origin}/api/pets/${petId}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok && process.env.PLAYWRIGHT_E2E === "1" && (petId === "demo-pet" || petId === "sample-pet")) {
      const e2ePet = {
        id: petId,
        name: "モカ",
        species: "犬",
        breed: "トイプードル",
        sex: "メス",
        age: "6歳",
        weight: "4.2kg",
        birthday: "2020-03-10",
        personality: "怖がり。雷が苦手。",
        features: "左耳の先に白い毛あり。",
        photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a"
      };

      return (
        <div className="space-y-4">
          <a
            href={`/e/${E2E_PUBLIC_EMERGENCY_TOKEN}`}
            className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
          >
            緊急情報を確認
          </a>

          <PetProfileCard pet={e2ePet} />

          <PetPhotoGallery
            petId={petId}
            photos={[
              "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
              "https://images.unsplash.com/photo-1548681528-6a5c45b66b42",
              "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8"
            ]}
          />

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

          <EmergencyQrShareCard petId={petId} />

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

          <VaccinationManager
            petId={petId}
            initialItems={[
              { type: "狂犬病", date: "2026-03-20", nextDue: "2027-03-20" },
              { type: "混合ワクチン", date: "2025-04-10", nextDue: "2026-04-10" },
              { type: "フィラリア", date: "2026-04-01", nextDue: "2026-05-01" }
            ]}
          />

          <HealthTrackingPanel petId={petId} />

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
        </div>
      );
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load pet detail");
  }

  const payload = (await response.json()) as PetDetailResponse;
  const pet = payload.data;
  const activeToken = pet.emergencyToken?.isActive ? pet.emergencyToken.token : null;
  const emergencyLinkToken = process.env.PLAYWRIGHT_E2E === "1" ? E2E_PUBLIC_EMERGENCY_TOKEN : activeToken;
  return (
    <div className="space-y-4">
      {emergencyLinkToken ? (
        <a
          href={`/e/${emergencyLinkToken}`}
          className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
        >
          緊急情報を確認
        </a>
      ) : null}

      <PetProfileEditorCard
        petId={petId}
        initialPet={{
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          sex: pet.sex,
          ageYears: pet.ageYears,
          weightKg: pet.weightKg,
          birthday: pet.birthday,
          notesPersonality: pet.notesPersonality,
          notesFeatures: pet.notesFeatures,
          mainPhotoUrl: pet.mainPhotoUrl,
          photos: pet.photos
        }}
      />

      <PetPhotoGallery petId={petId} photos={pet.photos.map((photo) => photo.photoUrl)} />

      <EmergencyEditorCard petId={petId} initialEmergencyInfo={pet.emergencyInfo} />

      <EmergencyQrShareCard petId={petId} />

      <MedicationManagerCard
        petId={petId}
        initialItems={pet.medications.map((item) => ({
          id: item.id,
          name: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          startDate: normalizeDate(item.startDate),
          endDate: item.endDate ? normalizeDate(item.endDate) : null
        }))}
      />

      <VaccinationManager
        petId={petId}
        initialItems={pet.vaccinations.map((item) => ({
          id: item.id,
          typeCode: item.type,
          date: normalizeDate(item.date),
          nextDue: item.nextDue ? normalizeDate(item.nextDue) : null,
          type:
            item.type === "RABIES"
              ? "狂犬病"
              : item.type === "CORE"
                ? "混合ワクチン"
                : item.type === "HEARTWORM"
                  ? "フィラリア"
                  : item.type === "FLEA_TICK"
                    ? "ノミ・ダニ"
                    : "その他"
        }))}
      />

      <HealthTrackingPanel petId={petId} />

      <MedicalRecordManager
        petId={petId}
        initialItems={pet.medicalRecords.map((item) => ({
          id: item.id,
          date: normalizeDate(item.date),
          title: item.title,
          description: item.description,
          recordType: item.recordType
        }))}
      />
    </div>
  );
}
