import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { allowedImageHostMessage, isAllowedImageUrl } from "@/lib/validators/image-url";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const photoSchema = z.object({
  photoUrl: z.string().url().refine(isAllowedImageUrl, {
    message: allowedImageHostMessage
  }),
  sortOrder: z.number().int().min(0).default(0)
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
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

  const data = await prisma.petPhoto.findMany({
    where: { petId: access.petId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: { petId: string } }) {
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
  const parsed = photoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const photo = await prisma.petPhoto.create({
    data: {
      petId: access.petId,
      photoUrl: parsed.data.photoUrl,
      sortOrder: parsed.data.sortOrder
    }
  });

  return NextResponse.json({ data: photo }, { status: 201 });
}
