# 管理者マニュアル

作成日: 2026-07-16 | バージョン: 1.0.0

## 目次
1. [管理画面へのアクセス](#1-管理画面へのアクセス)
2. [管理画面の機能](#2-管理画面の機能)
3. [Sentryエラーモニタリング](#3-sentryエラーモニタリング)
4. [環境変数の設定](#4-環境変数の設定)
5. [障害対応手順](#5-障害対応手順)

---

## 1. 管理画面へのアクセス

### 1.1 管理者権限の設定

管理画面にアクセスするには、環境変数 `ADMIN_EMAILS` に管理者のメールアドレスを設定する必要があります。

**設定方法:**
```bash
# .env.local または本番環境の環境変数に設定
ADMIN_EMAILS="admin@example.com,manager@example.com"
```

- 複数の管理者を設定する場合は、カンマ区切りでメールアドレスを指定
- Supabase Authで登録済みのメールアドレスのみ有効

### 1.2 アクセス手順

1. 設定した管理者メールアドレスでアプリケーションにログイン
2. ブラウザで `/admin` にアクセス
3. 管理画面が表示される

**認証エラーになる場合:**
- メールアドレスが `ADMIN_EMAILS` に含まれているか確認
- Supabase Authで正しくログインしているか確認
- 環境変数が正しく設定されているか確認

---

## 2. 管理画面の機能

### 2.1 世帯一覧

**表示項目:**
- 世帯ID（先頭8文字）
- 世帯名
- メンバー数
- ペット数
- 作成日

**用途:**
- ユーザーの世帯状況の把握
- アクティブユーザーの確認
- トラブルシューティング時のユーザー特定

### 2.2 課金状態一覧

**表示項目:**
- ユーザーID（先頭8文字）
- ステータス（INCOMPLETE/TRIALING/ACTIVE/PAST_DUE/CANCELED/UNPAID）
- Stripe顧客ID
- トライアル終了日
- 作成日

**ステータスの意味:**
- `INCOMPLETE`: 課金設定未完了
- `TRIALING`: トライアル期間中
- `ACTIVE`: 有料プラン利用中
- `PAST_DUE`: 支払い遅延
- `CANCELED`: 解約済み
- `UNPAID`: 未払い

**用途:**
- 課金状況のモニタリング
- トライアル期間終了ユーザーの把握
- 支払いトラブルの対応

### 2.3 統計ダッシュボード

**表示項目:**
- 総世帯数
- 総メンバー数
- アクティブサブスクリプション数（ACTIVE + TRIALING）
- 総ペット数

**用途:**
- サービス全体の状況把握
- 成長指標のモニタリング
- レポート作成

---

## 3. Sentryエラーモニタリング

### 3.1 Sentryのセットアップ

**手順:**

1. Sentryアカウント作成
   - https://sentry.io にアクセス
   - アカウントを作成（無料プランから利用可能）

2. プロジェクト作成
   - 「Create Project」をクリック
   - プラットフォーム: 「Next.js」を選択
   - プロジェクト名: 任意（例: animal-rescue）

3. DSNの取得
   - プロジェクト設定から「DSN」をコピー
   - 組織名（SENTRY_ORG）とプロジェクト名（SENTRY_PROJECT）を確認

4. 環境変数の設定
   ```bash
   SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
   NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
   SENTRY_ORG="your-org"
   SENTRY_PROJECT="your-project"
   ```

### 3.2 Sentryの設定内容

**本番環境でのみ有効化:**
- `NODE_ENV=production` の場合のみエラー収集が有効

**セッションリプレイ:**
- 通常セッション: 10% を収集
- エラー発生時: 100% を収集

**機密情報の保護:**
- クッキーは自動的に削除
- ヘッダーは自動的に削除
- テキストはマスキング
- メディアはブロック

### 3.3 Sentryの使い方

**エラーの確認:**
1. Sentryダッシュボードにアクセス
2. 「Issues」タブでエラー一覧を確認
3. 各エラーをクリックして詳細を確認

**アラート設定:**
1. 「Settings」→「Alerts」
2. 新しいアラートルールを作成
3. 条件: エラー数、頻度、重要度など
4. 通知方法: メール、Slackなど

**パフォーマンス監視:**
- 「Performance」タブでリクエスト速度、データベースクエリなどを確認
- ボトルネックの特定に使用

---

## 4. 環境変数の設定

### 4.1 必須環境変数

**データベース・認証:**
```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**アプリケーション:**
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**決済:**
```bash
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PRICE_ID_MONTHLY_680="price_xxx"
```

**通知:**
```bash
REMINDER_EMAIL_WEBHOOK_URL="https://example.com/hooks/reminder-email"
REMINDER_LINE_WEBHOOK_URL="https://example.com/hooks/reminder-line"
```

**エラーモニタリング:**
```bash
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
```

**管理画面:**
```bash
ADMIN_EMAILS="admin@example.com,manager@example.com"
```

### 4.2 環境変数の設定場所

| 環境 | 設定ファイル |
|---|---|
| ローカル開発 | `.env.local` |
| 本番 | デプロイプラットフォームの環境変数設定 |

**注意:**
- `.env.local` はGitにコミットしない（`.gitignore`に含まれている）
- 本番環境の環境変数は厳重に管理
- セキュリティキーは絶対に公開しない

---

## 5. 障害対応手順

### 5.1 障害レベル定義

**Sev1（最重要）:**
- サービス全体停止
- 緊急公開API障害
- 対応: 24時間365日即時対応、目標30分以内

**Sev2（重要）:**
- 部分機能障害
- 課金機能停止
- 対応: 営業時間内即時対応、目標2時間以内

**Sev3（軽微）:**
- パフォーマンス劣化
- 軽微なバグ
- 対応: 翌営業日対応

### 5.2 障害対応フロー

```
1. 検知（監視アラート / ユーザー報告）
   ↓
2. 影響範囲の特定
   - 何の機能が影響を受けているか
   - 何人のユーザーが影響を受けているか
   ↓
3. 初動対応
   - Sev1: 必要なら機能の一時停止・ロールバック
   - ステータスページの更新
   ↓
4. 根本原因の調査
   - ログの確認（Vercel Logs）
   - Sentryのエラートレース
   - データベース状況の確認
   ↓
5. 修正・デプロイ
   - 修正コードの実装
   - テスト確認
   - デプロイ
   ↓
6. 検証・復旧
   - 機能確認
   - ユーザーへの通知
   ↓
7. 事後検証
   - 再発防止策の検討
   - ドキュメント更新
```

### 5.3 緊急連絡先

**連絡先をドキュメントに記載:**
- 技術責任者
- サービス提供者
- データベース管理者
- 外部サービス連絡先（Supabase、Stripe、Sentry）

---

## 付録

### A. よくある問題

**Q: 管理画面にアクセスできない**
- A: `ADMIN_EMAILS` 環境変数を確認、ログイン状態を確認

**Q: Sentryにエラーが表示されない**
- A: `NODE_ENV=production` であるか確認、DSNが正しいか確認

**Q: 統計数値が正しくない**
- A: データベースの整合性を確認、キャッシュをクリア

### B. 参考ドキュメント

- 運用設計: `docs/design/09_operations_design.md`
- セキュリティ設計: `docs/design/06_security_design.md`
- SaaS運営設計: `docs/design/10_saas_operations.md`
