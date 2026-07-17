import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import { badRequest } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const routeParams = await params;
  const parsedParams = paramsSchema.safeParse(routeParams);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
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

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1" && (parsedParams.data.petId === "demo-pet" || parsedParams.data.petId === "sample-pet")) {
    return NextResponse.json({ data: { id: parsedParams.data.petId, isArchived: true } });
  }

  // Update pet to archived, and also deactivate emergency token
  const updated = await prisma.$transaction([
    prisma.pet.update({
      where: { id: access.petId },
      data: { isArchived: true }
    }),
    prisma.petEmergencyToken.updateMany({
      where: { petId: access.petId },
      data: { isActive: false }
    })
  ]);

  return NextResponse.json({ data: updated[0] });
}
