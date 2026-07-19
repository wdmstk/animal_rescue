import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";

export default async function SupportPage() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof Response) {
    redirect("/login");
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: auth.userId },
    orderBy: { updatedAt: "desc" }
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "BUG":
        return "不具合";
      case "FEATURE":
        return "要望";
      case "BILLING":
        return "料金・課金";
      default:
        return "その他";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">返信待ち</span>;
      case "IN_PROGRESS":
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">対応中</span>;
      case "RESOLVED":
        return <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">解決済</span>;
      case "CLOSED":
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">対応終了</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/settings" className="text-xs text-slate-500 hover:underline">
            ← 設定に戻る
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">お問い合わせ</h1>
        </div>
        <Link
          href="/support/new"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          新規作成
        </Link>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500">作成されたお問い合わせはありません。</p>
            <Link
              href="/support/new"
              className="mt-3 inline-block rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              新しい問い合わせを作成する
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{getCategoryLabel(ticket.category)}</span>
                {getStatusBadge(ticket.status)}
              </div>
              <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">{ticket.title}</h2>
              <p className="mt-2 text-right text-xs text-slate-400">
                更新日: {new Date(ticket.updatedAt).toLocaleDateString("ja-JP")}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
