# API Routes Design

実装中の `src/app/api/**/route.ts` に合わせた API 一覧です。

## 共通設計
- 保護APIは `middleware.ts` により認証Cookie前提でアクセス制御。
- 入力検証は Zod（`safeParse`）を利用。
- 業務データは Prisma 経由で Postgres を操作。
- 公開緊急APIのみ Supabase RPC（`get_public_emergency_by_token`）を利用。

## エンドポイント（実装準拠）

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Households
- `POST /api/households/invite-codes`
- `POST /api/households/join`

### Pets（基本）
- `GET /api/pets`
- `POST /api/pets`
- `GET /api/pets/:petId`

### Pets（緊急情報・QR）
- `PUT /api/pets/:petId/emergency-info`
- `GET /api/pets/:petId/qr-token`
- `POST /api/pets/:petId/qr-token`
- `DELETE /api/pets/:petId/qr-token`
- `GET /api/pets/:petId/qr-image`
- `GET /api/public/emergency/:token`（公開）

### Pets（写真）
- `GET /api/pets/:petId/photos`
- `POST /api/pets/:petId/photos`
- `POST /api/pets/:petId/photos/upload-url`

### Pets（医療・投薬・ワクチン）
- `GET /api/pets/:petId/medical-records`
- `POST /api/pets/:petId/medical-records`
- `GET /api/pets/:petId/medications`
- `POST /api/pets/:petId/medications`
- `POST /api/pets/:petId/medication-reminders`
- `GET /api/pets/:petId/vaccinations`
- `POST /api/pets/:petId/vaccinations`
- `PATCH /api/pets/:petId/vaccinations`

### Pets（健康トラッキング）
- `GET /api/pets/:petId/health/core-metrics`
- `POST /api/pets/:petId/health/core-metrics`
- `GET /api/pets/:petId/health/lab-results`
- `POST /api/pets/:petId/health/lab-results`
- `GET /api/pets/:petId/health/extensions`
- `POST /api/pets/:petId/health/extensions`
- `GET /api/pets/:petId/health/trends`

## 標準フロー（保護API）
1. `middleware.ts` で公開パスか判定、非公開なら認証Cookie確認
2. Route Handler で `params/body/query` を Zod 検証
3. 必要に応じて存在確認・権限関連チェック（世帯所属など）
4. Prisma で `SELECT/INSERT/UPDATE` 実行
5. 変換済み JSON を返却（`400/401/404/200/201`）
