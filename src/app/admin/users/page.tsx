import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  INCOMPLETE: "bg-amber-500/20 border border-amber-500/30 text-amber-300",
  TRIALING: "bg-blue-500/20 border border-blue-500/30 text-blue-300",
  ACTIVE: "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300",
  PAST_DUE: "bg-orange-500/20 border border-orange-500/30 text-orange-300",
  CANCELED: "bg-slate-800 text-slate-400",
  UNPAID: "bg-red-500/20 border border-red-500/30 text-red-300"
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; q?: string; cursor?: string }>;
}) {
  await requireAdminUser();

  const { status: filterStatus, q: searchQuery, cursor } = await searchParams;

  const PAGE_SIZE = 50;

  const where = {
    ...(filterStatus ? { userSubscription: { status: filterStatus } } : {}),
    ...(searchQuery
      ? {
          id: { contains: searchQuery }
        }
      : {})
  };

  // HouseholdMember から userId 一覧を取得（重複排除）
  const members = await prisma.householdMember.findMany({
    where: cursor ? { createdAt: { lt: new Date(cursor) } } : undefined,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    select: {
      userId: true,
      role: true,
      createdAt: true,
      household: {
        select: {
          id: true,
          name: true,
          _count: { select: { pets: true } }
        }
      }
    }
  });

  const hasMore = members.length > PAGE_SIZE;
  const displayMembers = hasMore ? members.slice(0, PAGE_SIZE) : members;
  const nextCursor = hasMore
    ? displayMembers[displayMembers.length - 1]?.createdAt.toISOString()
    : null;

  // サブスクリプション情報を別途取得
  const userIds = [...new Set(displayMembers.map((m) => m.userId))];
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: { in: userIds },
      ...(filterStatus ? { status: filterStatus as SubscriptionStatus } : {})
    },
    select: { userId: true, status: true, trialEndsAt: true, currentPeriodEnd: true }
  });
  const subMap = Object.fromEntries(subscriptions.map((s) => [s.userId, s]));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">👤 ユーザー管理</h2>
        <p className="mt-1 text-sm text-slate-400">世帯メンバーの一覧およびサブスクリプション状態</p>
      </div>

      {/* フィルター */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["", "ACTIVE", "TRIALING", "PAST_DUE", "UNPAID", "CANCELED"].map((s) => (
          <a
            key={s || "all"}
            href={`/admin/users${s ? `?status=${s}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterStatus === s || (!filterStatus && !s)
                ? "bg-teal-600 text-white shadow-md"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {s || "すべて"}
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
                <th className="px-4 py-3 text-left font-semibold">ロール</th>
                <th className="px-4 py-3 text-left font-semibold">世帯名</th>
                <th className="px-4 py-3 text-left font-semibold">ペット数</th>
                <th className="px-4 py-3 text-left font-semibold">サブスク状態</th>
                <th className="px-4 py-3 text-left font-semibold">トライアル終了</th>
                <th className="px-4 py-3 text-left font-semibold">登録日</th>
                <th className="px-4 py-3 text-left font-semibold">詳細</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.map((member) => {
                const sub = subMap[member.userId];
                return (
                  <tr key={`${member.userId}-${member.household.id}`} className="border-b border-white/5 hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {member.userId.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          member.role === "OWNER"
                            ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{member.household.name}</td>
                    <td className="px-4 py-3 text-slate-300">{member.household._count.pets}匹</td>
                    <td className="px-4 py-3">
                      {sub ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[sub.status] ?? "bg-slate-800 text-slate-400"}`}
                        >
                          {sub.status}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {sub?.trialEndsAt
                        ? new Date(sub.trialEndsAt).toLocaleDateString("ja-JP")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(member.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${member.userId}`}
                        className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {displayMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    ユーザーがいません
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
              href={`/admin/users?${filterStatus ? `status=${filterStatus}&` : ""}cursor=${nextCursor}`}
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
