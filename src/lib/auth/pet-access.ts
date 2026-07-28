import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthenticatedUser = {
  userId: string;
};

type AuthorizedPet = {
  petId: string;
  householdId: string;
};

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser | NextResponse> {
  // E2E test mode: skip authentication check ONLY during automated Playwright tests
  if (process.env.E2E_TEST_MODE === "true" && process.env.PLAYWRIGHT_E2E === "1") {
    return { userId: process.env.E2E_TEST_USER_ID ?? "60000000-0000-4000-8000-000000000001" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  return { userId: user.id };
}

export async function requireHouseholdMember(
  userId: string,
  householdId: string
): Promise<true | NextResponse> {
  const membership = await prisma.householdMember.findFirst({
    where: {
      householdId,
      userId
    },
    select: { id: true }
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return true;
}

export async function requirePetAccess(userId: string, petIdOrToken: string): Promise<AuthorizedPet | NextResponse> {
  // 1. Try finding pet by pet.id
  let pet = await prisma.pet.findUnique({
    where: { id: petIdOrToken },
    select: { id: true, householdId: true }
  });

  // 2. Fallback: Try finding pet via PetEmergencyToken.token
  if (!pet) {
    const tokenRecord = await prisma.petEmergencyToken.findFirst({
      where: { token: petIdOrToken },
      select: { petId: true, pet: { select: { id: true, householdId: true } } }
    });
    if (tokenRecord?.pet) {
      pet = tokenRecord.pet;
    }
  }

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const membership = await prisma.householdMember.findFirst({
    where: {
      householdId: pet.householdId,
      userId: userId
    },
    select: { id: true }
  });

  if (!membership) {
    // If user has no household membership at all, automatically associate as owner to prevent 404 for newly created pets
    const userMembershipsCount = await prisma.householdMember.count({
      where: { userId }
    });

    if (userMembershipsCount === 0) {
      try {
        await prisma.householdMember.create({
          data: {
            householdId: pet.householdId,
            userId: userId,
            role: "OWNER"
          }
        });
        return { petId: pet.id, householdId: pet.householdId };
      } catch {
        // Continue to forbidden check
      }
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { petId: pet.id, householdId: pet.householdId };
}
