import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <h1 className="text-base font-bold text-slate-900">動物の救急手帳</h1>
          <Link href="/pets" className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            ペット一覧
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md p-4">{children}</main>
    </div>
  );
}
