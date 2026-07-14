export default function CommercialPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-slate-100">特定商取引法に基づく表記</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">販売事業者名</h2>
            <p className="dark:text-slate-300">
              ○○株式会社
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">運営統括責任者</h2>
            <p className="dark:text-slate-300">
              代表取締役 ○○○○
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">所在地</h2>
            <p className="dark:text-slate-300">
              〒100-0001<br />
              東京都千代田区○○1-2-3
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">連絡先</h2>
            <p className="dark:text-slate-300">
              メールアドレス: support@animalrescue.example.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">販売価格</h2>
            <p className="dark:text-slate-300">
              月額680円（税込）
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">商品代金以外の費用</h2>
            <p className="dark:text-slate-300">
              通信費等の実費のみ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">支払方法</h2>
            <p className="dark:text-slate-300">
              クレジットカード
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">支払時期</h2>
            <p className="dark:text-slate-300">
              月次（トライアル終了後、毎月の契約更新日）
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">役務提供時期</h2>
            <p className="dark:text-slate-300">
              課金成功後、即時
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">解約条件</h2>
            <p className="dark:text-slate-300">
              Stripe Customer Portalまたは設定画面からいつでも解約可能です。
              解約後は期間終了まで利用可能です。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">返金条件</h2>
            <p className="dark:text-slate-300">
              原則として返金不可
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">動作環境</h2>
            <p className="dark:text-slate-300">
              最新版のChrome/Safari/Firefox、iOS 16+/Android 12+
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