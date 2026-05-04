import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requireHouseholdMember } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { petCreateSchema } from "@/lib/validators/pet";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

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
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: pets });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = petCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
    return NextResponse.json({ error: "所属世帯が見つかりません" }, { status: 400 });
  }

  const membership = await requireHouseholdMember(auth.userId, householdId);
  if (membership instanceof NextResponse) {
    return membership;
  }

  const pet = await prisma.pet.create({
    data: {
      ...parsed.data,
      householdId,
      birthday: parsed.data.birthday ? new Date(parsed.data.birthday) : null,
      sterilizedAt: parsed.data.sterilizedAt ? new Date(parsed.data.sterilizedAt) : null
    }
  });

  return NextResponse.json({ data: pet }, { status: 201 });
}
