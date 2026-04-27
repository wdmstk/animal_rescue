# 画面導線（MVP）

実装中の Next.js ルーティング（`src/app`）と `middleware.ts` の認証分岐を基準にした画面導線です。

```mermaid
flowchart TD
  A[アクセス開始] --> B{公開パスか}

  B -->|Yes| C{どのURLか}
  B -->|No| D{認証Cookieあり}

  D -->|No| L[/login]
  D -->|Yes| E{どのURLか}

  C -->|/login| L
  C -->|/signup| S[/signup]
  C -->|/e/:token| P[/e/:token]
  C -->|/api/public/*| AP[公開API]

  E -->|/| H[/ -> /petsへリダイレクト]
  E -->|/pets| F[/pets]
  E -->|/pets/:petId| G[/pets/:petId]
  E -->|/invite/join| I[/invite/join]

  L -->|ログイン成功| F
  L -->|新規登録へ| S
  S -->|登録後ログインへ| L
  F -->|ペット選択| G
  G -->|ヘッダー操作| F
  G -->|緊急情報を確認| P

  P -->|トークン不正/失効| N[404 Not Found]
```

## 主要シナリオ
- ログイン前ユーザー: `/pets` など保護ページへアクセスすると `/login` へ遷移。
- ログイン後ユーザー: `/` アクセス時は `/pets` へリダイレクト。
- ペット管理: `/pets` 一覧から `/pets/:petId` 詳細へ遷移し、各管理UI（写真/緊急情報/投薬/ワクチン/健康記録）を操作。
- QR公開閲覧: `/e/:token` は匿名アクセス可能。トークンが不正または無効なら 404。

## 関連ルート
- 画面: `/login`, `/signup`, `/pets`, `/pets/:petId`, `/invite/join`, `/e/:token`
- API: `/api/auth/*`, `/api/pets/*`, `/api/households/*`, `/api/public/emergency/:token`
