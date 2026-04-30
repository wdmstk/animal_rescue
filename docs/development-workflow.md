# 並列実装ワークフロー

## ブランチ方針
- 初期基点: `main`
- タスクブランチ: `feat/TASK-xxx-*`, `test/TASK-xxx-*`, `docs/TASK-xxx-*`
- 1タスク1PRを徹底し、差分を混在させない

## 実装手順
1. `TASKS.md` にタスクを登録し、対応するGitHub Issueを作成
   - CodexAppでの並行実装を想定し、Issueは独立実装可能な単位（API/UI/Test/Docs）で分割
   - 依存関係（blocked by / prerequisite）をIssueに明記
2. `main` を最新化してタスクブランチを作成
   - 初回セットアップ、または migration 追加後は `npm run db:setup` を実行してDBスキーマを最新化する
3. 実装後に品質ゲートを実行
   - `npm run lint`
   - `npx vitest run`
   - 画面影響あり: `npm run test:e2e`
   - 実DB依存の変更: `RUN_DB_INTEGRATION=1 npx vitest run tests/integration/health-db-real-route.test.ts`
4. コミット・push
5. PR作成（通常PR）
6. CIグリーン確認後にマージし、対応Issueをクローズ、ブランチ削除・`main` 最新化まで実施

## PR作成（日本語サマリ）
`\n` の文字列表示を避けるため、必ず `--body-file` を使う。
`pull_request_template.md` の必須チェックリストは全項目を完了させること。

```bash
mkdir -p .github/pr-body
cat > .github/pr-body/TASK-xxx.md <<'EOF'
## 概要
...

## 変更内容
...

## テスト結果
- npm run lint : 成功
- npx vitest run : 成功
EOF

gh pr create \
  --base main \
  --head feat/TASK-xxx-... \
  --title "feat: TASK-xxx ..." \
  --body-file .github/pr-body/TASK-xxx.md
```

## CI確認とマージ運用（段階ガード）
1. PR作成時（初期フェーズ）
   - PR本文の「PR作成前」「PR作成時」チェックのみ更新する
   - `PR Operational Guard` がこのフェーズを検証する
2. CI完了後（マージ前フェーズ）
   - `Lint` / `Unit/Integration (Vitest)` / `DB Integration (Real Postgres)` / `E2E (Playwright)` の成功を確認する
   - PR本文を編集し、以下を更新する
     - `ci_green_confirmed`
     - `self_review_final_done_after_ci_green`
     - `ready_for_main_merge`
     - 最終セルフレビュー3観点
   - `PR Pre-Merge Guard` は `edited` イベントかつ上記チェック更新時に検証される
3. `main` へ squash merge
4. 対応Issueをクローズ
5. PR本文の `issue_closed_on_task_done` を更新する
   - `push on main` の `Post-Merge Issue Guard` で、チェック済みかつ対応Issueが `closed` かを検証する
6. 作業ブランチをローカル/リモートから削除
7. ローカル `main` を最新化

```bash
gh pr checks --watch
gh pr merge --squash --delete-branch
gh issue close <issue-number>
git checkout main
git pull origin main
```

CIが失敗した場合は修正コミットを追加して再pushし、再度 `gh pr checks --watch` でグリーン化を確認する。
PR本文のチェック項目・最終セルフレビュー更新による再検証は `edited` イベントで発火するため、再発火目的の空コミットは不要。
