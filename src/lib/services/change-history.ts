export type ChangeHistoryItem = {
  id: string;
  changedAt: string;
  target: string;
};

type EmergencyInfoSource = {
  updatedAt: string;
};

type MedicationSource = {
  id: string;
  name: string;
  createdAt: string;
};

type VaccinationSource = {
  id: string;
  type: "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER";
  customTypeName: string | null;
  createdAt: string;
};

type MedicalRecordSource = {
  id: string;
  title: string;
  createdAt: string;
};

type ChangeHistorySources = {
  emergencyInfo: EmergencyInfoSource | null;
  medications: MedicationSource[];
  vaccinations: VaccinationSource[];
  medicalRecords: MedicalRecordSource[];
};

const vaccinationTypeLabelMap: Record<VaccinationSource["type"], string> = {
  RABIES: "狂犬病",
  CORE: "混合ワクチン",
  HEARTWORM: "フィラリア",
  FLEA_TICK: "ノミ・ダニ",
  OTHER: "その他"
};

const buildTimestamp = (value: string) => new Date(value).getTime();

export const buildChangeHistoryItems = (sources: ChangeHistorySources): ChangeHistoryItem[] => {
  const items: ChangeHistoryItem[] = [];

  if (sources.emergencyInfo) {
    items.push({
      id: "emergency-info",
      changedAt: sources.emergencyInfo.updatedAt,
      target: "緊急情報"
    });
  }

  items.push(
    ...sources.medications.map((item) => ({
      id: `medication-${item.id}`,
      changedAt: item.createdAt,
      target: `投薬: ${item.name}`
    }))
  );

  items.push(
    ...sources.vaccinations.map((item) => ({
      id: `vaccination-${item.id}`,
      changedAt: item.createdAt,
      target: `ワクチン: ${item.type === "OTHER" ? item.customTypeName ?? "その他" : vaccinationTypeLabelMap[item.type]}`
    }))
  );

  items.push(
    ...sources.medicalRecords.map((item) => ({
      id: `medical-record-${item.id}`,
      changedAt: item.createdAt,
      target: `医療記録: ${item.title}`
    }))
  );

  return items.sort((a, b) => buildTimestamp(b.changedAt) - buildTimestamp(a.changedAt));
};
