import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  // E2E mock bypass
  if (process.env.PLAYWRIGHT_E2E === "1") {
    return NextResponse.json({
      data: [
        {
          id: "demo-pet",
          name: "モカ",
          coreMetrics: [
            { value: "4.2", recordedAt: "2026-05-01T00:00:00.000Z" },
            { value: "4.0", recordedAt: "2026-04-01T00:00:00.000Z" }
          ],
          labResults: [
            { marker: "CRE", value: "1.2", unit: "mg/dL", recordedAt: "2026-05-01T00:00:00.000Z" },
            { marker: "CRE", value: "1.4", unit: "mg/dL", recordedAt: "2026-04-01T00:00:00.000Z" }
          ]
        },
        {
          id: "demo-pet-2",
          name: "チョコ",
          coreMetrics: [
            { value: "5.5", recordedAt: "2026-05-01T00:00:00.000Z" },
            { value: "5.3", recordedAt: "2026-04-01T00:00:00.000Z" }
          ],
          labResults: [
            { marker: "CRE", value: "1.0", unit: "mg/dL", recordedAt: "2026-05-01T00:00:00.000Z" },
            { marker: "CRE", value: "0.9", unit: "mg/dL", recordedAt: "2026-04-01T00:00:00.000Z" }
          ]
        }
      ]
    });
  }

  const member = await prisma.householdMember.findFirst({
    where: { userId: auth.userId },
    select: { householdId: true }
  });

  if (!member) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  const pets = await prisma.pet.findMany({
    where: { householdId: member.householdId },
    select: {
      id: true,
      name: true,
      coreMetrics: {
        where: { type: "WEIGHT_KG" },
        orderBy: { recordedAt: "desc" },
        select: {
          value: true,
          recordedAt: true
        }
      },
      labResults: {
        orderBy: { recordedAt: "desc" },
        select: {
          marker: true,
          value: true,
          unit: true,
          recordedAt: true
        }
      }
    }
  });

  // Convert decimal to number for JSON response
  const serialized = pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    coreMetrics: pet.coreMetrics.map((c) => ({
      value: Number(c.value),
      recordedAt: c.recordedAt.toISOString()
    })),
    labResults: pet.labResults.map((l) => ({
      marker: l.marker,
      value: Number(l.value),
      unit: l.unit,
      recordedAt: l.recordedAt.toISOString()
    }))
  }));

  return NextResponse.json({ data: serialized });
}
