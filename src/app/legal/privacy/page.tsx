import { LegalNav } from "@/components/legal-nav";

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <LegalNav />

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-3">
            <span>🔒</span>
            <span>AniLink 情報保護規程</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">プライバシーポリシー</h1>
          <p className="text-xs text-slate-400 mt-2">最終更新日: 2026年7月24日</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第1条 個人情報の取扱い</h2>
            <p className="text-slate-300">
              さけLab（以下「当社」）は、提供するペット情報・救急管理プラットフォーム「AniLink」（以下「本サービス」）において、個人情報保護法その他の関連法令を遵守し、適切に個人情報を取り扱います。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第2条 収集する個人情報</h2>
            <p className="text-slate-300">
              当社が本サービスで収集する情報は以下の通りです。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>メールアドレス</li>
              <li>表示名（氏名・アカウント名）</li>
              <li>緊急連絡先名・電話番号</li>
              <li>飼い主住所情報</li>
              <li>ペットの医療・健康情報（個人情報に準じて保護管理します）</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第3条 利用目的</h2>
            <p className="text-slate-300">
              収集した個人情報は以下の目的で使用します。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>AniLink のサービス提供（ペット管理・緊急情報共有機能）</li>
              <li>本人確認・認証処理</li>
              <li>課金・決済処理（Stripe等との連係）</li>
              <li>サービス改善・統計分析</li>
              <li>障害調査・セキュリティ対応</li>
              <li>お問い合わせ・サポート対応</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第4条 第三者提供</h2>
            <p className="text-slate-300">
              当社は、法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供しません。
              ただし、業務委託先（Supabase、Stripe等）との間で必要な範囲で情報を共有することがあります。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第5条 越境移転</h2>
            <p className="text-slate-300">
              当社が利用するクラウドサーバーは海外に設置される場合があります。
              個人情報が海外に移転される場合、適切な保護措置を講じます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第6条 本人の権利</h2>
            <p className="text-slate-300">
              ユーザーは、自身の個人情報について以下の権利を有します。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>開示請求権</li>
              <li>訂正・追加・削除請求権</li>
              <li>利用停止請求権</li>
              <li>第三者提供の停止請求権</li>
            </ul>
            <p className="text-slate-300">
              これらの請求は、設定画面またはサポートフォーム（/support）にて行うことができます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第7条 データの削除</h2>
            <p className="text-slate-300">
              ユーザーがアカウントを削除した場合、当社は原則として30日以内に該当する個人情報を削除します。
              ただし、法令に基づく保存期間が定められている場合は、その期間保存します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第8条 セキュリティ</h2>
            <p className="text-slate-300">
              当社は個人情報の漏洩、改ざん、不正アクセス等を防止するため、適切なセキュリティ対策を講じます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第9条 Cookieの使用</h2>
            <p className="text-slate-300">
              当社はサービスの利便性向上のためにCookieを使用することがあります。
              詳細は「Cookieポリシー」をご確認ください。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第10条 お問い合わせ窓口</h2>
            <p className="text-slate-300">
              個人情報の取扱いに関するお問い合わせは、以下の連絡先またはサポート画面よりお願いいたします。
            </p>
            <div className="p-4 rounded-xl border border-white/10 bg-slate-950/60 font-mono text-xs text-slate-200">
              AniLink カスタマーサポート
              <br />
              メールアドレス: support@sakelab.jp
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}