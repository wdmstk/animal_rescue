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
  const household = await prisma.household.findFirst({
    where: {
      id: householdId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: { id: true }
  });

  if (!household) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return true;
}

export async function requirePetAccess(userId: string, petId: string): Promise<AuthorizedPet | NextResponse> {
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      OR: [
        {
          household: {
            members: {
              some: { userId }
            }
          }
        },
        {
          household: {
            ownerId: userId
          }
        }
      ]
    },
    select: {
      id: true,
      householdId: true
    }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return { petId: pet.id, householdId: pet.householdId };
}
