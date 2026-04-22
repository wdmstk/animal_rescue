import { EmergencyCard } from "@/components/features/pets/emergency-card";
import { MedicalTimeline } from "@/components/features/pets/medical-timeline";
import { PetProfileCard } from "@/components/features/pets/pet-profile-card";

export default function PetDetailPage({ params }: { params: { petId: string } }) {
  const pet = {
    id: params.petId,
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

      <EmergencyCard
        disease="僧帽弁閉鎖不全症（軽度）"
        medications="ピモベンダン 1日2回"
        allergy="鶏肉アレルギー"
        vet="みなと動物病院 03-1234-5678"
        contact="山田 花子 090-1234-5678"
      />

      <MedicalTimeline
        items={[
          {
            id: "1",
            date: "2026-04-01",
            title: "定期健診",
            description: "血液検査、尿検査ともに大きな異常なし。"
          },
          {
            id: "2",
            date: "2026-03-12",
            title: "ワクチン接種",
            description: "混合ワクチン接種。次回は1年後。"
          }
        ]}
      />
    </div>
  );
}
