import { EmergencyCard } from "@/components/features/pets/emergency-card";
import { EmergencyQrShareCard } from "@/components/features/pets/emergency-qr-share-card";
import { MedicalTimeline } from "@/components/features/pets/medical-timeline";
import { MedicationCalendar } from "@/components/features/pets/medication-calendar";
import { PetPhotoGallery } from "@/components/features/pets/pet-photo-gallery";
import { PetProfileCard } from "@/components/features/pets/pet-profile-card";
import { VaccinationHistory } from "@/components/features/pets/vaccination-history";

export default async function PetDetailPage({
  params
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;

  const pet = {
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
        href={`/e/demo-token`}
        className="sticky top-[68px] z-10 block rounded-xl bg-emergency-500 px-4 py-3 text-center text-sm font-bold text-white shadow"
      >
        緊急情報を確認
      </a>

      <PetProfileCard pet={pet} />

      <PetPhotoGallery
        photos={[
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          "https://images.unsplash.com/photo-1548681528-6a5c45b66b42",
          "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8"
        ]}
      />

      <EmergencyCard
        disease="僧帽弁閉鎖不全症（軽度）"
        medications="ピモベンダン 1日2回"
        allergy="鶏肉アレルギー"
        vet="みなと動物病院 03-1234-5678"
        contact="山田 花子 090-1234-5678"
      />

      <EmergencyQrShareCard token="demo-token" />

      <MedicationCalendar
        periods={[
          { name: "ピモベンダン", startDate: "2026-01-01", endDate: null },
          { name: "整腸剤", startDate: "2026-04-20", endDate: "2026-04-25" }
        ]}
      />

      <VaccinationHistory
        items={[
          { type: "狂犬病", date: "2026-03-20", nextDue: "2027-03-20" },
          { type: "混合ワクチン", date: "2025-04-10", nextDue: "2026-04-10" },
          { type: "フィラリア", date: "2026-04-01", nextDue: "2026-05-01" }
        ]}
      />

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">記録を追加</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">
            診察を追加
          </button>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700">
            検査を追加
          </button>
        </div>
      </section>

      <MedicalTimeline
        items={[
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
