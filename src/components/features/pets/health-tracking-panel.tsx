"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { filterHealthSeries, pickDisplaySeriesKey, type HealthSeriesCategory } from "@/lib/services/health-series-filter";
import { summarizeHealthTrendSeries } from "@/lib/services/health-graph-summary";
import type { CoreHealthEntry, HealthExtensionEntry, HealthTrendSeries, LabResultEntry } from "@/types/health";
import { CORE_METRIC_TYPES, LAB_MARKER_CATEGORY_MAP, LAB_MARKER_TYPES } from "@/types/health";
import { isValidDateInput, parseNonNegativeNumber } from "@/lib/validators/health-input-ui";
import { Tooltip } from "@/components/ui/tooltip";

type HealthTrackingPanelProps = {
  petId: string;
};

type HealthSnapshot = {
  coreEntries: CoreHealthEntry[];
  labEntries: LabResultEntry[];
  extensionEntries: HealthExtensionEntry[];
  series: HealthTrendSeries[];
};
type ExtensionDraft = {
  id: string;
  name: string;
  value: string;
  unit: string;
  recordedAt: string;
  note: string;
};

const coreTypeLabelMap: Record<(typeof CORE_METRIC_TYPES)[number], string> = {
  WEIGHT_KG: "体重 (kg)",
  WATER_INTAKE_ML: "飲水量 (mL)",
  APPETITE_SCORE: "食欲スコア",
  URINATION_COUNT: "排尿回数",
  DEFECATION_COUNT: "排便回数",
  VOMIT_COUNT: "嘔吐回数",
  BODY_TEMPERATURE_C: "体温 (℃)"
};

