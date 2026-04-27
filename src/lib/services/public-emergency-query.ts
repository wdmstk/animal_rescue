import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toPublicEmergencyView } from "@/lib/services/public-emergency";
import { E2E_PUBLIC_EMERGENCY_TOKEN } from "@/lib/constants/emergency";
import type { EmergencyViewPayload } from "@/types/domain";

type PublicEmergencyRpcRow = {
  pet_name: string;
  disease: string | null;
  current_medications: string | null;
  allergy: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

const isRpcFunctionMissingError = (error: { code?: string; message?: string | null }) => {
  if (error.code === "PGRST202") {
    return true;
  }

  const message = error.message?.toLowerCase() ?? "";
  return message.includes("could not find the function") && message.includes("get_public_emergency_by_token");
};

const getPublicEmergencyByTokenFallback = async (token: string): Promise<EmergencyViewPayload | null> => {
  const { prisma } = await import("@/lib/prisma");
  const tokenRow = await prisma.petEmergencyToken.findFirst({
    where: {
      token,
      isActive: true
    },
    select: {
      pet: {
        select: {
          name: true,
          emergencyInfo: {
            select: {
              disease: true,
              allergy: true,
              currentMedications: true,
              vetName: true,
              vetPhone: true,
              emergencyContactName: true,
              emergencyContactPhone: true
            }
          }
        }
      }
    }
  });

  if (!tokenRow?.pet.emergencyInfo) {
    return null;
  }

  return toPublicEmergencyView({
    petName: tokenRow.pet.name,
    disease: tokenRow.pet.emergencyInfo.disease,
    allergy: tokenRow.pet.emergencyInfo.allergy,
    currentMedications: tokenRow.pet.emergencyInfo.currentMedications,
    vetName: tokenRow.pet.emergencyInfo.vetName,
    vetPhone: tokenRow.pet.emergencyInfo.vetPhone,
    emergencyContactName: tokenRow.pet.emergencyInfo.emergencyContactName,
    emergencyContactPhone: tokenRow.pet.emergencyInfo.emergencyContactPhone
  });
};

export const getPublicEmergencyByToken = async (token: string): Promise<EmergencyViewPayload | null> => {
  if (process.env.PLAYWRIGHT_E2E === "1") {
    if (token !== E2E_PUBLIC_EMERGENCY_TOKEN) {
      return null;
    }

    return {
      petName: "モカ（E2E）",
      disease: "僧帽弁閉鎖不全症（軽度）",
      medications: "ピモベンダン 1日2回",
      allergy: "鶏肉アレルギー",
      vetName: "みなと動物病院",
      vetPhone: "03-1234-5678",
      emergencyContactName: "山田 花子",
      emergencyContactPhone: "090-1234-5678"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_emergency_by_token", {
    input_token: token
  });

  if (error) {
    if (isRpcFunctionMissingError(error)) {
      return getPublicEmergencyByTokenFallback(token);
    }

    throw new Error(`Failed to load public emergency data: ${error.message}`);
  }

  const row = (data as PublicEmergencyRpcRow[] | null)?.[0];
  if (!row) {
    return null;
  }

  return toPublicEmergencyView({
    petName: row.pet_name,
    disease: row.disease,
    allergy: row.allergy,
    currentMedications: row.current_medications,
    vetName: row.vet_name,
    vetPhone: row.vet_phone,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone
  });
};
