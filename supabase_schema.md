# Supabase Schema Design

## テーブル一覧（MVP）
- `organizations`（組織）
- `members`（メンバー）
- `resource_a`
- `resource_b`
- `files`
- `notification_logs`

## キー設計
- 主キーは `uuid` (`gen_random_uuid()`) を基本
- 主要テーブルに `created_at`, `updated_at`
- すべての業務テーブルに `organization_id` を持たせ分離

## リレーション概要
- `organizations` 1 - n `members`
- `organizations` 1 - n `resource_a`
- `organizations` 1 - n `resource_b`
- `resource_a` 1 - n `files`（必要に応じて）

## インデックス方針
- 検索キー（`organization_id`, `created_at`, `status` など）へ付与
- 一覧系は `organization_id + created_at` の複合インデックスを優先

## RLS方針
- RLS は全テーブルで有効化
- `auth.uid()` と所属テーブルを用いて `organization_id` 単位で許可
- service role の利用はサーバー側の管理処理に限定

## Emergency 公開参照（追加）
- `PetEmergencyToken.token` をキーに匿名参照するため、RPC `public.get_public_emergency_by_token(uuid)` を提供
- 返却項目は緊急表示に必要な最小項目のみ
- `anon` には当該RPCの `execute` のみ付与し、テーブル直接アクセスは許可しない
