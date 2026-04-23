export type MedicalTimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  recordType: "EXAM" | "SURGERY" | "LAB" | "MEDICATION" | "OTHER";
};

export const groupTimelineByDate = (items: MedicalTimelineItem[]): Record<string, MedicalTimelineItem[]> => {
  return items.reduce<Record<string, MedicalTimelineItem[]>>((acc, item) => {
    const key = item.date;
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
};
