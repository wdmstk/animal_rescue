# 06. セキュリティ設計

作成日: 2026-07-12 | バージョン: 1.0.0

---

## 目次
1. [セキュリティ設計原則](#1-セキュリティ設計原則)
2. [認証・認可設計](#2-認証認可設計)
3. [RBAC設計](#3-rbac設計)
4. [OWASP Top 10 対応](#4-owasp-top-10-対応)
5. [暗号化設計](#5-暗号化設計)
6. [監査ログ設計](#6-監査ログ設計)
7. [バックアップ・障害復旧](#7-バックアップ障害復旧)
8. [監視・アラート](#8-監視アラート)
9. [レート制限設計](#9-レート制限設計)
10. [秘密情報管理](#10-秘密情報管理)
11. [セキュリティレビュー結果](#11-セキュリティレビュー結果)

---

## 1. セキュリティ設計原則

### 設計の基本方針

| 原則 | 実装 |
|---|---|
| 最小権限 | RLS + アプリ層の認可チェック |
| 多層防御 | Middleware → Route Handler → DB(RLS) |
| 失敗安全 | エラー時はアクセス拒否（デフォルト拒否） |
| 暗号化 | 転送時（TLS 1.3）・保存時（AES-256） |
| 秘密情報管理 | 環境変数・シークレットマネージャ |
| 監査可能性 | 全重要操作のログ記録 |
| テナント分離 | 世帯単位での完全分離（RLS） |

### セキュリティ境界

```
[Public Internet]
        ↓ HTTPS (TLS 1.3)
[Vercel Edge / CDN]
        ↓
[Next.js Middleware]  ← 認証Cookie確認
        ↓ 認証済みリクエストのみ通過
[Route Handlers]      ← Zodバリデーション + 認可チェック
        ↓
[Supabase PostgreSQL] ← RLS（Row Level Security）
```

---

## 2. 認証・認可設計

### 認証メカニズム

**採用**: Supabase Auth（JWT ベース）

```
認証フロー:
1. ユーザーがログイン（メール・パスワード）
2. Supabase Auth が JWT を発行
3. JWT が sb-* Cookie に保存（HttpOnly, Secure, SameSite=Lax）
4. 以降のリクエストで Cookie を自動送信
5. Route Handler で supabase.auth.getUser() で検証
```

**JWT の設定**:
```
有効期限: 1時間（Supabase デフォルト）
リフレッシュトークン: 7日間
HttpOnly: true（JavaScript からアクセス不可）
Secure: true（HTTPS のみ）
SameSite: Lax
```

**セキュリティリスクと対策**:
```
リスク: CSRF攻撃
対策: SameSite=Lax Cookie + Supabase の CSRF 対策

リスク: セッションハイジャック
対策: HttpOnly Cookie + HTTPS 強制

リスク: 長期間ログイン維持によるリスク
対策: 1時間ごとのトークンリフレッシュ
```

### 認可メカニズム（多層防御）

**Layer 1: Middleware（最初の防衛線）**
```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const publicPaths = ['/login', '/signup', '/e/*', '/api/public/*']
  if (isPublicPath(req.pathname, publicPaths)) return NextResponse.next()
  
  const token = req.cookies.get('sb-*')
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  
  return NextResponse.next()
}
```

**Layer 2: Route Handler（ビジネスロジック防衛）**
```typescript
// 全保護APIに以下を実装
const { data: { user } } = await supabase.auth.getUser()
if (!user) return unauthorized()

// リソース所有チェック
const pet = await prisma.pet.findFirst({
  where: {
    id: petId,
    household: { members: { some: { userId: user.id } } }
  }
})
if (!pet) return notFound()  // 404を返す（403は情報漏洩リスク）
```

**Layer 3: Database RLS**
```sql
-- 世帯所属チェック関数
CREATE FUNCTION is_household_member(target_household_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "HouseholdMember"
    WHERE "householdId" = target_household_id
    AND "userId" = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- Pet テーブルのRLSポリシー例
CREATE POLICY "household_members_can_access_pets"
ON "Pet" FOR ALL
USING (
  is_household_member("householdId")
);
```

---

## 3. RBAC設計

### ロール定義

| ロール | 定義 | 権限 |
|---|---|---|
| `anon` | 未ログインユーザー | 公開APIのみ（/api/public/*） |
| `FAMILY` | 世帯メンバー | ペット・医療記録の閲覧・作成・編集 |
| `OWNER` | 世帯オーナー | FAMILY権限 + メンバー管理・世帯設定 |
| `service_role` | システム内部処理 | 全操作（RLSバイパス可） |
| `admin` | 運営管理者 | 管理画面（未実装）|

### 認可マトリクス（詳細版）

| 操作 | anon | FAMILY | OWNER | admin |
|---|---|---|---|---|
| ペット登録・編集・削除 | × | ○ | ○ | ○ |
| 緊急情報 閲覧・編集 | × | ○ | ○ | ○ |
| QRトークン発行・無効化 | × | ○ | ○ | ○ |
| 公開緊急情報 閲覧 | ○ | ○ | ○ | ○ |
| 家族招待コード発行 | × | × | ○ | ○ |
| メンバーロール変更 | × | × | ○ | ○ |
| メンバー除外 | × | × | ○ | ○ |
| 課金設定変更 | × | × | ○ | ○ |
| 世帯設定変更 | × | × | ○ | ○ |
| OWNER不在復旧 | × | 最古メンバーのみ | - | ○ |
| 管理画面アクセス | × | × | × | ○ |

### OWNERガード

```typescript
// OWNER降格防止（TASK-179）
// PATCH /api/households/members/:memberId
const ownerCount = await prisma.householdMember.count({
  where: { householdId, role: 'OWNER' }
})
if (ownerCount <= 1 && currentMember.role === 'OWNER' && newRole !== 'OWNER') {
  return NextResponse.json(
    { error: 'OWNERを0人にはできません' },
    { status: 409 }
  )
}
```

---

## 4. OWASP Top 10 対応

### A01: 壊れたアクセス制御（Broken Access Control）

**リスク**: 他ユーザーのペットデータへの不正アクセス

**対策**:
- 全保護APIで world帯所属チェック実施
- RLSで DB レベルでも分離
- petId が worldleaderのものかを必ず検証
- テスト: `tests/integration/pet-route.test.ts`（他ユーザーアクセス拒否を検証）

**残存リスク**:
- 管理者APIが未実装（実装時に適切な admin チェックが必要）
- サービスロールキーがクライアント側に漏洩した場合（環境変数管理で対応）

### A02: 暗号化の失敗（Cryptographic Failures）

**リスク**: 機密データの平文保存・転送

**対策**:
- 通信: TLS 1.3 強制（Vercel デフォルト）
- パスワード: Supabase Auth が bcrypt でハッシュ
- JWT: HS256 署名（Supabase 管理）
- ストレージ: Supabase Storage が保存時暗号化
- カード情報: Stripe が管理（自社保持なし）

**残存リスク**:
- ペット医療情報はDBに平文保存（暗号化カラム未実装）
- **改善案**: 医療情報の機密フィールドをアプリ層で暗号化（Phase 2）

### A03: インジェクション（Injection）

**リスク**: SQLインジェクション・NoSQLインジェクション

**対策**:
- 全DBアクセスが Prisma ORM 経由（パラメタライズドクエリ）
- Zod でユーザー入力を事前バリデーション
- RPC は `security definer` で実行環境を制御

**状態**: 良好（Prisma使用により SQLi リスクは最小化）

### A04: 安全でない設計（Insecure Design）

**リスク**: 設計段階でのセキュリティ欠陥

**対策**:
- 公開緊急APIは必要最小限のフィールドのみ返却
- QRトークンはUUID（推測困難）
- 緊急公開URLに内部IDを露出しない

**残存リスク**:
- QRトークンを再生成しない限り、トークンを知る第三者は引き続きアクセス可能
- **改善案**: トークンに有効期限を設ける（任意設定）

### A05: セキュリティの設定ミス（Security Misconfiguration）

**対策**:
- Supabase RLS を全テーブルで有効化
- SUPABASE_SERVICE_ROLE_KEY はサーバーのみ
- 本番環境でデバッグ情報を非表示

**チェックリスト**:
- [ ] Supabase ダッシュボードで全テーブルの RLS 有効を確認
- [ ] anon key の権限が最小限であることを確認
- [ ] 不要なSupabase機能（未使用バケット等）を無効化

### A06: 脆弱なコンポーネント（Vulnerable Components）

**対策**:
- 依存パッケージの週次監視（npm audit）
- GitHub Dependabot の有効化推奨
- OSSライセンスの確認

**現状**:
```bash
npm audit  # 定期実行必須
```

### A07: 認証の失敗（Authentication Failures）

**対策**:
- レート制限（ログインAPIに適用 → 現状は未実装）
- 失敗時のエラーメッセージは詳細を開示しない（「メールまたはパスワードが正しくありません」）
- HttpOnly Cookie でトークンを保護

**残存リスク**:
- ログインAPIにレート制限が未実装
- **改善案**: 5回失敗で30分ロック + Captcha

### A08: ソフトウェアとデータの整合性の失敗

**対策**:
- Stripe Webhook の署名検証
- Supabase からの JWT 検証

### A09: セキュリティログとモニタリングの失敗

**現状の問題**:
- 監査ログが一部しかDBに保存されていない
- セキュリティイベントの自動アラートがない

**改善案**:
- `AuditLog` テーブルに全操作を記録（04_domain_model.md 参照）
- 異常なアクセスパターン検知のアラート設定

### A10: サーバーサイドリクエストフォージェリ（SSRF）

**現状**: OCR API呼び出し時にユーザー指定URLを使用しない設計のため、リスクは低い

---

## 5. 暗号化設計

### 転送時暗号化

```
プロトコル: TLS 1.3（Vercelデフォルト）
証明書: Vercel自動管理
HSTS: Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 保存時暗号化

```
PostgreSQL（Supabase）:
  - インフラレベルの暗号化（AES-256）
  - アプリレベルの暗号化: 未実装（Phase 2で検討）

Supabase Storage:
  - S3互換・保存時暗号化有効

バックアップ:
  - 暗号化バックアップを使用
```

### 機密フィールドの取り扱い

```
現在の状態:
  - ペット医療情報: 平文でDB保存
  - 電話番号: 平文でDB保存
  - 保険番号: 平文でDB保存（未実装）

推奨（Phase 2）:
  - 特に機密性の高いフィールド（例: 保険証券番号）は
    アプリ層で AES-256-GCM で暗号化してDB保存
  - 暗号化キーはシークレットマネージャで管理
```

---

## 6. 監査ログ設計

### ログ記録対象（設計）

| イベント | 重要度 | 記録項目 |
|---|---|---|
| ログイン成功 | Info | userId, ipAddress, timestamp |
| ログイン失敗 | Warning | email, ipAddress, timestamp, reason |
| ペット作成・削除 | Info | userId, petId, petName, householdId |
| 緊急情報更新 | High | userId, petId, changedFields |
| QRトークン操作 | High | userId, petId, action (create/rotate/deactivate) |
| 緊急公開閲覧 | Info | token, ipAddress, timestamp |
| メンバー権限変更 | High | operatorId, targetMemberId, oldRole, newRole |
| OWNER復旧 | Critical | triggeredByUserId, recoveredUserId, householdId |
| Stripe課金イベント | High | eventId, eventType, householdId, status |

### ログの保持期間

```
通常ログ: 1年
セキュリティイベント: 3年（法的要件）
課金・会計ログ: 7年（会計法）
```

---

## 7. バックアップ・障害復旧

### バックアップ戦略

```
Supabase Point-in-Time Recovery (PITR):
  - 有料プランで有効化必須
  - RPO: 1秒以内（WALログ）
  - 保持期間: 7日間（推奨）

定期バックアップ:
  - 日次フルバックアップ
  - 保持期間: 30日
  - 保存先: 別リージョン（冗長性確保）
```

### RTO/RPO目標

```
目標:
  RTO (Recovery Time Objective): 4時間
  RPO (Recovery Point Objective): 1時間

復旧優先順位:
  1. 認証システム
  2. 緊急公開API（最重要）
  3. ペット健康記録の閲覧
  4. 更新系API
  5. 管理・分析系
```

---

## 8. 監視・アラート

### 監視項目

```
インフラ監視:
  - APIレスポンスタイム（p95 < 500ms, p99 < 2000ms）
  - エラーレート（5xx < 0.1%）
  - 可用性（99.9%目標）

セキュリティ監視:
  - 認証失敗急増（5分間で100回超）
  - 同一IPからの異常なアクセス
  - 公開緊急APIへの異常なアクセス（不正スキャン検知）

課金監視:
  - Stripe Webhook 失敗
  - Checkout 失敗率上昇
  - 解約率の急増
```

### アラートレベル

| Level | 条件 | 通知先 | SLA |
|---|---|---|---|
| Sev1 | サービス全停止 / 緊急公開API障害 | 即時（電話・SMS） | 30分以内に初動 |
| Sev2 | 部分機能障害 / 高エラーレート | Slack（#on-call） | 1時間以内に初動 |
| Sev3 | パフォーマンス劣化 / 軽微エラー | Slack（#alerts） | 翌業務日 |

---

## 9. レート制限設計

### エンドポイント別レート制限

| エンドポイント | 制限 | 理由 |
|---|---|---|
| `POST /api/auth/login` | 10 req/min per IP | ブルートフォース防止 |
| `POST /api/auth/signup` | 5 req/min per IP | スパム登録防止 |
| `GET /api/public/emergency/:token` | 60 req/min per IP | DoS防止 |
| `POST /api/billing/webhook` | Stripe のみ | Stripe IP ホワイトリスト |
| その他保護API | 100 req/min per user | 一般的な制限 |

### 実装方法（詳細仕様）

本システムでは、APIの悪用やDoS攻撃を防ぐため、サーバーサイドで厳密なレート制限を行います。

#### 1. クライアントIPの厳密な抽出方針
Vercel等のエッジ環境やリバースプロキシを経由する場合、ヘッダー偽装のリスクを回避するため、以下の優先順位でクライアントIPを取得します。
1. `x-forwarded-for` ヘッダーの最左端のIP（プロキシ経由時の送信元）
2. `x-real-ip` ヘッダー
3. 接続情報（`request.ip` または `socket.remoteAddress`）

※ `x-forwarded-for` の改ざんを防ぐため、プロキシ信頼リストの制御またはヘッダーのサニタイズ処理をミドルウェア等で事前に行います。

#### 2. レート制限プロバイダと障害時のフォールバック（Fail-Open方針）
- **データストア**: Upstash Redis (Serverless Redis)
- **アルゴリズム**: スライディングウィンドウ（Sliding Window Counter）による高精度制限
- **フォールバック挙動 (Fail-Open)**:
  Upstash Redis との通信タイムアウトや接続エラーが発生した場合、サービス全体の可用性を維持するため **Fail-Open（アクセス許可）** とします。その際、エラーはサイレントでキャッチしつつ、監視ツール（Sentry等）に `RateLimitStoreConnectionError` の警告ログを出力し、エンジニアへ即時通知します。

#### 3. 実装モックコード
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Redis クライアント初期化（環境変数経由）
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// スライディングウィンドウによる制限定義
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
})

export async function checkRateLimit(req: Request, limitType: "login" | "signup" | "public") {
  // IPの抽出
  const forwardedFor = req.headers.get("x-forwarded-for")
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1"
  
  const key = `ratelimit:${limitType}:${ip}`
  
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(key)
    return { success, limit, reset, remaining }
  } catch (error) {
    // 接続エラー時の Fail-Open
    console.error("Rate Limit Store Error (Fail-Open active):", error)
    // Sentry.captureException(error)
    return { success: true, limit: 10, reset: 0, remaining: 9 }
  }
}
```

---

## 10. 秘密情報管理

### 環境変数分類

```
公開可（クライアント側で使用可）:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

機密（サーバーのみ）:
  SUPABASE_SERVICE_ROLE_KEY  ← 絶対にクライアント公開禁止
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  DATABASE_URL
  OCR_API_KEY

ローカル専用:
  .env.local（gitignore済み）
  本番は Vercel Environment Variables
```

### ローテーション計画

| 秘密情報 | ローテーション周期 | 担当 |
|---|---|---|
| Stripe Secret Key | 年次または侵害時 | 技術担当 |
| Supabase Service Role Key | 四半期または侵害時 | 技術担当 |
| データベースパスワード | 年次または侵害時 | 技術担当 |
| Webhook Secret | 侵害時のみ | 技術担当 |

---

## 11. セキュリティレビュー結果

### 現状の強み
- RLS + アプリ層の二重認可チェック
- Stripe Webhook の署名検証
- security definer RPC での公開情報の最小化
- HttpOnly Cookie での JWT 保護
- 全DBアクセスが Prisma 経由（SQLi 対策）
- テスト（integration）で認可境界を検証済み

### 重大な課題（要対応）

| 課題 | 深刻度 | 対応期限 | 対応内容 |
|---|---|---|---|
| ログインAPIのレート制限なし | High | ローンチ前 | Upstash Rate Limit実装 |
| 監査ログが不完全 | High | ローンチ前 | AuditLogテーブル整備 |
| OWNER復旧時の追加認証なし | Medium | ローンチ前 | パスワード再確認を追加 |
| パスワードリセット未実装 | High | ローンチ前 | Supabase Auth のResetAPI使用 |
| 医療情報の平文保存 | Medium | Phase 2 | アプリ層暗号化 |
| セキュリティヘッダーの確認 | Medium | ローンチ前 | Content-Security-Policy等 |

### 推奨セキュリティヘッダー

```typescript
// next.config.ts に追加
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js のため必要
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com",
      "frame-src https://js.stripe.com",
    ].join('; ')
  }
]
```
