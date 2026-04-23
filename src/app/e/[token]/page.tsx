import { notFound } from "next/navigation";
import { EmergencyPublicView } from "@/components/features/pets/emergency-public-view";
import { prisma } from "@/lib/prisma";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { toPublicEmergencyView } from "@/lib/services/public-emergency";

export default async function EmergencyPublicPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isEmergencyToken(token)) {
    notFound();
  }

  const data = await prisma.petEmergencyToken.findUnique({
    where: { token },
    include: {
      pet: {
        include: {
          emergencyInfo: true
        }
      }
    }
  });

  if (!data || !data.isActive || !data.pet.emergencyInfo) {
    notFound();
  }

  const payload = toPublicEmergencyView({
    petName: data.pet.name,
    disease: data.pet.emergencyInfo.disease,
    allergy: data.pet.emergencyInfo.allergy,
    currentMedications: data.pet.emergencyInfo.currentMedications,
    vetName: data.pet.emergencyInfo.vetName,
    vetPhone: data.pet.emergencyInfo.vetPhone,
    emergencyContactName: data.pet.emergencyInfo.emergencyContactName,
    emergencyContactPhone: data.pet.emergencyInfo.emergencyContactPhone
  });

  return (
    <div className="min-h-screen bg-emergency-50 p-4">
      <div className="mx-auto w-full max-w-md">
        <EmergencyPublicView token={token} data={payload} />
      </div>
    </div>
  );
}
