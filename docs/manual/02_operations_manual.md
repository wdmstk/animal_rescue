# 運用マニュアル

作成日: 2026-07-16 | バージョン: 1.0.0

## 目次
1. [環境構築手順](#1-環境構築手順)
2. [デプロイ手順](#2-デプロイ手順)
3. [バックアップ手順](#3-バックアップ手順)
4. [日常の運用タスク](#4-日常の運用タスク)
5. [トラブルシューティング](#5-トラブルシューティング)

---

## 1. 環境構築手順

### 1.1 開発環境の構築

**前提条件:**
- Node.js 18.x 以上
- Git
- npm または yarn

**手順:**

1. リポジトリのクローン
```bash
git clone https://github.com/wdmstk/animal_rescue.git
cd animal_rescue
```

2. 依存関係のインストール
```bash
npm ci
```

3. 環境変数の設定
```bash
cp .env.example .env.local
# .env.local を編集して必要な環境変数を設定
```

4. データベースのセットアップ
```bash
npx prisma migrate deploy
npx prisma generate
```

5. 開発サーバーの起動
```bash
npm run dev
```

6. ブラウザで `http://localhost:3000` にアクセス

### 1.2 本番環境の構築

**Vercelデプロイの場合:**

1. Vercelプロジェクトの作成
   - Vercelダッシュボードにアクセス
   - 「New Project」をクリック
   - GitHubリポジトリをインポート

2. 環境変数の設定
   - プロジェクト設定 → Environment Variables
   - `.env.example` の全ての変数を設定
   - 特に重要: `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`

3. デプロイ設定
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

4. デプロイ実行
   - 「Deploy」をクリック

### 1.3 データベースのセットアップ

**Supabaseプロジェクトの作成:**

1. Supabaseダッシュボードにアクセス
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワードを設定
4. リージョンを選択（日本: ap-northeast-1）
5. プロジェクトを作成

**環境変数の取得:**
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- API Keys → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- API Keys → `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
- Database → Connection String → `DATABASE_URL`

---

## 2. デプロイ手順

### 2.1 開発から本番へのデプロイ

**手順:**

1. コードのテスト
```bash
npm run lint
npx vitest run
```

2. コミット
```bash
git add .
git commit -m "feat: 新機能の説明"
```

3. プッシュ
```bash
git push origin main
```

4. Vercelで自動デプロイ
   - GitHubと連携していれば自動的にデプロイされる
   - デプロイ状況をVercelダッシュボードで確認

### 2.2 データベースマイグレーション

**手順:**

1. Prismaスキーマの変更
```bash
# schema.prisma を編集
```

2. マイグレーションの作成
```bash
npx prisma migrate dev --name マイグレーション名
```

3. 本番環境への適用
```bash
npx prisma migrate deploy
```

4. Prisma Clientの再生成
```bash
npx prisma generate
```

**注意:**
- 本番環境でのマイグレーションは慎重に行う
- メンテナンス時間を考慮する
- バックアップを取得してから実行する

### 2.3 ロールバック手順

**Vercelでのロールバック:**

1. Vercelダッシュボードにアクセス
2. 「Deployments」タブをクリック
3. ロールバックしたいデプロイをクリック
4. 「Rollback」をクリック

**データベースのロールバック:**
```bash
# マイグレーションのロールバック
npx prisma migrate resolve --applied "マイグレーション名"
```

---

## 3. バックアップ手順

### 3.1 Supabaseのバックアップ

**自動バックアップ:**
- Supabaseは自動的に日次バックアップを作成
- 7日間のバックアップが保持される（無料プラン）

**手動バックアップ:**

1. Supabaseダッシュボードにアクセス
2. 「Database」→「Backups」
3. 「Create Backup」をクリック
4. バックアップ名を入力して作成

### 3.2 リストア手順

**手順:**

1. Supabaseダッシュボードにアクセス
2. 「Database」→「Backups」
3. リストアしたいバックアップを選択
4. 「Restore」をクリック
5. 確認ダイアログで「Restore」をクリック

**注意:**
- リストアはデータベース全体を上書きする
- リストア前に現在のデータのバックアップを作成する
- メンテナンス時間を考慮する

### 3.3 データエクスポート

**手順:**

1. Supabaseダッシュボードにアクセス
2. 「Database」→「Tables」
3. エクスポートしたいテーブルを選択
4. 「Export」をクリック
5. フォーマット（CSV/SQL）を選択してダウンロード

---

## 4. 日常の運用タスク

### 4.1 毎日のタスク

**Sentryの確認:**
- 新しいエラーがないか確認
- 重要度の高いエラーがあれば対応

**管理画面の確認:**
- 新規ユーザーの状況を確認
- 課金状況に異常がないか確認

**ログの確認:**
- Vercel Logsでエラーがないか確認
- 異常なアクセスパターンがないか確認

### 4.2 毎週のタスク

**バックアップの確認:**
- バックアップが正常に作成されているか確認
- リストアテストを定期的に実施

**パフォーマンスの確認:**
- Sentry Performanceでパフォーマンスを確認
- ボトルネークがないか確認

**セキュリティの確認:**
- 依存関係の更新があるか確認
- セキュリティパッチがあれば適用

### 4.3 毎月のタスク

**課金状況の確認:**
- Stripeダッシュボードで課金状況を確認
- 支払いエラーがないか確認

**ユーザー数の確認:**
- 新規ユーザー数の確認
- 解約数の確認

**データベースの最適化:**
- データベースの容量を確認
- 必要ならインデックスの最適化

---

## 5. トラブルシューティング

### 5.1 よくある問題

**Q: デプロイが失敗する**
- A: 
  - ビルドログを確認
  - 環境変数が正しく設定されているか確認
  - 依存関係のバージョンを確認

**Q: データベース接続エラー**
- A:
  - `DATABASE_URL` を確認
  - Supabaseプロジェクトが稼働しているか確認
  - ネットワーク設定を確認

**Q: 認証エラー**
- A:
  - Supabase Authの設定を確認
  - JWTトークンの有効期限を確認
  - 環境変数が正しいか確認

**Q: 決済エラー**
- A:
  - Stripe APIキーを確認
  - Webhookの設定を確認
  - 商品IDが正しいか確認

### 5.2 エラーログの確認

**Vercel Logs:**
1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. 「Logs」タブをクリック
4. フィルターを設定してエラーを確認

**Supabase Logs:**
1. Supabaseダッシュボードにアクセス
2. 「Logs」タブをクリック
3. フィルターを設定してログを確認

**Sentry:**
1. Sentryダッシュボードにアクセス
2. 「Issues」タブをクリック
3. エラーの詳細を確認

### 5.3 サポート連絡

**外部サービスのサポート:**
- Supabase: https://supabase.com/support
- Stripe: https://stripe.com/contact
- Vercel: https://vercel.com/support
- Sentry: https://sentry.io/support

---

## 付録

### A. 環境変数チェックリスト

デプロイ前に以下の環境変数が設定されているか確認:

- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_ID_MONTHLY_680`
- [ ] `SENTRY_DSN`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SENTRY_ORG`
- [ ] `SENTRY_PROJECT`
- [ ] `ADMIN_EMAILS`

### B. 参考ドキュメント

- 管理者マニュアル: `docs/manual/01_admin_manual.md`
- 運用設計: `docs/design/09_operations_design.md`
- セキュリティ設計: `docs/design/06_security_design.md`
