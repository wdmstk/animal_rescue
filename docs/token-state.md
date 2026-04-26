# 公開トークン状態遷移図

対象: `PetEmergencyToken`（`/api/pets/:petId/qr-token`, `/api/public/emergency/:token`）

```mermaid
stateDiagram-v2
  [*] --> Unissued: 初期状態（レコードなし）

  Unissued --> Active: GET /api/pets/:petId/qr-token\n(存在しなければ新規作成)
  Active --> Active: GET /api/pets/:petId/qr-token\n(既存トークン返却)
  Active --> Rotated: POST /api/pets/:petId/qr-token\n(新UUIDへ更新, rotatedAt設定)
  Rotated --> Active: 更新完了

  Active --> Inactive: DELETE /api/pets/:petId/qr-token\n(isActive=false)
  Rotated --> Inactive: DELETE /api/pets/:petId/qr-token\n(isActive=false)

  Inactive --> Active: POST /api/pets/:petId/qr-token\n(再発行時に isActive=true)
```

## 遷移ルール
- `GET /api/pets/:petId/qr-token`
  - レコードなし: 新規発行して `isActive=true`
  - レコードあり: 既存トークンを返却（再発行はしない）
- `POST /api/pets/:petId/qr-token`
  - `upsert` で常に新トークンへ更新（再発行）
  - 更新時は `rotatedAt` を現在時刻に設定
  - 常に `isActive=true` に戻す
- `DELETE /api/pets/:petId/qr-token`
  - 有効トークンを `isActive=false` に更新
  - すでに `isActive=false` の場合はそのまま返却（冪等）
  - トークン未発行時は `404`
- `GET /api/public/emergency/:token`
  - UUID形式不正は `400`
  - RPC結果なし（未発行・失効・不一致）は `404`
  - 有効トークンのみ `200` で緊急公開情報を返却

## 補足
- 公開参照は RPC `get_public_emergency_by_token(uuid)` を使用し、`isActive=true` のみ返却。
