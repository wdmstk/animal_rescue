export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-slate-100">利用規約</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第1条 総則</h2>
            <p className="dark:text-slate-300">
              本利用規約（以下「本規約」）は、Animal Rescue（以下「当社」）が提供する動物の救急手帳サービス（以下「本サービス」）の利用条件を定めるものです。
              ユーザーは本サービスを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第2条 サービスの目的</h2>
            <p className="dark:text-slate-300">
              本サービスは、ペットの医療情報管理および緊急時の情報共有を目的としたツールです。
              医療助言や診断を提供するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第3条 アカウント管理</h2>
            <p className="dark:text-slate-300">
              ユーザーは自己の責任でアカウント情報およびパスワードを管理するものとします。
              第三者へのアカウントの貸与・譲渡は禁止します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第4条 禁止事項</h2>
            <ul className="list-disc pl-5 space-y-1 dark:text-slate-300">
              <li>他者の情報への不正アクセス</li>
              <li>サービスの逆コンパイル・解析</li>
              <li>医療サービスとしての宣伝・使用</li>
              <li>商業目的での転売</li>
              <li>当社または第三者の知的財産権の侵害</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第5条 課金条項</h2>
            <p className="dark:text-slate-300">
              本サービスは月額680円（税込）の有料サービスです。30日間の無料トライアル期間を提供します。
              トライアル期間終了後、自動的に有料契約へ移行し、毎月自動更新されます。
              解約は次の更新日の24時間前までに行う必要があります。
              返金は原則として行いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第6条 免責事項</h2>
            <p className="dark:text-slate-300">
              本サービスは医療助言や診断を提供するものではありません。
              緊急時は必ず獣医師の判断に従ってください。
              登録情報の正確性はユーザーの責任となります。
              通信障害等による緊急時の情報提供の保証はいたしません。
              当社の故意・重過失による損害を除き、当社はいかなる責任も負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第7条 知的財産</h2>
            <p className="dark:text-slate-300">
              本サービスのUI、コード、ロゴ等は当社の知的財産です。
              ユーザーが登録した情報はユーザーの所有物ですが、サービス内での表示に同意するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第8条 サービスの変更・停止</h2>
            <p className="dark:text-slate-300">
              当社は30日前の予告により機能変更や価格改定を行うことができます。
              重大な変更の場合はメールにて通知します。
              サービス終了時はデータエクスポート機能を提供します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第9条 準拠法・管轄</h2>
            <p className="dark:text-slate-300">
              本規約の解釈に日本法を適用し、東京地方裁判所を専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 dark:text-slate-100">第10条 規約の変更</h2>
            <p className="dark:text-slate-300">
              当社はユーザーに通知することなく本規約を変更できるものとします。
              変更後の規約はサイト上に掲載された時点から効力を生じます。
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