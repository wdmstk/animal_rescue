import { dispatchMedicationReminder, type MedicationReminderDispatchResult } from "@/lib/services/reminder-delivery";

type ReminderSetting = {
  petId: string;
  medicationReminderChannel: "email" | "line" | "webhook";
  medicationReminderDestination: string;
};

type MedicationReminderSchedulerDeps = {
  findEnabledSettings: () => Promise<ReminderSetting[]>;
  hasActiveMedication: (petId: string, now: Date) => Promise<boolean>;
  createDispatchLog: (petId: string, reminderDate: Date) => Promise<"created" | "duplicate">;
  deleteDispatchLog: (petId: string, reminderDate: Date) => Promise<void>;
  dispatch: (input: {
    petId: string;
    channel: "email" | "line" | "webhook";
    destination: string;
  }) => Promise<MedicationReminderDispatchResult>;
};

export type MedicationReminderSchedulerResult = {
  scanned: number;
  activeTargeted: number;
  delivered: number;
  duplicatesSkipped: number;
  failed: number;
};

const toUtcDay = (value: Date): Date => {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
};

export const runMedicationReminderScheduler = async (
  deps: MedicationReminderSchedulerDeps,
  now = new Date()
): Promise<MedicationReminderSchedulerResult> => {
  const settings = await deps.findEnabledSettings();
  const reminderDate = toUtcDay(now);

  let activeTargeted = 0;
  let delivered = 0;
  let duplicatesSkipped = 0;
  let failed = 0;

  for (const setting of settings) {
    const active = await deps.hasActiveMedication(setting.petId, now);
    if (!active) {
      continue;
    }
    activeTargeted += 1;

    const logResult = await deps.createDispatchLog(setting.petId, reminderDate);
    if (logResult === "duplicate") {
      duplicatesSkipped += 1;
      continue;
    }

    const firstAttempt = await deps.dispatch({
      petId: setting.petId,
      channel: setting.medicationReminderChannel,
      destination: setting.medicationReminderDestination
    });

    if (firstAttempt.status === "delivered") {
      delivered += 1;
      continue;
    }

    if (firstAttempt.status === "configured_but_failed") {
      const retryAttempt = await deps.dispatch({
        petId: setting.petId,
        channel: setting.medicationReminderChannel,
        destination: setting.medicationReminderDestination
      });
      if (retryAttempt.status === "delivered") {
        delivered += 1;
        continue;
      }
    }

    failed += 1;
    await deps.deleteDispatchLog(setting.petId, reminderDate);
  }

  return {
    scanned: settings.length,
    activeTargeted,
    delivered,
    duplicatesSkipped,
    failed
  };
};

export const buildReminderDispatchWithProvider = (providerConfig: { emailWebhookUrl?: string; lineWebhookUrl?: string }) => {
  return async (input: { petId: string; channel: "email" | "line" | "webhook"; destination: string }) => {
    return dispatchMedicationReminder(input, providerConfig);
  };
};
