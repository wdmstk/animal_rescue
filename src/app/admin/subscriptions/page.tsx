import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import {
  SubscriptionStatusBadge,
  StatusChangeSelect,
  ExtendTrialButton
} from "./subscription-actions";

type SubscriptionStatus =
  | "INCOMPLETE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID";

export default async function AdminSubscriptionsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminUser();

  const { status: filterStatus } = await searchParams;

  const subscriptions = await prisma.userSubscription.findMany({
    where: filterStatus ? { status: filterStatus as SubscriptionStatus } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200
  });

  const statusCounts = await prisma.userSubscription.groupBy({
    by: ["status"],
    _count: { status: true }
  });
  const countMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.status]));

  const filterStatuses: SubscriptionStatus[] = [
    "ACTIVE",
    "TRIALING",
    "PAST_DUE",
    "UNPAID",
    "CANCELED",
    "INCOMPLETE"
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">💳 サブスクリプション管理</h2>
        <p className="mt-1 text-sm text-slate-400">
          ステータスの手動変更・トライアル延長ができます
        </p>
      </div>

      {/* フィルタータブ */}
      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href="/admin/subscriptions"
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            !filterStatus
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          すべて ({subscriptions.length})
        </a>
        {filterStatuses.map((s) => (
          <a
            key={s}
            href={`/admin/subscriptions?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterStatus === s
                ? "bg-teal-600 text-white shadow-md"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {s} ({countMap[s] ?? 0})
          </a>
        ))}
      </div>

      {/* テーブル */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-4 py-3 text-left font-semibold">ユーザーID</th>
                <th className="px-4 py-3 text-left font-semibold">現在のステータス</th>
                <th className="px-4 py-3 text-left font-semibold">ステータス変更</th>
                <th className="px-4 py-3 text-left font-semibold">トライアル延長</th>
                <th className="px-4 py-3 text-left font-semibold">トライアル終了</th>
                <th className="px-4 py-3 text-left font-semibold">グレース期限</th>
                <th className="px-4 py-3 text-left font-semibold">期間終了</th>
                <th className="px-4 py-3 text-left font-semibold">登録日</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {sub.userId.slice(0, 12)}…
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionStatusBadge status={sub.status as SubscriptionStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusChangeSelect
                      userId={sub.userId}
                      currentStatus={sub.status as SubscriptionStatus}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ExtendTrialButton userId={sub.userId} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {sub.trialEndsAt
                      ? new Date(sub.trialEndsAt).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {sub.graceUntil
                      ? new Date(sub.graceUntil).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(sub.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    該当するサブスクリプションがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-xs text-slate-400">
        ⚠️ ステータス変更は DB のみに反映されます。Stripe 側の変更は Stripe Dashboard から行ってください。
      </p>
    </div>
  );
}
