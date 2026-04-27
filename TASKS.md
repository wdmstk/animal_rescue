# TASKS.md

Development Task List

---

## TASK運用ルール
- Task ID 形式: `TASK-xxx`
- 正式タスクは `TASK INDEX` と詳細セクションを必ずセットで更新
- 新規TASK作成時は、対応するGitHub Issueを必ず作成し、TASK詳細にIssue番号を記載する
- IssueはCodexAppでの同時並行実装を想定し、独立実装可能な単位で分割する（API/UI/Test/Docs など）
- Issue分割時は依存関係（blocked by / prerequisite）を明示する
- TASKを`done`へ更新する際は、対応Issueをクローズしてから反映する
- 表示順序:
  1. `in_progress`
  2. `todo`
  3. `blocked`
  4. `done`
- 同一ステータス内は Task ID 降順

---

## TASK INDEX

### in_progress
1. `TASK-131` 新規ユーザー登録導線の追加

### todo
（なし）
### blocked
（なし）

### done
1. `TASK-130` 公開緊急RPC未配置時のフォールバック対応
2. `TASK-129` TASK完了時のIssueクローズ必須化
3. `TASK-128` TASK作成時のIssue必須化と並行実装向け分割方針の追加
4. `TASK-127` 公開緊急導線の整合化（QRトークン/ドキュメント/E2E）
5. `TASK-126` 実装運用の必須ガード（AGENTS/PRテンプレ/CI）
6. `TASK-125` health APIのpetId UUIDバリデーション強化（500→400）
7. `TASK-124` Prisma adapter未設定による500エラー修正
8. `TASK-123` 健康トラッキングのテスト拡充（unit/integration/e2e）
9. `TASK-122` 健康トラッキングのグラフ可視化UI
10. `TASK-121` 健康トラッキングの入力UI
11. `TASK-120` 健康トラッキングAPI/スキーマ整備
12. `TASK-119` 実DB統合テスト + CI記載更新
13. `TASK-118` ワクチン履歴編集フロー
14. `TASK-117` 投薬リマインダー実送信
15. `TASK-116` 医療記録追加フォーム永続化
16. `TASK-115` 写真Storageアップロード接続
17. `TASK-114` QRトークン再生成UI連携
18. `TASK-113` 公開緊急APIのRPC移行
19. `TASK-112` 認証/招待ユーザー連携
20. `TASK-111` 疾患非依存の健康トラッキング + グラフ表示
21. `TASK-110` 基盤セットアップ（Next.js + Supabase + Prisma）
22. `TASK-109` 認証 + 家族招待コード基盤
23. `TASK-108` スキーマ + RLS実装
24. `TASK-107` ペットプロフィール + 写真管理
25. `TASK-106` 緊急情報 + QR公開画面
26. `TASK-105` 医療タイムライン
27. `TASK-104` 投薬管理 + カレンダー
28. `TASK-103` ワクチン・予防歴
29. `TASK-102` 統合テスト（unit/integration/e2e）
30. `TASK-101` ドキュメント整備

---

## 正式タスク詳細

### 新規ユーザー登録導線の追加
- Task ID: `TASK-131`
- ブランチ: `feat/TASK-131-user-signup-flow`
- ステータス: `in_progress`
- 概要: メール/パスワードで新規ユーザー登録できる画面導線と認証APIを追加
- Issue: `#84`
- 完了条件:
  - `/signup` 画面からメール/パスワードで登録リクエストを送信できる
  - `POST /api/auth/signup` が入力バリデーションとSupabase登録呼び出しを実装する
  - `/login` と `/signup` 間の遷移リンクが利用できる
  - 登録成功後に `/login` 上で確認メール送信案内が表示される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 公開緊急RPC未配置時のフォールバック対応
- Task ID: `TASK-130`
- ブランチ: `fix/TASK-130-public-emergency-rpc-fallback`
- ステータス: `done`
- 概要: `get_public_emergency_by_token` がSupabase環境で未検出の場合でも公開緊急ページ/APIが500にならないようにする
- Issue: `#82`
- 完了条件:
  - RPC未検出エラー時に公開緊急データ取得がフォールバック経路で継続できる
  - 通常のRPCエラーは従来どおり例外として扱われる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### TASK完了時のIssueクローズ必須化
