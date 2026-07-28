import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requireHouseholdMember } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { petCreateSchema } from "@/lib/validators/pet";
import { badRequest, notFound } from "@/lib/api-error";
import { logPetAction, AuditAction } from "@/lib/audit-log";

import { paginationQuerySchema, buildPaginatedResponse } from "@/lib/pagination";

export async function GET(request?: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request?.url ?? "http://localhost");
  const parsedQuery = paginationQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined
  });

  const { limit, cursor } = parsedQuery.success ? parsedQuery.data : { limit: 20, cursor: undefined };

  const pets = await prisma.pet.findMany({
    where: {
      household: {
        members: {
          some: { userId: auth.userId }
        }
      }
    },
    include: {
      emergencyInfo: true,
      emergencyToken: true,
      photos: true
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { id: "desc" }
  });

  const paginated = buildPaginatedResponse(pets, limit);
  return NextResponse.json(paginated);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = petCreateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) {
    return createAccess;
  }

  const householdId =
    parsed.data.householdId ??
    (
      await prisma.householdMember.findFirst({
        where: { userId: auth.userId },
        select: { householdId: true },
        orderBy: { createdAt: "asc" }
      })
    )?.householdId;

  if (!householdId) {
    return badRequest("所属世帯が見つかりません");
  }

  const membership = await requireHouseholdMember(auth.userId, householdId);
  if (membership instanceof NextResponse) {
    return membership;
  }

  // クライアント情報を取得
  const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const pet = await prisma.pet.create({
    data: {
      ...parsed.data,
      householdId,
      birthday: parsed.data.birthday ? new Date(parsed.data.birthday) : null,
      sterilizedAt: parsed.data.sterilizedAt ? new Date(parsed.data.sterilizedAt) : null
    }
  });

  // 監査ログを記録
  await logPetAction(
    auth.userId,
    AuditAction.PET_CREATE,
    pet.id,
    { name: pet.name, species: pet.species, breed: pet.breed },
    ipAddress,
    userAgent
  );

  return NextResponse.json({ data: pet }, { status: 201 });
}
