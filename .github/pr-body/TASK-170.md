## 概要

- 対象TASK: `TASK-170`
- 対応Issue: `#164`
- 目的: 投薬リマインダーを定期実行ジョブで送信し、失敗時リトライと重複送信防止を実装する

## 変更内容

- `POST /api/jobs/medication-reminders` を追加
- 有効な通知設定を走査し、当日時点で有効な投薬があるペットのみ送信
- 日次ログ（`PetMedicationReminderDispatchLog`）で重複送信を防止
- 送信失敗時に1回リトライし、失敗確定時はログを削除して再実行可能に
- 統合テストを追加（成功・重複スキップ・リトライ・認可トークン）

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
- 差分妥当性: 定期送信ジョブ化に必要なAPI/サービス/DBログ/テストのみに限定
- 不要変更混入: なし
- 残リスク/フォローアップ: 日次重複判定はUTC基準のため、ローカル日付基準運用に切り替える場合は仕様追加が必要

### マージ後
- [ ] issue_closed_on_task_done
