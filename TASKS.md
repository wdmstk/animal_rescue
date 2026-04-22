# TASKS.md

Development Task List

---

## TASK運用ルール
- Task ID 形式: `TASK-xxx`
- 正式タスクは `TASK INDEX` と詳細セクションを必ずセットで更新
- 表示順序:
  1. `in_progress`
  2. `todo`
  3. `blocked`
  4. `done`
- 同一ステータス内は Task ID 降順

---

## TASK INDEX

### in_progress
1. `TASK-110` 基盤セットアップ（Next.js + Supabase + Prisma）

### todo
1. `TASK-109` 認証 + 家族招待コード基盤
2. `TASK-108` スキーマ + RLS実装
3. `TASK-107` ペットプロフィール + 写真管理
4. `TASK-106` 緊急情報 + QR公開画面
5. `TASK-105` 医療タイムライン
6. `TASK-104` 投薬管理 + カレンダー
7. `TASK-103` ワクチン・予防歴
8. `TASK-102` 統合テスト（unit/integration/e2e）
9. `TASK-101` ドキュメント整備

### blocked
（なし）

### done
（なし）

---

## 正式タスク詳細

### 基盤セットアップ（Next.js + Supabase + Prisma）
- Task ID: `TASK-110`
- ブランチ: `chore/TASK-110-bootstrap-next-supabase-prisma`
- ステータス: `in_progress`
- 概要: アプリ基盤、型、スタイル、テスト基盤を整備
- 完了条件:
  - `npm ci` が通る
  - `npm run lint` / `npx vitest run` が通る
  - Prisma schema / Supabase migration が追加される

### 認証 + 家族招待コード基盤
- Task ID: `TASK-109`
- ブランチ: `feat/TASK-109-auth-household-invite`
- ステータス: `todo`
- 概要: メールログインと家族共同編集の参加導線を実装

### スキーマ + RLS実装
- Task ID: `TASK-108`
- ブランチ: `feat/TASK-108-schema-rls-emergency-pet`
- ステータス: `todo`
- 概要: 救急手帳向けDB設計とRLSポリシーを適用

### ペットプロフィール + 写真管理
- Task ID: `TASK-107`
- ブランチ: `feat/TASK-107-pet-profile-photos`
- ステータス: `todo`
- 概要: 基本プロフィール編集と写真アップロード

### 緊急情報 + QR公開画面
- Task ID: `TASK-106`
- ブランチ: `feat/TASK-106-emergency-qr-public-view`
- ステータス: `todo`
- 概要: 最小情報公開の閲覧専用画面とQR共有

### 医療タイムライン
- Task ID: `TASK-105`
- ブランチ: `feat/TASK-105-medical-timeline`
- ステータス: `todo`
- 概要: 診療・手術・検査履歴の時系列管理

### 投薬管理 + カレンダー
- Task ID: `TASK-104`
- ブランチ: `feat/TASK-104-medication-calendar-integration`
- ステータス: `todo`
- 概要: 投薬スケジュール可視化と外部通知連携I/F

### ワクチン・予防歴
- Task ID: `TASK-103`
- ブランチ: `feat/TASK-103-vaccination-prevention`
- ステータス: `todo`
- 概要: 接種履歴と次回予定日管理

### 統合テスト（unit/integration/e2e）
- Task ID: `TASK-102`
- ブランチ: `test/TASK-102-mvp-test-coverage`
- ステータス: `todo`
- 概要: 主要ユーザーフローの自動テスト整備

### ドキュメント整備
- Task ID: `TASK-101`
- ブランチ: `docs/TASK-101-mvp-docs-security-ops`
- ステータス: `todo`
- 概要: セットアップ、設計、運用手順の明文化
