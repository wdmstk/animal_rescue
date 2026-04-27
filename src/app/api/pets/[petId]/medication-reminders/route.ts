import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";
import { env } from "@/lib/env";
import { dispatchMedicationReminder } from "@/lib/services/reminder-delivery";

const reminderSettingSchema = z
  .object({
    channel: z.enum(["email", "line", "webhook"]),
    destination: z.string().min(1),
    enabled: z.boolean()
  })
  .superRefine((value, ctx) => {
    if (value.channel === "webhook") {
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

export async function POST(request: Request, { params }: { params: { petId: string } }) {
  const parsedPetId = z.string().uuid().safeParse(params.petId);
  if (!parsedPetId.success) {
    return NextResponse.json({ error: parsedPetId.error.flatten() }, { status: 400 });
  }

  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const access = await requirePetAccess(auth.userId, parsedPetId.data);
  if (access instanceof NextResponse) {
    return access;
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
