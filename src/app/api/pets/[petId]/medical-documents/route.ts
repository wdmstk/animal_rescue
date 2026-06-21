import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { allowedImageHostMessage, isAllowedImageUrl } from "@/lib/validators/image-url";
import { isTableMissingError } from "@/lib/prisma-error";
import { badRequest, serverError } from "@/lib/api-error";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const documentCreateSchema = z.object({
  photoUrl: z.string().url().refine(isAllowedImageUrl, { message: allowedImageHostMessage }),
  capturedAt: z.string().datetime().optional().nullable()
});

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) return access;

  let data: Awaited<ReturnType<typeof prisma.petMedicalDocument.findMany>>;
  try {
    data = await prisma.petMedicalDocument.findMany({
      where: { petId: access.petId },
      orderBy: [{ createdAt: "desc" }]
    });
  } catch (error) {
    if (isTableMissingError(error)) {
      return serverError("医療書類テーブルが未作成です。`npm run db:setup` または `prisma migrate deploy` を実行してください。", 503);
    }
    throw error;
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) return createAccess;

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) return access;

  const parsedBody = documentCreateSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return badRequest(parsedBody.error);
  }

  let created: Awaited<ReturnType<typeof prisma.petMedicalDocument.create>>;
  try {
    created = await prisma.petMedicalDocument.create({
      data: {
        petId: access.petId,
        photoUrl: parsedBody.data.photoUrl,
        capturedAt: parsedBody.data.capturedAt ? new Date(parsedBody.data.capturedAt) : null
      }
    });
  } catch (error) {
    if (isTableMissingError(error)) {
      return serverError("医療書類テーブルが未作成です。`npm run db:setup` または `prisma migrate deploy` を実行してください。", 503);
    }
    throw error;
  }

  return NextResponse.json({ data: created }, { status: 201 });
}
