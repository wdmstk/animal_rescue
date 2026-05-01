## 概要

- 対象TASK: `TASK-159`
- 対応Issue: `#138`
- 目的: ペット詳細ページ `/pets/[petId]` にセクションナビを追加し、初回表示時の情報探索コストを下げる

## 変更内容

- `/pets/[petId]` ページに sticky の「詳細セクションナビ」を追加
- 主要セクション（プロフィール/提出サマリー/写真/緊急情報/投薬/ワクチン/健康記録/医療記録/更新履歴）へアンカーで即時ジャンプ可能に変更
- E2Eテストにセクションナビ表示確認と `#health` アンカー遷移確認を追加

## テスト結果

- `npm run lint`: 成功
- `npx vitest run`: 成功
- `npm run test:e2e`: 成功
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
- [x] ci_green_confirmed
- [x] self_review_final_done_after_ci_green
- [x] ready_for_main_merge

#### 最終セルフレビュー（必須）
- 差分妥当性: セクションナビ追加とアンカーラップ、および遷移確認E2Eのみで要件に一致
- 不要変更混入: なし（`page.tsx` と `health.spec.ts`、PR本文のみ）
- 残リスク/フォローアップ: ナビの「現在地ハイライト」は未対応（別タスクで拡張可能）

### マージ後
- [ ] issue_closed_on_task_done
