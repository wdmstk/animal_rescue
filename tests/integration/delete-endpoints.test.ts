import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE as deletePhoto } from "@/app/api/pets/[petId]/photos/[photoId]/route";
import { DELETE as deleteMedication } from "@/app/api/pets/[petId]/medications/[medicationId]/route";
import { DELETE as deleteVaccination } from "@/app/api/pets/[petId]/vaccinations/[vaccinationId]/route";
import { DELETE as deleteMember } from "@/app/api/households/members/[memberId]/route";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { requireEditAccess, requireShareAccess } from "@/lib/billing/access-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petPhoto: {
      findFirst: vi.fn(),
      delete: vi.fn()
    },
    petMedication: {
      findFirst: vi.fn(),
      delete: vi.fn()
    },
    petVaccination: {
      findFirst: vi.fn(),
      delete: vi.fn()
    },
    householdMember: {
      findFirst: vi.fn(),
      count: vi.fn(),
      delete: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    }
  }
}));

vi.mock("@/lib/auth/pet-access", () => ({
  requireAuthenticatedUser: vi.fn(),
  requirePetAccess: vi.fn()
}));

vi.mock("@/lib/billing/access-guard", () => ({
  requireEditAccess: vi.fn(),
  requireShareAccess: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

const mockPetId = "11111111-1111-4111-a111-111111111111";
const mockItemId = "22222222-2222-4222-a222-222222222222";
const mockUserId = "33333333-3333-4333-a333-333333333333";

describe("DELETE endpoints integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DELETE /api/pets/:petId/photos/:photoId", () => {
    it("deletes photo successfully and returns 204", async () => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(requireEditAccess).mockResolvedValue(true as any);
      vi.mocked(requirePetAccess).mockResolvedValue({ petId: mockPetId } as any);
      vi.mocked(prisma.petPhoto.findFirst).mockResolvedValue({ id: mockItemId, petId: mockPetId, photoUrl: "https://example.com/p.jpg" } as any);
      vi.mocked(prisma.petPhoto.delete).mockResolvedValue({} as any);

      const request = new Request("http://localhost/api/pets/" + mockPetId + "/photos/" + mockItemId, { method: "DELETE" });
      const response = await deletePhoto(request, { params: Promise.resolve({ petId: mockPetId, photoId: mockItemId }) });

      expect(response.status).toBe(204);
      expect(prisma.petPhoto.delete).toHaveBeenCalledWith({ where: { id: mockItemId } });
    });

    it("returns 404 if photo not found", async () => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(requireEditAccess).mockResolvedValue(true as any);
      vi.mocked(requirePetAccess).mockResolvedValue({ petId: mockPetId } as any);
      vi.mocked(prisma.petPhoto.findFirst).mockResolvedValue(null);

      const request = new Request("http://localhost/api/pets/" + mockPetId + "/photos/" + mockItemId, { method: "DELETE" });
      const response = await deletePhoto(request, { params: Promise.resolve({ petId: mockPetId, photoId: mockItemId }) });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/pets/:petId/medications/:medicationId", () => {
    it("deletes medication successfully and returns 204", async () => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(requireEditAccess).mockResolvedValue(true as any);
      vi.mocked(requirePetAccess).mockResolvedValue({ petId: mockPetId } as any);
      vi.mocked(prisma.petMedication.findFirst).mockResolvedValue({ id: mockItemId, name: "Test Med" } as any);
      vi.mocked(prisma.petMedication.delete).mockResolvedValue({} as any);

      const request = new Request("http://localhost/api/pets/" + mockPetId + "/medications/" + mockItemId, { method: "DELETE" });
      const response = await deleteMedication(request, { params: Promise.resolve({ petId: mockPetId, medicationId: mockItemId }) });

      expect(response.status).toBe(204);
      expect(prisma.petMedication.delete).toHaveBeenCalledWith({ where: { id: mockItemId } });
    });
  });

  describe("DELETE /api/pets/:petId/vaccinations/:vaccinationId", () => {
    it("deletes vaccination record successfully and returns 204", async () => {
      vi.mocked(requireAuthenticatedUser).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(requireEditAccess).mockResolvedValue(true as any);
      vi.mocked(requirePetAccess).mockResolvedValue({ petId: mockPetId } as any);
      vi.mocked(prisma.petVaccination.findFirst).mockResolvedValue({ id: mockItemId, type: "RABIES" } as any);
      vi.mocked(prisma.petVaccination.delete).mockResolvedValue({} as any);

      const request = new Request("http://localhost/api/pets/" + mockPetId + "/vaccinations/" + mockItemId, { method: "DELETE" });
      const response = await deleteVaccination(request, { params: Promise.resolve({ petId: mockPetId, vaccinationId: mockItemId }) });

      expect(response.status).toBe(204);
      expect(prisma.petVaccination.delete).toHaveBeenCalledWith({ where: { id: mockItemId } });
    });
  });

  describe("DELETE /api/households/members/:memberId", () => {
    it("deletes household member successfully and returns 204", async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } }, error: null }) }
      } as any);
      vi.mocked(requireShareAccess).mockResolvedValue(true as any);
      vi.mocked(prisma.householdMember.findFirst)
        .mockResolvedValueOnce({ householdId: "hh-1", role: "OWNER" } as any)
        .mockResolvedValueOnce({ id: mockItemId, userId: "other-user-id", role: "FAMILY" } as any);
      vi.mocked(prisma.householdMember.delete).mockResolvedValue({} as any);

      const request = new Request("http://localhost/api/households/members/" + mockItemId, { method: "DELETE" });
      const response = await deleteMember(request, { params: Promise.resolve({ memberId: mockItemId }) });

      expect(response.status).toBe(204);
      expect(prisma.householdMember.delete).toHaveBeenCalledWith({ where: { id: mockItemId } });
    });

    it("prevents self-deletion", async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } }, error: null }) }
      } as any);
      vi.mocked(requireShareAccess).mockResolvedValue(true as any);
      vi.mocked(prisma.householdMember.findFirst)
        .mockResolvedValueOnce({ householdId: "hh-1", role: "OWNER" } as any)
        .mockResolvedValueOnce({ id: mockItemId, userId: mockUserId, role: "OWNER" } as any);

      const request = new Request("http://localhost/api/households/members/" + mockItemId, { method: "DELETE" });
      const response = await deleteMember(request, { params: Promise.resolve({ memberId: mockItemId }) });

      expect(response.status).toBe(409);
    });

    it("prevents deleting last owner", async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } }, error: null }) }
      } as any);
      vi.mocked(requireShareAccess).mockResolvedValue(true as any);
      vi.mocked(prisma.householdMember.findFirst)
        .mockResolvedValueOnce({ householdId: "hh-1", role: "OWNER" } as any)
        .mockResolvedValueOnce({ id: mockItemId, userId: "other-user-id", role: "OWNER" } as any);
      vi.mocked(prisma.householdMember.count).mockResolvedValue(1);

      const request = new Request("http://localhost/api/households/members/" + mockItemId, { method: "DELETE" });
      const response = await deleteMember(request, { params: Promise.resolve({ memberId: mockItemId }) });

      expect(response.status).toBe(409);
    });
  });
});
