import type { CoreHealthEntry, HealthExtensionEntry, HealthTrendSeries, LabResultEntry } from "@/types/health";

const coreLabelMap: Record<CoreHealthEntry["type"], string> = {
  WEIGHT_KG: "体重 (kg)",
  WATER_INTAKE_ML: "飲水量 (mL)",
  APPETITE_SCORE: "食欲スコア",
  URINATION_COUNT: "排尿回数",
  DEFECATION_COUNT: "排便回数",
  VOMIT_COUNT: "嘔吐回数",
  BODY_TEMPERATURE_C: "体温 (℃)"
};

const labLabelMap: Record<LabResultEntry["marker"], string> = {
  CRE: "Cre",
  BUN: "BUN",
  SDMA: "SDMA",
  PHOSPHORUS: "リン(P)",
  ALT: "ALT",
  AST: "AST",
  ALP: "ALP",
  GLU: "GLU",
  WBC: "WBC",
  HCT: "HCT",
  TP: "TP",
  ALB: "ALB",
  TCHO: "TCHO",
  TG: "TG",
  Na: "Na",
  K: "K",
  Cl: "Cl",
  CRP: "CRP",
  URINE_GLUCOSE: "尿糖",
  URINE_KETONE: "尿ケトン",
  USG: "尿比重",
  URINE_PROTEIN: "尿蛋白",
  UPCR: "UPCR",
  FRUCTOSAMINE: "フルクトサミン",
  T4: "T4",
  FT4: "FT4",
  TSH: "TSH",
  CORTISOL: "コルチゾール",
  INSULIN: "インスリン",
  ACTH: "ACTH"
};

const toDay = (value: string) => value.slice(0, 10);
const toExtensionSeriesKey = (name: string) => `ext:${name.trim().toLowerCase()}`;
const toExtensionSeriesLabel = (entry: HealthExtensionEntry) => (entry.unit ? `${entry.name} (${entry.unit})` : entry.name);

const sortPoints = (points: { x: string; y: number }[]) =>
  [...points].sort((a, b) => a.x.localeCompare(b.x));

export function buildHealthTrendSeries(
  coreEntries: CoreHealthEntry[],
  labEntries: LabResultEntry[],
  extensionEntries: HealthExtensionEntry[]
): HealthTrendSeries[] {
  const map = new Map<string, HealthTrendSeries>();

  const upsert = (key: string, label: string, point: { x: string; y: number }) => {
    const existing = map.get(key);
    if (existing) {
      existing.points.push(point);
      return;
    }

    map.set(key, {
      key,
      label,
      points: [point]
    });
  };

  for (const entry of coreEntries) {
    upsert(`core:${entry.type}`, coreLabelMap[entry.type], { x: toDay(entry.recordedAt), y: entry.value });
  }

  for (const entry of labEntries) {
    upsert(`lab:${entry.marker}`, labLabelMap[entry.marker], { x: toDay(entry.recordedAt), y: entry.value });
  }

  for (const entry of extensionEntries) {
    upsert(toExtensionSeriesKey(entry.name), toExtensionSeriesLabel(entry), { x: toDay(entry.recordedAt), y: entry.value });
  }

  return [...map.values()]
    .map((series) => ({
      ...series,
      points: sortPoints(series.points)
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
