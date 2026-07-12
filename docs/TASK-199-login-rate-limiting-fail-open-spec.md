# TASK-199: ログインAPIのレート制限とFail-Open実装

## 概要

ブルートフォース防止のためログイン・サインアップ・公開緊急APIにレート制限をかけ、障害時はFail-Open動作にする。

## 背景

セキュリティ設計書（docs/design/06_security_design.md）にて、以下の重大な課題が特定されている：

- ログインAPIのレート制限なし（深刻度: High、対応期限: ローンチ前）
- ブルートフォース攻撃によるアカウント乗っ取りリスク
- DoS攻撃によるサービス可用性への影響

## 仕様

### 1. レート制限ポリシー

#### エンドポイント別制限

| エンドポイント | 制限 | 適用対象 | 理由 |
|---|---|---|---|
| `POST /api/auth/login` | 10 req/min | IPアドレス | ブルートフォース防止 |
| `POST /api/auth/signup` | 5 req/min | IPアドレス | スパム登録防止 |
| `GET /api/public/emergency/:token` | 60 req/min | IPアドレス | DoS防止（緊急時可用性確保） |

#### 制限アルゴリズム

- **方式**: スライディングウィンドウ（Sliding Window Counter）
- **精度**: 高精度（固定ウィンドウの境界問題を回避）
- **データストア**: Upstash Redis (Serverless Redis)

### 2. クライアントIPの抽出方針

Vercel等のエッジ環境やリバースプロキシを経由する場合、ヘッダー偽装のリスクを回避するため、以下の優先順位でクライアントIPを取得する。

#### 優先順位

1. `x-forwarded-for` ヘッダーの最左端のIP（プロキシ経由時の送信元）
2. `x-real-ip` ヘッダー
3. 接続情報（`request.ip` または `socket.remoteAddress`）

#### 実装仕様

```typescript
function getClientIp(req: Request): string {
  // x-forwarded-for ヘッダーがある場合、最左端のIPを使用
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  
  // x-real-ip ヘッダーがある場合
  const realIp = req.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  
  // フォールバック（開発環境等）
  return "127.0.0.1"
}
```

#### セキュリティ考慮事項

- `x-forwarded-for` の改ざんを防ぐため、プロキシ信頼リストの制御を検討
- 本番環境ではVercelの信頼できるプロキシ経由のみ許可

### 3. Fail-Open実装

#### 方針

Upstash Redis との通信タイムアウトや接続エラーが発生した場合、サービス全体の可用性を維持するため **Fail-Open（アクセス許可）** とする。

#### 理由

- 緊急公開APIは救急時に利用されるため、可用性が最優先
- Redis一時的な障害でサービス全体が停止することを防ぐ
- 攻撃者の窓口は一時的に広がるが、サービス停止よりはマシという判断

#### 実装仕様

```typescript
async function checkRateLimit(identifier: string, limit: number, window: string) {
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
    return { success, limit, reset, remaining, error: null }
  } catch (error) {
    // Fail-Open: エラー時はアクセス許可
    console.error("Rate Limit Store Error (Fail-Open active):", error)
    
    // 監視ツールへ警告（Sentry等）
    // Sentry.captureException(error, {
    //   tags: { component: "rate-limit", action: "fail-open" }
    // })
    
    return { 
      success: true, 
      limit, 
      reset: Date.now() + 60000, 
      remaining: limit - 1,
      error: "RATE_LIMIT_STORE_ERROR" 
    }
  }
}
```

#### 監視要件

- Fail-Open発動時は即時アラート（Sev2: Slack #on-call）
- 定期的にRedis接続状態をヘルスチェック
- Fail-Open頻度が異常に高い場合は手動対応

### 4. アーキテクチャ

#### コンポーネント構成

```
┌─────────────────────────────────────────┐
│  API Route Handler                       │
│  (login/signup/public-emergency)        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Rate Limit Middleware                  │
│  - IP抽出                               │
│  - Redis制限チェック                     │
│  - Fail-Openハンドリング                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Upstash Redis                           │
│  - スライディングウィンドウカウンタ      │
│  - 分布式ロック（必要に応じて）          │
└─────────────────────────────────────────┘
```

#### ディレクトリ構成