const labMarkerLabelMap: Record<(typeof LAB_MARKER_TYPES)[number], string> = {
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
const labCategoryLabelMap: Record<LabResultEntry["category"], string> = {
  BLOOD: "血液検査",
  URINE: "尿検査",
  ENDOCRINE: "内分泌検査"
};
const labMarkersByCategory: Record<LabResultEntry["category"], Array<(typeof LAB_MARKER_TYPES)[number]>> = {
  BLOOD: LAB_MARKER_TYPES.filter((item) => LAB_MARKER_CATEGORY_MAP[item] === "BLOOD"),
  URINE: LAB_MARKER_TYPES.filter((item) => LAB_MARKER_CATEGORY_MAP[item] === "URINE"),
  ENDOCRINE: LAB_MARKER_TYPES.filter((item) => LAB_MARKER_CATEGORY_MAP[item] === "ENDOCRINE")
};

const today = new Date().toISOString().slice(0, 10);
const createExtensionDraft = (): ExtensionDraft => ({
  id: crypto.randomUUID(),
  name: "",
  value: "",
  unit: "",
  recordedAt: today,
  note: ""
});
const periodOptions: { label: string; value: number | null }[] = [
  { label: "全期間", value: null },
  { label: "90日", value: 90 },
  { label: "30日", value: 30 },
  { label: "7日", value: 7 }
];
const categoryOptions: { label: string; value: HealthSeriesCategory }[] = [
  { label: "全項目", value: "all" },
  { label: "共通コア", value: "core" },
  { label: "血液検査", value: "lab" },
  { label: "拡張項目", value: "ext" }
];

type TrendLineChartProps = {
  series: HealthTrendSeries;
};

function TrendLineChart({ series }: TrendLineChartProps) {
  if (series.points.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm text-slate-600">データがありません。</p>
        <p className="mt-1 text-xs text-slate-500">上の健康入力フォームから記録を追加してください。</p>
      </div>
    );
  }

  if (series.points.length === 1) {
    const point = series.points[0];
    return (
      <p className="text-sm text-slate-600">
        {point.x}: <span className="font-semibold">{point.y}</span>
      </p>
    );
  }

  const width = 320;
  const height = 120;
  const padding = 16;
  const ys = series.points.map((point) => point.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yRange = maxY - minY || 1;

  const toX = (index: number) => padding + (index / (series.points.length - 1)) * (width - padding * 2);
  const toY = (value: number) => padding + ((maxY - value) / yRange) * (height - padding * 2);

  const polylinePoints = series.points.map((point, index) => `${toX(index)},${toY(point.y)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-28 w-full rounded-lg bg-slate-50">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
      <polyline fill="none" stroke="#0f766e" strokeWidth="2" points={polylinePoints} />
      {series.points.map((point, index) => (
        <circle key={`${point.x}-${index}`} cx={toX(index)} cy={toY(point.y)} r="2.5" fill="#0f766e" />
      ))}
    </svg>
  );
}

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

const postJson = async (url: string, body: object) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
};

const fetchHealthSnapshot = async (petId: string): Promise<HealthSnapshot> => {
  const [coreRes, labRes, extensionRes, trendRes] = await Promise.all([
    fetchJson<{ data: CoreHealthEntry[] }>(`/api/pets/${petId}/health/core-metrics`),
    fetchJson<{ data: LabResultEntry[] }>(`/api/pets/${petId}/health/lab-results`),
    fetchJson<{ data: HealthExtensionEntry[] }>(`/api/pets/${petId}/health/extensions`),
    fetchJson<{ data: { series: HealthTrendSeries[] } }>(`/api/pets/${petId}/health/trends`)
  ]);

  return {
    coreEntries: coreRes.data,
    labEntries: labRes.data,
    extensionEntries: extensionRes.data,
    series: trendRes.data.series
  };
};

export function HealthTrackingPanel({ petId }: HealthTrackingPanelProps) {
  const [coreEntries, setCoreEntries] = useState<CoreHealthEntry[]>([]);
  const [labEntries, setLabEntries] = useState<LabResultEntry[]>([]);
  const [extensionEntries, setExtensionEntries] = useState<HealthExtensionEntry[]>([]);
  const [series, setSeries] = useState<HealthTrendSeries[]>([]);

  const [coreType, setCoreType] = useState<(typeof CORE_METRIC_TYPES)[number]>("WEIGHT_KG");
  const [coreValue, setCoreValue] = useState("4.2");
  const [coreDate, setCoreDate] = useState(today);

  const [labCategory, setLabCategory] = useState<LabResultEntry["category"]>("BLOOD");
  const [labMarker, setLabMarker] = useState<(typeof LAB_MARKER_TYPES)[number]>("CRE");
  const [labValue, setLabValue] = useState("1.8");
  const [labUnit, setLabUnit] = useState("mg/dL");
  const [labDate, setLabDate] = useState(today);

  const [enableExtension, setEnableExtension] = useState(false);
  const [extensionRows, setExtensionRows] = useState<ExtensionDraft[]>([createExtensionDraft()]);

  const [selectedSeriesKey, setSelectedSeriesKey] = useState<string>("core:WEIGHT_KG");
  const [seriesCategory, setSeriesCategory] = useState<HealthSeriesCategory>("all");
  const [seriesDays, setSeriesDays] = useState<number | null>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applySnapshot = (snapshot: HealthSnapshot) => {
    setCoreEntries(snapshot.coreEntries);
    setLabEntries(snapshot.labEntries);
    setExtensionEntries(snapshot.extensionEntries);
    setSeries(snapshot.series);
    setSelectedSeriesKey((current) => {
      if (snapshot.series.some((item) => item.key === current)) {
        return current;
      }

      return snapshot.series[0]?.key ?? "core:WEIGHT_KG";
    });
  };

  const refreshData = async () => {
    const snapshot = await fetchHealthSnapshot(petId);
    applySnapshot(snapshot);
    setErrorMessage(null);
  };

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      try {
        const snapshot = await fetchHealthSnapshot(petId);
        if (canceled) {
          return;
        }

        applySnapshot(snapshot);
        setErrorMessage(null);
      } catch {
        if (!canceled) {
          setErrorMessage("健康記録の取得に失敗しました。DB未接続時はこの表示になります。");
        }
      }
    };

    void run();

    return () => {
      canceled = true;
    };
  }, [petId]);

  const displaySeries = useMemo(() => filterHealthSeries(series, seriesCategory, seriesDays), [series, seriesCategory, seriesDays]);
  const selectedSeries = useMemo(
    () => displaySeries.find((item) => item.key === selectedSeriesKey) ?? displaySeries[0] ?? null,
    [selectedSeriesKey, displaySeries]
  );
  const selectedSeriesSummary = useMemo(() => summarizeHealthTrendSeries(selectedSeries), [selectedSeries]);
  const parsedCoreValue = parseNonNegativeNumber(coreValue);
  const parsedLabValue = parseNonNegativeNumber(labValue);
  const hasCoreInputError = parsedCoreValue === null || !isValidDateInput(coreDate);
  const hasLabInputError = parsedLabValue === null || !isValidDateInput(labDate) || labUnit.trim().length === 0;
  const hasExtensionInputError = extensionRows.some(
    (item) => item.name.trim().length === 0 || parseNonNegativeNumber(item.value) === null || !isValidDateInput(item.recordedAt)
  );
  const availableLabMarkers = useMemo(() => labMarkersByCategory[labCategory], [labCategory]);

  const submitCore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasCoreInputError || parsedCoreValue === null) {
      setErrorMessage("共通コアの入力値または日付が不正です。");
      return;
    }

    setIsSubmitting(true);
    try {
      await postJson(`/api/pets/${petId}/health/core-metrics`, {
        type: coreType,
        value: parsedCoreValue,
        recordedAt: coreDate
      });
      await refreshData();
    } catch {
      setErrorMessage("共通コアの保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLab = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasLabInputError || parsedLabValue === null) {
      setErrorMessage("検査項目の入力値・単位・日付を確認してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await postJson(`/api/pets/${petId}/health/lab-results`, {
        category: labCategory,
        marker: labMarker,
        value: parsedLabValue,
        unit: labUnit.trim(),
        recordedAt: labDate
      });
      await refreshData();
    } catch {
      setErrorMessage("検査項目の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitExtension = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasExtensionInputError) {
      setErrorMessage("拡張項目の入力値または日付が不正です。");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        extensionRows.map((item) =>
          postJson(`/api/pets/${petId}/health/extensions`, {
            name: item.name.trim(),
            value: parseNonNegativeNumber(item.value),
            unit: item.unit.trim() || null,
            recordedAt: item.recordedAt,
            note: item.note.trim() || null
          })
        )
      );
      await refreshData();
      setExtensionRows([createExtensionDraft()]);
    } catch {
      setErrorMessage("拡張項目の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">健康記録</h2>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={enableExtension} onChange={(event) => setEnableExtension(event.target.checked)} />
          拡張項目（例: 点滴量）
        </label>
      </div>

      {errorMessage && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{errorMessage}</p>}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <form onSubmit={submitCore} className="space-y-2 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold text-slate-800">共通コアを記録</p>
            <Tooltip content="日常的に記録する基本的な健康指標です。体重、飲水量、食欲など。">
              <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
            </Tooltip>
          </div>
          <select
            value={coreType}
            onChange={(event) => setCoreType(event.target.value as (typeof CORE_METRIC_TYPES)[number])}
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          >
            {CORE_METRIC_TYPES.map((item) => (
              <option key={item} value={item}>
                {coreTypeLabelMap[item]}
              </option>
            ))}
          </select>
          <input
            value={coreValue}
            onChange={(event) => setCoreValue(event.target.value)}
            type="number"
            step="0.01"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="値"
          />
          <input
            value={coreDate}
            onChange={(event) => setCoreDate(event.target.value)}
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting || hasCoreInputError}
            className="w-full rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            保存
          </button>
        </form>

        <form onSubmit={submitLab} className="space-y-2 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold text-slate-800">{labCategoryLabelMap[labCategory]}を記録</p>
            <Tooltip content="血液・尿・内分泌などの検査項目を記録します。獣医師からの検査結果を入力してください。">
              <span className="text-slate-400 hover:text-slate-600 cursor-help">?</span>
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {(Object.keys(labCategoryLabelMap) as LabResultEntry["category"][]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setLabCategory(item);
                  const nextDefaultMarker = labMarkersByCategory[item][0];
                  setLabMarker(nextDefaultMarker);
                }}
                className={`rounded px-2 py-1 text-xs ${
                  labCategory === item ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                {labCategoryLabelMap[item]}
              </button>
            ))}
          </div>
          <select
            value={labMarker}
            onChange={(event) => setLabMarker(event.target.value as (typeof LAB_MARKER_TYPES)[number])}
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          >
            {availableLabMarkers.map((item) => (
              <option key={item} value={item}>
                {labMarkerLabelMap[item]}
              </option>
            ))}
          </select>
          <input
            value={labValue}
            onChange={(event) => setLabValue(event.target.value)}
            type="number"
            step="0.01"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="値"
          />
          <input
            value={labUnit}
            onChange={(event) => setLabUnit(event.target.value)}
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="単位"
          />
          <input
            value={labDate}
            onChange={(event) => setLabDate(event.target.value)}
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting || hasLabInputError}
            className="w-full rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            保存
          </button>
        </form>
      </div>

      {enableExtension && (
        <form onSubmit={submitExtension} className="mt-3 space-y-2 rounded-xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-sm font-semibold text-teal-900">拡張項目（複数可）</p>
          {extensionRows.map((row) => (
            <div key={row.id} className="grid gap-2 rounded-lg border border-teal-200 bg-white p-2 md:grid-cols-5">
              <input
                value={row.name}
                onChange={(event) =>
                  setExtensionRows((current) => current.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)))
                }
                type="text"
                className="rounded border border-teal-300 px-2 py-1 text-sm"
                placeholder="項目名"
              />
              <input
                value={row.value}
                onChange={(event) =>
                  setExtensionRows((current) => current.map((item) => (item.id === row.id ? { ...item, value: event.target.value } : item)))
                }
                type="number"
                step="0.01"
                className="rounded border border-teal-300 px-2 py-1 text-sm"
                placeholder="値"
              />
              <input
                value={row.unit}
                onChange={(event) =>
                  setExtensionRows((current) => current.map((item) => (item.id === row.id ? { ...item, unit: event.target.value } : item)))
                }
                type="text"
                className="rounded border border-teal-300 px-2 py-1 text-sm"
                placeholder="単位"
              />
              <input
                value={row.recordedAt}
                onChange={(event) =>
                  setExtensionRows((current) => current.map((item) => (item.id === row.id ? { ...item, recordedAt: event.target.value } : item)))
                }
                type="date"
                className="rounded border border-teal-300 px-2 py-1 text-sm"
              />
              <input
                value={row.note}
                onChange={(event) =>
                  setExtensionRows((current) => current.map((item) => (item.id === row.id ? { ...item, note: event.target.value } : item)))
                }
                type="text"
                className="rounded border border-teal-300 px-2 py-1 text-sm"
                placeholder="メモ"
              />
              {extensionRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setExtensionRows((current) => current.filter((item) => item.id !== row.id))}
                  className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 md:col-span-5"
                >
                  この行を削除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExtensionRows((current) => [...current, createExtensionDraft()])}
            className="w-full rounded border border-teal-300 bg-white px-3 py-2 text-xs font-semibold text-teal-800"
          >
            行を追加
          </button>
          <button
            type="submit"
            disabled={isSubmitting || hasExtensionInputError}
            className="w-full rounded bg-teal-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            拡張項目を保存
          </button>
        </form>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">推移グラフ</p>
          <div className="flex items-center gap-2">
            <select
              value={seriesDays === null ? "all" : String(seriesDays)}
              onChange={(event) => setSeriesDays(event.target.value === "all" ? null : Number(event.target.value))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              {periodOptions.map((item) => (
                <option key={item.label} value={item.value === null ? "all" : item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categoryOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setSeriesCategory(item.value);
                setSelectedSeriesKey((current) => pickDisplaySeriesKey(filterHealthSeries(series, item.value, seriesDays), current));
              }}
              className={`rounded-full border px-2 py-1 text-xs ${
                seriesCategory === item.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {displaySeries.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedSeriesKey(item.key)}
              className={`rounded border px-2 py-1 text-xs ${
                selectedSeries?.key === item.key ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
          {displaySeries.length === 0 && (
            <p className="text-xs text-slate-500">選択条件の系列データはありません。期間やカテゴリを変えるか、新しい記録を追加してください。</p>
          )}
        </div>
        <div className="mt-2">
          <select
            value={selectedSeries?.key ?? ""}
            onChange={(event) => setSelectedSeriesKey(event.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {displaySeries.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {selectedSeries ? <TrendLineChart series={selectedSeries} /> : <p className="mt-2 text-sm text-slate-500">系列データなし</p>}
        {selectedSeriesSummary && (
          <dl className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 md:grid-cols-5">
            <div>
              <dt className="text-slate-500">最新値</dt>
              <dd className="font-semibold text-slate-900">{selectedSeriesSummary.latest}</dd>
            </div>
            <div>
              <dt className="text-slate-500">最小値</dt>
              <dd className="font-semibold text-slate-900">{selectedSeriesSummary.min}</dd>
            </div>
            <div>
              <dt className="text-slate-500">最大値</dt>
              <dd className="font-semibold text-slate-900">{selectedSeriesSummary.max}</dd>
            </div>
            <div>
              <dt className="text-slate-500">件数</dt>
              <dd className="font-semibold text-slate-900">{selectedSeriesSummary.count}</dd>
            </div>
            <div>
              <dt className="text-slate-500">期間</dt>
              <dd className="font-semibold text-slate-900">
                {selectedSeriesSummary.startDate} - {selectedSeriesSummary.endDate}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">共通コア履歴</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {coreEntries.slice(0, 5).map((item) => (
              <li key={item.id}>
                {item.recordedAt.slice(0, 10)} / {coreTypeLabelMap[item.type]}: {item.value}
              </li>
            ))}
            {coreEntries.length === 0 && <li>記録なし</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">血液検査履歴</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {labEntries
              .filter((item) => item.category === "BLOOD")
              .slice(0, 5)
              .map((item) => (
              <li key={item.id}>
                {item.recordedAt.slice(0, 10)} / {labMarkerLabelMap[item.marker]}: {item.value} {item.unit}
              </li>
            ))}
            {labEntries.filter((item) => item.category === "BLOOD").length === 0 && <li>記録なし</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">尿検査履歴</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {labEntries
              .filter((item) => item.category === "URINE")
              .slice(0, 5)
              .map((item) => (
                <li key={item.id}>
                  {item.recordedAt.slice(0, 10)} / {labMarkerLabelMap[item.marker]}: {item.value} {item.unit}
                </li>
              ))}
            {labEntries.filter((item) => item.category === "URINE").length === 0 && <li>記録なし</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">内分泌検査履歴</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {labEntries
              .filter((item) => item.category === "ENDOCRINE")
              .slice(0, 5)
              .map((item) => (
                <li key={item.id}>
                  {item.recordedAt.slice(0, 10)} / {labMarkerLabelMap[item.marker]}: {item.value} {item.unit}
                </li>
              ))}
            {labEntries.filter((item) => item.category === "ENDOCRINE").length === 0 && <li>記録なし</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">拡張項目履歴</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {extensionEntries.slice(0, 5).map((item) => (
              <li key={item.id}>
                {item.recordedAt.slice(0, 10)} / {item.name}: {item.value} {item.unit ?? ""}
              </li>
            ))}
            {extensionEntries.length === 0 && <li>記録なし</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