- Task ID: `TASK-129`
- ブランチ: `docs/TASK-129-task-done-close-issue`
- ステータス: `done`
- 概要: TASK完了時に対応Issueを必ずクローズする運用を、ドキュメント・PRテンプレート・CIチェックへ反映
- Issue: `#76`
- 完了条件:
  - `AGENTS.md` と `TASKS.md` にTASK完了時のIssueクローズ必須が追記される
  - `docs/development-workflow.md` にIssueクローズ手順が追記される
  - PRテンプレートとCIチェックに `issue_closed_on_task_done` が追加される

### TASK作成時のIssue必須化と並行実装向け分割方針の追加
- Task ID: `TASK-128`
- ブランチ: `docs/TASK-128-task-issue-parallel-policy`
- ステータス: `done`
- 概要: 新規TASK作成時のIssue必須化と、CodexAppの並行実装を想定したIssue分割ルールを運用ドキュメントに追加
- Issue: `#75`
- 完了条件:
  - `AGENTS.md` にTASKとIssueの紐付け必須が追記される
  - `TASKS.md` の運用ルールにIssue作成/分割/依存関係明示が追記される
  - PRテンプレートとCIチェックにIssue管理チェック項目が追加される

### 公開緊急導線の整合化（QRトークン/ドキュメント/E2E）
- Task ID: `TASK-127`
- ブランチ: `feat/TASK-127-public-emergency-flow-alignment`
- ステータス: `done`
- 概要: 公開QR導線のURL整合、トークン無効化API、関連ドキュメント、E2E導線を一貫させる
- 完了条件:
  - `GET /api/pets/[petId]/qr-image` が `PetEmergencyToken` ベースの公開URLを返す
  - `DELETE /api/pets/[petId]/qr-token` でトークン無効化（`isActive=false`）ができる
  - 公開導線のE2E（正常系/404系）が追加される
  - 関連ドキュメント（ER/導線/API/RLS/テストマップ）が実装と整合する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 実装運用の必須ガード（AGENTS/PRテンプレ/CI）
- Task ID: `TASK-126`
- ブランチ: `chore/TASK-126-delivery-guardrail`
- ステータス: `done`
- 概要: 実装時の必須運用（タスク/ブランチ/テスト/PR/CI/セルフレビュー/mainマージ）を文書化し、PRテンプレートとCIで実行漏れを抑止
- 完了条件:
  - `AGENTS.md` に毎回の必須フローが追記される
  - `.github/pull_request_template.md` に必須チェックリストが追加される
  - `.github/workflows/ci.yml` でブランチ命名とPRチェックリスト完了が検証される

### Prisma adapter未設定による500エラー修正
- Task ID: `TASK-124`
- ブランチ: `fix/TASK-124-prisma-adapter-client-engine`
- ステータス: `done`
- 概要: Prisma Clientの`engineType=client`構成でadapter未指定時に発生するAPI 500を解消
- 完了条件:
  - `src/lib/prisma.ts` が adapter 前提で初期化される
  - `/api/pets/[petId]/health/*` の500が解消する
  - `npm run lint` / `npx vitest run` が通る

### health APIのpetId UUIDバリデーション強化（500→400）
- Task ID: `TASK-125`
- ブランチ: `fix/TASK-125-health-petid-uuid-validation`
- ステータス: `done`
- 概要: `/api/pets/[petId]/health/*` で不正なpetId（UUID以外）入力時に500ではなく400を返す
- 完了条件:
  - health API 4ルート（core-metrics/lab-results/extensions/trends）でpetId UUIDを検証
  - 不正petId時にDBアクセス前に400を返す
  - 該当integration testに不正petIdケースが追加される
  - `npm run lint` / `npx vitest run` が通る

