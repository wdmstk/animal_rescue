import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { extractMedicalDocument } from "@/lib/services/medical-document-ocr";
import { badRequest, notFound, serverError } from "@/lib/api-error";

import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit/middleware";

const paramsSchema = z.object({
  petId: z.string().uuid(),
  documentId: z.string().uuid()
});

const FREE_OCR_MONTHLY_LIMIT = 2;

export async function POST(req: Request, { params }: { params: Promise<{ petId: string; documentId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  const rateLimitResult = await checkRateLimit(req, "public");
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const createAccess = await requireCreateAccess(auth.userId);
  if (createAccess instanceof NextResponse) return createAccess;

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) return access;

  const document = await prisma.petMedicalDocument.findFirst({
    where: {
      id: parsedParams.data.documentId,
      petId: access.petId
    }
  });

  if (!document) {
    return notFound("Document");
  }

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOcrCount = await prisma.petMedicalDocument.count({
      where: {
        petId: access.petId,
        ocrText: { not: null },
        createdAt: { gte: startOfMonth }
      }
    });

    if (createAccess.planTier !== "paid" && monthlyOcrCount >= FREE_OCR_MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          error: "今月の無料OCR利用枠（月2枚まで）に達しました。Proプランで無制限にご利用いただけます。",
          code: "OCR_LIMIT_EXCEEDED"
        },
        { status: 402 }
      );
    }

    const extracted = await extractMedicalDocument(document.photoUrl);

    const updated = await prisma.petMedicalDocument.update({
      where: { id: document.id },
      data: {
        ocrText: extracted.rawText,
        ocrStructuredJson: extracted.result
      }
    });

    return NextResponse.json({
      data: updated,
      extracted: extracted.result,
      monthlyUsage: {
        used: monthlyOcrCount + 1,
        limit: FREE_OCR_MONTHLY_LIMIT,
        isPro: createAccess.planTier === "paid"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR extraction failed";
    return serverError(message);
  }
}
