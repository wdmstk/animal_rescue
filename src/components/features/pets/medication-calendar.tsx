import { buildMedicationCalendar, type MedicationPeriod } from "@/lib/services/medication-calendar";

type MedicationCalendarProps = {
  periods: MedicationPeriod[];
};

export function MedicationCalendar({ periods }: MedicationCalendarProps) {
  const calendar = buildMedicationCalendar(periods, 7);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">投薬カレンダー（7日）</h2>
      <div className="mt-3 space-y-2">
        {Object.entries(calendar).map(([date, meds]) => (
          <div key={date} className="rounded-lg border border-slate-200 p-2 text-sm">
            <p className="font-semibold text-slate-700">{date}</p>
            <p className="text-slate-600">{meds.length > 0 ? meds.join(" / ") : "投薬なし"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
