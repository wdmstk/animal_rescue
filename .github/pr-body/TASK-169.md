## 概要

- 対象TASK: `TASK-169`
- 対応Issue: `#163`
- 目的: 変更履歴（投薬/ワクチン/医療記録）を `createdAt` 基準から `updatedAt` 基準へ改善する

## 変更内容

- `PetMedication` / `PetVaccination` / `PetMedicalRecord` に `updatedAt` を追加
- 既存データ互換のため、migrationで既存レコードの `updatedAt = createdAt` をバックフィル
- 変更履歴集約ロジックを `updatedAt` 優先（未存在時は `createdAt` フォールバック）へ変更
- ペット詳細ページの変更履歴入力マッピングを `updatedAt` 対応
- 回帰テスト追加（`updatedAt` ソート + `createdAt` フォールバック）

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
- 差分妥当性: 変更履歴時刻基準の改善に必要なDB/ロジック/UIマッピング/テストのみに限定
- 不要変更混入: なし
- 残リスク/フォローアップ: 既存データはバックフィルにより履歴順互換を維持するが、将来タイムゾーン要件追加時は表示方針の明文化が必要

### マージ後
- [ ] issue_closed_on_task_done
