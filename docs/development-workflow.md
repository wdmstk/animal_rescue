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
3. コミット・push
4. Draft PR作成

## PR作成（日本語サマリ）
`\n` の文字列表示を避けるため、必ず `--body-file` を使う。

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
  --draft \
  --base main \
  --head feat/TASK-xxx-... \
  --title "feat: TASK-xxx ..." \
  --body-file .github/pr-body/TASK-xxx.md
```
