export type EmergencyViewPayload = {
  petName: string;
  disease: string | null;
  medications: string | null;
  allergy: string | null;
  vetName: string | null;
  vetPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  recentMedicationSummaries?: string[];
  recentVaccinationSummaries?: string[];
  recentMedicalRecordSummaries?: string[];
};

export type EmergencyInfoInput = {
  disease?: string | null;
  allergy?: string | null;
  currentMedications?: string | null;
  vetName?: string | null;
  vetPhone?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
};
