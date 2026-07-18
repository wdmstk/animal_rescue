import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminUser } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { RevokeQrButton } from "../revoke-qr-button";

const STATUS_COLORS: Record<string, string> = {
  INCOMPLETE: "bg-yellow-100 text-yellow-700",
  TRIALING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-orange-100 text-orange-700",
  CANCELED: "bg-slate-100 text-slate-600",
  UNPAID: "bg-red-100 text-red-700"
};

export default async function AdminUserDetailPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdminUser();
  const { userId } = await params;

  const [subscription, households, auditLogs] = await Promise.all([
    prisma.userSubscription.findUnique({ where: { userId } }),
    prisma.household.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { select: { userId: true, role: true } },
        pets: {
          include: {
            emergencyToken: { select: { isActive: true, token: true, rotatedAt: true } }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: { select: { pets: true, members: true } }
      }
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { action: true, entityType: true, createdAt: true, ipAddress: true }
    })
  ]);

  if (households.length === 0 && !subscription) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/users"
          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← 一覧に戻る
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">ユーザー詳細</h2>
      </div>

      <p className="mb-6 font-mono text-sm text-slate-400">userId: {userId}</p>

      {/* サブスクリプション情報 */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">サブスクリプション</h3>
        {subscription ? (
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-400">ステータス</dt>
              <dd className="mt-1">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[subscription.status] ?? "bg-slate-100"}`}
                >
                  {subscription.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Stripe 顧客 ID</dt>
              <dd className="mt-1 font-mono text-xs">{subscription.stripeCustomerId || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">トライアル終了</dt>
              <dd className="mt-1 text-xs">
                {subscription.trialEndsAt
                  ? new Date(subscription.trialEndsAt).toLocaleString("ja-JP")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">期間終了</dt>
              <dd className="mt-1 text-xs">
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleString("ja-JP")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">グレース期限</dt>
              <dd className="mt-1 text-xs">
                {subscription.graceUntil
                  ? new Date(subscription.graceUntil).toLocaleString("ja-JP")
                  : "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-400">サブスクリプション情報なし</p>
        )}
        <div className="mt-4">
          <Link
            href={`/admin/subscriptions?userId=${userId}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            サブスクリプション管理ページで変更 →
          </Link>
        </div>
      </section>

      {/* 世帯・ペット情報 */}
      {households.map((household) => (
        <section key={household.id} className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-900">
            世帯: {household.name}
            <span className="ml-2 text-xs font-normal text-slate-400">
              メンバー {household._count.members}人 / ペット {household._count.pets}頭
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2 pr-4 text-left font-semibold text-slate-500">ペット名</th>
                  <th className="py-2 pr-4 text-left font-semibold text-slate-500">種類</th>
                  <th className="py-2 pr-4 text-left font-semibold text-slate-500">QR トークン</th>
                  <th className="py-2 pr-4 text-left font-semibold text-slate-500">QR 状態</th>
                  <th className="py-2 text-left font-semibold text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {household.pets.map((pet) => (
                  <tr key={pet.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-semibold text-slate-800">{pet.name}</td>
                    <td className="py-2 pr-4 text-slate-500">{pet.species}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-slate-400">
                      {pet.emergencyToken?.token?.slice(0, 16) ?? "未発行"}…
                    </td>
                    <td className="py-2 pr-4">
                      {pet.emergencyToken ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            pet.emergencyToken.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {pet.emergencyToken.isActive ? "有効" : "無効"}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {pet.emergencyToken?.isActive && (
                        <RevokeQrButton petId={pet.id} petName={pet.name} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* 直近の操作ログ */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">直近の操作ログ（20件）</h3>
        <div className="space-y-1">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-slate-50 py-2 text-xs">
              <span className="font-mono text-slate-400">
                {new Date(log.createdAt).toLocaleString("ja-JP")}
              </span>
              <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                {log.action}
              </span>
              <span className="text-slate-500">{log.entityType}</span>
              <span className="ml-auto text-slate-300">{log.ipAddress}</span>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-sm text-slate-400">操作ログなし</p>
          )}
        </div>
      </section>
    </div>
  );
}
