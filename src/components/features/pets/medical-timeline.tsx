type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  recordType: "EXAM" | "SURGERY" | "LAB" | "MEDICATION" | "OTHER";
};

const labelMap: Record<TimelineItem["recordType"], string> = {
  EXAM: "診察",
  SURGERY: "手術",
  LAB: "検査",
  MEDICATION: "投薬",
  OTHER: "その他"
};

export function MedicalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">医療記録タイムライン</h2>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{item.date}</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {labelMap[item.recordType]}
              </span>
            </div>
            <h3 className="mt-1 text-sm font-bold text-slate-800">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
