import Link from "next/link";
import { requireAdminUser } from "@/lib/admin/require-admin";

const navItems = [
  { href: "/admin/dashboard", label: "📊 ダッシュボード" },
  { href: "/admin/users", label: "👤 ユーザー管理" },
  { href: "/admin/subscriptions", label: "💳 サブスクリプション" },
  { href: "/admin/announcements", label: "📢 お知らせ管理" },
  { href: "/admin/audit-logs", label: "📋 監査ログ" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen w-56 shrink-0 border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin</p>
            <h1 className="mt-1 text-base font-bold text-slate-900">動物救急手帳</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="absolute bottom-0 w-full border-t border-slate-200 px-4 py-4">
            <Link
              href="/"
              className="flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              ← アプリに戻る
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
