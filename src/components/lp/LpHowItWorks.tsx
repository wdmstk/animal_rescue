"use client";

const steps = [
  {
    id: 1,
    phase: "登録フェーズ",
    title: "アカウントを作成する",
    desc: "メールアドレスとパスワードで30秒で登録完了。クレジットカード不要で30日間の無料トライアルが始まります。",
    detail: "登録後、世帯が自動作成されます。",
    icon: "📧",
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  },
  {
    id: 2,
    phase: "セットアップフェーズ",
    title: "ペットの情報を入力する",
    desc: "名前・種類・品種・誕生日・体重などの基本情報を入力。次に緊急情報（持病・アレルギー・薬・病院・連絡先）を登録します。",
    detail: "最初の設定は約5分。あとはいつでも追記・修正できます。",
    icon: "🐾",
    color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
  },
  {
    id: 3,
    phase: "共有フェーズ",
    title: "家族を招待する",
    desc: "招待コードを発行し、家族のスマートフォンから参加してもらいます。全員がリアルタイムで情報を確認・更新できます。",
    detail: "家族人数の制限なし。無制限で招待できます。",
    icon: "👨‍👩‍👧‍👦",
    color: "from-violet-500/20 to-violet-600/20 border-violet-500/30",
  },
  {
    id: 4,
    phase: "日常フェーズ",
    title: "日々の健康記録を積み重ねる",
    desc: "体重・ワクチン・受診記録・投薬を記録していくことで、ペットの健康が見える化されます。",
    detail: "投薬リマインダーで飲み忘れも防止。",
    icon: "📊",
    color: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
  },
  {
    id: 5,
    phase: "緊急フェーズ",
    title: "いざというときQRを見せる",
    desc: "ペット一覧画面の「🚨緊急QR」ボタンをタップするだけでQRコードが全画面表示。病院スタッフがスキャンするだけで、持病・アレルギー・薬・緊急連絡先が即座に届きます。",
    detail: "認証不要。どんなスマートフォンでも2秒以内に表示。",
    icon: "🆘",
    color: "from-red-500/20 to-red-600/20 border-red-500/30",
    isHighlight: true,
  },
];

export function LpHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            利用イメージ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            登録5分、いざというとき3タップ
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            難しい設定は一切不要。シンプルなフローで始められます。
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-[calc(50%-1px)] top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500/0 via-blue-500/30 to-blue-500/0"
          />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-12 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content (half width on desktop) */}
                <div className="flex-1 space-y-1">
                  {index % 2 === 0 ? (
                    <div className="lg:text-right space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        {step.phase}
                      </span>
                      <h3
                        className={`text-xl font-semibold ${
                          step.isHighlight ? "text-red-300" : "text-white"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                      <p className="text-xs text-gray-600">{step.detail}</p>
                    </div>
                  ) : (
                    <div className="lg:ml-0 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        {step.phase}
                      </span>
                      <h3
                        className={`text-xl font-semibold ${
                          step.isHighlight ? "text-red-300" : "text-white"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                      <p className="text-xs text-gray-600">{step.detail}</p>
                    </div>
                  )}
                </div>

                {/* Center icon */}
                <div className="flex-shrink-0 relative z-10">
                  <div
                    className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br border ${step.color} shadow-lg`}
                  >
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 border border-white/20 text-xs font-bold text-gray-300">
                    {step.id}
                  </div>
                </div>

                {/* Spacer for layout balance */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency scenario callout */}
        <div className="mt-20 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-600/5 p-8 lg:p-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-xl font-bold text-red-300 flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              深夜の緊急シナリオ
            </h3>
            <div className="space-y-3 font-mono text-sm">
              {[
                { t: "23:00", action: "ペットが突然ぐったりし、夜間救急病院へ向かう", highlight: false },
                { t: "23:30", action: "受付で「持病はありますか？今の薬は？」と聞かれる", highlight: false },
                { t: "23:31", action: "アプリを起動 → ペット一覧 → 「🚨緊急QR」タップ（3タップ）", highlight: true },
                { t: "23:31:15", action: "QRコードを病院スタッフに見せる", highlight: true },
                { t: "23:31:20", action: "スタッフがスキャン → 持病・アレルギー・投薬情報が瞬時に表示", highlight: true },
                { t: "23:32", action: "正確な情報をもとに、スムーズに治療が始まる", highlight: false },
              ].map((row) => (
                <div
                  key={row.t}
                  className={`flex gap-4 rounded-lg p-3 ${
                    row.highlight
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-white/[0.02]"
                  }`}
                >
                  <span className="text-gray-500 flex-shrink-0 w-20">
                    {row.t}
                  </span>
                  <span
                    className={
                      row.highlight ? "text-red-200" : "text-gray-400"
                    }
                  >
                    {row.action}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 italic">
              ※ 緊急時でも、アプリ起動から情報提供まで約75秒が目標です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
