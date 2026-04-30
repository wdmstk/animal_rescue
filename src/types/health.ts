export const CORE_METRIC_TYPES = [
  "WEIGHT_KG",
  "WATER_INTAKE_ML",
  "APPETITE_SCORE",
  "URINATION_COUNT",
  "DEFECATION_COUNT",
  "VOMIT_COUNT",
  "BODY_TEMPERATURE_C"
] as const;

export const LAB_MARKER_TYPES = [
  "CRE",
  "BUN",
  "SDMA",
  "PHOSPHORUS",
  "ALT",
  "AST",
  "ALP",
  "GLU",
  "WBC",
  "HCT",
  "TP",
  "ALB",
  "TCHO",
  "TG",
  "Na",
  "K",
  "Cl",
  "CRP",
  "URINE_GLUCOSE",
  "URINE_KETONE",
  "USG",
  "URINE_PROTEIN",
  "UPCR",
  "FRUCTOSAMINE",
  "T4",
  "FT4",
  "TSH",
  "CORTISOL",
  "INSULIN",
  "ACTH"
] as const;
export const LAB_RESULT_CATEGORIES = ["BLOOD", "URINE", "ENDOCRINE"] as const;

export type CoreMetricType = (typeof CORE_METRIC_TYPES)[number];
export type LabMarkerType = (typeof LAB_MARKER_TYPES)[number];
export type LabResultCategory = (typeof LAB_RESULT_CATEGORIES)[number];

export const LAB_MARKER_CATEGORY_MAP: Record<LabMarkerType, LabResultCategory> = {
  CRE: "BLOOD",
  BUN: "BLOOD",
  SDMA: "BLOOD",
  PHOSPHORUS: "BLOOD",
  ALT: "BLOOD",
  AST: "BLOOD",
  ALP: "BLOOD",
  GLU: "BLOOD",
  WBC: "BLOOD",
  HCT: "BLOOD",
  TP: "BLOOD",
  ALB: "BLOOD",
  TCHO: "BLOOD",
  TG: "BLOOD",
  Na: "BLOOD",
  K: "BLOOD",
  Cl: "BLOOD",
  CRP: "BLOOD",
  URINE_GLUCOSE: "URINE",
  URINE_KETONE: "URINE",
  USG: "URINE",
  URINE_PROTEIN: "URINE",
  UPCR: "URINE",
  FRUCTOSAMINE: "ENDOCRINE",
  T4: "ENDOCRINE",
  FT4: "ENDOCRINE",
  TSH: "ENDOCRINE",
  CORTISOL: "ENDOCRINE",
  INSULIN: "ENDOCRINE",
  ACTH: "ENDOCRINE"
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
  name: string;
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
