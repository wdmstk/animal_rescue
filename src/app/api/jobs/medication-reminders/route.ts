import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { buildReminderDispatchWithProvider, runMedicationReminderScheduler } from "@/lib/services/medication-reminder-scheduler";
import { unauthorized, serverError } from "@/lib/api-error";

type ReminderSetting = {
  petId: string;
  medicationReminderChannel: "email" | "line" | "webhook";
  medicationReminderDestination: string;
};

type ReminderDispatchLogDelegate = {
  create: (args: { data: { petId: string; reminderDate: Date } }) => Promise<unknown>;
  deleteMany: (args: { where: { petId: string; reminderDate: Date } }) => Promise<unknown>;
};

const getReminderDispatchLogDelegate = (): ReminderDispatchLogDelegate | null => {
  const delegate = (prisma as unknown as { petMedicationReminderDispatchLog?: ReminderDispatchLogDelegate })
    .petMedicationReminderDispatchLog;
  if (!delegate?.create || !delegate?.deleteMany) {
    return null;
  }
  return delegate;
};

const isPrismaUniqueConstraintError = (error: unknown): boolean => {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
};

export async function POST(request: Request) {
  if (env.MEDICATION_REMINDER_JOB_TOKEN) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${env.MEDICATION_REMINDER_JOB_TOKEN}`) {
      return unauthorized("Unauthorized");
    }
  }

  const reminderDispatchLog = getReminderDispatchLogDelegate();
  if (!reminderDispatchLog) {
    return serverError("Reminder dispatch log model is unavailable. Regenerate Prisma Client.", 503);
  }

  const result = await runMedicationReminderScheduler(
    {
      findEnabledSettings: async () =>
        (await prisma.petDisplaySettings.findMany({
          where: {
            medicationReminderEnabled: true,
            medicationReminderDestination: {
              not: ""
            }
          },
          select: {
            petId: true,
            medicationReminderChannel: true,
            medicationReminderDestination: true
          }
        })) as ReminderSetting[],
      hasActiveMedication: async (petId, now) => {
        const activeMedication = await prisma.petMedication.findFirst({
          where: {
            petId,
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }]
          },
          select: { id: true }
        });
        return Boolean(activeMedication);
      },
      createDispatchLog: async (petId, reminderDate) => {
        try {
          await reminderDispatchLog.create({
            data: { petId, reminderDate }
          });
          return "created";
        } catch (error) {
          if (isPrismaUniqueConstraintError(error)) {
            return "duplicate";
          }
          throw error;
        }
      },
      deleteDispatchLog: async (petId, reminderDate) => {
        await reminderDispatchLog.deleteMany({
          where: { petId, reminderDate }
        });
      },
      dispatch: buildReminderDispatchWithProvider({
        emailWebhookUrl: env.REMINDER_EMAIL_WEBHOOK_URL,
        lineWebhookUrl: env.REMINDER_LINE_WEBHOOK_URL
      })
    },
    new Date(),
    env.REMINDER_SCHEDULE_TIMEZONE ?? "UTC"
  );

  return NextResponse.json({ data: result });
}
