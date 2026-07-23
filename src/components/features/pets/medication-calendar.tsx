import { buildMedicationCalendar, type MedicationPeriod } from "@/lib/services/medication-calendar";

type MedicationCalendarProps = {
  periods: MedicationPeriod[];
};

export function MedicationCalendar({ periods }: MedicationCalendarProps) {
  const calendar = buildMedicationCalendar(periods, 7);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-sm backdrop-blur-md">
      <h2 className="text-base font-bold text-white">投薬カレンダー（7日）</h2>
      <div className="mt-3 space-y-2">
        {Object.entries(calendar).map(([date, meds]) => (
          <div key={date} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm">
            <p className="font-bold text-slate-200">{date}</p>
            <p className="text-slate-300 mt-1">{meds.length > 0 ? meds.join(" / ") : "投薬なし"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
