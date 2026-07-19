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

type MedicalTimelineProps = {
  items: TimelineItem[];
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (id: string) => void;
};

export function MedicalTimeline({ items, onEdit, onDelete }: MedicalTimelineProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/60 dark:border dark:border-white/10 dark:text-slate-100 dark:backdrop-blur-md">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">医療記録タイムライン</h2>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:bg-slate-950/40 dark:border-white/5">
            <p className="text-sm text-slate-600 dark:text-slate-400">医療記録はまだありません。</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">上のフォームから診察・検査・投薬メモを追加してください。</p>
            <a
              href="#medical-record-form"
              className="mt-2 inline-flex rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              記録入力へ移動
            </a>
          </div>
        ) : null}
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/5 dark:bg-slate-950/20">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.date}</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  {labelMap[item.recordType]}
                </span>
              </div>
            </div>
            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{item.description}</p>
            
            <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-white/5 pt-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="rounded px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 dark:text-slate-300 dark:hover:bg-white/5 dark:border-white/10"
                >
                  編集
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/20 dark:border-rose-900/30"
                >
                  削除
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
