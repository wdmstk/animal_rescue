"use client";

const securityItems = [
  {
    icon: "🔐",
    title: "通信はすべてTLS暗号化",
    desc: "ブラウザとサーバー間のすべての通信はTLS（HTTPS）で暗号化されています。データが第三者に傍受されることはありません。",
  },
  {
    icon: "🏠",
    title: "世帯単位のデータ分離（RLS）",
    desc: "Supabase の Row Level Security（RLS）により、他の世帯のデータには絶対にアクセスできない仕組みを実装しています。",
  },
  {
    icon: "🔑",
    title: "QRトークンは推測不可能なUUID",
    desc: "緊急公開URLはランダムに生成されたUUIDトークンを使用。URLを推測して他のペット情報にアクセスすることは不可能です。",
  },
  {
    icon: "💳",
    title: "カード情報は自社に届かない",
    desc: "クレジットカード情報はStripeが管理します。当社はカード番号・セキュリティコードを一切保持しません（PCI DSS準拠）。",
  },
  {
    icon: "🛡️",
    title: "ブルートフォース攻撃への対策",
    desc: "ログインAPIにはレート制限を実装。1分間に10回を超える試行は自動的にブロックされます。",
  },
  {
    icon: "📋",
    title: "変更履歴と監査ログ",
    desc: "誰がいつ何を変更したかを記録する監査ログを実装。データの正確性と透明性を担保します。",
  },
  {
    icon: "🔄",
    title: "定期的なセキュリティメンテナンス",
    desc: "依存ライブラリの脆弱性を週次で監視。秘密情報（APIキー等）は四半期ごとにローテーションします。",
  },
  {
    icon: "📦",
    title: "データのバックアップ体制",
    desc: "目標復旧時点（RPO）は1時間、目標復旧時間（RTO）は4時間。月次のリストア演習を実施しています。",
  },
];

export function LpSecurity() {
  return (
    <section id="security" className="py-24 lg:py-32 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            安全性・信頼性
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            大切な情報を、安全に守ります。
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            医療情報を扱うサービスとして、セキュリティは最高水準で設計されています。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {securityItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {[
            { label: "プライバシーポリシー", href: "/legal/privacy" },
            { label: "利用規約", href: "/legal/terms" },
            { label: "特定商取引法に基づく表記", href: "/legal/tokusho" },
            { label: "Cookieポリシー", href: "/legal/cookie" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
