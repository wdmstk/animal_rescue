import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { ownerProfileUpdateSchema } from "@/lib/validators/owner-profile";
import { badRequest, notFound, forbidden } from "@/lib/api-error";

const DEFAULT_PROFILE = {
  fullName: null,
  phone: null,
  email: null,
  postalCode: null,
  addressLine1: null,
  addressLine2: null,
  note: null
} as const;

const toResponseData = (
  ownerUserId: string,
  profile: {
    fullName: string | null;
    phone: string | null;
    email: string | null;
    postalCode: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    note: string | null;
  }
) => ({
  ownerUserId,
  ...profile
});

const findOwnerContext = async (userId: string) => {
  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    select: { householdId: true }
  });

  if (!membership) {
    return badRequest("所属世帯が見つかりません");
  }

  const ownerMembership = await prisma.householdMember.findFirst({
    where: {
      householdId: membership.householdId,
      role: "OWNER"
    },
    select: { userId: true }
  });

  if (!ownerMembership) {
    return notFound("Owner");
  }

  return { householdId: membership.householdId, ownerUserId: ownerMembership.userId };
};

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const ownerContext = await findOwnerContext(auth.userId);
  if (ownerContext instanceof NextResponse) {
    return ownerContext;
  }

  const profile = await prisma.ownerProfile.findUnique({
    where: { ownerUserId: ownerContext.ownerUserId }
  });

  return NextResponse.json({
    data: toResponseData(ownerContext.ownerUserId, profile ?? DEFAULT_PROFILE)
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const ownerContext = await findOwnerContext(auth.userId);
  if (ownerContext instanceof NextResponse) {
    return ownerContext;
  }

  if (auth.userId !== ownerContext.ownerUserId) {
    return forbidden("Only owner can update owner profile");
  }

  const body = await request.json();
  const parsed = ownerProfileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const updated = await prisma.ownerProfile.upsert({
    where: { ownerUserId: ownerContext.ownerUserId },
    update: parsed.data,
    create: {
      ownerUserId: ownerContext.ownerUserId,
      ...parsed.data
    }
  });

  return NextResponse.json({
    data: toResponseData(updated.ownerUserId, updated)
  });
}
