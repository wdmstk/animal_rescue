"use client";

const problems = [
  {
    icon: "😱",
    title: "深夜のパニック",
    desc: "夜中にペットが急変。かかりつけ病院の電話番号すら頭に浮かばない。受付で「持病は？」「今飲んでいる薬は？」と聞かれても、パニックで答えられない。",
    highlight: "正確な情報が伝えられず、治療が遅れる",
  },
  {
    icon: "📝",
    title: "情報がバラバラ",
    desc: "ワクチン証明書は押入れ、薬の袋は引き出し、診察カードは財布の中。いざというとき、どれも手元にない。",
    highlight: "必要なときに、必要な情報が出てこない",
  },
  {
    icon: "👨‍👩‍👧",
    title: "家族が知らない",
    desc: "ペットの管理は自分だけ。出張中に配偶者が病院へ連れていっても、持病も薬も何もわからない。毎回ゼロから説明しなければならない。",
    highlight: "家族で共有できていないから、いざというとき対応できない",
  },
];

const solution = {
  title: "「AniLink」が解決します",
  desc: "すべての医療情報を一箇所に。QRコード一枚で、誰でも・どこでも・すぐに必要な情報を届けられます。",
};

export function LpProblem() {
  return (
    <section id="problem" className="py-24 lg:py-32 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            課題
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            こんな経験、ありませんか？
          </h2>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {problems.map((item) => (
            <div
              key={item.title}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="space-y-4">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-sm font-medium text-red-400">
                    → {item.highlight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow / transition */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-white/5">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Solution callout */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-12 text-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5"
          />
          <div className="relative space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {solution.title}
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {solution.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
