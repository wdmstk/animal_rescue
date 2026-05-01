import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireShareAccess } from "@/lib/billing/access-guard";
import { generateEmergencyToken } from "@/lib/security/emergency-token";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
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

  const petId = access.petId;
  const existing = await prisma.petEmergencyToken.findUnique({
    where: { petId }
  });

  if (existing?.isActive) {
    return NextResponse.json({
      data: {
        token: existing.token,
        publicUrl: `/e/${existing.token}`
      }
    });
  }

  if (existing && !existing.isActive) {
    const reactivatedToken = generateEmergencyToken();
    const updated = await prisma.petEmergencyToken.update({
      where: { petId },
      data: {
        token: reactivatedToken,
        isActive: true,
        rotatedAt: new Date()
      }
    });

    return NextResponse.json({
      data: {
        token: updated.token,
        publicUrl: `/e/${updated.token}`
      }
    });
  }

  const token = generateEmergencyToken();
  const created = await prisma.petEmergencyToken.create({
    data: {
      petId,
      token,
      isActive: true
    }
  });

  return NextResponse.json({
    data: {
      token: created.token,
      publicUrl: `/e/${created.token}`
    }
  });
}

export async function POST(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const shareAccess = await requireShareAccess(auth.userId);
  if (shareAccess instanceof NextResponse) {
    return shareAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const petId = access.petId;
  const token = generateEmergencyToken();
  const updated = await prisma.petEmergencyToken.upsert({
    where: { petId },
    update: {
      token,
      isActive: true,
      rotatedAt: new Date()
    },
    create: {
      petId,
      token,
      isActive: true
    }
  });

  return NextResponse.json({
    data: {
      token: updated.token,
      publicUrl: `/e/${updated.token}`
    }
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }
  const shareAccess = await requireShareAccess(auth.userId);
  if (shareAccess instanceof NextResponse) {
    return shareAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const petId = access.petId;
  const existing = await prisma.petEmergencyToken.findUnique({
    where: { petId },
    select: { token: true, isActive: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  if (!existing.isActive) {
    return NextResponse.json({
      data: {
        token: existing.token,
        publicUrl: `/e/${existing.token}`,
        isActive: false
      }
    });
  }

  const updated = await prisma.petEmergencyToken.update({
    where: { petId },
    data: { isActive: false }
  });

  return NextResponse.json({
    data: {
      token: updated.token,
      publicUrl: `/e/${updated.token}`,
      isActive: updated.isActive
    }
  });
}
