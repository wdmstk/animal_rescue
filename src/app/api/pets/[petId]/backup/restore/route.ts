import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CoreMetricType, LabResultCategory, MedicalRecordType, VaccinationType, LabMarkerType } from "@prisma/client";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess } from "@/lib/billing/access-guard";
import { badRequest } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
});

const backupRestoreSchema = z.object({
  backupVersion: z.string(),
  medicalRecords: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
      recordType: z.enum(["EXAM", "SURGERY", "LAB", "MEDICATION", "OTHER"]),
      photoUrl: z.string().optional().nullable()
    })
  ),
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      startDate: z.string(),
      endDate: z.string().optional().nullable()
    })
  ),
  vaccinations: z.array(
    z.object({
      type: z.enum(["RABIES", "CORE", "HEARTWORM", "FLEA_TICK", "OTHER"]),
      customTypeName: z.string().optional().nullable(),
      date: z.string(),
      nextDue: z.string().optional().nullable()
    })
  ),
  coreMetrics: z.array(
    z.object({
      type: z.string(),
      value: z.number(),
      recordedAt: z.string(),
      note: z.string().optional().nullable()
    })
  ),
  labResults: z.array(
    z.object({
      category: z.string(),
      marker: z.string(),
      value: z.number(),
      unit: z.string(),
      recordedAt: z.string(),
      note: z.string().optional().nullable()
    })
  )
});

export async function POST(
  request: Request,
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

  const body = await request.json();
  const parsed = backupRestoreSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  // Run clear and insert within transaction
  await prisma.$transaction(async (tx) => {
    // Delete existing related data
    await tx.petMedicalRecord.deleteMany({ where: { petId: access.petId } });
    await tx.petMedication.deleteMany({ where: { petId: access.petId } });
    await tx.petVaccination.deleteMany({ where: { petId: access.petId } });
    await tx.petCoreMetricEntry.deleteMany({ where: { petId: access.petId } });
    await tx.petLabResultEntry.deleteMany({ where: { petId: access.petId } });

    // Create medical records
    if (parsed.data.medicalRecords.length > 0) {
      await tx.petMedicalRecord.createMany({
        data: parsed.data.medicalRecords.map(m => ({
          petId: access.petId,
          date: new Date(m.date),
          title: m.title,
          description: m.description,
          recordType: m.recordType as MedicalRecordType,
          photoUrl: m.photoUrl
        }))
      });
    }

    // Create medications
    if (parsed.data.medications.length > 0) {
      await tx.petMedication.createMany({
        data: parsed.data.medications.map(m => ({
          petId: access.petId,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          startDate: new Date(m.startDate),
          endDate: m.endDate ? new Date(m.endDate) : null
        }))
      });
    }

    // Create vaccinations
    if (parsed.data.vaccinations.length > 0) {
      await tx.petVaccination.createMany({
        data: parsed.data.vaccinations.map(v => ({
          petId: access.petId,
          type: v.type as VaccinationType,
          customTypeName: v.customTypeName,
          date: new Date(v.date),
          nextDue: v.nextDue ? new Date(v.nextDue) : null
        }))
      });
    }

    // Create core metrics
    if (parsed.data.coreMetrics.length > 0) {
      await tx.petCoreMetricEntry.createMany({
        data: parsed.data.coreMetrics.map(c => ({
          petId: access.petId,
          type: c.type as CoreMetricType,
          value: c.value,
          recordedAt: new Date(c.recordedAt),
          note: c.note
        }))
      });
    }

    // Create lab results
    if (parsed.data.labResults.length > 0) {
      await tx.petLabResultEntry.createMany({
        data: parsed.data.labResults.map(l => ({
          petId: access.petId,
          category: l.category as LabResultCategory,
          marker: l.marker as LabMarkerType,
          value: l.value,
          unit: l.unit,
          recordedAt: new Date(l.recordedAt),
          note: l.note
        }))
      });
    }
  });

  return NextResponse.json({ data: { success: true } });
}
