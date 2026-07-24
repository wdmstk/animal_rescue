import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">AniLink</h1>
          <div className="flex items-center gap-2">
            <Link href="/settings" className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-300">
              設定
            </Link>
            <Link href="/pets" className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              ペット一覧
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md p-4">{children}</main>
    </div>
  );
}
