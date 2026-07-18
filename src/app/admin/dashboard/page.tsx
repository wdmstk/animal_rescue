import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdminUser();

  const [subscriptions, households, recentSignups] = await Promise.all([
    prisma.userSubscription.findMany({
      select: { status: true, createdAt: true }
    }),
    prisma.household.count(),
    // 直近30日の日別新規登録数
    prisma.userSubscription.findMany({
      where: {
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const active = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialing = subscriptions.filter((s) => s.status === "TRIALING").length;
  const pastDue = subscriptions.filter((s) => s.status === "PAST_DUE").length;
  const unpaid = subscriptions.filter((s) => s.status === "UNPAID").length;
  const canceled = subscriptions.filter((s) => s.status === "CANCELED").length;

  const mrr = active * 680 + pastDue * 680;
  const arr = mrr * 12;

  const conversionRate =
    active + canceled > 0 ? ((active / (active + canceled)) * 100).toFixed(1) : "0.0";

  // 直近30日の日別登録数テーブル
  const dailyCounts: Record<string, number> = {};
  for (const signup of recentSignups) {
    const day = signup.createdAt.toISOString().slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
  }
  const now = new Date();
  const last30days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: dailyCounts[key] ?? 0 };
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">ダッシュボード</h2>
        <p className="mt-1 text-sm text-slate-500">サービスの主要指標</p>
      </div>

      {/* KPI カード */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="MRR" value={`¥${mrr.toLocaleString()}`} sub="月次定期収益" />
        <StatCard label="ARR" value={`¥${arr.toLocaleString()}`} sub="年次換算" />
        <StatCard label="アクティブ" value={active} sub="有料ユーザー数" />
        <StatCard label="トライアル中" value={trialing} sub="転換待ち" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="有料転換率" value={`${conversionRate}%`} sub="ACTIVE / (ACTIVE + CANCELED)" />
        <StatCard
          label="支払い問題"
          value={pastDue + unpaid}
          sub={`PAST_DUE: ${pastDue} / UNPAID: ${unpaid}`}
        />
        <StatCard label="解約済み" value={canceled} sub="CANCELED" />
        <StatCard label="総世帯数" value={households} sub="全ユーザー" />
      </div>

      {/* 直近30日の新規登録数 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">直近30日の新規登録数</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-2 pr-4 text-left font-semibold text-slate-500">日付</th>
                <th className="py-2 text-left font-semibold text-slate-500">新規登録</th>
                <th className="py-2 text-left font-semibold text-slate-500">バー</th>
              </tr>
            </thead>
            <tbody>
              {last30days
                .filter((d) => d.count > 0)
                .map((d) => (
                  <tr key={d.date} className="border-b border-slate-50">
                    <td className="py-1 pr-4 font-mono text-slate-600">{d.date}</td>
                    <td className="py-1 pr-4 font-bold text-slate-900">{d.count}</td>
                    <td className="py-1">
                      <div
                        className="h-4 rounded bg-blue-400"
                        style={{ width: `${Math.min(d.count * 24, 200)}px` }}
                      />
                    </td>
                  </tr>
                ))}
              {last30days.every((d) => d.count === 0) && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-400">
                    直近30日の新規登録データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ステータス分布 */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">サブスクリプション分布</h3>
        <div className="space-y-2">
          {(
            [
              { label: "ACTIVE", count: active, color: "bg-green-400" },
              { label: "TRIALING", count: trialing, color: "bg-blue-400" },
              { label: "PAST_DUE", count: pastDue, color: "bg-yellow-400" },
              { label: "CANCELED", count: canceled, color: "bg-slate-300" },
              { label: "UNPAID", count: unpaid, color: "bg-red-400" }
            ] as const
          ).map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-28 text-xs font-mono text-slate-500">{label}</span>
              <div className="flex-1 rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${color} transition-all`}
                  style={{
                    width:
                      subscriptions.length > 0
                        ? `${(count / subscriptions.length) * 100}%`
                        : "0%"
                  }}
                />
              </div>
              <span className="w-8 text-right text-sm font-bold text-slate-700">{count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
