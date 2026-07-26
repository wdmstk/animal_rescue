import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import { badRequest, notFound } from "@/lib/api-error";
import { createAuditLog, AuditAction, EntityType } from "@/lib/audit-log";

const paramsSchema = z.object({
  petId: z.string().uuid(),
  photoId: z.string().uuid()
});

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ petId: string; photoId: string }> }
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

  const existingPhoto = await prisma.petPhoto.findFirst({
    where: {
      id: parsedParams.data.photoId,
      petId: access.petId
    }
  });

  if (!existingPhoto) {
    return notFound("Photo");
  }

  await prisma.petPhoto.delete({
    where: { id: existingPhoto.id }
  });

  void createAuditLog({
    userId: auth.userId,
    action: AuditAction.PET_UPDATE,
    entityType: EntityType.PET,
    entityId: access.petId,
    changes: { deletedPhotoId: existingPhoto.id, photoUrl: existingPhoto.photoUrl }
  });

  return new NextResponse(null, { status: 204 });
}
