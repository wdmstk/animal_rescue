import { EmergencyPublicView } from "@/components/features/pets/emergency-public-view";

export default function EmergencyPublicPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-emergency-50 p-4">
      <div className="mx-auto w-full max-w-md">
        <EmergencyPublicView
          token={params.token}
          data={{
            petName: "モカ",
            disease: "僧帽弁閉鎖不全症（軽度）",
            medications: "ピモベンダン 1日2回",
            allergy: "鶏肉",
            vetName: "みなと動物病院",
            vetPhone: "03-1234-5678",
            emergencyContactName: "山田 花子",
            emergencyContactPhone: "090-1234-5678"
          }}
        />
      </div>
    </div>
  );
}
