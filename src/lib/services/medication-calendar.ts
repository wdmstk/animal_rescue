export type MedicationPeriod = {
  name: string;
  startDate: string;
  endDate: string | null;
};

const toLocalDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const buildMedicationCalendar = (periods: MedicationPeriod[], days = 7): Record<string, string[]> => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const result: Record<string, string[]> = {};

  for (let i = 0; i < days; i += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const key = formatLocalDate(date);

    result[key] = periods
      .filter((period) => {
        const start = toLocalDate(period.startDate);
        const end = period.endDate ? toLocalDate(period.endDate) : null;
        return start <= date && (!end || date <= end);
      })
      .map((period) => period.name);
  }

  return result;
};
