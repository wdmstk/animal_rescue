# 14. 動物病院連携API 設計仕様書 (Veterinary Collaboration API Design)

作成日: 2026-07-17 | バージョン: 1.0.0

---

## 1. 概要

本仕様書は、外部の動物病院システム（電子カルテシステム、レセコン等）と「動物の救急手帳」間で、ペットの医療・救急情報をセキュアかつ効率的に共有・連携するための API 設計仕様です。

### 主なユースケース
1. **緊急時カルテ取得:** 救急搬送されたペットの持病・アレルギー・投薬情報を動物病院側が即時閲覧。
2. **電子カルテ連携（書込）:** 動物病院での診察記録やワクチン接種記録を、病院のシステムから直接ユーザーの救急手帳に登録。
3. **予防管理（確認）:** 各ワクチンの接種期限や過去の抗体検査結果を病院側から照会。

---

## 2. セキュリティ & 認証方式

機密性の高い医療情報を扱うため、API 認証には業界標準のセキュリティプロトコルを採用します。

### 認証フロー
- **OAuth 2.0 (Client Credentials Flow):** 動物病院システム等のマシン間 (M2M) 連携用。
- **APIキー認証:** 特定のクローズドな連携先やテスト用。
  - ヘッダー形式: `X-Vet-API-Key: vet_live_xxxxxx`

```
+--------------------+        Client Credentials        +--------------------+
|                    | -------------------------------> |                    |
|  動物病院システム  |                                  |  動物の救急手帳    |
|  (EMR / レセコン)  | <------------------------------- |  認可サーバー      |
|                    |          Access Token            |                    |
+--------------------+                                  +--------------------+
```

---

## 3. API エンドポイント一覧

ベースURL: `https://api.pet-emergency.com/v1/vet`

### 3.1. ペット情報の取得
指定された緊急トークンまたは連携IDから、ペットの医療サマリーを取得します。

- **エンドポイント:** `GET /pets/summary`
- **認証要求:** `Scope: pets:read`
- **クエリパラメータ:**
  - `token` (String, Required): 緊急用QRコードに埋め込まれている公開用トークン
- **レスポンス (200 OK):**
```json
{
  "status": "success",
  "data": {
    "petId": "uuid-xxxx-xxxx",
    "name": "モカ",
    "species": "DOG",
    "breed": "トイプードル",
    "bloodType": "DEA1.1+",
    "emergencyInfo": {
      "disease": "僧帽弁閉鎖不全症（軽度）",
      "allergy": "鶏肉アレルギー",
      "currentMedications": "ピモベンダン 1.25mg 1日2回"
    },
    "owner": {
      "fullName": "山田 花子",
      "phone": "090-1234-5678"
    }
  }
}
```

### 3.2. 診察記録・医療記録の登録
電子カルテシステムから診察記録を直接「救急手帳」に書き込みます。

- **エンドポイント:** `POST /pets/{petId}/medical-records`
- **認証要求:** `Scope: records:write`
- **リクエストボディ:**
```json
{
  "date": "2026-07-17",
  "title": "定期健康診断および血液検査",
  "recordType": "EXAM",
  "description": "一般状態良好。心音に軽度の雑音あり（ステージB1維持）。血液検査にてCRE: 1.1mg/dLで正常範囲内。",
  "vetName": "中央動物病院"
}
```
- **レスポンス (201 Created):**
```json
{
  "status": "success",
  "data": {
    "recordId": "rec-uuid-yyyy-yyyy",
    "createdAt": "2026-07-17T22:15:00Z"
  }
}
```

### 3.3. ワクチン接種記録の自動登録
混合ワクチンや狂犬病予防ワクチンの証明データを外部システムから自動インポートします。

- **エンドポイント:** `POST /pets/{petId}/vaccinations`
- **認証要求:** `Scope: vaccinations:write`
- **リクエストボディ:**
```json
{
  "type": "CORE",
  "customTypeName": "7種混合ワクチン",
  "date": "2026-07-17",
  "nextDue": "2027-07-17"
}
```
- **レスポンス (201 Created):**
```json
{
  "status": "success",
  "data": {
    "vaccinationId": "vac-uuid-zzzz-zzzz"
  }
}
```

---

## 4. エラーハンドリング

API は標準的な HTTP ステータスコードと JSON 形式のエラーレスポンスを返却します。

| コード | 意味 | 発生シナリオ |
|---|---|---|
| `400` | Bad Request | パラメータのバリデーションエラー |
| `401` | Unauthorized | APIキーまたはアクセストークンの失効・未指定 |
| `403` | Forbidden | 要求スコープの権限不足 |
| `404` | Not Found | ペット、またはレコードが存在しない |

### エラーレスポンス形式
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "指定された緊急トークンは無効化されているか期限切れです。"
  }
}
```
