import { dispatchMedicationReminder, type MedicationReminderDispatchResult } from "@/lib/services/reminder-delivery";
import { toTimezoneDay } from "@/lib/services/medication-reminder-scheduler";

type VaccineReminderSetting = {
  petId: string;
  vaccineReminderChannel: "email" | "line" | "webhook";
  vaccineReminderDestination: string;
};

type DueVaccinationInfo = {
  id: string;
  type: string;
  nextDue: Date;
};

type VaccineReminderSchedulerDeps = {
  findEnabledSettings: () => Promise<VaccineReminderSetting[]>;
  getDueVaccinations: (petId: string, now: Date) => Promise<DueVaccinationInfo[]>;
  createDispatchLog: (petId: string, vaccinationId: string, reminderDate: Date) => Promise<"created" | "duplicate">;
  deleteDispatchLog: (petId: string, vaccinationId: string, reminderDate: Date) => Promise<void>;
  dispatch: (input: {
    petId: string;
    channel: "email" | "line" | "webhook";
    destination: string;
    vaccinationId: string;
    vaccineType: string;
    nextDue: Date;
  }) => Promise<MedicationReminderDispatchResult>;
};

export type VaccineReminderSchedulerResult = {
  scanned: number;
  dueVaccinesFound: number;
  delivered: number;
  duplicatesSkipped: number;
  failed: number;
};

export const runVaccineReminderScheduler = async (
  deps: VaccineReminderSchedulerDeps,
  now = new Date(),
  timezone = "UTC"
): Promise<VaccineReminderSchedulerResult> => {
  const settings = await deps.findEnabledSettings();
  const reminderDate = toTimezoneDay(now, timezone);

  let dueVaccinesFound = 0;
  let delivered = 0;
  let duplicatesSkipped = 0;
  let failed = 0;

  for (const setting of settings) {
    const dueVaccines = await deps.getDueVaccinations(setting.petId, now);
    if (dueVaccines.length === 0) {
      continue;
    }

    for (const vaccine of dueVaccines) {
      dueVaccinesFound += 1;

      const logResult = await deps.createDispatchLog(setting.petId, vaccine.id, reminderDate);
      if (logResult === "duplicate") {
        duplicatesSkipped += 1;
        continue;
      }

      const firstAttempt = await deps.dispatch({
        petId: setting.petId,
        channel: setting.vaccineReminderChannel,
        destination: setting.vaccineReminderDestination,
        vaccinationId: vaccine.id,
        vaccineType: vaccine.type,
        nextDue: vaccine.nextDue
      });

      if (firstAttempt.status === "delivered") {
        delivered += 1;
        continue;
      }

      if (firstAttempt.status === "configured_but_failed") {
        const retryAttempt = await deps.dispatch({
          petId: setting.petId,
          channel: setting.vaccineReminderChannel,
          destination: setting.vaccineReminderDestination,
          vaccinationId: vaccine.id,
          vaccineType: vaccine.type,
          nextDue: vaccine.nextDue
        });
        if (retryAttempt.status === "delivered") {
          delivered += 1;
          continue;
        }
      }

      failed += 1;
      await deps.deleteDispatchLog(setting.petId, vaccine.id, reminderDate);
    }
  }

  return {
    scanned: settings.length,
    dueVaccinesFound,
    delivered,
    duplicatesSkipped,
    failed
  };
};

export const buildVaccineReminderDispatchWithProvider = (providerConfig: { emailWebhookUrl?: string; lineWebhookUrl?: string }) => {
  return async (input: {
    petId: string;
    channel: "email" | "line" | "webhook";
    destination: string;
    vaccinationId: string;
    vaccineType: string;
    nextDue: Date;
  }) => {
    // We can reuse the medication reminder delivery mechanism or define specific webhook calls
    const endpoint =
      input.channel === "webhook"
        ? input.destination
        : input.channel === "email"
        ? providerConfig.emailWebhookUrl
        : providerConfig.lineWebhookUrl;

    if (!endpoint) {
      return {
        status: "provider_not_configured" as const,
        provider: input.channel
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          petId: input.petId,
          channel: input.channel,
          destination: input.destination,
          vaccinationId: input.vaccinationId,
          vaccineType: input.vaccineType,
          nextDue: input.nextDue.toISOString(),
          type: "VACCINE_REMINDER"
        })
      });

      if (!response.ok) {
        return {
          status: "configured_but_failed" as const,
          provider: input.channel,
          detail: `Provider status ${response.status}`
        };
      }

      return {
        status: "delivered" as const,
        provider: input.channel
      };
    } catch (error) {
      return {
        status: "configured_but_failed" as const,
        provider: input.channel,
        detail: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };
};
