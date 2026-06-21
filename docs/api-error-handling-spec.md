# APIエラーハンドリング改善 - 技術仕様書

## 1. 目的
APIルートでのエラーハンドリングを集中化し、一貫性と保守性を改善する。

## 2. 新規ファイル

### 2.1 src/lib/api-error.ts
集中的なエラーハンドリングユーティリティ。

#### エクスポートされる型
```typescript
export type ApiErrorResponse = {
  error: string | Record<string, unknown>;
};
```

#### エクスポートされる関数

##### apiError(message, status?)
基底となるエラーレスポンス生成関数。

```typescript
export const apiError = (
  message: string | Record<string, unknown>,
  status: number = 500
): NextResponse<ApiErrorResponse>
```

- `message`: エラーメッセージ（文字列またはオブジェクト）
- `status`: HTTPステータスコード（デフォルト: 500）
- 戻り値: NextResponse with ApiErrorResponse
- 副作用: console.error でエラーを出力

##### badRequest(message)
400 Bad Request エラーを生成。

```typescript
export const badRequest = (message: string | ZodError): NextResponse<ApiErrorResponse>
```

- `message`: エラーメッセージまたはZodError
- ZodErrorが渡された場合は自動的に `flatten()` を適用
- ステータス: 400

##### unauthorized(message?)
401 Unauthorized エラーを生成。

```typescript
export const unauthorized = (message: string = "認証が必要です"): NextResponse<ApiErrorResponse>
```

- `message`: エラーメッセージ（デフォルト: "認証が必要です"）
- ステータス: 401

##### forbidden(message?)
403 Forbidden エラーを生成。

```typescript
export const forbidden = (message: string = "Forbidden"): NextResponse<ApiErrorResponse>
```

- `message`: エラーメッセージ（デフォルト: "Forbidden"）
- ステータス: 403

##### notFound(resource?)
404 Not Found エラーを生成。

```typescript
export const notFound = (resource: string = "Resource"): NextResponse<ApiErrorResponse>
```

- `resource`: リソース名（デフォルト: "Resource"）
- メッセージ: "{resource} not found"
- ステータス: 404

##### paymentRequired(message?)
402 Payment Required エラーを生成。

```typescript
export const paymentRequired = (message: string = "この機能は有料プランで利用できます"): NextResponse<ApiErrorResponse>
```

- `message`: エラーメッセージ（デフォルト: "この機能は有料プランで利用できます"）
- ステータス: 402

##### serverError(message?)
500 Internal Server Error エラーを生成。

```typescript
export const serverError = (message: string = "サーバーエラーが発生しました"): NextResponse<ApiErrorResponse>
```

- `message`: エラーメッセージ（デフォルト: "サーバーエラーが発生しました"）
- ステータス: 500

## 3. 既存ファイルの変更

### 3.1 APIルートの移行パターン

#### パターン1: パラメータバリデーションエラー
変更前:
```typescript
const parsedParams = petIdParamSchema.safeParse(await params);
if (!parsedParams.success) {
  return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
}
```

変更後:
```typescript
import { badRequest } from "@/lib/api-error";

const parsedParams = petIdParamSchema.safeParse(await params);
if (!parsedParams.success) {
  return badRequest(parsedParams.error);
}
```

#### パターン2: リクエストボディバリデーションエラー
変更前:
```typescript
const body = await request.json();
const parsed = petCreateSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}
```

変更後:
```typescript
import { badRequest } from "@/lib/api-error";

const body = await request.json();
const parsed = petCreateSchema.safeParse(body);
if (!parsed.success) {
  return badRequest(parsed.error);
}
```

#### パターン3: 認証エラー
変更前:
```typescript
const auth = await requireAuthenticatedUser();
if (auth instanceof NextResponse) {
  return auth;
}
```

変更後:
```typescript
const auth = await requireAuthenticatedUser();
if (auth instanceof NextResponse) {
  return auth;
}
```
※ 認証ガード関数は既に一貫したエラーレスポンスを返すため、変更不要

#### パターン4: 権限エラー
変更前:
```typescript
const access = await requirePetAccess(auth.userId, petId);
if (access instanceof NextResponse) {
  return access;
}
```

変更後:
```typescript
const access = await requirePetAccess(auth.userId, petId);
if (access instanceof NextResponse) {
  return access;
}
```
※ 権限ガード関数は既に一貫したエラーレスポンスを返すため、変更不要

#### パターン5: リソース未検出エラー
変更前:
```typescript
if (!pet) {
  return NextResponse.json({ error: "Pet not found" }, { status: 404 });
}
```

変更後:
```typescript
import { notFound } from "@/lib/api-error";

if (!pet) {
  return notFound("Pet");
}
```

#### パターン6: 課金エラー
変更前:
```typescript
const denied = (message: string) => NextResponse.json({ error: message }, { status: 402 });
```

変更後:
```typescript
import { paymentRequired } from "@/lib/api-error";

const denied = (message: string) => paymentRequired(message);
```

### 3.2 移行対象ファイル（優先度順）

#### 高優先度（頻繁に使用されるルート）
- src/app/api/pets/route.ts
- src/app/api/pets/[petId]/route.ts
- src/app/api/account/route.ts
- src/app/api/pets/[petId]/emergency-info/route.ts

#### 中優先度
- src/app/api/pets/[petId]/photos/route.ts
- src/app/api/pets/[petId]/medications/route.ts
- src/app/api/pets/[petId]/vaccinations/route.ts
- src/app/api/households/members/route.ts

#### 低優先度
- 残りのAPIルート

## 4. 互換性

### 4.1 エラーレスポンスフォーマット
新旧のエラーレスポンスフォーマットは互換性がある：

変更前:
```json
{
  "error": { "fieldErrors": {...}, "formErrors": [...] }
}
```

変更後:
```json
{
  "error": { "fieldErrors": {...}, "formErrors": [...] }
}
```

### 4.2 既存テスト
- エラーレスポンスの構造に依存するテストは変更なしで通過するはず
- ステータスコードに依存するテストも変更なしで通過するはず

## 5. 実装順序

1. `src/lib/api-error.ts` を作成
2. 高優先度のルートを1つ移行して動作確認
3. lintとテストを実行
4. 高優先度の残りのルートを移行
5. 中優先度のルートを移行
6. 低優先度のルートを移行
7. 最終lintとテスト実行

## 6. 備考

### 6.1 ログ出力
`apiError` 関数は `console.error` でエラーを出力する。将来的には構造化ログやリクエストIDの追加を検討可能。

### 6.2 将来的な拡張
- リクエストIDの追跡
- エラーコードの標準化
- 多言語対応
- エラーレスポンスの詳細化（スタックトレースの制御など）

### 6.3 既存のエラーユーティリティ
`src/lib/prisma-error.ts` の `isTableMissingError` は維持し、必要に応じて `api-error.ts` に統合を検討。
