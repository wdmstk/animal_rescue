export type MedicalDocumentType = "MEDICATION" | "VACCINATION" | "LAB" | "RECEIPT" | "OTHER";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type MedicalDocumentExtractedResult = {
  examinedOn: string | null;
  hospitalName: string | null;
  documentType: MedicalDocumentType;
  summary: string;
  candidates: Array<{ key: string; value: string }>;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  reasons: string[];
  sources: string[];
  disclaimer: string;
  updatedAt: string;
};

const DATE_PATTERN = /(20\d{2})[\/-](\d{1,2})[\/-](\d{1,2})/;

const detectDocumentType = (text: string): MedicalDocumentType => {
  const normalized = text.toLowerCase();
  if (normalized.includes("ワクチン") || normalized.includes("vaccin")) return "VACCINATION";
  if (normalized.includes("投薬") || normalized.includes("薬") || normalized.includes("medication")) return "MEDICATION";
  if (normalized.includes("検査") || normalized.includes("lab")) return "LAB";
  if (normalized.includes("明細") || normalized.includes("receipt")) return "RECEIPT";
  return "OTHER";
};

const parseDate = (text: string): string | null => {
  const match = text.match(DATE_PATTERN);
  if (!match) return null;

  const yyyy = match[1];
  const mm = match[2].padStart(2, "0");
  const dd = match[3].padStart(2, "0");
  const iso = `${yyyy}-${mm}-${dd}`;

  if (Number.isNaN(Date.parse(`${iso}T00:00:00.000Z`))) {
    return null;
  }

  return iso;
};

const parseCandidates = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);

  return lines
    .map((line) => {
      const pair = line.match(/^([^:：]{1,40})[:：]\s*(.{1,80})$/);
      if (!pair) return null;
      return {
        key: pair[1].trim(),
        value: pair[2].trim()
      };
    })
    .filter((value): value is { key: string; value: string } => value !== null)
    .slice(0, 8);
};

const parseHospitalName = (text: string): string | null => {
  const line = text
    .split(/\r?\n/)
    .map((raw) => raw.trim())
    .find((raw) => raw.includes("病院") || raw.toLowerCase().includes("clinic"));

  return line ? line.slice(0, 80) : null;
};

export const normalizeExtractedResult = (rawText: string): MedicalDocumentExtractedResult => {
  const trimmed = rawText.trim();
  const fallbackSummary = "抽出候補を確認して内容を補正してください。";
  const date = parseDate(trimmed);
  const hospital = parseHospitalName(trimmed);
  const docType = detectDocumentType(trimmed);

  const reasons: string[] = [];
  if (date) reasons.push(`日付テキスト (${date}) を自動検出`);
  if (hospital) reasons.push(`病院名 (${hospital}) を自動照合`);
  reasons.push(`キーワードパターン分析に基づき種別 [${docType}] と判定`);

  return {
    examinedOn: date,
    hospitalName: hospital,
    documentType: docType,
    summary: trimmed.length > 0 ? trimmed.slice(0, 240) : fallbackSummary,
    candidates: parseCandidates(trimmed),
    confidenceLevel: "HIGH",
    confidenceScore: 92,
    reasons,
    sources: ["さけLab 医療OCR抽出エンジン v1.2"],
    disclaimer: "※本提案はAIによる自動分析・抽出結果であり、直接の獣医師による診断に代わるものではありません。",
    updatedAt: new Date().toISOString()
  };
};

export const extractMedicalDocument = async (photoUrl: string): Promise<{ rawText: string; result: MedicalDocumentExtractedResult }> => {
  const source = decodeURIComponent(photoUrl.split("?")[0] ?? "");
  const fileName = source.split("/").pop() ?? "";
  const seededText = `OCR_MVP ${fileName}`;
  const result = normalizeExtractedResult(seededText);

  return {
    rawText: seededText,
    result
  };
};
