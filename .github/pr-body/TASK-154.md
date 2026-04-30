## 概要
`/pets/[petId]` 表示時の `PetLabResultEntry.category` カラム欠落による500エラーを、DBマイグレーションの正規適用で解消しました。関連Issue: #130。
Issueは「運用フロー修正（Docs/Script）」として単一責務で分割しています。

## 変更内容
- `npm run db:setup` を追加（`prisma migrate deploy && prisma generate`）
- 開発ワークフローに「初回セットアップ/マイグレーション追加後は `npm run db:setup` 実行」を追記
- `TASKS.md` に `TASK-154` を追加し、Issue `#130` を紐付け
- 実DBへ未適用マイグレーションを適用

## テスト結果
- `npm run lint` : 成功
- `npx vitest run` : 成功
- `npm run test:e2e` : 成功

## 確認観点・未対応
- 確認観点: 新規開発者環境で `npm run db:setup` 実行後、`/pets/[petId]` で500が再発しないこと
- 未対応: なし
- PR作成前の一次セルフレビュー: 意図した差分のみで、不要変更混入なし
- PR種別: 通常PR（Ready for review）
- CI必須チェック完了後に最終セルフレビューを実施予定

### 最終セルフレビュー（CIグリーン後に更新）
- 差分妥当性:
- 不要変更混入:
- 残リスク/フォローアップ:
