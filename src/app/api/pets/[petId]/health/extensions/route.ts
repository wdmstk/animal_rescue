import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { healthExtensionEntryInputSchema, healthPetIdParamSchema } from "@/lib/validators/health";

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = healthPetIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const data = await prisma.petHealthExtensionEntry.findMany({
    where: { petId: access.petId },
    orderBy: { recordedAt: "desc" }
  });

  return NextResponse.json({
    data: data.map((item) => ({
      id: item.id,
      petId: item.petId,
      name: item.name,
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

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = healthExtensionEntryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.petHealthExtensionEntry.create({
    data: {
      petId: access.petId,
      name: parsed.data.name,
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
        name: created.name,
        value: Number(created.value),
        unit: created.unit,
        recordedAt: created.recordedAt.toISOString(),
        note: created.note
      }
    },
    { status: 201 }
  );
}
