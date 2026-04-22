# API Routes Design

## 共通設計
- すべての保護APIは認証必須
- 入力検証はZodで実施
- エラーはHTTPステータスとメッセージを明示
- Supabaseアクセスは `src/lib` 経由で一元化

## エンドポイント（MVP）

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Resource A
- `GET /api/resource-a`
- `POST /api/resource-a`
- `GET /api/resource-a/[id]`
- `PUT /api/resource-a/[id]`
- `DELETE /api/resource-a/[id]`

### Resource B
- `GET /api/resource-b`
- `POST /api/resource-b`
- `GET /api/resource-b/[id]`
- `PUT /api/resource-b/[id]`
- `DELETE /api/resource-b/[id]`

### Upload
- `POST /api/upload`

## 登録処理の標準フロー（例）
1. リクエスト検証
2. テナント/組織所属チェック
3. 重複・整合性チェック
4. INSERT
5. 必要に応じた通知トリガー
6. 成功レスポンス
