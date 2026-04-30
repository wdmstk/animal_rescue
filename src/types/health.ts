export const CORE_METRIC_TYPES = [
  "WEIGHT_KG",
  "WATER_INTAKE_ML",
  "APPETITE_SCORE",
  "URINATION_COUNT",
  "DEFECATION_COUNT",
  "VOMIT_COUNT",
  "BODY_TEMPERATURE_C"
] as const;

export const LAB_MARKER_TYPES = ["CRE", "BUN", "SDMA", "PHOSPHORUS"] as const;
export const LAB_RESULT_CATEGORIES = ["BLOOD", "URINE", "ENDOCRINE"] as const;

export const HEALTH_EXTENSION_KEYS = ["INFUSION_ML"] as const;

export type CoreMetricType = (typeof CORE_METRIC_TYPES)[number];
export type LabMarkerType = (typeof LAB_MARKER_TYPES)[number];
export type LabResultCategory = (typeof LAB_RESULT_CATEGORIES)[number];
export type HealthExtensionKey = (typeof HEALTH_EXTENSION_KEYS)[number];

export const LAB_MARKER_CATEGORY_MAP: Record<LabMarkerType, LabResultCategory> = {
  CRE: "BLOOD",
  BUN: "BLOOD",
  SDMA: "ENDOCRINE",
  PHOSPHORUS: "BLOOD"
};

export type CoreHealthEntry = {
  id: string;
  petId: string;
  type: CoreMetricType;
  value: number;
  recordedAt: string;
  note: string | null;
};

export type LabResultEntry = {
  id: string;
  petId: string;
  category: LabResultCategory;
  marker: LabMarkerType;
  value: number;
  unit: string;
  recordedAt: string;
  note: string | null;
};

export type HealthExtensionEntry = {
  id: string;
  petId: string;
  key: HealthExtensionKey;
  value: number;
  unit: string | null;
  recordedAt: string;
  note: string | null;
};

export type HealthTrendPoint = {
  x: string;
  y: number;
};

export type HealthTrendSeries = {
  key: string;
  label: string;
  points: HealthTrendPoint[];
};
