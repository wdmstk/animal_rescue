export default function CookiePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-slate-100">Cookieポリシー</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第1条 Cookieの使用目的</h2>
            <p className="dark:text-slate-300">
              当社は、サービスの利便性向上、セキュリティ維持、および統計分析のためにCookieを使用します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第2条 Cookieの種類</h2>
            <p className="dark:text-slate-300">
              当社が使用するCookieは以下の通りです。
            </p>
            <ul className="list-disc pl-5 space-y-1 dark:text-slate-300">
              <li>必須Cookie: 認証状態の維持、セキュリティ保護のために必要</li>
              <li>機能Cookie: ユーザー設定の保存、利便性向上</li>
              <li>解析Cookie: サービス改善のための統計データ収集</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第3条 Cookieの管理</h2>
            <p className="dark:text-slate-300">
              ユーザーはブラウザの設定によりCookieを無効にすることができます。
              ただし、必須Cookieを無効にするとサービスの一部機能が正常に動作しない場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第4条 第三者Cookie</h2>
            <p className="dark:text-slate-300">
              当社は、第三者によるCookieの使用を原則として許可していません。
              分析目的でGoogle Analytics等を使用する場合、事前に同意を取得します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第5条 Cookieの有効期限</h2>
            <p className="dark:text-slate-300">
              Cookieの有効期限は、Cookieの種類によって異なります。
              セッションCookieはブラウザを閉じると削除されます。
              永続Cookieは設定された有効期限まで保存されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第6条 ポリシーの変更</h2>
            <p className="dark:text-slate-300">
              当社は予告なく本ポリシーを変更できるものとします。
              変更後のポリシーはサイト上に掲載された時点から効力を生じます。
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