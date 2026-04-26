# 並列実装ワークフロー

## ブランチ方針
- 初期基点: `main`
- タスクブランチ: `feat/TASK-xxx-*`, `test/TASK-xxx-*`, `docs/TASK-xxx-*`
- 1タスク1PRを徹底し、差分を混在させない

## 実装手順
1. `main` を最新化してタスクブランチを作成
2. 実装後に品質ゲートを実行
   - `npm run lint`
   - `npx vitest run`
   - 画面影響あり: `npm run test:e2e`
   - 実DB依存の変更: `RUN_DB_INTEGRATION=1 npx vitest run tests/integration/health-db-real-route.test.ts`
3. コミット・push
4. PR作成（通常PR）
5. CIグリーン確認後にマージし、ブランチ削除・`main` 最新化まで実施

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

## CI確認とマージ運用
1. PR作成後にCI完了まで待機
2. 必須チェックがすべて成功したことを確認
   - `PR Operational Guard`（ブランチ命名 + PRチェックリスト）を含む
3. `main` へ squash merge
4. 作業ブランチをローカル/リモートから削除
5. ローカル `main` を最新化

```bash
gh pr checks --watch
gh pr merge --squash --delete-branch
git checkout main
git pull origin main
```

CIが失敗した場合は修正コミットを追加して再pushし、再度 `gh pr checks --watch` でグリーン化を確認する。
