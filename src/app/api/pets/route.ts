import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requireHouseholdMember } from "@/lib/auth/pet-access";
import { petInputSchema } from "@/lib/validators/pet";

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
  const parsed = petInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const membership = await requireHouseholdMember(auth.userId, parsed.data.householdId);
  if (membership instanceof NextResponse) {
    return membership;
  }

  const pet = await prisma.pet.create({
    data: {
      ...parsed.data,
      birthday: parsed.data.birthday ? new Date(parsed.data.birthday) : null
    }
  });

  return NextResponse.json({ data: pet }, { status: 201 });
}
