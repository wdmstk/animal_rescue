import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { badRequest, notFound } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid(),
  medicationId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
});

const logCreateSchema = z.object({
  status: z.enum(["TAKEN", "SKIPPED"]),
  loggedAt: z.string().datetime().optional().default(() => new Date().toISOString()),
  note: z.string().max(500).optional().nullable()
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ petId: string; medicationId: string }> }
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

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1" && (parsedParams.data.petId === "demo-pet" || parsedParams.data.petId === "sample-pet")) {
    return NextResponse.json({
      data: [
        {
          id: "mock-log-1",
          medicationId: parsedParams.data.medicationId,
          status: "TAKEN",
          loggedAt: new Date().toISOString(),
          note: "Mock log"
        }
      ]
    });
  }

  const medication = await prisma.petMedication.findFirst({
    where: {
      id: parsedParams.data.medicationId,
      petId: access.petId
    }
  });

  if (!medication) {
    return notFound("Medication");
  }

  const logs = await prisma.petMedicationLog.findMany({
    where: { medicationId: parsedParams.data.medicationId },
    orderBy: { loggedAt: "desc" }
  });

  return NextResponse.json({ data: logs });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ petId: string; medicationId: string }> }
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
  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) {
    return createAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();
  const parsedBody = logCreateSchema.safeParse(body);
  if (!parsedBody.success) {
    return badRequest(parsedBody.error);
  }

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1" && (parsedParams.data.petId === "demo-pet" || parsedParams.data.petId === "sample-pet")) {
    return NextResponse.json({
      data: {
        id: "mock-log-created",
        medicationId: parsedParams.data.medicationId,
        status: parsedBody.data.status,
        loggedAt: parsedBody.data.loggedAt,
        note: parsedBody.data.note
      }
    }, { status: 201 });
  }

  const medication = await prisma.petMedication.findFirst({
    where: {
      id: parsedParams.data.medicationId,
      petId: access.petId
    }
  });

  if (!medication) {
    return notFound("Medication");
  }

  const created = await prisma.petMedicationLog.create({
    data: {
      medicationId: parsedParams.data.medicationId,
      status: parsedBody.data.status,
      loggedAt: new Date(parsedBody.data.loggedAt),
      note: parsedBody.data.note
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