```
src/
├── lib/
│   ├── rate-limit/
│   │   ├── index.ts           # メインエクスポート
│   │   ├── client.ts          # Upstash Redisクライアント
│   │   ├── middleware.ts      # レート制限ミドルウェア
│   │   ├── ip-extractor.ts    # IP抽出ロジック
│   │   └── types.ts           # 型定義
└── app/
    └── api/
        ├── auth/
        │   ├── login/
        │   │   └── route.ts    # レート制限適用
        │   └── signup/
        │       └── route.ts    # レート制限適用
        └── public/
            └── emergency/
                └── [token]/
                    └── route.ts # レート制限適用
```

### 5. API仕様

#### レート制限超過時のレスポンス

```typescript
// HTTP 429 Too Many Requests
{
  error: "Too many requests",
  message: "リクエスト数が制限を超えました。しばらく待ってから再試行してください。",
  retryAfter: 45,  // 秒単位
  limit: 10,
  remaining: 0,
  reset: 1720876800  // Unix timestamp
}
```

#### ヘッダー情報

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1720876800
Retry-After: 45
```

### 6. 環境変数

#### 必要な環境変数

```bash
# Upstash Redis REST API URL
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io

# Upstash Redis REST API Token
UPSTASH_REDIS_REST_TOKEN=AXXxxx...

