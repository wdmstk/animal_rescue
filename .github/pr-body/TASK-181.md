## 概要

- 対象TASK: `TASK-181`
- 対応Issue: #191
- 目的: 緊急情報保存時の実運用エラー（Promise params, バリデーションエラー表示クラッシュ, 全角電話入力失敗）を解消し、失敗原因をUIに適切表示できるようにする

Closes #191

## 変更内容

- `src/app/api/pets/[petId]/emergency-info/route.ts`
  - `params` を `await Promise.resolve(params)` で解決してから Zod 検証するよう変更
- `src/components/features/pets/emergency-editor-card.tsx`
  - APIエラーを文字列へ安全に変換する `getApiErrorMessage` を追加
  - `flatten()` 形式（`formErrors`/`fieldErrors`）でも表示文字列を抽出
- `src/lib/validators/emergency.ts`
  - 電話番号の全角数字/記号を半角へ正規化する前処理を追加
- `prisma/migrations/20260501111720/migration.sql`
  - Prismaエラー対処として既存テーブルのデフォルト差異（`OwnerDisplaySettings.id`, 各 `updatedAt`）を補正
- テスト追加/更新
  - `tests/unit/validators.test.ts`: 全角電話番号正規化ケース
  - `tests/integration/emergency-info-route.test.ts`: Promise params 受理ケース、全角電話正規化ケース

## テスト結果

- `npm run lint`: pass
- `npx vitest run`: pass
- `npm run test:e2e`: pass
- その他（必要時）: なし

## チェックリスト（必須）

### PR作成前
- [x] task_updated
- [x] task_order_checked
- [x] issue_created_and_linked
- [x] issue_split_for_parallelizable_units
- [x] branch_naming_checked
- [x] tests_run_lint
- [x] tests_run_vitest
- [x] tests_run_e2e_or_na
- [x] self_review_initial_done_before_pr

### PR作成時
- [x] pr_opened_ready_for_review_or_reason_for_draft

### マージ前（CI完了後）
以下は `Lint / Unit/Integration (Vitest) / DB Integration (Real Postgres) / E2E (Playwright)` が green になってからチェックする。
- [x] ci_green_confirmed
- [x] self_review_final_done_after_ci_green
- [x] ready_for_main_merge

#### 最終セルフレビュー（必須）
- 差分妥当性: 緊急情報保存エラーの根本原因（params Promise・エラー表示型不整合・電話正規化不足）に限定した最小差分で修正
- 不要変更混入: なし（緊急情報関連の実装/テスト/TASK管理/PR本文のみ）
- 残リスク/フォローアップ: 他APIルートにも Next.js 16 の Promise params パターンが残存している可能性があるため横断点検は別タスクで実施余地あり

### マージ後
Issueクローズ後にチェックする（`push on main` の Post-Merge Issue Guard で検証）。
- [ ] issue_closed_on_task_done
