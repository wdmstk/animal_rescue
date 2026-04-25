import type { HealthTrendSeries } from "@/types/health";

export type HealthSeriesCategory = "all" | "core" | "lab" | "ext";

const dayMs = 24 * 60 * 60 * 1000;

const categoryPrefixMap: Record<Exclude<HealthSeriesCategory, "all">, string> = {
  core: "core:",
  lab: "lab:",
  ext: "ext:"
};

function isWithinDays(pointDate: string, threshold: Date): boolean {
  const date = new Date(`${pointDate}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date >= threshold;
}

export function filterHealthSeries(
  series: HealthTrendSeries[],
  category: HealthSeriesCategory,
  days: number | null,
  today: Date = new Date()
): HealthTrendSeries[] {
  const categoryFiltered =
    category === "all"
      ? series
      : series.filter((item) => item.key.startsWith(categoryPrefixMap[category]));

  if (days === null) {
    return categoryFiltered;
  }

  const threshold = new Date(today.getTime() - (days - 1) * dayMs);

  return categoryFiltered
    .map((item) => ({
      ...item,
      points: item.points.filter((point) => isWithinDays(point.x, threshold))
    }))
    .filter((item) => item.points.length > 0);
}

export function pickDisplaySeriesKey(series: HealthTrendSeries[], current: string): string {
  if (series.some((item) => item.key === current)) {
    return current;
  }

  return series[0]?.key ?? "core:WEIGHT_KG";
}