# オプション: Redis接続タイムアウト（ミリ秒）
UPSTASH_REDIS_TIMEOUT=5000
```

#### 環境別設定

| 環境 | UPSTASH_REDIS_REST_URL | UPSTASH_REDIS_REST_TOKEN |
|---|---|---|
| 開発 | ローカルRedisまたはUpstash dev | テスト用トークン |
| ステージング | Upstash staging | Stagingトークン |
| 本番 | Upstash production | Productionトークン |

### 7. テスト計画

#### 7.1 単体テスト

##### IP抽出ロジックテスト

```typescript
describe('getClientIp', () => {
  it('x-forwarded-forヘッダーから最左端のIPを抽出する', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })
  
  it('x-real-ipヘッダーをフォールバックとして使用する', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-real-ip': '203.0.113.1' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })
  
  it('ヘッダーがない場合はデフォルトIPを返す', () => {
    const req = new Request('http://example.com')
    expect(getClientIp(req)).toBe('127.0.0.1')
  })
})
```

##### Fail-Openロジックテスト

```typescript
describe('checkRateLimit with Fail-Open', () => {
  it('Redis接続エラー時にFail-Openする', async () => {
    // Redis接続をモックしてエラーを発生させる
    mockRedis.rejects(new Error('Connection failed'))
    
    const result = await checkRateLimit('test-ip', 10, '1 m')
    
    expect(result.success).toBe(true)
    expect(result.error).toBe('RATE_LIMIT_STORE_ERROR')
  })
  
  it('Fail-Open時に警告ログを出力する', async () => {
    const consoleSpy = vi.spyOn(console, 'error')
    mockRedis.rejects(new Error('Connection failed'))
    
    await checkRateLimit('test-ip', 10, '1 m')
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Rate Limit Store Error (Fail-Open active):',
      expect.any(Error)
    )
  })
})
```

#### 7.2 統合テスト

##### ログインAPIレート制限テスト

```typescript
describe('POST /api/auth/login rate limiting', () => {
  it('10回以内のリクエストは許可される', async () => {
    for (let i = 0; i < 10; i++) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
      expect(response.status).not.toBe(429)
    }
  })
  
  it('11回目のリクエストは429を返す', async () => {
    // 10回リクエストを送信
    for (let i = 0; i < 10; i++) {
      await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
    }
    
    // 11回目
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    })
    
    expect(response.status).toBe(429)
    const data = await response.json()
    expect(data.error).toBe('Too many requests')
  })
  
  it('異なるIPからのリクエストは独立してカウントされる', async () => {
    // IP1から10回リクエスト
    for (let i = 0; i < 10; i++) {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.0.2.1' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
    }
    
    // IP2からのリクエストは許可される
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': '192.0.2.2' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    })
    
    expect(response.status).not.toBe(429)
  })
})
```

##### サインアップAPIレート制限テスト

```typescript
describe('POST /api/auth/signup rate limiting', () => {
  it('5回以内のリクエストは許可される', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ 
          email: `test${i}@example.com`, 
          password: 'password123' 
        })
      })
      expect(response.status).not.toBe(429)
    }
  })
  
  it('6回目のリクエストは429を返す', async () => {
    // 5回リクエストを送信
    for (let i = 0; i < 5; i++) {
      await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ 
          email: `test${i}@example.com`, 
          password: 'password123' 
        })
      })
    }
    
    // 6回目
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test5@example.com', 
        password: 'password123' 
      })
    })
    
    expect(response.status).toBe(429)
  })
})
```

##### 公開緊急APIレート制限テスト

```typescript
describe('GET /api/public/emergency/:token rate limiting', () => {
  it('60回以内のリクエストは許可される', async () => {
    for (let i = 0; i < 60; i++) {
      const response = await fetch('/api/public/emergency/test-token')
      expect(response.status).not.toBe(429)
    }
  })
  
  it('61回目のリクエストは429を返す', async () => {
    // 60回リクエストを送信
    for (let i = 0; i < 60; i++) {
      await fetch('/api/public/emergency/test-token')
    }
    
    // 61回目
    const response = await fetch('/api/public/emergency/test-token')
    expect(response.status).toBe(429)
  })
})
```

##### Fail-Open統合テスト

```typescript
describe('Fail-Open behavior', () => {
  it('Redis接続エラー時にAPIが利用可能である', async () => {
    // Redis接続を切断
    await disconnectRedis()
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    })
    
    // 429ではなく、通常のレスポンス（200または認証エラー）が返る
    expect(response.status).not.toBe(429)
    expect(response.status).not.toBe(500)
  })
  
  it('Fail-Open時に適切なログが出力される', async () => {
    const logSpy = vi.spyOn(console, 'error')
    await disconnectRedis()
    
    await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' })
    })
    
    expect(logSpy).toHaveBeenCalledWith(
      'Rate Limit Store Error (Fail-Open active):',
      expect.any(Error)
    )
  })
})
```

#### 7.3 E2Eテスト

##### ユーザーフローテスト

```typescript
describe('Rate limiting E2E', () => {
  it('ユーザーはレート制限を超えると適切なエラーメッセージを見る', async () => {
    await page.goto('/login')
    
    // 11回ログインを試行
    for (let i = 0; i < 11; i++) {
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }
    
    // エラーメッセージが表示される
    const errorMessage = await page.textContent('[data-testid="error-message"]')
    expect(errorMessage).toContain('リクエスト数が制限を超えました')
  })
})
```

### 8. 実装順序

1. **Upstash Redisセットアップ**
   - Upstashプロジェクト作成
   - Redisデータベース作成
   - 環境変数設定

2. **依存パッケージ追加**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

3. **レート制限ライブラリ実装**
   - IP抽出ロジック
   - Redisクライアント初期化
   - レート制限チェック関数
   - Fail-Openハンドリング

4. **APIルートへの適用**
   - POST /api/auth/login
   - POST /api/auth/signup
   - GET /api/public/emergency/:token

5. **テスト実装**
   - 単体テスト
   - 統合テスト
   - E2Eテスト

6. **監視設定**
   - Sentryエラー通知
   - ログ出力確認

7. **検証**
   - Lint実行
   - テスト実行
   - 手動検証

### 9. 完了条件

- [x] x-forwarded-for から安全にIPを特定し、Upstash Redisを用いた1分間10回のログインレート制限を実装する
- [x] Redis接続エラー時でも、サービスを停止させずに Fail-Open（ログ警告出力のうえAPI通過）とする
- [x] レート制限およびFail-Open例外のVitest統合テストが通る
- [x] npm run lint が通る

### 10. 依存関係

なし

### 11. リスクと対策

#### リスク1: Upstash Redisの可用性
- **対策**: Fail-Open実装によりRedis障害時もサービス継続
- **監視**: Redis接続エラーを即時アラート

#### リスク2: IP偽装攻撃
- **対策**: x-forwarded-forヘッダーの最左端のみを使用（プロキシチェーン対応）
- **制限**: Vercelの信頼できるプロキシ経由のみ許可

#### リスク3: レート制限回避（複数IP）
- **対策**: IP単位での制限（ユーザー単位よりは緩いが、実装シンプル）
- **改善案**: 将来的にはユーザーID + IPの複合キーを検討

#### リスク4: 誤検知（正当なユーザーが制限される）
- **対策**: 制限値は妥当な範囲（ログイン10回/分は十分）
- **ユーザビリティ**: わかりやすいエラーメッセージと再試行可能時間の表示

### 12. 参考資料

- セキュリティ設計: docs/design/06_security_design.md
- Upstash Ratelimitドキュメント: https://upstash.com/docs/ratelimit/sdks/ts
- OWASP Rate Limiting: https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html
