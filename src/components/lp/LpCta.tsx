"use client";

import Link from "next/link";

export function LpCta() {
  return (
    <section id="cta" className="relative py-24 lg:py-32 bg-[#0a0a0f] overflow-hidden">
      {/* Background glow */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-blue-600/20 to-violet-600/20 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            今すぐ始める
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            今日から、大切な子を
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              もっと安心して守れる
            </span>
            ように。
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            登録5分・クレジットカード不要・30日間無料。
            いざという日のために、今日から準備を始めましょう。
          </p>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            id="final-cta-primary"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white font-semibold text-base hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-blue-500/30 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            無料で登録する（30日間）
          </Link>
          <Link
            href="/login"
            id="final-cta-login"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl border border-white/20 text-white font-semibold text-base hover:bg-white/5 active:scale-95 transition-all w-full sm:w-auto"
          >
            ログイン
          </Link>
        </div>

        {/* Trust signals row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          {[
            { icon: "✓", text: "クレジットカード不要" },
            { icon: "✓", text: "30日間完全無料" },
            { icon: "✓", text: "いつでも解約可能" },
            { icon: "✓", text: "ペット頭数無制限" },
            { icon: "✓", text: "家族人数無制限" },
          ].map((t) => (
            <span key={t.text} className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{t.icon}</span>
              {t.text}
            </span>
          ))}
        </div>

        {/* Secondary message */}
        <div className="pt-8 border-t border-white/10 max-w-2xl mx-auto">
          <p className="text-sm text-gray-500 italic leading-relaxed">
            「あのとき、情報を伝えられていれば...」
            <br />
            という後悔をなくすために。<br />
            ペットと過ごす毎日をもっと安心できるものに。
          </p>
        </div>
      </div>
    </section>
  );
}
