import { beforeEach, describe, expect, it, vi } from "vitest";

// Define global mock outside hoisted function
const globalMockLimit = vi.fn()
const mockRatelimitInstance = {
  limit: globalMockLimit
}

const { rpcMock, createSupabaseServerClientMock, findFirstEmergencyTokenMock, findUniqueOwnerDisplaySettingsMock, RatelimitMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn(),
  findFirstEmergencyTokenMock: vi.fn(),
  findUniqueOwnerDisplaySettingsMock: vi.fn(),
  RatelimitMock: class MockRatelimit {
    constructor(config: any) {
      return mockRatelimitInstance
    }
    static slidingWindow(limit: number, window: string) {
      return { limiter: 'slidingWindow' }
    }
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petEmergencyToken: {
      findFirst: findFirstEmergencyTokenMock
    },
    ownerDisplaySettings: {
      findUnique: findUniqueOwnerDisplaySettingsMock
    }
  }
}));

// Mock Upstash Redis and Ratelimit
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn()
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: RatelimitMock
}))

import { GET } from "../../src/app/api/public/emergency/[token]/route";

describe("GET /api/public/emergency/[token]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupabaseServerClientMock.mockResolvedValue({
      rpc: rpcMock
    });
    
    // Set environment variables for tests
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    
    // Mock rate limiting to allow requests by default for existing tests
    globalMockLimit.mockResolvedValue({
      success: true,
      remaining: 59,
      reset: Date.now() + 60000
    })
  });

  it("returns 400 for non-uuid token", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "invalid-token" })
    });

    expect(response.status).toBe(400);
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("returns 404 when token has no matching data", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(404);
    expect(rpcMock).toHaveBeenCalledWith("get_public_emergency_by_token", {
      input_token: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns emergency payload for valid token", async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          pet_name: "Mugi",
          disease: "CKD",
          current_medications: "Renal meds",
          allergy: "None",
          vet_name: "City Vet",
          vet_phone: "03-0000-0000",
          emergency_contact_name: "Owner",
          emergency_contact_phone: "090-0000-0000",
          blood_type: null,
          emergency_vet_name: null,
          emergency_vet_phone: null,
          emergency_contact_name_2: null,
          emergency_contact_phone_2: null
        }
      ],
      error: null
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toEqual({
      petName: "Mugi",
      disease: "CKD",
      medications: "Renal meds",
      allergy: "None",
      vetName: "City Vet",
      vetPhone: "03-0000-0000",
      emergencyContactName: "Owner",
      emergencyContactPhone: "090-0000-0000",
      bloodType: null,
      emergencyVetName: null,
      emergencyVetPhone: null,
      emergencyContactName2: null,
      emergencyContactPhone2: null,
      recentMedicationSummaries: [],
      recentVaccinationSummaries: [],
      recentMedicalRecordSummaries: []
    });
  });

  it("normalizes nullable and whitespace fields in response payload", async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          pet_name: "Mugi",
          disease: "  ",
          current_medications: " Renal meds ",
          allergy: null,
          vet_name: " ",
          vet_phone: null,
          emergency_contact_name: " Owner ",
          emergency_contact_phone: "090-0000-0000",
          blood_type: null,
          emergency_vet_name: null,
          emergency_vet_phone: null,
          emergency_contact_name_2: null,
          emergency_contact_phone_2: null
        }
      ],
      error: null
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toEqual({
      petName: "Mugi",
      disease: null,
      medications: "Renal meds",
      allergy: null,
      vetName: null,
      vetPhone: null,
      emergencyContactName: "Owner",
      emergencyContactPhone: "090-0000-0000",
      bloodType: null,
      emergencyVetName: null,
      emergencyVetPhone: null,
      emergencyContactName2: null,
      emergencyContactPhone2: null,
      recentMedicationSummaries: [],
      recentVaccinationSummaries: [],
      recentMedicalRecordSummaries: []
    });
  });

  it("throws when RPC execution fails", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "db timeout" }
    });

    await expect(
      GET(new Request("http://localhost"), {
        params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
      })
    ).rejects.toThrow("Failed to load public emergency data: db timeout");
    expect(findFirstEmergencyTokenMock).not.toHaveBeenCalled();
  });

  it("falls back to prisma query when RPC function is missing in schema cache", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message: "Could not find the function public.get_public_emergency_by_token(input_token) in the schema cache"
      }
    });
    findFirstEmergencyTokenMock.mockResolvedValue({
      pet: {
        name: "Mugi",
        emergencyInfo: {
          disease: "CKD",
          currentMedications: "Renal meds",
          allergy: "None",
          vetName: "City Vet",
          vetPhone: "03-0000-0000",
          emergencyContactName: "Owner",
          emergencyContactPhone: "090-0000-0000",
          bloodType: null,
          emergencyVetName: null,
          emergencyVetPhone: null,
          emergencyContactName2: null,
          emergencyContactPhone2: null
        }
      }
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    expect(findFirstEmergencyTokenMock).toHaveBeenCalledWith({
      where: {
        token: "11111111-1111-4111-8111-111111111111",
        isActive: true
      },
      select: {
        pet: {
          select: {
            name: true,
            emergencyInfo: {
              select: {
                disease: true,
                allergy: true,
                currentMedications: true,
                vetName: true,
                vetPhone: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
                bloodType: true,
                emergencyVetName: true,
                emergencyVetPhone: true,
                emergencyContactName2: true,
                emergencyContactPhone2: true
              }
            }
          }
        }
      }
    });
  });

  it("returns 404 when fallback cannot find public emergency record", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message: "Could not find the function public.get_public_emergency_by_token(input_token) in the schema cache"
      }
    });
    findFirstEmergencyTokenMock.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(404);
  });

  it("returns 200 with null fields when fallback finds active token without emergency info", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message: "Could not find the function public.get_public_emergency_by_token(input_token) in the schema cache"
      }
    });
    findFirstEmergencyTokenMock.mockResolvedValue({
      pet: {
        name: "Mugi",
        emergencyInfo: null
      }
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toEqual({
      petName: "Mugi",
      disease: null,
      medications: null,
      allergy: null,
      vetName: null,
      vetPhone: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      bloodType: null,
      emergencyVetName: null,
      emergencyVetPhone: null,
      emergencyContactName2: null,
      emergencyContactPhone2: null,
      recentMedicationSummaries: [],
      recentVaccinationSummaries: [],
      recentMedicalRecordSummaries: []
    });
  });

  it("omits recent summaries when display settings are off", async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          pet_name: "Mugi",
          disease: "CKD",
          current_medications: "Renal meds",
          allergy: "None",
          vet_name: "City Vet",
          vet_phone: "03-0000-0000",
          emergency_contact_name: "Owner",
          emergency_contact_phone: "090-0000-0000",
          blood_type: null,
          emergency_vet_name: null,
          emergency_vet_phone: null,
          emergency_contact_name_2: null,
          emergency_contact_phone_2: null
        }
      ],
      error: null
    });
    findFirstEmergencyTokenMock.mockResolvedValue({
      pet: {
        household: {
          members: [{ userId: "owner-1" }]
        },
        medications: [],
        vaccinations: [],
        medicalRecords: []
      }
    });
    findUniqueOwnerDisplaySettingsMock.mockResolvedValue({
      showEmergencyMedicationSummary: false,
      showEmergencyVaccinationSummary: false,
      showEmergencyMedicalRecordSummary: false
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.recentMedicationSummaries).toBeUndefined();
    expect(payload.data.recentVaccinationSummaries).toBeUndefined();
    expect(payload.data.recentMedicalRecordSummaries).toBeUndefined();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    globalMockLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 60000
    })

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(429);
    const payload = await response.json();
    expect(payload.error).toBe('Too many requests');
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("allows request when rate limit is not exceeded", async () => {
    globalMockLimit.mockResolvedValue({
      success: true,
      remaining: 59,
      reset: Date.now() + 60000
    })

    rpcMock.mockResolvedValue({
      data: [
        {
          pet_name: "Mugi",
          disease: "CKD",
          current_medications: "Renal meds",
          allergy: "None",
          vet_name: "City Vet",
          vet_phone: "03-0000-0000",
          emergency_contact_name: "Owner",
          emergency_contact_phone: "090-0000-0000",
          blood_type: null,
          emergency_vet_name: null,
          emergency_vet_phone: null,
          emergency_contact_name_2: null,
          emergency_contact_phone_2: null
        }
      ],
      error: null
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('59');
  });

  it("implements Fail-Open when Redis connection fails", async () => {
    globalMockLimit.mockRejectedValue(new Error('Connection failed'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    rpcMock.mockResolvedValue({
      data: [
        {
          pet_name: "Mugi",
          disease: "CKD",
          current_medications: "Renal meds",
          allergy: "None",
          vet_name: "City Vet",
          vet_phone: "03-0000-0000",
          emergency_contact_name: "Owner",
          emergency_contact_phone: "090-0000-0000",
          blood_type: null,
          emergency_vet_name: null,
          emergency_vet_phone: null,
          emergency_contact_name_2: null,
          emergency_contact_phone_2: null
        }
      ],
      error: null
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ token: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200); // Fail-Open allows request
    expect(rpcMock).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Rate Limit Store Error (Fail-Open active):',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
