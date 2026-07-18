import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { runVaccineReminderScheduler, buildVaccineReminderDispatchWithProvider } from "@/lib/services/vaccine-reminder-scheduler";
import { unauthorized, serverError } from "@/lib/api-error";

type VaccineReminderSetting = {
  petId: string;
  vaccineReminderChannel: "email" | "line" | "webhook";
  vaccineReminderDestination: string;
};

type DispatchLogDelegate = {
  create: (args: { data: { petId: string; vaccinationId: string; reminderDate: Date } }) => Promise<unknown>;
  deleteMany: (args: { where: { petId: string; vaccinationId: string; reminderDate: Date } }) => Promise<unknown>;
};

const getDispatchLogDelegate = (): DispatchLogDelegate | null => {
  const delegate = (prisma as unknown as { petVaccineReminderDispatchLog?: DispatchLogDelegate })
    .petVaccineReminderDispatchLog;
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

  const dispatchLog = getDispatchLogDelegate();
  if (!dispatchLog) {
    return serverError("Vaccine reminder dispatch log model is unavailable.", 503);
  }

  const result = await runVaccineReminderScheduler(
    {
      findEnabledSettings: async () =>
        (await prisma.petDisplaySettings.findMany({
          where: {
            vaccineReminderEnabled: true,
            vaccineReminderDestination: { not: "" }
          },
          select: {
            petId: true,
            vaccineReminderChannel: true,
            vaccineReminderDestination: true
          }
        })) as VaccineReminderSetting[],
      getDueVaccinations: async (petId, now) => {
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const vaccinations = await prisma.petVaccination.findMany({
          where: {
            petId,
            nextDue: {
              gte: now,
              lte: thirtyDaysFromNow
            }
          },
          select: {
            id: true,
            type: true,
            nextDue: true
          }
        });
        return vaccinations.map((v) => ({
          id: v.id,
          type: v.type,
          nextDue: v.nextDue as Date
        }));
      },
      createDispatchLog: async (petId, vaccinationId, reminderDate) => {
        try {
          await dispatchLog.create({
            data: { petId, vaccinationId, reminderDate }
          });
          return "created";
        } catch (error) {
          if (isPrismaUniqueConstraintError(error)) {
            return "duplicate";
          }
          throw error;
        }
      },
      deleteDispatchLog: async (petId, vaccinationId, reminderDate) => {
        await dispatchLog.deleteMany({
          where: { petId, vaccinationId, reminderDate }
        });
      },
      dispatch: buildVaccineReminderDispatchWithProvider({
        emailWebhookUrl: env.REMINDER_EMAIL_WEBHOOK_URL,
        lineWebhookUrl: env.REMINDER_LINE_WEBHOOK_URL
      })
    },
    new Date(),
    env.REMINDER_SCHEDULE_TIMEZONE ?? "UTC"
  );

  return NextResponse.json({ data: result });
}
