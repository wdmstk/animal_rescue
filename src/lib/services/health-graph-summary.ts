import type { HealthTrendSeries } from "@/types/health";

export type HealthGraphSummary = {
  latest: number;
  min: number;
  max: number;
  count: number;
  startDate: string;
  endDate: string;
};

export function summarizeHealthTrendSeries(series: HealthTrendSeries | null): HealthGraphSummary | null {
  if (!series || series.points.length === 0) {
    return null;
  }

  const values = series.points.map((point) => point.y);
  const latestPoint = series.points[series.points.length - 1];
  const firstPoint = series.points[0];

  if (!latestPoint || !firstPoint) {
    return null;
  }

  return {
    latest: latestPoint.y,
    min: Math.min(...values),
    max: Math.max(...values),
    count: series.points.length,
    startDate: firstPoint.x,
    endDate: latestPoint.x
  };
}
