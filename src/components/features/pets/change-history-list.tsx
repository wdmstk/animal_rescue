import { ChangeHistoryItem } from "@/lib/services/change-history";

type ChangeHistoryListProps = {
  items: ChangeHistoryItem[];
};

const formatChangedAt = (value: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));

export function ChangeHistoryList({ items }: ChangeHistoryListProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md text-white">
      <h2 className="text-base font-bold text-blue-300 flex items-center gap-2">📜 変更履歴（監査ログ）</h2>
      <p className="mt-0.5 text-xs text-slate-400">更新時刻と対象を新しい順に表示します。</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">変更履歴はまだありません。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3.5 py-2.5 text-xs">
              <p className="font-bold text-white text-sm">{item.target}</p>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">{formatChangedAt(item.changedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
