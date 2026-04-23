import { notFound } from "next/navigation";
import { EmergencyPublicView } from "@/components/features/pets/emergency-public-view";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getPublicEmergencyByToken } from "@/lib/services/public-emergency-query";

export default async function EmergencyPublicPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isEmergencyToken(token)) {
    notFound();
  }

  const payload = await getPublicEmergencyByToken(token);

  if (!payload) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-emergency-50 p-4">
      <div className="mx-auto w-full max-w-md">
        <EmergencyPublicView token={token} data={payload} />
      </div>
    </div>
  );
}
