export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-slate-100">プライバシーポリシー</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第1条 個人情報の取扱い</h2>
            <p className="dark:text-slate-300">
              当社は、個人情報保護法その他の関連法令を遵守し、適切に個人情報を取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第2条 収集する個人情報</h2>
            <p className="dark:text-slate-300">
              当社が収集する個人情報は以下の通りです。
            </p>
            <ul className="list-disc pl-5 space-y-1 dark:text-slate-300">
              <li>メールアドレス</li>
              <li>表示名（氏名の場合）</li>
              <li>緊急連絡先名・電話番号</li>
              <li>飼い主住所</li>
              <li>ペットの医療情報（個人情報に準じて取り扱います）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第3条 利用目的</h2>
            <p className="dark:text-slate-300">
              収集した個人情報は以下の目的で使用します。
            </p>
            <ul className="list-disc pl-5 space-y-1 dark:text-slate-300">
              <li>サービス提供（ペット管理・緊急情報共有）</li>
              <li>本人確認・認証</li>
              <li>課金・決済処理</li>
              <li>サービス改善・統計分析</li>
              <li>障害調査・セキュリティ対応</li>
              <li>問い合わせ対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第4条 第三者提供</h2>
            <p className="dark:text-slate-300">
              当社は、法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供しません。
              ただし、業務委託先（Supabase、Stripe等）との間で必要な範囲で情報を共有することがあります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第5条 越境移転</h2>
            <p className="dark:text-slate-300">
              当社が利用するサーバーは海外に設置される場合があります。
              個人情報が海外に移転される場合、適切な保護措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第6条 本人の権利</h2>
            <p className="dark:text-slate-300">
              ユーザーは、自身の個人情報について以下の権利を有します。
            </p>
            <ul className="list-disc pl-5 space-y-1 dark:text-slate-300">
              <li>開示請求権</li>
              <li>訂正・追加・削除請求権</li>
              <li>利用停止請求権</li>
              <li>第三者提供の停止請求権</li>
            </ul>
            <p className="dark:text-slate-300">
              これらの請求は、設定画面またはメールにて行うことができます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第7条 データの削除</h2>
            <p className="dark:text-slate-300">
              ユーザーがアカウントを削除した場合、当社は原則として30日以内に該当する個人情報を削除します。
              ただし、法令に基づく保存期間が定められている場合は、その期間保存します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第8条 セキュリティ</h2>
            <p className="dark:text-slate-300">
              当社は個人情報の漏洩、改ざん、不正アクセス等を防止するため、適切なセキュリティ対策を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第9条 Cookieの使用</h2>
            <p className="dark:text-slate-300">
              当社はサービスの利便性向上のためにCookieを使用することがあります。
              ユーザーはブラウザの設定によりCookieを無効にすることができます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第10条 お問い合わせ</h2>
            <p className="dark:text-slate-300">
              個人情報の取扱いに関するお問い合わせは、以下の連絡先までお願いします。
            </p>
            <p className="dark:text-slate-300">
              メールアドレス: support@animalrescue.example.com
            </p>
          </section>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
            最終更新日: 2026年7月15日
          </p>
        </div>
      </div>
    </div>
  );
}