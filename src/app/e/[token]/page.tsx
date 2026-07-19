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
    <div className="min-h-screen bg-[#07070a] p-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[500px] h-[500px] rounded-full bg-rose-500/15 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[100px]" />
      </div>
      
      <div className="relative z-10 mx-auto w-full max-w-md">
        <EmergencyPublicView token={token} data={payload} />
      </div>
    </div>
  );
}
