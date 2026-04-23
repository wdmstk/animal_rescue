import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toPublicEmergencyView } from "@/lib/services/public-emergency";
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

export const getPublicEmergencyByToken = async (token: string): Promise<EmergencyViewPayload | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_emergency_by_token", {
    input_token: token
  });

  if (error) {
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
