import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";

const paramsSchema = z.object({
  petId: z.string().uuid(),
  medicationId: z.string().uuid()
});

const medicationUpdateSchema = z.object({
  name: z.string().min(1).max(120),
  dosage: z.string().min(1).max(80),
  frequency: z.string().min(1).max(120),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ petId: string; medicationId: string }> }) {
  const routeParams = await params;
  const parsedParams = paramsSchema.safeParse(routeParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const editAccess = await requireEditAccess(auth.userId);
  if (editAccess instanceof NextResponse) {
    return editAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsedBody = medicationUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.petMedication.findFirst({
    where: {
      id: parsedParams.data.medicationId,
      petId: access.petId
    },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Medication not found" }, { status: 404 });
  }

  const updated = await prisma.petMedication.update({
    where: { id: parsedParams.data.medicationId },
    data: {
      ...parsedBody.data,
      startDate: new Date(parsedBody.data.startDate),
      endDate: parsedBody.data.endDate ? new Date(parsedBody.data.endDate) : null
    }
  });

  return NextResponse.json({ data: updated });
}
