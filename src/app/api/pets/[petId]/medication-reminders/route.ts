import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { env } from "@/lib/env";
import { requireEditAccess, requireNotifyAccess } from "@/lib/billing/access-guard";
import { dispatchMedicationReminder } from "@/lib/services/reminder-delivery";

const reminderSettingSchema = z
  .object({
    channel: z.enum(["email", "line", "webhook"]),
    destination: z.string(),
    enabled: z.boolean()
  })
  .superRefine((value, ctx) => {
    if (value.enabled && value.destination.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destination"],
        message: "destination is required when reminder is enabled"
      });
    }

    if (value.enabled && value.channel === "webhook") {
      const webhookUrlResult = z.string().url().safeParse(value.destination);

      if (!webhookUrlResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["destination"],
          message: "destination must be a valid URL when channel is webhook"
        });
      }
    }
  });

const defaultReminderSettings = {
  enabled: false,
  channel: "email" as const,
  destination: ""
};

type PetDisplaySettingsReminderDelegate = {
  findUnique: (args: { where: { petId: string } }) => Promise<{
    petId: string;
    medicationReminderEnabled: boolean;
    medicationReminderChannel: "email" | "line" | "webhook";
    medicationReminderDestination: string;
  } | null>;
  upsert: (args: {
    where: { petId: string };
    update: {
      medicationReminderEnabled: boolean;
      medicationReminderChannel: "email" | "line" | "webhook";
      medicationReminderDestination: string;
    };
    create: {
      petId: string;
      medicationReminderEnabled: boolean;
      medicationReminderChannel: "email" | "line" | "webhook";
      medicationReminderDestination: string;
    };
  }) => Promise<{
    petId: string;
    medicationReminderEnabled: boolean;
    medicationReminderChannel: "email" | "line" | "webhook";
    medicationReminderDestination: string;
  }>;
};

const getPetDisplaySettingsDelegate = (): PetDisplaySettingsReminderDelegate | null => {
  const delegate = (prisma as unknown as { petDisplaySettings?: PetDisplaySettingsReminderDelegate }).petDisplaySettings;
  if (!delegate?.findUnique || !delegate?.upsert) {
    return null;
  }
  return delegate;
};

async function parseAndAuthorize(params: Promise<{ petId: string }>) {
  const parsedParams = z.object({ petId: z.string().uuid() }).safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedParams.data.petId);
  if (access instanceof NextResponse) {
    return access;
  }

  return {
    ...access,
    userId: auth.userId
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ petId: string }> }) {
  const access = await parseAndAuthorize(params);
  if (access instanceof NextResponse) {
    return access;
  }

  const petDisplaySettings = getPetDisplaySettingsDelegate();
  if (!petDisplaySettings) {
    return NextResponse.json({ error: "Display settings model is unavailable. Regenerate Prisma Client." }, { status: 503 });
  }

  const settings = await petDisplaySettings.findUnique({ where: { petId: access.petId } });

  return NextResponse.json({
    data: {
      petId: access.petId,
      enabled: settings?.medicationReminderEnabled ?? defaultReminderSettings.enabled,
      channel: settings?.medicationReminderChannel ?? defaultReminderSettings.channel,
      destination: settings?.medicationReminderDestination ?? defaultReminderSettings.destination
    }
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const access = await parseAndAuthorize(params);
  if (access instanceof NextResponse) {
    return access;
  }
  const editAccess = await requireEditAccess(access.userId);
  if (editAccess instanceof NextResponse) {
    return editAccess;
  }

  const body = await request.json();
  const parsed = reminderSettingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const petDisplaySettings = getPetDisplaySettingsDelegate();
  if (!petDisplaySettings) {
    return NextResponse.json({ error: "Display settings model is unavailable. Regenerate Prisma Client." }, { status: 503 });
  }

  const saved = await petDisplaySettings.upsert({
    where: { petId: access.petId },
    update: {
      medicationReminderEnabled: parsed.data.enabled,
      medicationReminderChannel: parsed.data.channel,
      medicationReminderDestination: parsed.data.destination
    },
    create: {
      petId: access.petId,
      medicationReminderEnabled: parsed.data.enabled,
      medicationReminderChannel: parsed.data.channel,
      medicationReminderDestination: parsed.data.destination
    }
  });

  return NextResponse.json({
    data: {
      petId: access.petId,
      enabled: saved.medicationReminderEnabled,
      channel: saved.medicationReminderChannel,
      destination: saved.medicationReminderDestination,
      status: "saved"
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ petId: string }> }) {
  const access = await parseAndAuthorize(params);
  if (access instanceof NextResponse) {
    return access;
  }
  const notifyAccess = await requireNotifyAccess(access.userId);
  if (notifyAccess instanceof NextResponse) {
    return notifyAccess;
  }

  const body = await request.json();
  const parsed = reminderSettingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.enabled) {
    return NextResponse.json({
      data: {
        petId: access.petId,
        channel: parsed.data.channel,
        destination: parsed.data.destination,
        status: "disabled"
      }
    });
  }

  const result = await dispatchMedicationReminder(
    {
      petId: access.petId,
      channel: parsed.data.channel,
      destination: parsed.data.destination
    },
    {
      emailWebhookUrl: env.REMINDER_EMAIL_WEBHOOK_URL,
      lineWebhookUrl: env.REMINDER_LINE_WEBHOOK_URL
    }
  );

  if (result.status === "provider_not_configured") {
    return NextResponse.json(
      {
        data: {
          petId: access.petId,
          channel: parsed.data.channel,
          destination: parsed.data.destination,
          status: "provider_not_configured"
        }
      },
      { status: 503 }
    );
  }

  if (result.status === "configured_but_failed") {
    return NextResponse.json(
      {
        data: {
          petId: access.petId,
          channel: parsed.data.channel,
          destination: parsed.data.destination,
          status: "configured_but_failed",
          detail: result.detail
        }
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    data: {
      petId: access.petId,
      channel: parsed.data.channel,
      destination: parsed.data.destination,
      status: "delivered"
    }
  });
}
