# 05. API設計（完全版）

作成日: 2026-07-12 | バージョン: 1.0.0

---

## 目次
1. [API設計原則](#1-api設計原則)
2. [エンドポイント一覧](#2-エンドポイント一覧)
3. [エンドポイント詳細](#3-エンドポイント詳細)
4. [共通仕様](#4-共通仕様)
5. [APIレビューと改善提案](#5-apiレビューと改善提案)

---

## 1. API設計原則

### RESTful 設計原則
- リソース指向URL（名詞を使用）
- HTTP動詞を正しく使用（GET/POST/PUT/PATCH/DELETE）
- 冪等性の確保（GET/PUT/DELETE）
- ステートレス

### エラーレスポンス統一（TASK-187実装済み）
```typescript
// src/lib/api-error.ts
const errorHandlers = {
  badRequest:      (msg?) => NextResponse.json({ error: msg ?? 'Bad Request' }, { status: 400 }),
  unauthorized:    ()     => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  forbidden:       ()     => NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
  notFound:        (msg?) => NextResponse.json({ error: msg ?? 'Not Found' }, { status: 404 }),
  paymentRequired: ()     => NextResponse.json({ error: 'Payment Required' }, { status: 402 }),
  serverError:     (msg?) => NextResponse.json({ error: msg ?? 'Internal Server Error' }, { status: 500 }),
}
```

### 認証フロー
```
全保護API共通:
1. middleware.ts がリクエストを受信
2. sb-* Cookie の存在確認
3. Cookie なし → 307 /login にリダイレクト
4. Route Handler でさらに supabase.auth.getUser() で検証
5. householdId / petId の所属チェック
6. 処理実行
```

### バリデーション
- 入力バリデーション: Zod（safeParse）
- 電話番号: 全角→半角正規化後にフォーマット検証
- UUID: `isUuid()` または Zod `uuid()` で検証
- 文字数制限: 各フィールドで明示（下記参照）

---

## 2. エンドポイント一覧

### 認証 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| POST | `/api/auth/login` | 不要 | ログイン |
| POST | `/api/auth/logout` | 必要 | ログアウト |
| POST | `/api/auth/signup` | 不要 | 新規登録 |
| POST | `/api/auth/reset-password-request` | 不要 | パスワードリセットメール送信 |
| POST | `/api/auth/reset-password` | 必要 (Temp JWT) | 新パスワード設定 |

### アカウント・設定 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/account` | 必要 | アカウント情報取得 |
| PATCH | `/api/account` | 必要 | 表示名・パスワード更新 |
| DELETE | `/api/account` | 必要 | アカウント削除（退会） |
| GET | `/api/settings/display` | 必要 | 表示設定取得 |
| PATCH | `/api/settings/display` | 必要 | 表示設定更新 |

### 世帯・家族 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| POST | `/api/households/invite-codes` | OWNER | 招待コード発行 |
| POST | `/api/households/join` | 必要 | 招待コードで参加 |
| GET | `/api/households/members` | 必要 | メンバー一覧取得 |
| PATCH | `/api/households/members/:memberId` | OWNER | メンバーロール変更 |
| DELETE | `/api/households/members/:memberId` | OWNER | メンバー除外 |
| POST | `/api/households/recover-owner` | 必要 | OWNER不在復旧 |

### ペット基本 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets` | 必要 | ペット一覧取得 |
| POST | `/api/pets` | 必要 | ペット新規作成 |
| GET | `/api/pets/:petId` | 必要 | ペット詳細取得 |
| PUT | `/api/pets/:petId` | 必要 | ペット情報更新 |
| DELETE | `/api/pets/:petId` | 必要 | ペット削除 |

### 緊急情報 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets/:petId/emergency-info` | 必要 | 緊急情報取得 |
| PUT | `/api/pets/:petId/emergency-info` | 必要 | 緊急情報更新 |
| GET | `/api/pets/:petId/qr-token` | 必要 | QRトークン取得（なければ自動発行） |
| POST | `/api/pets/:petId/qr-token` | 必要 | QRトークン再生成 |
| DELETE | `/api/pets/:petId/qr-token` | 必要 | QRトークン無効化 |
| GET | `/api/pets/:petId/qr-image` | 必要 | QR画像取得（PNG） |
| GET | `/api/public/emergency/:token` | 不要 | 公開緊急情報取得（QRスキャン後） |

### 写真 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets/:petId/photos` | 必要 | 写真一覧取得 |
| POST | `/api/pets/:petId/photos` | 必要 | 写真情報保存 |
| POST | `/api/pets/:petId/photos/upload-url` | 必要 | 署名付きアップロードURL取得 |
| DELETE | `/api/pets/:petId/photos/:photoId` | 必要 | 写真削除 |

### 医療記録 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets/:petId/medical-records` | 必要 | 医療記録一覧取得 |
| POST | `/api/pets/:petId/medical-records` | 必要 | 医療記録作成 |
| PUT | `/api/pets/:petId/medical-records/:recordId` | 必要 | 医療記録更新 |
| DELETE | `/api/pets/:petId/medical-records/:recordId` | 必要 | 医療記録削除 |
| GET | `/api/pets/:petId/medical-documents` | 必要 | 医療書類一覧取得 |
| POST | `/api/pets/:petId/medical-documents` | 必要 | 医療書類メタ保存 |
| POST | `/api/pets/:petId/medical-documents/upload-url` | 必要 | 書類アップロードURL取得 |
| POST | `/api/pets/:petId/medical-documents/:documentId/extract` | 必要 | OCR抽出実行 |

### 投薬管理 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets/:petId/medications` | 必要 | 投薬一覧取得 |
| POST | `/api/pets/:petId/medications` | 必要 | 投薬登録 |
| PUT | `/api/pets/:petId/medications/:medicationId` | 必要 | 投薬更新 |
| DELETE | `/api/pets/:petId/medications/:medicationId` | 必要 | 投薬削除 |
| POST | `/api/pets/:petId/medication-reminders` | 必要 | リマインダー設定 |
| GET | `/api/pets/:petId/medication-reminders` | 必要 | リマインダー一覧取得 |

### ワクチン管理 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets/:petId/vaccinations` | 必要 | ワクチン履歴取得 |
| POST | `/api/pets/:petId/vaccinations` | 必要 | ワクチン接種記録 |
| PATCH | `/api/pets/:petId/vaccinations/:vaccinationId` | 必要 | ワクチン記録更新 |
| DELETE | `/api/pets/:petId/vaccinations/:vaccinationId` | 必要 | ワクチン記録削除 |

### 健康トラッキング API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/pets/:petId/health/core-metrics` | 必要 | コアメトリクス一覧 |
| POST | `/api/pets/:petId/health/core-metrics` | 必要 | コアメトリクス記録 |
| GET | `/api/pets/:petId/health/lab-results` | 必要 | 検査値一覧 |
| POST | `/api/pets/:petId/health/lab-results` | 必要 | 検査値記録 |
| GET | `/api/pets/:petId/health/extensions` | 必要 | 拡張項目一覧 |
| POST | `/api/pets/:petId/health/extensions` | 必要 | 拡張項目記録 |
| GET | `/api/pets/:petId/health/trends` | 必要 | 推移データ取得 |

### 課金 API

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/billing/status` | 必要 | 課金ステータス取得 |
| POST | `/api/billing/checkout` | 必要 | Stripe Checkout開始 |
| POST | `/api/billing/portal` | 必要 | Stripe顧客ポータル遷移 |
| POST | `/api/billing/webhook` | Stripe署名 | Stripeイベント受信 |

---

## 3. エンドポイント詳細

### GET /api/public/emergency/:token（最重要）

**目的**: QRコードスキャン後に緊急情報を返す（認証不要）

**リクエスト**:
```
GET /api/public/emergency/550e8400-e29b-41d4-a716-446655440000
```

**レスポンス（200 OK）**:
```typescript
{
  data: {
    petName: string              // "チョコ"
    species: string              // "犬"
    breed: string                // "柴犬"
    sex: "MALE" | "FEMALE" | "UNKNOWN"
    ageYears: number | null
    weightKg: number | null
    photoUrl: string | null
    
    // 緊急情報（最重要）
    disease: string | null        // 持病（フリーテキスト）
    allergy: string | null        // アレルギー（フリーテキスト）
    currentMedications: string | null
    
    // かかりつけ病院
    vetName: string | null
    vetPhone: string | null       // "03-1234-5678"
    
    // 緊急連絡先
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    
    // 設定に応じた追加情報
    recentMedications?: MedicationSummary[]  // 最新3件
    recentVaccinations?: VaccinationSummary[]
    recentMedicalRecords?: MedicalRecordSummary[]
    
    updatedAt: string  // ISO8601
  }
}
```

**エラーレスポンス**:
```
400: UUID形式不正 {"error": "Invalid token format"}
404: トークン不明・失効 {"error": "Not Found"}
```

**セキュリティ要件**:
- Rate Limit: 60 req/min per IP
- 内部ペットID・世帯IDを露出しない
- security definer RPCで必要最小限のフィールドのみ返却

---

### PUT /api/pets/:petId/emergency-info

**目的**: 緊急情報を更新する

**認証**: 必要（世帯メンバー）

**リクエストボディ**:
```typescript
{
  disease?: string                   // 持病（最大1000文字）
  allergy?: string                   // アレルギー（最大1000文字）
  currentMedications?: string        // 現在の薬（最大1000文字）
  vetName?: string                   // 病院名（最大200文字）
  vetPhone?: string                  // 電話番号（正規化後: 000-0000-0000 形式）
  emergencyContactName?: string      // 緊急連絡先名（最大100文字）
  emergencyContactPhone?: string     // 電話番号（正規化後）
}
```

**バリデーションルール**:
```
vetPhone / emergencyContactPhone:
  - 全角数字・ハイフン → 半角に正規化
  - 形式: /^0\d{1,4}-\d{1,4}-\d{4}$/
  - または空文字（削除）
  - 不正な場合: 400 Bad Request
```

**レスポンス（200 OK）**:
```typescript
{
  data: PetEmergencyInfo
}
```

---

### POST /api/billing/webhook

**目的**: Stripe からのイベントを受信し、サブスクリプション状態をDBに反映

**認証**: Stripe-Signature ヘッダーで署名検証

**対応イベント**:
```
checkout.session.completed
  → subscriptionStatus = 'active'
  → stripeCustomerId, stripeSubscriptionId を保存

invoice.payment_succeeded
  → subscriptionStatus = 'active'

invoice.payment_failed
  → subscriptionStatus = 'past_due'

customer.subscription.deleted
  → subscriptionStatus = 'canceled'

customer.subscription.trial_will_end（3日前）
  → 通知メール送信（未実装）
```

**冪等性の確保**:
- Stripe Event ID をDBに記録
- 同一Event IDは再処理しない

---

### POST /api/auth/reset-password-request

**目的**: パスワードを忘れたユーザーに対して、パスワード再設定用のメールを送信する。

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "user@example.com"
}
```

**仕様とバリデーション**:
- `email`: 必須、形式検証（Zod `email()`）
- セキュリティ配慮: メールアドレスが登録されているかどうかにかかわらず、常に `200 OK` と「再設定メールを送信しました（登録がある場合）」という旨のメッセージを返す（ユーザー存在の有無を漏洩させないため）。
- 内部動作: Supabase Auth の `resetPasswordForEmail` を呼び出す。リダイレクト先は `/login/reset-password` に設定。

**レスポンス（200 OK）**:
```json
{
  "message": "If the email is registered, a password reset link has been sent."
}
```

---

### POST /api/auth/reset-password

**目的**: 再設定用リンク（Temp JWT）を使用してアクセスしたユーザーが、新しいパスワードを設定する。

**認証**: 必要（Supabase Authの回復フローセッションによる一時JWT。Next.js Server Actions または API Routeでのセッション認識を前提とする）

**リクエストボディ**:
```json
{
  "password": "NewSecurePassword123!"
}
```

**仕様とバリデーション**:
- `password`: 必須、8文字以上、半角英数字混合
- 内部動作: Supabase Auth の `updateUser({ password })` を呼び出す。

**レスポンス（200 OK）**:
```json
{
  "message": "Password updated successfully."
}
```

---

### DELETE /api/account

**目的**: アカウントを完全に削除し、退会する。世帯データの消去およびStripeサブスクリプションの即時キャンセルを実行する。

**認証**: 必要 (OWNER権限チェック含む)

**リクエストボディ**:
```json
{
  "confirm": true
}
```

**内部動作と制約ルール**:
1. **世帯内最後のOWNER確認**: 自身が所属世帯の最後のメンバー、または他のメンバーがいる場合は自分以外のOWNERが存在することを確認。自分が唯一のOWNERで他にメンバー（FAMILY）がいる場合、アカウント削除前に他のメンバーをOWNERに昇格させるか、世帯全体を解散（メンバー全員削除）させる必要がある（409衝突）。
2. **Stripe連携**: 削除対象ユーザーが世帯のStripeサブスクリプションを契約している場合、Stripe API を通じて `customer.subscription.cancel` を即時実行（即時キャンセル）。
3. **データ物理削除**: `Prisma` によりユーザーが所有するペットおよび関連データ（PetEmergencyInfo, PetMedication, PetCoreMetricEntry, etc.）を CASCADE で物理削除。
4. **Supabase Auth連携**: `supabase.auth.admin.deleteUser`（サービスロールキー使用）により、認証DBからもアカウントを完全に削除する。

**レスポンス（200 OK）**:
```json
{
  "message": "Account and all associated pet data deleted successfully."
}
```

---

## 4. 共通仕様

### 認証・認可フロー（全保護API）

```typescript
// 標準的なRoute Handler パターン
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  // 1. params の await（Next.js 15 対応）
  const { petId } = await params
  
  // 2. UUID バリデーション
  if (!isUuid(petId)) return badRequest('Invalid petId')
  
  // 3. 認証確認
  const supabase = createServerClient(/* ... */)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  
  // 4. ペットへのアクセス権確認（世帯所属チェック）
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      household: {
        members: { some: { userId: user.id } }
      }
    }
  })
  if (!pet) return notFound()
  
  // 5. 課金チェック（必要な場合）
  const billing = await getBillingStatus(user.id)
  if (!billing.canCreate) return paymentRequired()
  
  // 6. 処理実行
  // ...
}
```

### ページネーション
```typescript
// クエリパラメータ
?limit=20&cursor=<last_id>

// レスポンス
{
  data: T[]
  nextCursor: string | null
  total?: number  // コストが許す場合のみ
}
```

### 日時フォーマット
- 全てISO 8601 形式（`2026-07-12T12:00:00+09:00`）
- タイムゾーン: UTC で保存、表示はクライアントのローカルタイム

---

## 5. APIレビューと改善提案

### 現状の問題点

#### 問題1: 緊急情報APIのフィールド不足

**現状**: `PetEmergencyInfo` に血液型・夜間救急病院・保険情報がない
**影響**: 重篤な緊急事態での情報提供が不完全
**改善案**:
```typescript
// PUT /api/pets/:petId/emergency-info の追加フィールド
{
  bloodType?: string                  // 'DEA 1.1+' 等
  emergencyVetName?: string           // 夜間救急病院
  emergencyVetPhone?: string
  emergencyVetAddress?: string        // 地図リンク生成用
  emergencyContactName2?: string      // 第二緊急連絡先
  emergencyContactPhone2?: string
  insurerName?: string                // 保険会社
  policyNumber?: string               // 証券番号
  specialNotes?: string               // 特記事項
}
```

#### 問題2: 投薬記録（実施チェック）APIがない

**現状**: 投薬情報の登録はあるが、「今日飲んだ」チェック機能がない
**改善案**:
```
POST /api/pets/:petId/medications/:medicationId/logs
  body: { administeredAt: string, notes?: string }

GET /api/pets/:petId/medications/:medicationId/logs
  query: ?date=2026-07-12  (その日のログ一覧)
```

#### 問題3: ワクチン期限リマインダーAPIがない

**現状**: ワクチン次回接種日は登録できるが、リマインダー機能がない
**改善案**:
```
GET /api/pets/:petId/vaccinations/upcoming
  → 30日以内に期限を迎えるワクチン一覧
  → これをベースにリマインダーcronを実装
```

#### 問題4: 管理者APIが未設計

**現状**: 管理画面が未実装のため、管理者APIも未定義
**改善案（設計）**:
```
GET /api/admin/users              管理者のみ
GET /api/admin/subscriptions      管理者のみ
GET /api/admin/audit-logs         管理者のみ
POST /api/admin/announcements     管理者のみ
```

### 採用した設計方針の理由

**Prisma vs 直接Supabase クライアント**:
- 採用: Prisma（型安全・マイグレーション管理）
- 例外: 公開緊急API（Supabase RPC を使用）
- 理由: RPCで security definer 関数を使い、返却フィールドをDB層で制限することでセキュリティ向上

**Optimistic Update vs Server State**:
- 採用: Server State（fetch-on-mutation）
- 理由: 医療情報は正確性が最優先。楽観的更新でのデータ不整合リスクを避ける
- トレードオフ: UIのレスポンスが若干遅くなる
