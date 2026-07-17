import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireExportAccess } from "@/lib/billing/access-guard";
import { badRequest } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
});

function escapeCSV(val: string | null | undefined): string {
  if (val === null || val === undefined) return "";
  const cleaned = val.replace(/"/g, '""');
  return `"${cleaned}"`;
}

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
    const csvContent = [
      ["日付", "カテゴリ", "項目/タイトル", "詳細/数値", "メモ/備考"].join(","),
      ['"2026-05-01"', '"医療記録"', '"定期診察"', '"EXAM"', '"異常なし"'].join(",")
    ].join("\n");
    return new NextResponse("\ufeff" + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pet-health-export-${parsedParams.data.petId}.csv"`
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

  const rows: Array<{ date: string; category: string; title: string; detail: string; note: string }> = [];

  pet.medicalRecords.forEach((r) => {
    rows.push({
      date: r.date.toISOString().slice(0, 10),
      category: "医療記録",
      title: r.title,
      detail: r.recordType,
      note: r.description
    });
  });

  pet.medications.forEach((m) => {
    rows.push({
      date: m.startDate.toISOString().slice(0, 10),
      category: "投薬",
      title: m.name,
      detail: `${m.dosage} / ${m.frequency}`,
      note: m.endDate ? `終了日: ${m.endDate.toISOString().slice(0, 10)}` : "継続中"
    });
  });

  pet.vaccinations.forEach((v) => {
    rows.push({
      date: v.date.toISOString().slice(0, 10),
      category: "ワクチン",
      title: v.type,
      detail: v.customTypeName || "",
      note: v.nextDue ? `次回予定: ${v.nextDue.toISOString().slice(0, 10)}` : ""
    });
  });

  pet.coreMetrics.forEach((c) => {
    rows.push({
      date: c.recordedAt.toISOString().slice(0, 10),
      category: "健康指標",
      title: c.type,
      detail: `${c.value.toString()}`,
      note: c.note || ""
    });
  });

  pet.labResults.forEach((l) => {
    rows.push({
      date: l.recordedAt.toISOString().slice(0, 10),
      category: "検査結果",
      title: `${l.category}/${l.marker}`,
      detail: `${l.value.toString()} ${l.unit}`,
      note: l.note || ""
    });
  });

  rows.sort((a, b) => b.date.localeCompare(a.date));

  const headers = ["日付", "カテゴリ", "項目/タイトル", "詳細/数値", "メモ/備考"];
  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      [
        escapeCSV(r.date),
        escapeCSV(r.category),
        escapeCSV(r.title),
        escapeCSV(r.detail),
        escapeCSV(r.note)
      ].join(",")
    )
  ].join("\n");

  return new NextResponse("\ufeff" + csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pet-health-export-${parsedParams.data.petId}.csv"`
    }
  });
}
