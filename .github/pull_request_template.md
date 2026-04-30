## 概要

- 対象TASK:
- 対応Issue:
- 目的:

## 変更内容

- 

## テスト結果

- `npm run lint`:
- `npx vitest run`:
- `npm run test:e2e`:
- その他（必要時）:

## チェックリスト（必須）

### PR作成前
- [ ] task_updated
- [ ] task_order_checked
- [ ] issue_created_and_linked
- [ ] issue_split_for_parallelizable_units
- [ ] branch_naming_checked
- [ ] tests_run_lint
- [ ] tests_run_vitest
- [ ] tests_run_e2e_or_na
- [ ] self_review_initial_done_before_pr

### PR作成時
- [ ] pr_opened_ready_for_review_or_reason_for_draft

### マージ前（CI完了後）
以下は `Lint / Unit/Integration (Vitest) / DB Integration (Real Postgres) / E2E (Playwright)` が green になってからチェックする。
- [ ] ci_green_confirmed
- [ ] self_review_final_done_after_ci_green
- [ ] ready_for_main_merge

#### 最終セルフレビュー（必須）
- 差分妥当性:
- 不要変更混入:
- 残リスク/フォローアップ:

### マージ後
Issueクローズ後にチェックする（`push on main` の Post-Merge Issue Guard で検証）。
- [ ] issue_closed_on_task_done
