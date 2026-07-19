"use client";

import Link from "next/link";
import Image from "next/image";

export function LpHero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]"
    >
      {/* Gradient orbs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#1a56db]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#7c3aed]/15 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#0891b2]/10 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-300">
                30日間無料トライアル実施中
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
                その一枚が、
                <br />
                <span className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  大切な命を
                </span>
                <br />
                守る。
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl">
                ペットの緊急医療情報を一枚のQRコードに。
                夜間救急でも、パニックのときでも、
                <br className="hidden sm:block" />
                <strong className="text-white">3タップで</strong>
                必要なすべてを獣医師に届けます。
              </p>
            </div>

            {/* Value props */}
            <ul className="space-y-3">
              {[
                { icon: "🔐", text: "QRコード一枚で、認証不要の緊急共有" },
                { icon: "👨‍👩‍👧‍👦", text: "家族全員で情報を共有・更新" },
                { icon: "💊", text: "持病・アレルギー・投薬を一元管理" },
                { icon: "📊", text: "体重・検査値の推移をグラフで可視化" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-300 text-sm sm:text-base">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                id="hero-cta-primary"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white font-semibold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
              >
                無料で始める
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#features"
                id="hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-base hover:bg-white/5 active:scale-95 transition-all"
              >
                機能を見る
              </Link>
            </div>

            {/* Trust signals */}
            <p className="text-xs text-gray-500">
              クレジットカード不要 · 30日間無料 · いつでも解約可能
            </p>
          </div>

          {/* Right: App mockup */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-sm mx-auto">
              {/* Glow behind image */}
              <div
                aria-hidden="true"
                className="absolute inset-0 scale-110 bg-gradient-to-br from-blue-500/30 to-violet-500/30 blur-3xl rounded-3xl"
              />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/lp-hero-qr.jpg"
                  alt="ペットの緊急QRコードカードのモックアップ"
                  width={400}
                  height={533}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-xs">スクロール</span>
        <svg
          className="w-5 h-5 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
