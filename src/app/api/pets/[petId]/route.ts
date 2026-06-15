import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { getHistoryWindowStartDate } from "@/lib/billing/access-policy";
import { getUserBillingAccessState, requireEditAccess } from "@/lib/billing/access-guard";
import { petUpdateSchema } from "@/lib/validators/pet";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const routeParams = await params;
  const parsedParams = petIdParamSchema.safeParse(routeParams);
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
  const billing = await getUserBillingAccessState(auth.userId);
  const historyWindowStart = getHistoryWindowStartDate(billing.accessPolicy.historyWindowDays);

  const pet = await prisma.pet.findUnique({
    where: { id: access.petId },
    include: {
      emergencyInfo: true,
      medicalRecords: {
        where: historyWindowStart ? { date: { gte: historyWindowStart } } : undefined,
        orderBy: { date: "desc" }
      },
      medications: {
        where: historyWindowStart ? { startDate: { gte: historyWindowStart } } : undefined,
        orderBy: { startDate: "desc" }
      },
      vaccinations: {
        where: historyWindowStart ? { date: { gte: historyWindowStart } } : undefined,
        orderBy: { date: "desc" }
      },
      emergencyToken: true,
      photos: { orderBy: { sortOrder: "asc" } }
    }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return NextResponse.json({ data: pet });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const routeParams = await params;
  const parsedParams = petIdParamSchema.safeParse(routeParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const body = await request.json();
  const parsedBody = petUpdateSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
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

  const pet = await prisma.pet.update({
    where: { id: access.petId },
    data: {
      ...parsedBody.data,
      birthday: parsedBody.data.birthday ? new Date(parsedBody.data.birthday) : parsedBody.data.birthday,
      sterilizedAt: parsedBody.data.sterilizedAt ? new Date(parsedBody.data.sterilizedAt) : parsedBody.data.sterilizedAt
    }
  });

  return NextResponse.json({ data: pet });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const routeParams = await params;
  const parsedParams = petIdParamSchema.safeParse(routeParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
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

  await prisma.pet.delete({
    where: { id: access.petId }
  });

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.storage
      .from("pet-photos")
      .list(`pets/${access.petId}`, { limit: 1000 });
    if (error) {
      console.warn("Failed to list pet photo objects for cleanup", error.message);
    } else if (data.length > 0) {
      const paths = data.map((item) => `pets/${access.petId}/${item.name}`);
      const { error: removeError } = await supabase.storage.from("pet-photos").remove(paths);
      if (removeError) {
        console.warn("Failed to remove pet photo objects during cleanup", removeError.message);
      }
    }
  } catch (error) {
    console.warn("Unexpected error in pet photo cleanup", error);
  }

  return NextResponse.json({ data: { id: access.petId, deleted: true } });
}
