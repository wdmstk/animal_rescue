## 概要

- 対象TASK: `TASK-171`
- 対応Issue: `#165`
- 目的: 緊急公開向けの電話・病院入力品質を強化し、無効値での誤導線（tel/map）を防止する

## 変更内容

- API入力バリデーションを強化
  - 文字列入力をtrimして空文字を`null`化
  - 電話番号は`[0-9+()- 空白]`以外を拒否
- 緊急情報編集UIに入力補助を追加
  - 電話入力に`type=tel`/`inputMode`/`pattern`/`placeholder`/説明文を追加
- 公開緊急画面の安全フォールバックを強化
  - `tel:`リンク生成時に桁数境界（10〜15桁）を満たさない値はリンク化しない
- テスト追加
  - unit: 電話の不正文字拒否
  - integration: 不正電話400、trim反映
  - e2e: 電話入力ヒント属性の表示

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
- 差分妥当性: 緊急情報の入力品質・公開導線の安全性強化に限定
- 不要変更混入: なし
- 残リスク/フォローアップ: 電話番号の国際形式の厳密判定（国別ルール）は未対応

### マージ後
- [ ] issue_closed_on_task_done
