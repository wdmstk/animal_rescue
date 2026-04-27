import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { emergencyInfoInputSchema } from "@/lib/validators/emergency";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function PUT(request: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
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
  const parsed = emergencyInfoInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const emergencyInfo = await prisma.petEmergencyInfo.upsert({
    where: { petId: access.petId },
    update: parsed.data,
    create: {
      petId: access.petId,
      ...parsed.data
    }
  });

  return NextResponse.json({ data: emergencyInfo });
}
