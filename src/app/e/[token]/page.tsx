import { notFound } from "next/navigation";
import { EmergencyPublicView } from "@/components/features/pets/emergency-public-view";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getPublicEmergencyByToken } from "@/lib/services/public-emergency-query";

type EmergencyPublicPageProps = {
  params: Promise<{ token: string }>;
};

async function loadEmergencyPayload(token: string) {
  if (!isEmergencyToken(token)) {
    notFound();
  }

  const payload = await getPublicEmergencyByToken(token);
  if (!payload) {
    notFound();
  }

  return payload;
}

export default async function PublicEmergencyPage({ params }: EmergencyPublicPageProps) {
  const { token } = await params;
  const payload = await loadEmergencyPayload(token);

  return (
    <div className="min-h-screen bg-emergency-50 p-4">
      <div className="mx-auto w-full max-w-md">
        <EmergencyPublicView token={token} data={payload} />
      </div>
    </div>
  );
}
