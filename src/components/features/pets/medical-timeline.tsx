type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
};

export function MedicalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">医療記録タイムライン</h2>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold text-slate-500">{item.date}</p>
            <h3 className="mt-1 text-sm font-bold text-slate-800">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
