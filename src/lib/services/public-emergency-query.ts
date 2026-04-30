import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toPublicEmergencyView } from "@/lib/services/public-emergency";
import { E2E_PUBLIC_EMERGENCY_TOKEN } from "@/lib/constants/emergency";
import type { EmergencyViewPayload } from "@/types/domain";

type PublicEmergencyRpcRow = {
  pet_name: string;
  disease: string | null;
  current_medications: string | null;
  allergy: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

const DEFAULT_SUMMARY_SETTINGS = {
  showEmergencyMedicationSummary: true,
  showEmergencyVaccinationSummary: true,
  showEmergencyMedicalRecordSummary: true
} as const;

const formatDate = (value: Date): string => value.toISOString().slice(0, 10);

const toMedicationSummary = (item: { name: string; dosage: string; frequency: string; startDate: Date; endDate: Date | null }): string =>
  `${item.name} / ${item.dosage} / ${item.frequency} / ${formatDate(item.startDate)}${item.endDate ? `-${formatDate(item.endDate)}` : "-"}`;

const toVaccinationSummary = (item: { type: string; date: Date; nextDue: Date | null }): string =>
  `${item.type} / 接種:${formatDate(item.date)}${item.nextDue ? ` / 次回:${formatDate(item.nextDue)}` : ""}`;

const toMedicalRecordSummary = (item: { date: Date; title: string; recordType: string }): string =>
  `${formatDate(item.date)} / ${item.recordType} / ${item.title}`;

const withRecentSummaries = async (token: string, base: EmergencyViewPayload): Promise<EmergencyViewPayload> => {
  const { prisma } = await import("@/lib/prisma");
  const tokenRow = await prisma.petEmergencyToken.findFirst({
    where: {
      token,
      isActive: true
    },
    select: {
      pet: {
        select: {
          displaySettings: {
            select: {
              showEmergencyMedicationSummary: true,
              showEmergencyVaccinationSummary: true,
              showEmergencyMedicalRecordSummary: true
            }
          },
          medications: {
            orderBy: { startDate: "desc" },
            take: 3,
            select: {
              name: true,
              dosage: true,
              frequency: true,
              startDate: true,
              endDate: true
            }
          },
          vaccinations: {
            orderBy: { date: "desc" },
            take: 3,
            select: {
              type: true,
              date: true,
              nextDue: true
            }
          },
          medicalRecords: {
            orderBy: { date: "desc" },
            take: 3,
            select: {
              date: true,
              title: true,
              recordType: true
            }
          }
        }
      }
    }
  });

  const settings = tokenRow?.pet?.displaySettings ?? DEFAULT_SUMMARY_SETTINGS;
  const payload: EmergencyViewPayload = { ...base };

  if (settings.showEmergencyMedicationSummary) {
    payload.recentMedicationSummaries = (tokenRow?.pet?.medications ?? []).map(toMedicationSummary);
  }
  if (settings.showEmergencyVaccinationSummary) {
    payload.recentVaccinationSummaries = (tokenRow?.pet?.vaccinations ?? []).map(toVaccinationSummary);
  }
  if (settings.showEmergencyMedicalRecordSummary) {
    payload.recentMedicalRecordSummaries = (tokenRow?.pet?.medicalRecords ?? []).map(toMedicalRecordSummary);
  }

  return payload;
};

const isRpcFunctionMissingError = (error: { code?: string; message?: string | null }) => {
  if (error.code === "PGRST202") {
    return true;
  }

  const message = error.message?.toLowerCase() ?? "";
  return message.includes("could not find the function") && message.includes("get_public_emergency_by_token");
};

const getPublicEmergencyByTokenFallback = async (token: string): Promise<EmergencyViewPayload | null> => {
  const { prisma } = await import("@/lib/prisma");
  const tokenRow = await prisma.petEmergencyToken.findFirst({
    where: {
      token,
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
              emergencyContactPhone: true
            }
          }
        }
      }
    }
  });

  if (!tokenRow?.pet) {
    return null;
  }

  const base = toPublicEmergencyView({
    petName: tokenRow.pet.name,
    disease: tokenRow.pet.emergencyInfo?.disease ?? null,
    allergy: tokenRow.pet.emergencyInfo?.allergy ?? null,
    currentMedications: tokenRow.pet.emergencyInfo?.currentMedications ?? null,
    vetName: tokenRow.pet.emergencyInfo?.vetName ?? null,
    vetPhone: tokenRow.pet.emergencyInfo?.vetPhone ?? null,
    emergencyContactName: tokenRow.pet.emergencyInfo?.emergencyContactName ?? null,
    emergencyContactPhone: tokenRow.pet.emergencyInfo?.emergencyContactPhone ?? null
  });

  return withRecentSummaries(token, base);
};

export const getPublicEmergencyByToken = async (token: string): Promise<EmergencyViewPayload | null> => {
  if (process.env.PLAYWRIGHT_E2E === "1") {
    if (token !== E2E_PUBLIC_EMERGENCY_TOKEN) {
      return null;
    }

    return {
      petName: "モカ（E2E）",
      disease: "僧帽弁閉鎖不全症（軽度）",
      medications: "ピモベンダン 1日2回",
      allergy: "鶏肉アレルギー",
      vetName: "みなと動物病院",
      vetPhone: "03-1234-5678",
      emergencyContactName: "山田 花子",
      emergencyContactPhone: "090-1234-5678",
      recentMedicationSummaries: ["ピモベンダン / 1.25mg / 1日2回 / 2026-01-10-"],
      recentVaccinationSummaries: ["CORE / 接種:2025-10-01 / 次回:2026-10-01"],
      recentMedicalRecordSummaries: ["2026-02-20 / EXAM / 定期検診"]
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_emergency_by_token", {
    input_token: token
  });

  if (error) {
    if (isRpcFunctionMissingError(error)) {
      return getPublicEmergencyByTokenFallback(token);
    }

    throw new Error(`Failed to load public emergency data: ${error.message}`);
  }

  const row = (data as PublicEmergencyRpcRow[] | null)?.[0];
  if (!row) {
    return null;
  }

  const base = toPublicEmergencyView({
    petName: row.pet_name,
    disease: row.disease,
    allergy: row.allergy,
    currentMedications: row.current_medications,
    vetName: row.vet_name,
    vetPhone: row.vet_phone,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone
  });

  return withRecentSummaries(token, base);
};
