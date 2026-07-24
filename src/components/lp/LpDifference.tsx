"use client";

const differences = [
  {
    icon: "🆘",
    title: "3タップで緊急QR表示",
    competitor: "緊急時専用機能なし",
    ours:
      "ペット一覧から2タップでQR表示。認証不要で獣医師がスキャンするだけで全情報確認可能。パニック状態でも使える設計。",
    highlight: true,
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "家族全員で管理",
    competitor: "個人ログイン・情報サイロ化",
    ours:
      "招待コードで家族を追加。OWNER/FAMILYの権限管理付きで、全員が最新情報を確認・更新できます。",
    highlight: false,
  },
  {
    icon: "🏥",
    title: "夜間救急病院まで登録可能",
    competitor: "かかりつけ病院のみ",
    ours:
      "かかりつけ病院＋夜間救急病院の両方を登録。緊急時に「電話番号がわからない」という事態を防ぎます。",
    highlight: false,
  },
  {
    icon: "🩸",
    title: "血液型・詳細医療情報",
    competitor: "基本情報のみ",
    ours:
      "血液型・第二緊急連絡先・保険情報まで登録可能。輸血が必要な緊急時にも対応できる詳細な情報管理。",
    highlight: false,
  },
  {
    icon: "📊",
    title: "30項目の検査値グラフ",
    competitor: "体重のみ・グラフなし",
    ours:
      "血液検査・尿検査・内分泌検査を含む30項目の時系列グラフ。慢性疾患の経過観察に不可欠な機能です。",
    highlight: false,
  },
  {
    icon: "📄",
    title: "医療書類OCR読取",
    competitor: "手入力のみ",
    ours:
      "診察書・処方箋を撮影するだけでテキスト抽出。入力の手間を大幅に削減します。",
    highlight: false,
  },
  {
    icon: "🐾",
    title: "ペット頭数・家族人数の制限なし",
    competitor: "頭数制限・別途料金",
    ours:
      "月額680円の定額で、何頭でも・何人でも利用可能。多頭飼いご家庭にも安心のシンプルな料金体系。",
    highlight: false,
  },
  {
    icon: "🇯🇵",
    title: "日本語・日本の医療基準",
    competitor: "海外サービスで日本語非対応",
    ours:
      "日本の獣医療に特化した設計。ワクチン種別も日本基準（狂犬病・混合等）で管理できます。",
    highlight: false,
  },
];

export function LpDifference() {
  return (
    <section id="difference" className="py-24 lg:py-32 bg-[#06060a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            他サービスとの違い
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            なぜ「AniLink」なのか
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            ペット手帳アプリとは根本的に違います。
            これは緊急時のために設計された「命を守る情報基盤」です。
          </p>
        </div>

        {/* Comparison table */}
        <div className="rounded-3xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_1fr] gap-0 bg-white/5 border-b border-white/10 px-6 py-4">
            <div className="w-12" />
            <div className="px-4 py-2 text-sm font-semibold text-gray-400">
              一般的なペット手帳アプリ
            </div>
            <div className="px-4 py-2 text-sm font-semibold text-blue-400">
              AniLink
            </div>
          </div>

          {/* Rows */}
          {differences.map((item, index) => (
            <div
              key={item.title}
              className={`grid grid-cols-[auto_1fr_1fr] gap-0 border-b border-white/5 last:border-0 px-6 py-5 transition-colors ${
                item.highlight ? "bg-blue-500/5" : ""
              } hover:bg-white/[0.02]`}
            >
              {/* Icon + title */}
              <div className="w-12 flex items-start pt-0.5">
                <span className="text-xl">{item.icon}</span>
              </div>

              {/* Competitor */}
              <div className="px-4 space-y-1">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-red-400">✕</span>
                  {item.competitor}
                </p>
              </div>

              {/* Ours */}
              <div className="px-4">
                <p className="text-sm text-gray-300 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                  {item.ours}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
