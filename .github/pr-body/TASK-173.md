## 概要

- 対象TASK: `TASK-173`
- 対応Issue: `#173`
- 目的: 投薬リマインダーの日次判定をUTC固定から運用タイムゾーン基準へ切り替え可能にする

## 変更内容

- `REMINDER_SCHEDULE_TIMEZONE` 環境変数を追加（未設定時は `UTC`）
- ジョブの日次キー生成を `toTimezoneDay` へ変更し、設定タイムゾーンの日付境界で判定
- 統合テスト追加（`Asia/Tokyo` 境界ケースで `reminderDate` を検証）
- ユニットテスト追加（UTC既定/タイムゾーン境界）
- e2e不安定テスト（公開ページ遷移）を `waitForURL + click` で安定化

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
- [ ] ci_green_confirmed
- [ ] self_review_final_done_after_ci_green
- [ ] ready_for_main_merge

#### 最終セルフレビュー（必須）
- 差分妥当性: タイムゾーン基準化と境界テスト、安定化に必要なe2eテスト修正のみ
- 不要変更混入: なし
- 残リスク/フォローアップ: タイムゾーン文字列の運用入力ミスを防ぐため将来は設定UI/バリデーション追加余地あり

### マージ後
- [ ] issue_closed_on_task_done
