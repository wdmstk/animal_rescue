import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, string> = {
  EMERGENCY_INFO_UPDATE: "bg-orange-100 text-orange-700",
  PET_CREATE: "bg-green-100 text-green-700",
  PET_DELETE: "bg-red-100 text-red-700",
  ACCOUNT_DELETE: "bg-red-100 text-red-700",
  ADMIN_SUBSCRIPTION_CHANGE: "bg-purple-100 text-purple-700",
  ADMIN_QR_REVOKE: "bg-red-100 text-red-700",
  ADMIN_ANNOUNCEMENT_CREATE: "bg-blue-100 text-blue-700"
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
        <h2 className="text-2xl font-bold text-slate-900">監査ログ</h2>
        <p className="mt-1 text-sm text-slate-500">
          過去24時間: {last24hCount} 件
        </p>
      </div>

      {/* フィルターフォーム */}
      <form method="GET" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-500">アクション</label>
          <select
            name="action"
            defaultValue={action ?? ""}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <label className="block text-xs font-semibold text-slate-500">ユーザーID（前方一致）</label>
          <input
            type="text"
            name="userId"
            defaultValue={userId ?? ""}
            placeholder="uuid..."
            className="mt-1 w-56 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">日付（FROM）</label>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">日付（TO）</label>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          絞り込む
        </button>
        <Link
          href="/admin/audit-logs"
          className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          リセット
        </Link>
      </form>

      {/* ログテーブル */}
      <section className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">日時</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">ユーザーID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">アクション</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">エンティティ</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">エンティティID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">変更内容</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">IP</th>
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    <Link
                      href={`/admin/users/${log.userId}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {log.userId.slice(0, 10)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.entityType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {log.entityId.slice(0, 10)}…
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {log.changes ? (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-500">表示</summary>
                        <pre className="mt-1 max-w-xs overflow-x-auto rounded bg-slate-50 p-2 text-xs">
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