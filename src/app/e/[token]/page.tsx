import { EmergencyPublicView } from "@/components/features/pets/emergency-public-view";

export default async function EmergencyPublicPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-emergency-50 p-4">
      <div className="mx-auto w-full max-w-md">
        <EmergencyPublicView
          token={token}
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
