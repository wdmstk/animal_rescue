import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import { badRequest, notFound } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid(),
  recordId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
});

const recordUpdateSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  recordType: z.enum(["EXAM", "SURGERY", "LAB", "MEDICATION", "OTHER"]).default("OTHER"),
  photoUrl: z.string().url().optional().nullable()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ petId: string; recordId: string }> }
) {
  const routeParams = await params;
  const parsedParams = paramsSchema.safeParse(routeParams);
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

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1" && (parsedParams.data.petId === "demo-pet" || parsedParams.data.petId === "sample-pet")) {
    const body = await request.json();
    const parsedBody = recordUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return badRequest(parsedBody.error);
    }
    return NextResponse.json({
      data: {
        id: parsedParams.data.recordId,
        ...parsedBody.data,
        petId: parsedParams.data.petId,
        date: new Date(parsedBody.data.date).toISOString()
      }
    });
  }

  const body = await request.json();
  const parsedBody = recordUpdateSchema.safeParse(body);
  if (!parsedBody.success) {
    return badRequest(parsedBody.error);
  }

  const existing = await prisma.petMedicalRecord.findFirst({
    where: {
      id: parsedParams.data.recordId,
      petId: access.petId
    },
    select: { id: true }
  });

  if (!existing) {
    return notFound("MedicalRecord");
  }

  const updated = await prisma.petMedicalRecord.update({
    where: { id: parsedParams.data.recordId },
    data: {
      ...parsedBody.data,
      date: new Date(parsedBody.data.date)
    }
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ petId: string; recordId: string }> }
) {
  const routeParams = await params;
  const parsedParams = paramsSchema.safeParse(routeParams);
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

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1" && (parsedParams.data.petId === "demo-pet" || parsedParams.data.petId === "sample-pet")) {
    return NextResponse.json({ data: { success: true } });
  }

  const existing = await prisma.petMedicalRecord.findFirst({
    where: {
      id: parsedParams.data.recordId,
      petId: access.petId
    },
    select: { id: true }
  });

  if (!existing) {
    return notFound("MedicalRecord");
  }

  await prisma.petMedicalRecord.delete({
    where: { id: parsedParams.data.recordId }
  });

  return NextResponse.json({ data: { success: true } });
}
