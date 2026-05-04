import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireShareAccess } from "@/lib/billing/access-guard";
import { generateEmergencyToken } from "@/lib/security/emergency-token";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const resolvePublicBaseUrl = (request: Request) => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const requestUrl = new URL(request.url);
  return requestUrl.origin;
};

const toPublicUrl = (request: Request, token: string) => `${resolvePublicBaseUrl(request)}/e/${token}`;

export async function GET(request: Request, { params }: { params: Promise<{ petId: string }> }) {
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
        publicUrl: toPublicUrl(request, existing.token)
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
        publicUrl: toPublicUrl(request, updated.token)
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
      publicUrl: toPublicUrl(request, created.token)
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
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
      publicUrl: toPublicUrl(request, updated.token)
    }
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ petId: string }> }) {
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
        publicUrl: toPublicUrl(request, existing.token),
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
      publicUrl: toPublicUrl(request, updated.token),
      isActive: updated.isActive
    }
  });
}
