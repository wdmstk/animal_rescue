# Animal Rescue - Emergency Pet Pass

動物の救急手帳（Emergency Pet Pass）MVP 実装リポジトリです。

## 技術スタック
- Next.js App Router + TypeScript
- Supabase (Auth / Postgres / Storage)
- Prisma
- Tailwind CSS
- Vitest / Playwright

## セットアップ
```bash
npm ci
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

## 必須コマンド
```bash
npm run lint
npx vitest run
npm run test:e2e
```

## テストデータ投入（ローカル/テストDB専用）
`DATABASE_URL` がローカル/テスト用DBを向いていることを確認してから実行してください。本番DBでは実行しないでください。

```bash
# 軽量データ（自動テスト向け）
npm run seed:test:baseline

# 多ケースデータ（手動UI確認向け）
npm run seed:test:showcase

# seed対象のみ削除してbaselineを再投入
npm run seed:test:reset
```

seed処理は `seed:` プレフィックス付きデータのみ削除対象にし、他データは保持します。

## 主な画面
- `/pets`: ペット一覧
- `/pets/[petId]`: プロフィール + 緊急情報 + タイムライン
- `/e/[token]`: QR公開の緊急ミニマム画面（閲覧専用）
- `/login`: ログイン

## API（一部）
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET/POST /api/pets`
- `PUT /api/pets/[petId]/emergency-info`
- `POST /api/pets/[petId]/qr-token`
- `GET /api/public/emergency/[token]`

## セキュリティ
- QR公開情報は最小構成（持病/薬/アレルギー/病院/連絡先）
- 公開URLは UUID トークン
- RLSポリシーは `supabase/migrations/20260423_rls.sql`
- `SUPABASE_SERVICE_ROLE_KEY` はサーバーのみ

## 開発運用
- 並列実装フロー: `docs/development-workflow.md`
- PRテンプレート: `docs/pr-template-ja.md`
- PR本文は `gh pr create --body-file` を使い、改行崩れを防ぐ

## ドキュメント一覧
- セキュリティ運用: `docs/security-policy.md`
- 開発フロー（PR/CI/マージ）: `docs/development-workflow.md`
- PRテンプレート: `docs/pr-template-ja.md`
- 現在のテスト観点: `docs/current-test-items.md`
- 画面導線: `docs/screen-flow.md`
- APIフロー図: `docs/api-sequence.md`
- 認可マトリクス: `docs/authz-matrix.md`
- 公開トークン状態遷移: `docs/token-state.md`
- テストマップ: `docs/test-map.md`

## アーキテクチャ参照
- 全体構成: `architecture.md`
- API設計メモ: `api_routes_design.md`
- Supabaseスキーマ: `supabase_schema.md`
- Supabase認証設計: `supabase_auth_design.md`
- Supabaseストレージ設計: `supabase_storage_design.md`
