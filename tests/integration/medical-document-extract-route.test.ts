import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findFirstMock, updateMock, extractMedicalDocumentMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  updateMock: vi.fn(),
  extractMedicalDocumentMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedicalDocument: {
      findFirst: findFirstMock,
      update: updateMock
    }
  }
}));

vi.mock("@/lib/services/medical-document-ocr", () => ({
  extractMedicalDocument: extractMedicalDocumentMock
}));

import { POST } from "../../src/app/api/pets/[petId]/medical-documents/[documentId]/extract/route";

describe("/api/pets/[petId]/medical-documents/[documentId]/extract", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const validDocumentId = "22222222-2222-4222-8222-222222222222";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 on invalid params", async () => {
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: "invalid", documentId: "invalid" })
    });

    expect(response.status).toBe(400);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 404 when document not found", async () => {
    findFirstMock.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId, documentId: validDocumentId })
    });

    expect(response.status).toBe(404);
  });

  it("returns extracted payload", async () => {
    findFirstMock.mockResolvedValue({ id: validDocumentId, petId: validPetId, photoUrl: "https://example.com/a.jpg" });
    extractMedicalDocumentMock.mockResolvedValue({
      rawText: "2026/05/01 どうぶつ病院",
      result: {
        examinedOn: "2026-05-01",
        hospitalName: "どうぶつ病院",
        documentType: "OTHER",
        summary: "summary",
        candidates: []
      }
    });
    updateMock.mockResolvedValue({ id: validDocumentId });

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId, documentId: validDocumentId })
    });

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: validDocumentId },
      data: {
        ocrText: "2026/05/01 どうぶつ病院",
        ocrStructuredJson: {
          examinedOn: "2026-05-01",
          hospitalName: "どうぶつ病院",
          documentType: "OTHER",
          summary: "summary",
          candidates: []
        }
      }
    });
  });

  it("returns 500 on OCR failure", async () => {
    findFirstMock.mockResolvedValue({ id: validDocumentId, petId: validPetId, photoUrl: "https://example.com/a.jpg" });
    extractMedicalDocumentMock.mockRejectedValue(new Error("OCR failure"));

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId, documentId: validDocumentId })
    });

    expect(response.status).toBe(500);
  });
});
