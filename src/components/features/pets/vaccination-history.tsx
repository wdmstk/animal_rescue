import { getVaccinationDueStatus } from "@/lib/services/vaccination";

export type VaccinationHistoryItem = {
  id: string;
  typeCode: "RABIES" | "CORE" | "HEARTWORM" | "FLEA_TICK" | "OTHER";
  type: string;
  date: string;
  nextDue: string | null;
};

const labelMap = {
  overdue: "期限超過",
  upcoming: "期限近い",
  ok: "有効"
} as const;

type VaccinationHistoryProps = {
  items: VaccinationHistoryItem[];
  editingId?: string | null;
  onEdit?: (item: VaccinationHistoryItem) => void;
};

export function VaccinationHistory({ items, editingId, onEdit }: VaccinationHistoryProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white">
      <h2 className="text-base font-bold text-emerald-300 flex items-center gap-2">💉 ワクチン・予防歴</h2>
      <div className="mt-3 space-y-2.5">
        {items.length === 0 ? <p className="text-xs text-slate-400">登録済みのワクチン・予防歴はありません。</p> : null}
        {items.map((item) => {
          const status = getVaccinationDueStatus(item.nextDue);
          return (
            <div key={item.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3.5 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">{item.type}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
                    status === "overdue"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : status === "upcoming"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}>
                    {labelMap[status]}
                  </span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
                    >
                      {editingId === item.id ? "編集中" : "編集"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 space-y-0.5 text-slate-300">
                <p>接種日: <span className="font-semibold text-white">{item.date}</span></p>
                <p>次回予定: <span className="font-semibold text-white">{item.nextDue ?? "未設定"}</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