### 疾患非依存の健康トラッキング + グラフ表示
- Task ID: `TASK-111`
- ブランチ: `feat/TASK-111-health-metrics-tracking-graphs`
- ステータス: `done`
- 概要: 全ペット共通コア項目 + 拡張項目（例: 点滴量）を記録し、時系列グラフで可視化
- 完了条件:
  - `POST/GET /api/pets/[petId]/health/core-metrics` が実装される
  - `POST/GET /api/pets/[petId]/health/lab-results` が実装される
  - `POST/GET /api/pets/[petId]/health/extensions` が実装される
  - `GET /api/pets/[petId]/health/trends` が実装される
  - ペット詳細画面に健康記録セクション（入力/履歴/グラフ）が表示される
  - `npm run lint` / `npx vitest run` が通る

### 健康トラッキングAPI/スキーマ整備
- Task ID: `TASK-120`
- ブランチ: `feat/TASK-120-health-metrics-api-schema-clean`
- ステータス: `done`
- 概要: 共通コア + 拡張セットの保存モデルとAPI契約を整備

### 健康トラッキングの入力UI
- Task ID: `TASK-121`
- ブランチ: `feat/TASK-121-health-metrics-input-ui`
- ステータス: `done`
- 概要: 共通フォームと条件付き拡張フォームを提供

### 健康トラッキングのグラフ可視化UI
- Task ID: `TASK-122`
- ブランチ: `feat/TASK-122-health-metrics-graph-ui`
- ステータス: `done`
- 概要: 項目切替可能な時系列グラフを実装

### 健康トラッキングのテスト拡充（unit/integration/e2e）
- Task ID: `TASK-123`
- ブランチ: `test/TASK-123-health-metrics-coverage`
- ステータス: `done`
- 概要: バリデーション、API、主要画面導線を自動テスト化

### 実DB統合テスト + CI記載更新
- Task ID: `TASK-119`
- ブランチ: `test/TASK-119-db-integration-and-ci-docs`
- ステータス: `done`
- 概要: 実DB統合テストとCI連携ドキュメントを更新

### ワクチン履歴編集フロー
- Task ID: `TASK-118`
- ブランチ: `feat/TASK-118-vaccination-edit-flow`
- ステータス: `done`
- 概要: ワクチン履歴の追加/編集導線を実装

### 投薬リマインダー実送信
- Task ID: `TASK-117`
- ブランチ: `feat/TASK-113-117-parallel-backend-wiring`
- ステータス: `done`
- 概要: 現在stubの通知処理を実送信へ切替

### 医療記録追加フォーム永続化
- Task ID: `TASK-116`
- ブランチ: `feat/TASK-116-medical-record-form-persistence`
- ステータス: `done`
- 概要: 記録追加UIをAPI永続化に接続

### 写真Storageアップロード接続
- Task ID: `TASK-115`
- ブランチ: `feat/TASK-107-pet-profile-photos`
- ステータス: `done`
- 概要: 画像アップロードをStorageに接続

### QRトークン再生成UI連携
- Task ID: `TASK-114`
- ブランチ: `feat/TASK-114-qr-token-rotation-ui`
- ステータス: `done`
- 概要: QRトークン再生成APIとUIを接続

### 公開緊急APIのRPC移行
- Task ID: `TASK-113`
- ブランチ: `feat/TASK-113-117-parallel-backend-wiring`
- ステータス: `done`
- 概要: 公開参照をRPCベースに統一

### 認証/招待ユーザー連携
- Task ID: `TASK-112`
- ブランチ: `feat/TASK-112-auth-invite-user-linkage`
- ステータス: `done`
- 概要: 招待参加導線を実ユーザー認証と接続

### 基盤セットアップ（Next.js + Supabase + Prisma）
- Task ID: `TASK-110`
- ブランチ: `chore/TASK-110-bootstrap-next-supabase-prisma`
- ステータス: `done`
- 概要: アプリ基盤、型、スタイル、テスト基盤を整備

### 認証 + 家族招待コード基盤
- Task ID: `TASK-109`
- ブランチ: `feat/TASK-109-auth-household-invite`
- ステータス: `done`
- 概要: メールログインと家族共同編集の参加導線を実装
- Issue: `#78`
- 完了条件:
  - `/login` からメール/パスワード認証を実行し、成功時に `/pets` へ遷移できる
  - `/invite/join` から招待コードで `POST /api/households/join` を実行できる
  - 招待参加の失敗時に、入力値を保持したままエラーが表示される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### スキーマ + RLS実装
