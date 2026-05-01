## 概要

- 対象TASK: `TASK-158`
- 対応Issue: `#137`
- 目的: 緊急公開画面を救急モードUIとして再構成し、薬・アレルギー・連絡先をファーストビューで即時確認できるようにする

## 変更内容

- `EmergencyPublicView` の先頭に「救急モード」バッジを追加
- ファーストビューに「最優先情報」ブロックを新設し、薬・アレルギー・連絡先を強調表示
- 緊急アクションボタン（電話/地図）の文字サイズ・余白を拡大し、救急時のタップしやすさを改善

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
- 差分妥当性: 緊急公開画面の視認性改善に限定し、情報優先度の要件に一致
- 不要変更混入: なし（`emergency-public-view.tsx` とタスク管理/PR本文のみ）
- 残リスク/フォローアップ: 「最優先情報」と詳細情報で同項目が重複表示されるため、次タスクで集約UIを検討可能

### マージ後
- [ ] issue_closed_on_task_done
