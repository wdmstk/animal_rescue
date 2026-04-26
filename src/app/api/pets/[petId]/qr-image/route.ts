import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateEmergencyToken } from "@/lib/security/emergency-token";

const petIdParamSchema = z.object({
  petId: z.string().uuid()
});

export async function GET(_: Request, { params }: { params: { petId: string } }) {
  const parsedParams = petIdParamSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const petId = parsedParams.data.petId;
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const existingToken = await prisma.petEmergencyToken.findUnique({
    where: { petId }
  });

  const token =
    existingToken?.token ??
    (
      await prisma.petEmergencyToken.create({
        data: {
          petId,
          token: generateEmergencyToken(),
          isActive: true
        }
      })
    ).token;

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/e/${token}`;
  const image = await QRCode.toDataURL(publicUrl, {
    width: 320,
    margin: 1
  });

  return NextResponse.json({ data: { publicUrl, image } });
}
