export type DueStatus = "overdue" | "upcoming" | "ok";

export const getVaccinationDueStatus = (nextDue: string | null): DueStatus => {
  if (!nextDue) {
    return "ok";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(nextDue);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "overdue";
  }

  if (diffDays <= 30) {
    return "upcoming";
  }

  return "ok";
};
