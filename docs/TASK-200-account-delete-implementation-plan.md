# TASK-200: アカウント削除（退会）機能実装計画

## 概要
ユーザーがアカウントと全データ、およびStripeサブスクリプションを即時キャンセル・物理消去する機能を実装する。

## 現状分析

### 既存構造
- **Account API**: `/api/account` (GET/PATCH) - 認証済みユーザー情報の取得・更新
- **Billing**: Stripe統合、`UserSubscription`モデルでサブスクリプション管理
- **Household**: 世帯単位でメンバー管理（OWNER/FAMILYロール）
- **Prisma Schema**: ほとんどのリレーションで`onDelete: Cascade`が設定済み
- **Settings UI**: `/settings` ページでアカウント・課金・家族情報を管理

### データ削除カスケード構造
```
User (Supabase Auth)
  ↓
HouseholdMember (onDelete: Cascade)
  ↓
Household (members: HouseholdMember[])
  ↓
Pet (onDelete: Cascade)
  ↓
  ├─ PetPhoto (onDelete: Cascade)
  ├─ PetEmergencyInfo (onDelete: Cascade)
  ├─ PetMedicalRecord (onDelete: Cascade)
  ├─ PetMedicalDocument (onDelete: Cascade)
  ├─ PetMedication (onDelete: Cascade)
  ├─ PetVaccination (onDelete: Cascade)
  ├─ PetEmergencyToken (onDelete: Cascade)
  ├─ PetDisplaySettings (onDelete: Cascade)
  ├─ PetMedicationReminderDispatchLog (onDelete: Cascade)
  ├─ PetCoreMetricEntry (onDelete: Cascade)
  ├─ PetLabResultEntry (onDelete: Cascade)
  └─ PetHealthExtensionEntry (onDelete: Cascade)

その他関連データ:
  ├─ UserSubscription (userId: unique)
  ├─ OwnerDisplaySettings (ownerUserId: unique)
  ├─ OwnerProfile (ownerUserId: unique)
  └─ HouseholdInviteCode (onDelete: Cascade)
```

## 実装仕様

### 1. DELETE /api/account エンドポイント

#### リクエスト
- Method: `DELETE`
- Authentication: 必須
- Body: なし

#### レスポンス
- 成功時: `200 OK` `{ ok: true }`
- 失敗時:
  - `401 Unauthorized`: 未認証
  - `409 Conflict`: 最後のOWNERが他メンバーを残して削除しようとした場合
  - `500 Internal Server Error`: その他のエラー

#### 処理フロー
1. 認証ユーザーの取得
2. ユーザーが属する世帯のメンバー情報を取得
3. OWNER削除ガードチェック（詳細は後述）
4. Stripeサブスクリプションのキャンセル
5. Prismaによる関連データの削除
6. Supabase Authユーザーの削除
7. 成功レスポンスを返す

### 2. OWNER削除ガード

#### 条件
- ユーザーがOWNERロールである
- 世帯内に他のメンバーが存在する
- 世帯内のOWNER数が1人（削除対象ユーザーのみ）

#### エラーレスポンス
```json
{
  "error": "最後のOWNERは、他のメンバーがいる世帯を削除できません。先に権限を移譲するか、メンバーを削除してください。"
}
```

### 3. Stripeサブスクリプションキャンセル

#### 実装方法
```typescript
const subscription = await prisma.userSubscription.findUnique({
  where: { userId: user.id },
  select: { stripeCustomerId: true, stripeSubscriptionId: true }
});

if (subscription?.stripeSubscriptionId) {
  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
}
```

#### エラーハンドリング
- Stripe APIエラー発生時はログに出力し、処理を継続する（データ削除を優先）
- サブスクリプションがない場合はスキップ

### 4. Prismaデータ削除

#### 削除順序
1. `UserSubscription` (userIdベース)
2. `OwnerDisplaySettings` (ownerUserIdベース)
3. `OwnerProfile` (ownerUserIdベース)
4. `HouseholdMember` (userIdベース - これによりHouseholdがカスケード削除される)

#### 実装方法
```typescript
await prisma.$transaction([
  prisma.userSubscription.deleteMany({ where: { userId: user.id } }),
  prisma.ownerDisplaySettings.deleteMany({ where: { ownerUserId: user.id } }),
  prisma.ownerProfile.deleteMany({ where: { ownerUserId: user.id } }),
  prisma.householdMember.deleteMany({ where: { userId: user.id } })
]);
```

### 5. Supabase Authユーザー削除

#### 実装方法
```typescript
const supabaseAdmin = createSupabaseAdminClient();
await supabaseAdmin.auth.admin.deleteUser(user.id);
```

