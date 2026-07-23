import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, string> = {
  EMERGENCY_INFO_UPDATE: "bg-orange-500/20 border border-orange-500/30 text-orange-300",
  PET_CREATE: "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300",
  PET_DELETE: "bg-red-500/20 border border-red-500/30 text-red-300",
  ACCOUNT_DELETE: "bg-red-500/20 border border-red-500/30 text-red-300",
  ADMIN_SUBSCRIPTION_CHANGE: "bg-purple-500/20 border border-purple-500/30 text-purple-300",
  ADMIN_QR_REVOKE: "bg-red-500/20 border border-red-500/30 text-red-300",
  ADMIN_ANNOUNCEMENT_CREATE: "bg-blue-500/20 border border-blue-500/30 text-blue-300"
};

export default async function AuditLogsPage({
  searchParams
}: {
  searchParams: Promise<{
    action?: string;
    userId?: string;
    from?: string;
    to?: string;
    cursor?: string;
  }>;
}) {
  await requireAdminUser();

  const { action, userId, from, to, cursor } = await searchParams;

  const where = {
    ...(action ? { action } : {}),
    ...(userId ? { userId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + "T23:59:59Z") } : {})
          }
        }
      : {}),
    ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {})
  };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1
  });

  const hasMore = logs.length > PAGE_SIZE;
  const displayLogs = hasMore ? logs.slice(0, PAGE_SIZE) : logs;
  const nextCursor = hasMore
    ? displayLogs[displayLogs.length - 1]?.createdAt.toISOString()
    : null;

  // 直近24時間の件数（フィルターなしで取得）
  const yesterday = new Date(new Date().setHours(new Date().getHours() - 24));
  const last24hCount = await prisma.auditLog.count({
    where: { createdAt: { gte: yesterday } }
  });


  // action 種類一覧
  const actionTypes = await prisma.auditLog.findMany({
    select: { action: true },
    distinct: ["action"],
    orderBy: { action: "asc" }
  });

  const buildQueryString = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { action, userId, from, to, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params.toString() ? `?${params.toString()}` : "";
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">📋 監査ログ</h2>
        <p className="mt-1 text-sm text-slate-400">
          過去24時間の記録: <span className="font-bold text-teal-300">{last24hCount}</span> 件
        </p>
      </div>

      {/* フィルターフォーム */}
      <form method="GET" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs font-semibold text-slate-300">アクション</label>
          <select
            name="action"
            defaultValue={action ?? ""}
            className="mt-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
          >
            <option value="">すべて</option>
            {actionTypes.map((a) => (
              <option key={a.action} value={a.action}>
                {a.action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300">ユーザーID（前方一致）</label>
          <input
            type="text"
            name="userId"
            defaultValue={userId ?? ""}
            placeholder="uuid..."
            className="mt-1 w-56 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300">日付（FROM）</label>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="mt-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300">日付（TO）</label>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="mt-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-teal-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-teal-500"
        >
          検索
        </button>
        <Link
          href="/admin/audit-logs"
          className="rounded-xl border border-white/10 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
        >
          リセット
        </Link>
      </form>

      {/* ログテーブル */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-4 py-3 text-left font-semibold">日時</th>
                <th className="px-4 py-3 text-left font-semibold">ユーザーID</th>
                <th className="px-4 py-3 text-left font-semibold">アクション</th>
                <th className="px-4 py-3 text-left font-semibold">エンティティ</th>
                <th className="px-4 py-3 text-left font-semibold">エンティティID</th>
                <th className="px-4 py-3 text-left font-semibold">変更内容</th>
                <th className="px-4 py-3 text-left font-semibold">IP</th>
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-slate-800/40">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-400">
                    {new Date(log.createdAt).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    <Link
                      href={`/admin/users/${log.userId}`}
                      className="text-teal-300 hover:underline"
                    >
                      {log.userId.slice(0, 10)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-slate-800 text-slate-400"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{log.entityType}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {log.entityId.slice(0, 10)}…
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {log.changes ? (
                      <details className="cursor-pointer">
                        <summary className="text-teal-400 font-semibold hover:underline">表示</summary>
                        <pre className="mt-1 max-w-xs overflow-x-auto rounded-xl border border-white/10 bg-slate-950 p-2 text-xs text-slate-300">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {log.ipAddress ?? "—"}
                  </td>
                </tr>
              ))}
              {displayLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    該当するログがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {nextCursor && (
          <div className="border-t border-slate-100 px-4 py-3">
            <Link
              href={`/admin/audit-logs${buildQueryString({ cursor: nextCursor })}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              次の {PAGE_SIZE} 件 →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}