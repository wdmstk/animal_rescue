"use client";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    title: "家族共有",
    desc: "招待コードで家族を追加し、全員がリアルタイムで最新情報を確認・更新できます。出張中・外出中でも安心。",
    benefit: "誰かが不在でも、家族全員が対応できる安心感",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
    title: "緊急情報 & QR公開",
    desc: "持病・アレルギー・服薬中の薬・かかりつけ病院・緊急連絡先をQRコードに集約。スキャンするだけで情報が届きます。",
    benefit: "パニック状態でも3タップでQR表示。伝え忘れゼロへ",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
    title: "投薬管理 & リマインダー",
    desc: "薬の名称・用量・頻度・期間を登録し、定期リマインダーを受け取れます。飲ませたかどうかの記録管理も可能。",
    benefit: "投薬ミスを防ぎ、慢性疾患のペットの日常管理を支援",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-400",
    title: "健康トラッキング",
    desc: "体重・体温などのコアメトリクスに加え、血液検査・尿検査・内分泌検査を含む30項目の検査値を時系列グラフで記録。",
    benefit: "数値の変化をグラフで見える化。通院前の準備が整う",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    color: "from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400",
    title: "医療記録タイムライン",
    desc: "診察・手術・検査などの医療記録を写真付きで登録。OCR機能で書類をスキャンしてテキスト抽出できます。",
    benefit: "複数病院の記録を一箇所に集約。どこでもすぐに参照できる",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "from-sky-500/20 to-sky-600/20 border-sky-500/30 text-sky-400",
    title: "ワクチン管理",
    desc: "狂犬病・混合ワクチン等の接種履歴と次回接種予定日を管理。種類・日付・次回日をひとつひとつ正確に記録。",
    benefit: "接種忘れを防ぎ、大切な家族の健康を確実に守る",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-400",
    title: "PDF出力 & データ共有",
    desc: "医療情報を通院提出用のPDFとして出力。QRコードリンクをLINEで共有すれば、ペットホテルやトリマーにも情報提供が可能。",
    benefit: "通院のたびに説明する手間が省け、預かりもスムーズに",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: "from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400",
    title: "変更履歴 & 監査ログ",
    desc: "誰がいつ何を変更したかを時系列で記録。家族間の情報更新履歴を透明に保ちます。",
    benefit: "情報の正確性を保ち、家族全員が安心して使える",
  },
];

export function LpFeatures() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            機能
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            ペットケアに必要なすべてが、ここに。
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            日常の記録から緊急時の情報共有まで、
            一つのアプリで完結します。
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="space-y-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br border ${f.color}`}
                >
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs font-medium text-blue-300">
                    ✓ {f.benefit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
