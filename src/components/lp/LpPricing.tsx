"use client";

import Link from "next/link";

export function LpPricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-[#06060a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            料金プラン
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            シンプルな料金体系
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            何頭でも・何人でも。月額680円（税別）の定額制。
            まずは30日間、無料でお試しください。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free trial */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                無料トライアル
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">¥0</span>
                <span className="text-gray-400">/ 30日間</span>
              </div>
              <p className="text-sm text-gray-500">クレジットカード不要</p>
            </div>

            <ul className="space-y-3">
              {[
                "ペット登録（頭数無制限）",
                "緊急情報入力 & QR生成",
                "家族共有（人数無制限）",
                "投薬・ワクチン・健康記録",
                "医療タイムライン",
                "PDF出力",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              id="pricing-free-cta"
              className="block w-full py-3 px-6 rounded-xl border border-white/20 text-center text-white font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              無料で始める
            </Link>
          </div>

          {/* Paid plan */}
          <div className="relative rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-8 space-y-8">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-semibold">
                30日後に移行
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-300 uppercase tracking-wide">
                スタンダードプラン
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">¥680</span>
                <span className="text-gray-400">/ 月（税別）</span>
              </div>
              <p className="text-sm text-gray-500">世帯単位・家族全員で使えます</p>
            </div>

            <ul className="space-y-3">
              {[
                "無料トライアルの全機能",
                "ペット頭数・家族人数 無制限",
                "緊急QR（ローテーション・無効化）",
                "血液型・夜間救急病院登録",
                "第二緊急連絡先",
                "投薬リマインダー（定期送信）",
                "検査値グラフ（30項目）",
                "医療書類OCR読取",
                "変更履歴（監査ログ）",
                "Stripe顧客ポータル（解約はいつでも）",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-200">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              id="pricing-paid-cta"
              className="block w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-center text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
            >
              30日間無料で試す
            </Link>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-gray-500">
            ※ 年払いプランは Coming Soon
          </p>
          <p className="text-sm text-gray-500">
            ※ 解約はStripe顧客ポータルまたは設定画面からいつでも可能です
          </p>
          <p className="text-sm text-gray-500">
            ※ 将来的に動物病院・ペットホテル向けプランを検討中
          </p>
        </div>
      </div>
    </section>
  );
}
