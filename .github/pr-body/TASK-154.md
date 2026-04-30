## 概要

- 対象TASK: `TASK-154`
- 対応Issue: `#130`
- 目的: `/pets/[petId]` 表示時の `PetLabResultEntry.category` カラム欠落による500エラーを、互換フォールバックなしでDBマイグレーション正規適用により解消する

## 変更内容

- `npm run db:setup` を追加（`prisma migrate deploy && prisma generate`）
- 開発ワークフローに「初回セットアップ/マイグレーション追加後は `npm run db:setup` 実行」を追記
- `TASKS.md` に `TASK-154` を追加し、Issue `#130` を紐付け
- 接続先DBに未適用マイグレーションを適用し、`PetLabResultEntry.category` を含む最新スキーマへ更新

## テスト結果

- `npm run lint`: 成功
- `npx vitest run`: 成功
- `npm run test:e2e`: 成功
- その他（必要時）: `npm run db:setup` 実行で `No pending migrations to apply.` を確認

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
- [ ] ci_green_confirmed
- [ ] self_review_final_done_after_ci_green
- [ ] ready_for_main_merge

#### 最終セルフレビュー（必須）
- 差分妥当性:
- 不要変更混入:
- 残リスク/フォローアップ:

### マージ後
- [ ] issue_closed_on_task_done