#### エラーハンドリング
- Auth削除失敗時はログに出力し、DB削除が成功していればAPI成功を返す
- 理由: DBデータが削除されていれば、Authユーザーは実質的に無効化されている

### 6. UI実装

#### 設定画面への追加
- セクション: 「アカウント削除（退会）」
- 配置: ログイン情報セクションの直下
- UI要素:
  - 警告文（赤色背景）
  - 削除ボタン（赤色、危険操作感）
  - 確認ダイアログ（既存の`window.confirm`を一時使用、TASK-191でカスタムダイアログへ置換）

#### 確認ダイアログ内容
```
アカウントを削除すると、以下のデータが完全に消去されます：
・全てのペット情報
・全ての医療記録
・全ての写真
・世帯情報
・サブスクリプション（即時キャンセル）

この操作は取り消せません。本当に削除しますか？
```

## テスト計画

### 統合テスト (tests/integration/account-route.test.ts)

#### テストケース
1. **正常系**: 単独メンバーのOWNERがアカウント削除
   - 準備: 1世帯1メンバー（OWNER）を作成
   - 実行: DELETE /api/account
   - 検証: 200 OK、関連データが削除されている

2. **正常系**: 複数メンバーのFAMILYがアカウント削除
   - 準備: 1世帯2メンバー（OWNER + FAMILY）を作成
   - 実行: FAMILYユーザーでDELETE /api/account
   - 検証: 200 OK、FAMILYメンバーのみ削除、世帯・OWNER・ペットは残存

3. **異常系**: 最後のOWNERが他メンバーを残して削除
   - 準備: 1世帯2メンバー（OWNER + FAMILY）を作成
   - 実行: OWNERユーザーでDELETE /api/account
   - 検証: 409 Conflict、適切なエラーメッセージ

4. **異常系**: 未認証ユーザーが削除試行
   - 準備: 認証なし
   - 実行: DELETE /api/account
   - 検証: 401 Unauthorized

5. **正常系**: Stripeサブスクリプションありの削除
   - 準備: サブスクリプション付きユーザーを作成
   - 実行: DELETE /api/account
   - 検証: 200 OK、Stripe APIが呼ばれる

### E2Eテスト (tests/e2e/settings-account.spec.ts)

#### テストケース
1. **正常系**: 設定画面からのアカウント削除フロー
   - 準備: テストユーザーでログイン、/settings に遷移
   - 実行: 削除ボタンクリック → 確認ダイアログでOK
   - 検証: /login にリダイレクト、再ログイン失敗

2. **異常系**: 最後のOWNER削除のエラー表示
   - 準備: OWNER + FAMILYの世帯でログイン
   - 実行: 削除ボタンクリック → 確認ダイアログでOK
   - 検証: エラーメッセージ表示、データは削除されない

## 実装順序

1. **API実装**
   - DELETE /api/account エンドポイント実装
   - OWNER削除ガード実装
   - Stripeキャンセル実装
   - Prisma削除実装
   - Supabase Auth削除実装

2. **テスト実装**
   - 統合テスト追加
   - E2Eテスト追加

3. **UI実装**
   - 設定画面に削除セクション追加
   - 削除フロー実装

4. **検証**
   - Lint実行
   - テスト実行
   - 手動検証

## リスクと mitigations

### リスク1: Stripeキャンセル失敗
- **影響**: 課金が継続する可能性
- **Mitigation**: エラーログ記録、処理継続、後日手動対応

### リスク2: Supabase Auth削除失敗
- **影響**: Authユーザーが残存するがDBデータは削除済み
- **Mitigation**: DB削除優先、Auth削除失敗時はログ記録のみ

### リスク3: カスケード削除の不整合
- **影響**: 孤児データが残存
- **Mitigation**: Prismaトランザクション使用、既存のonDelete: Cascade設定を活用

### リスク4: 誤削除
- **影響**: ユーザーデータの完全消失
- **Mitigation**: 確認ダイアログ、警告文、赤色UI

## 依存関係
- なし（独立して実装可能）

## 完了条件
- `DELETE /api/account` が実装されている
- 唯一のOWNERが他メンバーを残した状態で削除を試みた場合、409エラーで防止する
- 退会時にStripe APIを通じて該当世帯のサブスクリプションを即時キャンセルする
- Prismaのカスケード削除で、関連するペット、投薬、タイムライン等のデータを物理削除する
- `supabase.auth.admin.deleteUser` を経由して認証情報自体も消去する
- `npx vitest run` / `npm run test:e2e` の正常退会テストが通る

## 今後の改善（別TASK）
- TASK-191: カスタム確認ダイアログ実装による`window.confirm`置換
- バックアップ/復元機能（別途検討）
- 削除待機期間の導入（別途検討）
