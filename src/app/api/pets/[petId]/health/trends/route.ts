import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildHealthTrendSeries } from "@/lib/services/health-trends";

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const [coreMetrics, labResults, extensions] = await Promise.all([
    prisma.petCoreMetricEntry.findMany({
      where: { petId: params.petId },
      orderBy: { recordedAt: "asc" }
    }),
    prisma.petLabResultEntry.findMany({
      where: { petId: params.petId },
      orderBy: { recordedAt: "asc" }
    }),
    prisma.petHealthExtensionEntry.findMany({
      where: { petId: params.petId },
      orderBy: { recordedAt: "asc" }
    })
  ]);

  const series = buildHealthTrendSeries(
    coreMetrics.map((item) => ({
      id: item.id,
      petId: item.petId,
      type: item.type,
      value: Number(item.value),
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    })),
    labResults.map((item) => ({
      id: item.id,
      petId: item.petId,
      marker: item.marker,
      value: Number(item.value),
      unit: item.unit,
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    })),
    extensions.map((item) => ({
      id: item.id,
      petId: item.petId,
      key: item.key,
      value: Number(item.value),
      unit: item.unit,
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    }))
  );

  return NextResponse.json({ data: { series } });
}
