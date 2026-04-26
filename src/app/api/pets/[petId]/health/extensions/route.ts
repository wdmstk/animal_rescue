import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { healthExtensionEntryInputSchema, healthPetIdParamSchema } from "@/lib/validators/health";

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const { petId } = parsedParams.data;
  const data = await prisma.petHealthExtensionEntry.findMany({
    where: { petId },
    orderBy: { recordedAt: "desc" }
  });

  return NextResponse.json({
    data: data.map((item) => ({
      id: item.id,
      petId: item.petId,
      key: item.key,
      value: Number(item.value),
      unit: item.unit,
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
  const parsed = healthExtensionEntryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petHealthExtensionEntry.create({
    data: {
      petId,
      key: parsed.data.key,
      value: parsed.data.value,
      unit: parsed.data.unit || null,
      recordedAt: parsed.data.recordedAt,
      note: parsed.data.note || null
    }
  });

  return NextResponse.json(
    {
      data: {
        id: created.id,
        petId: created.petId,
        key: created.key,
        value: Number(created.value),
        unit: created.unit,
        recordedAt: created.recordedAt.toISOString(),
        note: created.note
      }
    },
    { status: 201 }
  );
}
