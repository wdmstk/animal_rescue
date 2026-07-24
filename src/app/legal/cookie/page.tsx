import { LegalNav } from "@/components/legal-nav";

export default function CookiePage() {
  return (
    <div className="space-y-6">
      <LegalNav />

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-3">
            <span>🍪</span>
            <span>AniLink クッキーポリシー</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Cookieポリシー</h1>
          <p className="text-xs text-slate-400 mt-2">最終更新日: 2026年7月24日</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第1条 Cookieの使用目的</h2>
            <p className="text-slate-300">
              さけLab（以下「当社」）が提供する「AniLink」（以下「本サービス」）では、サービスの利便性向上、セキュリティ維持、および匿名統計分析のためにCookieを使用します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第2条 Cookieの種類</h2>
            <p className="text-slate-300">
              当社が使用するCookieは以下の通りです。
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong className="text-white">必須Cookie:</strong> 認証状態の維持、セッション管理、セキュリティ保護のために必要不可欠なCookieです。</li>
              <li><strong className="text-white">機能Cookie:</strong> ユーザーの表示設定や環境設定を記憶し、操作性を向上させます。</li>
              <li><strong className="text-white">解析Cookie:</strong> サービス利用状況を匿名で統計分析し、品質改善に役立てます。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第3条 Cookieの管理</h2>
            <p className="text-slate-300">
              ユーザーはブラウザの設定によりCookieの受け入れを無効化・制限することができます。
              ただし、必須Cookieを無効に設定した場合、本サービスの一部機能（ログイン状態の維持等）が正常に動作しない場合があります。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第4条 第三者Cookie</h2>
            <p className="text-slate-300">
              当社は、トラッキング目的の第三者広告Cookie等を使用しません。
              サービス分析目的でアクセス解析ツールを導入する場合は、プライバシーに配慮した設計および適切な同意管理を行います。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第5条 Cookieの有効期限</h2>
            <p className="text-slate-300">
              Cookieの有効期限は種類により異なります。セッションCookieはブラウザ終了時に自動削除されます。永続Cookieは一定の保存期間経過後、またはブラウザのデータ消去操作により削除されます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">第6条 ポリシーの変更</h2>
            <p className="text-slate-300">
              当社は法令の変更やサービス内容の改善に伴い、本ポリシーを改定することがあります。
              最新のポリシーは本ページに掲載された時点より有効となります。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}