# 認可マトリクス（RLS観点）

基準:
- `supabase/migrations/20260423_rls.sql`
- `supabase/migrations/20260423_health_metrics.sql`
- `supabase/migrations/20260423_public_emergency_rpc.sql`

## ロール定義
- `anon`: 未ログイン。公開画面/APIのみ。
- `authenticated member`: `HouseholdMember` に所属するログインユーザー。
- `authenticated owner`: `HouseholdMember.role = OWNER` のログインユーザー。
- `service role`: サーバー管理処理用（RLSバイパス可能）。

## マトリクス

| 対象 | anon | authenticated member | authenticated owner | service role |
|---|---|---|---|---|
| `Household` | 不可 | `SELECT` 可（所属世帯のみ） | `SELECT` 可 + `UPDATE` 可（所属世帯のみ） | 全操作可 |
| `HouseholdMember` | 不可 | `SELECT` 可（所属世帯のみ） | `SELECT/INSERT/UPDATE/DELETE` 可（所属世帯のみ） | 全操作可 |
| `HouseholdInviteCode` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属世帯のみ） | 同左 | 全操作可 |
| `Pet` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属世帯のみ） | 同左 | 全操作可 |
| `PetPhoto` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetEmergencyInfo` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetMedicalRecord` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetMedication` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetVaccination` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetEmergencyToken` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetCoreMetricEntry` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetLabResultEntry` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| `PetHealthExtensionEntry` | 不可 | `SELECT/INSERT/UPDATE/DELETE` 可（所属ペットのみ） | 同左 | 全操作可 |
| RPC `get_public_emergency_by_token(uuid)` | `EXECUTE` 可 | `EXECUTE` 可 | `EXECUTE` 可 | 実行可 |

## ルール要点
- 世帯所属判定は `public.is_household_member(target_household_id)` を共通利用。
- `Household` 更新と `HouseholdMember` 管理は OWNER のみ許可。
- `Pet*` 系テーブルは、`Pet` を介した世帯所属チェックでアクセス制御。
- 公開緊急参照は `security definer` RPC 経由のみを許可し、返却列を最小化。

## 実装上の注意
- アプリの非公開画面/API は `middleware.ts` で認証Cookie有無をチェック。
- APIの多くは Prisma 直アクセスのため、運用では「API層の認可チェック」と「DB層(RLS)」を二重で担保する方針が安全。
