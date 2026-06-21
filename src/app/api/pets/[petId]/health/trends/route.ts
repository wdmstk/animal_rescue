import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { buildHealthTrendSeries } from "@/lib/services/health-trends";
import { healthPetIdParamSchema } from "@/lib/validators/health";
import { badRequest } from "@/lib/api-error";

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const [coreMetrics, labResults, extensions] = await Promise.all([
    prisma.petCoreMetricEntry.findMany({
      where: { petId: access.petId },
      orderBy: { recordedAt: "asc" }
    }),
    prisma.petLabResultEntry.findMany({
      where: { petId: access.petId },
      orderBy: { recordedAt: "asc" }
    }),
    prisma.petHealthExtensionEntry.findMany({
      where: { petId: access.petId },
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
      category: item.category,
      marker: item.marker,
      value: Number(item.value),
      unit: item.unit,
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    })),
    extensions.map((item) => ({
      id: item.id,
      petId: item.petId,
      name: item.name,
      value: Number(item.value),
      unit: item.unit,
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    }))
  );

  return NextResponse.json({ data: { series } });
}