- Task ID: `TASK-108`
- ブランチ: `feat/TASK-108-schema-rls-emergency-pet`
- ステータス: `done`
- 概要: 救急手帳向けDB設計とRLSポリシーを適用
- Issue: `#80`
- 完了条件:
  - `prisma/schema.prisma` と Supabase migration の主要テーブル構成が整合している
  - 世帯境界テーブルと健康系テーブルのRLS有効化/主要ポリシーを実DBで検証できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ペットプロフィール + 写真管理
- Task ID: `TASK-107`
- ブランチ: `feat/TASK-107-pet-profile-photos`
- ステータス: `done`
- 概要: 基本プロフィール編集と写真アップロード
- 完了条件:
  - `GET/POST /api/pets` と `GET /api/pets/[petId]` が integration test で検証される
  - `GET/POST /api/pets/[petId]/photos` と `POST /api/pets/[petId]/photos/upload-url` の正常系・異常系が integration test で検証される
  - ペット詳細画面でプロフィール/写真管理セクション表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 緊急情報 + QR公開画面
- Task ID: `TASK-106`
- ブランチ: `feat/TASK-106-emergency-qr-public-view`
- ステータス: `done`
- 概要: 最小情報公開の閲覧専用画面とQR共有
- 完了条件:
  - `PUT /api/pets/[petId]/emergency-info` の正常系・異常系（petId/入力値/存在確認）が integration test で検証される
  - `GET /api/pets/[petId]/qr-image` の petId バリデーションと生成結果が integration test で検証される
  - ペット詳細画面で緊急情報/QR共有セクションが e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 医療タイムライン
- Task ID: `TASK-105`
- ブランチ: `feat/TASK-105-medical-timeline`
- ステータス: `done`
- 概要: 診療・手術・検査履歴の時系列管理
- 完了条件:
  - `GET/POST /api/pets/[petId]/medical-records` の正常系・異常系が integration test で検証される
  - 医療タイムライングルーピングロジックが unit test で検証される
  - ペット詳細画面で医療記録タイムライン表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 投薬管理 + カレンダー
- Task ID: `TASK-104`
- ブランチ: `feat/TASK-104-medication-calendar-integration`
- ステータス: `done`
- 概要: 投薬スケジュール可視化と外部通知連携I/F
- 完了条件:
  - `GET/POST /api/pets/[petId]/medications` の正常系・異常系が integration test で検証される
  - 投薬カレンダー生成ロジックの境界条件（endDate 含む/開始日前）が unit test で検証される
  - ペット詳細画面で投薬カレンダー表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ワクチン・予防歴
- Task ID: `TASK-103`
- ブランチ: `feat/TASK-103-vaccination-prevention`
- ステータス: `done`
- 概要: 接種履歴と次回予定日管理
- 完了条件:
  - ワクチン履歴API（GET/POST/PATCH）の正常系・異常系が integration test で検証される
  - 次回予定日の期限判定ロジック（overdue/upcoming/ok）が unit test で検証される
  - ペット詳細画面でワクチン・予防歴セクション表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 統合テスト（unit/integration/e2e）
- Task ID: `TASK-102`
- ブランチ: `test/TASK-102-mvp-test-coverage`
- ステータス: `done`
- 概要: 主要ユーザーフローの自動テスト整備
- 完了条件:
  - 招待コード系APIの異常系分岐（入力不正/期限切れ/使用済み）が integration test で検証される
  - 招待参加画面とペット詳細遷移が e2e test で検証される
  - 招待コード関連バリデータが unit test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ドキュメント整備
- Task ID: `TASK-101`
- ブランチ: `docs/TASK-101-mvp-docs-security-ops`
- ステータス: `done`
- 概要: セットアップ、設計、運用手順の明文化
- 完了条件:
  - `README.md` にセットアップ/設計ドキュメント導線が整理される
  - `docs/development-workflow.md` に PR作成〜CI確認〜マージ〜後片付け手順が明記される
  - `docs/security-policy.md` に運用時のセキュリティ確認手順が明記される


