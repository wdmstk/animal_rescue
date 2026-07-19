"use client";

import { useState } from "react";

const faqs = [
  {
    q: "無料トライアルにクレジットカードは必要ですか？",
    a: "必要ありません。メールアドレスとパスワードだけで登録でき、30日間すべての機能を無料でお使いいただけます。30日後に課金に移行する場合に初めてカード情報の入力が必要になります。",
  },
  {
    q: "月額680円で何頭まで登録できますか？",
    a: "頭数に制限はありません。犬3匹・猫2匹など何頭でも月額680円（税別）の定額でご利用いただけます。多頭飼いのご家庭にも安心してお使いいただける料金設計です。",
  },
  {
    q: "家族は何人まで招待できますか？",
    a: "人数の制限はありません。招待コードを発行し、家族全員に参加してもらえます。配偶者・子供・高齢の親御さんなど、ペットに関わるすべての家族と情報を共有できます。",
  },
  {
    q: "QRコードを他の人が見ると情報が漏れませんか？",
    a: "QRコードのURLはランダムに生成された推測不可能なUUIDトークンです。URLを知っている人だけがアクセスできます。また、QRコードを再生成すると旧URLは即座に無効化されるため、必要に応じていつでも更新できます。",
  },
  {
    q: "QRコードに表示される情報は何ですか？",
    a: "緊急時に医療従事者が必要とする最小限の情報のみ表示されます。具体的には、ペットの基本情報（名前・種類・年齢・体重・血液型）、持病・アレルギー・服薬中の薬、かかりつけ病院・夜間救急病院、緊急連絡先（2件まで）です。",
  },
  {
    q: "インターネット接続がない場所でも使えますか？",
    a: "Service Workerによるオフラインキャッシュを実装しており、一度アクセスした緊急情報は電波の届かない場所でも表示できます。ただし、情報の更新はオンライン時に限られます。",
  },
  {
    q: "犬・猫以外のペットも登録できますか？",
    a: "はい。種類はフリーテキストで入力できますので、うさぎ・ハムスター・鳥など、あらゆる動物を登録していただけます。",
  },
  {
    q: "医療記録のOCR機能はどう使いますか？",
    a: "診察書や処方箋を写真撮影すると、テキストが自動的に読み取られ入力フォームに転記されます。確認・修正後に保存するだけで、書類のデジタル化が完了します。",
  },
  {
    q: "退会（アカウント削除）はできますか？",
    a: "はい。設定画面からいつでもアカウントを削除できます。削除するとペット情報・医療記録・ご家族のアカウント情報がすべて完全に消去されます。また、Stripeのサブスクリプションも同時にキャンセルされます。",
  },
  {
    q: "解約した後にデータを取り出せますか？",
    a: "解約（サブスクリプションのキャンセル）後も、課金が切れるまではデータにアクセスできます。CSV出力機能でデータをダウンロードしてからご解約いただくことをお勧めします。アカウント削除後はデータの復元はできません。",
  },
  {
    q: "動物病院のスタッフは特別なアプリが必要ですか？",
    a: "必要ありません。一般的なスマートフォンのカメラでQRコードをスキャンするだけで、Webブラウザで情報を確認できます。アカウント登録や専用アプリのインストールは一切不要です。",
  },
  {
    q: "投薬リマインダーはどのように受け取れますか？",
    a: "メール通知による定期送信ジョブとして実装されています。投薬登録時に設定した頻度（毎日・週次など）に応じてリマインダーが届きます。",
  },
  {
    q: "複数の動物病院の記録を管理できますか？",
    a: "はい。かかりつけ病院・夜間救急病院をそれぞれ登録できます。また、医療記録タイムラインは診察先・日付・種別を含めて複数病院の記録を一箇所で管理できます。",
  },
  {
    q: "将来的に動物病院と連携できますか？",
    a: "Phase 3（2027年以降）での動物病院連携APIの提供を計画しています。現時点では設計が完了しており、病院側の準備が整い次第、病院システムとの連携が可能になる予定です。",
  },
  {
    q: "個人情報保護法への対応はされていますか？",
    a: "はい。収集する情報・利用目的・第三者提供に関するプライバシーポリシーを整備しています。データの削除・開示請求にも対応しています。詳細はプライバシーポリシーページをご確認ください。",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        id={`faq-${q.slice(0, 20).replace(/\s/g, "-")}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-medium text-white">
          {q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export function LpFaq() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#06060a]">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            よくある質問
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            気になること、答えます。
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 sm:px-8">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          他にご不明な点がございましたら、
          <a
            href="/support"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            サポートページ
          </a>
          からお問い合わせください。
        </p>
      </div>
    </section>
  );
}
