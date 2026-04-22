# Supabase Storage Design

## 対象
- ユーザーアップロードファイル
- 添付資料

## バケット方針
- 例: `app-files`
- パス規約: `<organization_id>/<resource>/<yyyy>/<mm>/<uuid>.<ext>`

## アップロードフロー
1. クライアントから `POST /api/upload`
2. サーバーで MIME/サイズ検証
3. 所属 `organization_id` とパス整合性チェック
4. Supabase Storage へ保存
5. 保存パス/URLをDBへ記録

## セキュリティ
- Storage policyで `organization_id` スコープを強制
- 許可拡張子を用途別に限定
- 最大サイズを明示（例: 10MB）

## 運用
- 削除時はDB参照との整合を保つ
- 期限付きURL（signed URL）を基本利用
