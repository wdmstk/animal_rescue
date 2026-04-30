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
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">変更履歴（監査ログ）</h2>
      <p className="mt-1 text-xs text-slate-600">更新時刻と対象を新しい順に表示します。</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">変更履歴はまだありません。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <p className="font-semibold text-slate-800">{item.target}</p>
              <p className="text-xs text-slate-600">{formatChangedAt(item.changedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
