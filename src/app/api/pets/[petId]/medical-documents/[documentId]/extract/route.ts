import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireCreateAccess } from "@/lib/billing/access-guard";
import { extractMedicalDocument } from "@/lib/services/medical-document-ocr";
import { badRequest, notFound, serverError } from "@/lib/api-error";

const paramsSchema = z.object({
  petId: z.string().uuid(),
  documentId: z.string().uuid()
});

export async function POST(_: Request, { params }: { params: Promise<{ petId: string; documentId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

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
    const extracted = await extractMedicalDocument(document.photoUrl);

    const updated = await prisma.petMedicalDocument.update({
      where: { id: document.id },
      data: {
        ocrText: extracted.rawText,
        ocrStructuredJson: extracted.result
      }
    });

    return NextResponse.json({ data: updated, extracted: extracted.result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR extraction failed";
    return serverError(message);
  }
}
