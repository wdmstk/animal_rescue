import { beforeEach, vi } from "vitest";

process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/animal_rescue_test";
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";

const {
  requireAuthenticatedUserMock,
  requireHouseholdMemberMock,
  requirePetAccessMock
} = vi.hoisted(() => ({
  requireAuthenticatedUserMock: vi.fn(),
  requireHouseholdMemberMock: vi.fn(),
  requirePetAccessMock: vi.fn()
}));

vi.mock("@/lib/auth/pet-access", () => ({
  requireAuthenticatedUser: requireAuthenticatedUserMock,
  requireHouseholdMember: requireHouseholdMemberMock,
  requirePetAccess: requirePetAccessMock
}));

beforeEach(() => {
  requireAuthenticatedUserMock.mockResolvedValue({
    userId: "22222222-2222-4222-8222-222222222222"
  });
  requireHouseholdMemberMock.mockResolvedValue(true);
  requirePetAccessMock.mockImplementation(async (_userId: string, petId: string) => ({
    petId,
    householdId: "11111111-1111-4111-8111-111111111111"
  }));
});
