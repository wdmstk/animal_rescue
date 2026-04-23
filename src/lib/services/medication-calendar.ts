export type MedicationPeriod = {
  name: string;
  startDate: string;
  endDate: string | null;
};

export const buildMedicationCalendar = (periods: MedicationPeriod[], days = 7): Record<string, string[]> => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const result: Record<string, string[]> = {};

  for (let i = 0; i < days; i += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const key = date.toISOString().slice(0, 10);

    result[key] = periods
      .filter((period) => {
        const start = new Date(period.startDate);
        const end = period.endDate ? new Date(period.endDate) : null;
        return start <= date && (!end || date <= end);
      })
      .map((period) => period.name);
  }

  return result;
};
