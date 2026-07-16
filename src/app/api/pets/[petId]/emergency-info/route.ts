import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import { emergencyInfoInputSchema } from "@/lib/validators/emergency";
import { badRequest } from "@/lib/api-error";
import { logEmergencyInfoAction, AuditAction } from "@/lib/audit-log";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function PUT(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const parsedParams = petIdParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
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

  const body = await request.json();
  const parsed = emergencyInfoInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const emergencyInfo = await prisma.petEmergencyInfo.upsert({
    where: { petId: access.petId },
    update: parsed.data,
    create: {
      petId: access.petId,
      ...parsed.data
    }
  });

  // 監査ログを記録
  const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  await logEmergencyInfoAction(
    auth.userId,
    AuditAction.EMERGENCY_INFO_UPDATE,
    access.petId,
    parsed.data,
    ipAddress,
    userAgent
  );

  return NextResponse.json({ data: emergencyInfo });
}
