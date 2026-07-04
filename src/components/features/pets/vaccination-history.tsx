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
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">ワクチン・予防歴</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const status = getVaccinationDueStatus(item.nextDue);
          return (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">{item.type}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
                    {labelMap[status]}
                  </span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 min-h-[44px] min-w-[44px]"
                    >
                      {editingId === item.id ? "編集中" : "編集"}
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-slate-600">接種日: {item.date}</p>
              <p className="text-slate-600">次回予定: {item.nextDue ?? "未設定"}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
