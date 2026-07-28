import { notFound } from "next/navigation";
import { AniLinkPassView } from "@/components/features/pets/anilink-pass-view";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getAniLinkPassByToken } from "@/lib/services/anilink-pass-query";

type AniLinkPassPageProps = {
  params: Promise<{ token: string }>;
};

export default async function AniLinkPassPage({ params }: AniLinkPassPageProps) {
  const { token } = await params;

  if (!isEmergencyToken(token)) {
    notFound();
  }

  const passData = await getAniLinkPassByToken(token);
  if (!passData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#07070a] p-4 sm:p-6 md:p-8 relative overflow-hidden flex items-center justify-center">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[15%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute -bottom-[20%] -right-[15%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <AniLinkPassView data={passData} />
      </div>
    </div>
  );
}
