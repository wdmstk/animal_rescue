"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type MetricPoint = {
  value: number;
  recordedAt: string;
};

type ComparePetData = {
  id: string;
  name: string;
  coreMetrics: MetricPoint[];
  labResults: {
    marker: string;
    value: number;
    unit: string;
    recordedAt: string;
  }[];
};

const colors = ["#0f766e", "#6d28d9", "#c2410c", "#0369a1", "#be185d"];

export default function PetsComparePage() {
  const [pets, setPets] = useState<ComparePetData[]>([]);
  const [selectedPets, setSelectedPets] = useState<Record<string, boolean>>({});
  const [metricType, setMetricType] = useState<string>("WEIGHT_KG"); // "WEIGHT_KG" or lab marker like "CRE", "BUN"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadCompareData = async () => {
      try {
        const res = await fetch("/api/households/compare");
        if (!res.ok) throw new Error("Failed to fetch comparison data");
        const payload = await res.json();
        if (isMounted) {
          setPets(payload.data || []);
          const initialSelection: Record<string, boolean> = {};
          (payload.data || []).forEach((pet: ComparePetData) => {
            initialSelection[pet.id] = true;
          });
          setSelectedPets(initialSelection);
        }
      } catch (err) {
        if (isMounted) {
          setError("データの読み込みに失敗しました。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    void loadCompareData();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableMarkers = useMemo(() => {
    const markers = new Set<string>();
    pets.forEach((pet) => {
      pet.labResults.forEach((res) => {
        markers.add(res.marker);
      });
    });
    return Array.from(markers);
  }, [pets]);

  // Filter and extract selected metric series for selected pets
  const chartData = useMemo(() => {
    const seriesList: Array<{ petName: string; color: string; points: { date: string; value: number }[] }> = [];

    pets.forEach((pet, index) => {
      if (!selectedPets[pet.id]) return;

      let rawPoints: { date: string; value: number }[] = [];
      if (metricType === "WEIGHT_KG") {
        rawPoints = pet.coreMetrics.map((m) => ({
          date: m.recordedAt.slice(0, 10),
          value: m.value
        }));
      } else {
        rawPoints = pet.labResults
          .filter((l) => l.marker === metricType)
          .map((l) => ({
            date: l.recordedAt.slice(0, 10),
            value: l.value
          }));
      }

      // Sort points chronologically
      rawPoints.sort((a, b) => a.date.localeCompare(b.date));

      if (rawPoints.length > 0) {
        seriesList.push({
          petName: pet.name,
          color: colors[index % colors.length],
          points: rawPoints
        });
      }
    });

    return seriesList;
  }, [pets, selectedPets, metricType]);

  // Compute unified min/max for chart
  const bounds = useMemo(() => {
    let allValues: number[] = [];
    let allDates: string[] = [];

    chartData.forEach((s) => {
      s.points.forEach((p) => {
        allValues.push(p.value);
        allDates.push(p.date);
      });
    });

    if (allValues.length === 0) return null;

    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const yRange = maxY - minY || 1;

    allDates = Array.from(new Set(allDates)).sort();

    return {
      minY,
      maxY,
      yRange,
      dates: allDates
    };
  }, [chartData]);

  // SVG Chart drawing helper
  const renderChart = () => {
    if (!bounds || chartData.length === 0) {
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          比較するデータが存在しません。他の指標を選択するか、ペットの健康記録を追加してください。
        </div>
      );
    }

    const width = 500;
    const height = 240;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const toX = (date: string) => {
      if (bounds.dates.length <= 1) return paddingLeft + chartWidth / 2;
      const idx = bounds.dates.indexOf(date);
      return paddingLeft + (idx / (bounds.dates.length - 1)) * chartWidth;
    };

    const toY = (value: number) => {
      return paddingTop + ((bounds.maxY - value) / bounds.yRange) * chartHeight;
    };

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2">推移比較グラフ</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full bg-slate-50 rounded-xl">
          {/* Y grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = bounds.minY + bounds.yRange * ratio;
            const y = toY(val);
            return (
              <g key={`grid-y-${ratio}`}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                <text x={paddingLeft - 5} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X date labels */}
          {bounds.dates.map((date, idx) => {
            if (bounds.dates.length > 5 && idx % Math.ceil(bounds.dates.length / 5) !== 0) return null;
            const x = toX(date);
            return (
              <text key={`date-${date}`} x={x} y={height - paddingBottom + 15} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">
                {date.slice(5)}
              </text>
            );
          })}

          {/* Lines and points */}
          {chartData.map((series) => {
            const polylinePoints = series.points.map((p) => `${toX(p.date)},${toY(p.value)}`).join(" ");

            return (
              <g key={`series-${series.petName}`}>
                {series.points.length > 1 && (
                  <polyline fill="none" stroke={series.color} strokeWidth="2.5" points={polylinePoints} />
                )}
                {series.points.map((p, idx) => (
                  <g key={`point-${series.petName}-${idx}`}>
                    <circle cx={toX(p.date)} cy={toY(p.value)} r="3.5" fill={series.color} stroke="#ffffff" strokeWidth="1" />
                    {/* Value Tooltip Label */}
                    <text x={toX(p.date)} y={toY(p.value) - 7} textAnchor="middle" className="text-[9px] font-bold fill-slate-800">
                      {p.value}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-sm text-slate-500">データを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">ペット健康データ比較</h2>
            <p className="mt-1 text-xs text-slate-500">世帯内のペットたちの体重・検査値の推移を並べて比較します。</p>
          </div>
          <Link href="/pets" className="text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-slate-50">
            一覧に戻る
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Left: controls */}
        <div className="md:col-span-1 space-y-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">1. 指標を選択</h3>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="WEIGHT_KG">体重 (kg)</option>
              {availableMarkers.map((marker) => (
                <option key={marker} value={marker}>
                  検査項目: {marker}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">2. 比較するペット</h3>
            <div className="mt-2 space-y-2">
              {pets.map((pet, idx) => (
                <label key={pet.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={!!selectedPets[pet.id]}
                    onChange={(e) =>
                      setSelectedPets((prev) => ({
                        ...prev,
                        [pet.id]: e.target.checked
                      }))
                    }
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                    {pet.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="md:col-span-2 space-y-3">
          {renderChart()}

          {/* Detail comparison list */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">直近の記録データ一覧</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="p-2.5 font-bold">ペット名</th>
                    <th className="p-2.5 font-bold">最新の記録値</th>
                    <th className="p-2.5 font-bold">記録日</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((series) => {
                    const lastPoint = series.points[series.points.length - 1];
                    return (
                      <tr key={`row-${series.petName}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="p-2.5 font-semibold flex items-center gap-1.5">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                          {series.petName}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {lastPoint ? `${lastPoint.value} ${metricType === "WEIGHT_KG" ? "kg" : ""}` : "記録なし"}
                        </td>
                        <td className="p-2.5 text-slate-500">{lastPoint ? lastPoint.date : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
