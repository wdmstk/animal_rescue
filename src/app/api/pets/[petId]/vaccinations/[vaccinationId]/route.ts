import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import { badRequest, notFound } from "@/lib/api-error";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

const paramsSchema = z.object({
  petId: z.string().uuid(),
  vaccinationId: z.string().uuid()
});

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ petId: string; vaccinationId: string }> }
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

  const existing = await prisma.petVaccination.findFirst({
    where: {
      id: parsedParams.data.vaccinationId,
      petId: access.petId
    },
    select: { id: true, type: true }
  });

  if (!existing) {
    return notFound("Vaccination record");
  }

  await prisma.petVaccination.delete({
    where: { id: existing.id }
  });

  void createAuditLog({
    userId: auth.userId,
    action: AuditAction.VACCINATION_DELETE,
    entityType: EntityType.VACCINATION,
    entityId: existing.id,
    changes: { type: existing.type }
  });

  return new NextResponse(null, { status: 204 });
}
