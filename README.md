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
