import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { env } from "@/lib/env";
import { requireEditAccess, requireNotifyAccess } from "@/lib/billing/access-guard";
import { badRequest, serverError } from "@/lib/api-error";

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
    vaccineReminderEnabled: boolean;
    vaccineReminderChannel: "email" | "line" | "webhook";
    vaccineReminderDestination: string;
  } | null>;
  upsert: (args: {
    where: { petId: string };
    update: {
      vaccineReminderEnabled: boolean;
      vaccineReminderChannel: "email" | "line" | "webhook";
      vaccineReminderDestination: string;
    };
    create: {
      petId: string;
      vaccineReminderEnabled: boolean;
      vaccineReminderChannel: "email" | "line" | "webhook";
      vaccineReminderDestination: string;
    };
  }) => Promise<{
    petId: string;
    vaccineReminderEnabled: boolean;
    vaccineReminderChannel: "email" | "line" | "webhook";
    vaccineReminderDestination: string;
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
  const parsedParams = z.object({
    petId: process.env.PLAYWRIGHT_E2E === "1" ? z.string() : z.string().uuid()
  }).safeParse(await params);
  if (!parsedParams.success) {
    return badRequest(parsedParams.error);
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
    return serverError("Display settings model is unavailable.", 503);
  }

  const settings = await petDisplaySettings.findUnique({ where: { petId: access.petId } });

  return NextResponse.json({
    data: {
      petId: access.petId,
      enabled: settings?.vaccineReminderEnabled ?? defaultReminderSettings.enabled,
      channel: settings?.vaccineReminderChannel ?? defaultReminderSettings.channel,
      destination: settings?.vaccineReminderDestination ?? defaultReminderSettings.destination
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
    return badRequest(parsed.error);
  }

  const petDisplaySettings = getPetDisplaySettingsDelegate();
  if (!petDisplaySettings) {
    return serverError("Display settings model is unavailable.", 503);
  }

  const saved = await petDisplaySettings.upsert({
    where: { petId: access.petId },
    update: {
      vaccineReminderEnabled: parsed.data.enabled,
      vaccineReminderChannel: parsed.data.channel,
      vaccineReminderDestination: parsed.data.destination
    },
    create: {
      petId: access.petId,
      vaccineReminderEnabled: parsed.data.enabled,
      vaccineReminderChannel: parsed.data.channel,
      vaccineReminderDestination: parsed.data.destination
    }
  });

  return NextResponse.json({
    data: {
      petId: access.petId,
      enabled: saved.vaccineReminderEnabled,
      channel: saved.vaccineReminderChannel,
      destination: saved.vaccineReminderDestination,
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
    return badRequest(parsed.error);
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

  const endpoint =
    parsed.data.channel === "webhook"
      ? parsed.data.destination
      : parsed.data.channel === "email"
      ? env.REMINDER_EMAIL_WEBHOOK_URL
      : env.REMINDER_LINE_WEBHOOK_URL;

  if (!endpoint) {
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

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        petId: access.petId,
        channel: parsed.data.channel,
        destination: parsed.data.destination,
        type: "VACCINE_TEST_DISPATCH"
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          data: {
            petId: access.petId,
            channel: parsed.data.channel,
            destination: parsed.data.destination,
            status: "configured_but_failed",
            detail: `Status ${response.status}`
          }
        },
        { status: 502 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        data: {
          petId: access.petId,
          channel: parsed.data.channel,
          destination: parsed.data.destination,
          status: "configured_but_failed",
          detail: error instanceof Error ? error.message : "Unknown error"
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
