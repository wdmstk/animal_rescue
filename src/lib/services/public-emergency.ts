import type { EmergencyViewPayload } from "@/types/domain";

type RawEmergency = {
  petName: string;
  disease: string | null;
  allergy: string | null;
  currentMedications: string | null;
  vetName: string | null;
  vetPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
};

const normalize = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const toPublicEmergencyView = (raw: RawEmergency): EmergencyViewPayload => ({
  petName: raw.petName,
  disease: normalize(raw.disease),
  medications: normalize(raw.currentMedications),
  allergy: normalize(raw.allergy),
  vetName: normalize(raw.vetName),
  vetPhone: normalize(raw.vetPhone),
  emergencyContactName: normalize(raw.emergencyContactName),
  emergencyContactPhone: normalize(raw.emergencyContactPhone)
});
