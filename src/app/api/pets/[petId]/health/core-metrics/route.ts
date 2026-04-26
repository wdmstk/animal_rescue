import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coreHealthEntryInputSchema, coreMetricTypeFilterSchema, healthPetIdParamSchema } from "@/lib/validators/health";

export async function GET(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const { petId } = parsedParams.data;
  const url = new URL(request.url);
  const parsedFilter = coreMetricTypeFilterSchema.safeParse({
    type: url.searchParams.get("type") ?? undefined
  });

  if (!parsedFilter.success) {
    return NextResponse.json({ error: parsedFilter.error.flatten() }, { status: 400 });
  }

  const data = await prisma.petCoreMetricEntry.findMany({
    where: {
      petId,
      type: parsedFilter.data.type
    },
    orderBy: { recordedAt: "desc" }
  });

  return NextResponse.json({
    data: data.map((item) => ({
      id: item.id,
      petId: item.petId,
      type: item.type,
      value: Number(item.value),
      recordedAt: item.recordedAt.toISOString(),
      note: item.note
    }))
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const { petId } = parsedParams.data;
  const body = await request.json();
  const parsed = coreHealthEntryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petCoreMetricEntry.create({
    data: {
      petId,
      type: parsed.data.type,
      value: parsed.data.value,
      recordedAt: parsed.data.recordedAt,
      note: parsed.data.note || null
    }
  });

  return NextResponse.json(
    {
      data: {
        id: created.id,
        petId: created.petId,
        type: created.type,
        value: Number(created.value),
        recordedAt: created.recordedAt.toISOString(),
        note: created.note
      }
    },
    { status: 201 }
  );
}
