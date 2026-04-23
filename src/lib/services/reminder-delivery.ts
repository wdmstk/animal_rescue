export type MedicationReminderChannel = "email" | "line" | "webhook";

export type MedicationReminderDispatchInput = {
  petId: string;
  channel: MedicationReminderChannel;
  destination: string;
};

export type MedicationReminderProviderConfig = {
  emailWebhookUrl?: string;
  lineWebhookUrl?: string;
};

export type MedicationReminderDispatchResult =
  | { status: "delivered"; provider: MedicationReminderChannel }
  | { status: "provider_not_configured"; provider: MedicationReminderChannel }
  | { status: "configured_but_failed"; provider: MedicationReminderChannel; detail: string };

const resolveProviderEndpoint = (
  channel: MedicationReminderChannel,
  destination: string,
  providers: MedicationReminderProviderConfig
): string | undefined => {
  if (channel === "webhook") {
    return destination;
  }

  if (channel === "email") {
    return providers.emailWebhookUrl;
  }

  return providers.lineWebhookUrl;
};

export const dispatchMedicationReminder = async (
  input: MedicationReminderDispatchInput,
  providers: MedicationReminderProviderConfig
): Promise<MedicationReminderDispatchResult> => {
  const endpoint = resolveProviderEndpoint(input.channel, input.destination, providers);

  if (!endpoint) {
    return {
      status: "provider_not_configured",
      provider: input.channel
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        petId: input.petId,
        channel: input.channel,
        destination: input.destination
      })
    });

    if (!response.ok) {
      return {
        status: "configured_but_failed",
        provider: input.channel,
        detail: `Provider responded with status ${response.status}`
      };
    }

    return {
      status: "delivered",
      provider: input.channel
    };
  } catch (error) {
    return {
      status: "configured_but_failed",
      provider: input.channel,
      detail: error instanceof Error ? error.message : "Unknown delivery error"
    };
  }
};
