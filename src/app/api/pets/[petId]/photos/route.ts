import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { allowedImageHostMessage, isAllowedImageUrl } from "@/lib/validators/image-url";
import { badRequest } from "@/lib/api-error";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const photoSchema = z.object({
  photoUrl: z.string().url().refine(isAllowedImageUrl, {
    message: allowedImageHostMessage
  }),
  sortOrder: z.number().int().min(0).default(0)
});

import { paginationQuerySchema, buildPaginatedResponse } from "@/lib/pagination";

export async function GET(request: Request | undefined, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const url = new URL(request?.url ?? "http://localhost");
  const parsedQuery = paginationQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined
  });
  const { limit, cursor } = parsedQuery.success ? parsedQuery.data : { limit: 20, cursor: undefined };

  const data = await prisma.petPhoto.findMany({
    where: { petId: access.petId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
  });

  const paginated = buildPaginatedResponse(data, limit);
  return NextResponse.json(paginated);
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) {
    return createAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsed = photoSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
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
