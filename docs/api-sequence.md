# APIフロー図（シーケンス）

実装中の Route Handler / Service / Supabase(RPC) / Prisma の呼び出し関係を、主要ユースケースごとに整理します。

## 1. コア健康記録の登録（保護API）

対象: `POST /api/pets/:petId/health/core-metrics`

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant M as Next.js Middleware
  participant R as Route Handler
  participant V as Zod Validator
  participant P as Prisma
  participant DB as Postgres

  U->>M: POST /api/pets/:petId/health/core-metrics
  alt sb-* Cookieなし
    M-->>U: 307 Redirect /login
  else Cookieあり
    M->>R: 通過
    R->>V: petId/body を safeParse
    alt 入力不正
      R-->>U: 400 Bad Request
    else 入力正常
      R->>P: petCoreMetricEntry.create(...)
      P->>DB: INSERT
      DB-->>P: Created row
      P-->>R: Created model
      R-->>U: 201 + JSON
    end
  end
```

## 2. 招待コード参加

対象: `POST /api/households/join`

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant M as Next.js Middleware
  participant R as Route Handler
  participant S as Supabase Auth (SSR Client)
  participant P as Prisma
  participant DB as Postgres

  U->>M: POST /api/households/join
  M->>R: 通過（認証Cookieあり）
  R->>S: auth.getUser()
  alt 未認証
    R-->>U: 401 認証が必要
  else 認証済み
    R->>P: householdInviteCode.findUnique(code)
    P->>DB: SELECT invite
    DB-->>P: invite row/null
    alt 招待コード無効 or 期限切れ or 使用済み
      R-->>U: 400 招待コードが無効
    else 有効
      R->>P: $transaction([member.create, invite.update])
      P->>DB: INSERT HouseholdMember + UPDATE HouseholdInviteCode
      DB-->>P: commit
      R-->>U: 200 { ok: true }
    end
  end
```

## 3. 公開緊急情報の取得（匿名）

対象: `GET /api/public/emergency/:token`

```mermaid
sequenceDiagram
  participant U as Browser/Scanner
  participant R as Public Route Handler
  participant V as Token Validator
  participant Q as Service(getPublicEmergencyByToken)
  participant SB as Supabase RPC Client
  participant DB as Postgres RPC

  U->>R: GET /api/public/emergency/:token
  R->>V: isEmergencyToken(token)
  alt UUID形式不正
    R-->>U: 400 Invalid token
  else 形式正常
    R->>Q: getPublicEmergencyByToken(token)
    Q->>SB: rpc("get_public_emergency_by_token", { input_token })
    SB->>DB: execute security definer RPC
    DB-->>SB: row[] (active tokenのみ)
    SB-->>Q: data/error
    alt rowなし
      R-->>U: 404 Not found
    else rowあり
      Q-->>R: EmergencyViewPayload
      R-->>U: 200 { data }
    end
  end
```

## 補足
- 認証ガードは `middleware.ts` で実施（`/login`, `/e/*`, `/api/public/*` は公開）。
- 非公開APIのドメイン操作は主に Prisma 経由で実装。
- 公開緊急情報は Supabase RPC `get_public_emergency_by_token` を経由し、返却項目を最小化。
