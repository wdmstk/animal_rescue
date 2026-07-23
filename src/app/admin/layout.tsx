import Link from "next/link";
import { requireAdminUser } from "@/lib/admin/require-admin";

const navItems = [
  { href: "/admin/dashboard", label: "📊 ダッシュボード" },
  { href: "/admin/users", label: "👤 ユーザー管理" },
  { href: "/admin/subscriptions", label: "💳 サブスクリプション" },
  { href: "/admin/announcements", label: "📢 お知らせ管理" },
  { href: "/admin/tickets", label: "🎫 問い合わせ管理" },
  { href: "/admin/audit-logs", label: "📋 監査ログ" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen w-60 shrink-0 border-r border-white/10 bg-slate-900/90 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 px-5 py-5 bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
              <span className="inline-flex rounded-full bg-blue-500/20 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 tracking-wider">
                ADMIN CONSOLE
              </span>
              <h1 className="mt-2 text-base font-bold text-white">動物救急手帳 管理</h1>
            </div>
            <nav className="p-3">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="border-t border-white/10 p-4">
            <Link
              href="/pets"
              className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-950/40 px-3 py-2 text-xs font-bold text-teal-300 hover:bg-teal-900/50 transition-colors"
            >
              ← ユーザー画面へ戻る
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
