import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireExportAccess } from "@/lib/billing/access-guard";
import { badRequest } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ petId: string }> }
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
  const exportAccess = await requireExportAccess(auth.userId);
  if (exportAccess instanceof NextResponse) {
    return exportAccess;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1" && (parsedParams.data.petId === "demo-pet" || parsedParams.data.petId === "sample-pet")) {
    const mockBackup = {
      backupVersion: "1.0.0",
      petId: parsedParams.data.petId,
      exportedAt: new Date().toISOString(),
      medicalRecords: [],
      medications: [],
      vaccinations: [],
      coreMetrics: [],
      labResults: []
    };
    return NextResponse.json(mockBackup, {
      headers: {
        "Content-Disposition": `attachment; filename="pet-backup-${parsedParams.data.petId}.json"`
      }
    });
  }

  const pet = await prisma.pet.findUnique({
    where: { id: access.petId },
    include: {
      medicalRecords: true,
      medications: true,
      vaccinations: true,
      coreMetrics: true,
      labResults: true
    }
  });

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const backupData = {
    backupVersion: "1.0.0",
    petId: pet.id,
    exportedAt: new Date().toISOString(),
    medicalRecords: pet.medicalRecords.map(r => ({
      date: r.date.toISOString(),
      title: r.title,
      description: r.description,
      recordType: r.recordType,
      photoUrl: r.photoUrl
    })),
    medications: pet.medications.map(m => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.startDate.toISOString(),
      endDate: m.endDate ? m.endDate.toISOString() : null
    })),
    vaccinations: pet.vaccinations.map(v => ({
      type: v.type,
      customTypeName: v.customTypeName,
      date: v.date.toISOString(),
      nextDue: v.nextDue ? v.nextDue.toISOString() : null
    })),
    coreMetrics: pet.coreMetrics.map(c => ({
      type: c.type,
      value: Number(c.value),
      recordedAt: c.recordedAt.toISOString(),
      note: c.note
    })),
    labResults: pet.labResults.map(l => ({
      category: l.category,
      marker: l.marker,
      value: Number(l.value),
      unit: l.unit,
      recordedAt: l.recordedAt.toISOString(),
      note: l.note
    }))
  };

  return new NextResponse(JSON.stringify(backupData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pet-backup-${pet.name}-${parsedParams.data.petId}.json"`
    }
  });
}
