import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/lp" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white text-base">🐾</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold tracking-tight text-base group-hover:text-blue-400 transition-colors">
                AniLink
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-medium">
                法的情報ポータル
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/lp"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <span>← LPへ戻る</span>
            </Link>
            <Link
              href="/pets"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-xs font-semibold text-white hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
            >
              アプリを開く
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#06060a] py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>© 2026 AniLink. All rights reserved.</p>
          <p>さけLab（運営責任者: 和田 将威）</p>
        </div>
      </footer>
    </div>
  );
}
