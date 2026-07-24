import { LegalNav } from "@/components/legal-nav";

const items = [
  { label: "販売事業者名", value: "和田 将威（屋号：さけLab）" },
  { label: "運営統括責任者", value: "和田 将威" },
  { label: "サービス名称", value: "AniLink（ペット情報・救急管理SaaS）" },
  { label: "所在地", value: "※請求があった場合には遅滞なく電子メール等により開示いたします。" },
  { label: "連絡先", value: "メールアドレス: support@sakelab.jp\n※電話番号は請求があった場合に遅滞なく開示いたします。" },
  { label: "販売価格", value: "月額 680円（税込） / 年額 6,800円（税込）\n※初回登録から30日間は無料トライアル期間となります。" },
  { label: "商品代金以外の必要費用", value: "インターネット接続料金および通信費等の実費" },
  { label: "支払方法", value: "クレジットカード決済（Stripe）" },
  { label: "支払時期", value: "初回：30日間の無料トライアル終了時に初回の決済が行われます。\n継続：以降、1ヶ月または1年ごとの自動更新時に決済が行われます。" },
  { label: "役務提供時期", value: "クレジットカード決済完了後、即時ご利用いただけます。" },
  { label: "解約・キャンセル条件", value: "設定画面よりいつでも解約手続きが可能です。\n次回更新日の24時間前までに解約手続きを完了された場合、次回更新以降の請求は発生いたしません。" },
  { label: "返金条件", value: "デジタルコンテンツ・オンラインサービスの性質上、契約成立後の返金・換金には応じかねます。\nただし、当社の責に帰すべき不具合によりサービスが利用できない場合は個別に対応いたします。" },
  { label: "動作環境", value: "最新版の Google Chrome / Safari / Microsoft Edge / Firefox\niOS 16 以上 / Android 12 以上" },
];

export default function CommercialPage() {
  return (
    <div className="space-y-6">
      <LegalNav />

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-3">
            <span>⚖️</span>
            <span>AniLink 特定商取引法表記</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">特定商取引法に基づく表記</h1>
          <p className="text-xs text-slate-400 mt-2">最終更新日: 2026年7月24日</p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5 space-y-1.5 transition-colors hover:border-white/20"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {item.label}
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}