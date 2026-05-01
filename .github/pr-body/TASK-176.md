## 概要

- 対象TASK: `TASK-176`
- 対応Issue: `#181`
- 目的: 商用利用に必要な法務・運用・事業ドキュメントおよびローンチチェックリストを追加し、READMEから参照できる状態にする

## 変更内容

- `docs/commercial-legal-ja.md` を追加（法務・コンプライアンス観点）
- `docs/commercial-operations-ja.md` を追加（運用・セキュリティ観点）
- `docs/commercial-business-ja.md` を追加（事業・マーケティング観点）
- `docs/commercial-launch-checklist-ja.md` を追加（ローンチ判定チェックリスト）
- `README.md` のドキュメント一覧に商用化ドキュメント導線を追加
- `TASKS.md` に `TASK-176` を正式タスクとして追記

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
以下は `Lint / Unit/Integration (Vitest) / DB Integration (Real Postgres) / E2E (Playwright)` が green になってからチェックする。
- [ ] ci_green_confirmed
- [ ] self_review_final_done_after_ci_green
- [ ] ready_for_main_merge

#### 最終セルフレビュー（必須）
- 差分妥当性: CI green確認後に記載
- 不要変更混入: CI green確認後に記載
- 残リスク/フォローアップ: CI green確認後に記載

### マージ後
Issueクローズ後にチェックする（`push on main` の Post-Merge Issue Guard で検証）。
- [ ] issue_closed_on_task_done
