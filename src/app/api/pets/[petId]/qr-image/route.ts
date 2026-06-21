import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { generateEmergencyToken } from "@/lib/security/emergency-token";
import { badRequest } from "@/lib/api-error";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

const resolvePublicBaseUrl = (request: Request) => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
};

export async function GET(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const routeParams = await params;
  const parsedParams = petIdParamSchema.safeParse(routeParams);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
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
  const existingToken = await prisma.petEmergencyToken.findUnique({
    where: { petId }
  });

  const token = existingToken?.isActive
    ? existingToken.token
    : existingToken
      ? (
          await prisma.petEmergencyToken.update({
            where: { petId },
            data: {
              token: generateEmergencyToken(),
              isActive: true,
              rotatedAt: new Date()
            }
          })
        ).token
      : (
          await prisma.petEmergencyToken.create({
            data: {
              petId,
              token: generateEmergencyToken(),
              isActive: true
            }
          })
        ).token;

  const publicUrl = `${resolvePublicBaseUrl(request)}/e/${token}`;
  const image = await QRCode.toDataURL(publicUrl, {
    width: 320,
    margin: 1
  });

  return NextResponse.json({ data: { publicUrl, image } });
}
