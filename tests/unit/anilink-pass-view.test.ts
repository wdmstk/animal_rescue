import { describe, expect, it } from "vitest";
import type { AniLinkPassData } from "@/lib/services/anilink-pass-query";

describe("AniLink Pass Data Structure", () => {
  it("structures SBAR payload correctly for vet presentation", () => {
    const mockPassData: AniLinkPassData = {
      token: "11111111-1111-4111-8111-111111111111",
      petName: "ポチ",
      mainPhotoUrl: "https://example.com/pet.jpg",
      sbar: {
        situation: {
          primaryComplaint: "定期検診 (EXAM)",
          recentMedicalSummary: "良好",
          specialNotes: "暴れるためネット使用推奨"
        },
        background: {
          petName: "ポチ",
          species: "DOG",
          breed: "柴犬",
          sex: "MALE",
          reproductiveStatus: "NEUTERED",
          weightKg: 10.5,
          disease: "皮膚炎",
          allergy: "チキン",
          currentMedications: [{ name: "アポキル", dosage: "5mg", frequency: "1日1回" }],
          vetName: "さけ動物病院",
          vetPhone: "03-0000-0000",
          emergencyContactName: "飼い主太郎",
          emergencyContactPhone: "090-0000-0000"
        },
        assessment: {
          latestLabDate: "2026-05-01",
          labMarkers: [{ marker: "CRE", value: 1.2, unit: "mg/dL", category: "BLOOD" }]
        },
        recommendation: {
          vaccinations: [{ type: "狂犬病", date: "2026-04-01", nextDue: "2027-04-01" }],
          recentMedications: [{ name: "アポキル", startDate: "2026-01-01", endDate: null }]
        }
      },
      updatedAt: "2026-07-28T00:00:00.000Z"
    };

    expect(mockPassData.petName).toBe("ポチ");
    expect(mockPassData.sbar.situation.specialNotes).toBe("暴れるためネット使用推奨");
    expect(mockPassData.sbar.assessment.labMarkers[0].marker).toBe("CRE");
    expect(mockPassData.sbar.recommendation.vaccinations[0].type).toBe("狂犬病");
  });
});
