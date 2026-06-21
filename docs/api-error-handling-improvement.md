# APIエラーハンドリング改善計画

## 概要
現在のAPIルートでエラーハンドリングが分散しており、コードの重複と不整合が発生している。集中的なエラーハンドリングユーティリティを導入して、一貫性と保守性を改善する。

## 現状の課題

### 1. エラーパターンの重複
- 38個のAPIルートで `NextResponse.json({ error: ... }, { status: ... })` が繰り返し使用されている
- 各ルートで同じようなエラーハンドリングコードを記述している

### 2. 予期せぬエラーの未処理
- ほとんどのルートにtry-catchブロックがない
- データベース障害やネットワークエラーで未処理の500エラーが発生する可能性

### 3. エラーレスポンスの不統一
- プレーン文字列を返すルートもある
- Zodエラーオブジェクトを返すルートもある
- カスタムエラーメッセージを返すルートもある

### 4. エラーユーティリティの不足
- `src/lib/prisma-error.ts` に `isTableMissingError` しか存在しない
- 他のエラーパターン用のユーティリティがない

## 提案する解決策

### 1. 集中的なエラーハンドリングユーティリティの作成
ファイル: `src/lib/api-error.ts`

以下の機能を提供する：
- 標準化されたエラーレスポンスフォーマット
- 一般的なHTTPステータスコード用のヘルパー関数
- エラーログ出力
- Zodエラーの自動フォーマット

```typescript
export const badRequest = (message: string | ZodError): NextResponse
export const unauthorized = (message?: string): NextResponse
export const forbidden = (message?: string): NextResponse
export const notFound = (resource?: string): NextResponse
export const paymentRequired = (message?: string): NextResponse
export const serverError = (message?: string): NextResponse
```

### 2. APIルートの段階的な移行
破壊的変更を避けるため、段階的に移行する：

**フェーズ1**: 新しいユーティリティを作成
- `src/lib/api-error.ts` を作成
- 既存のルートは変更なし

**フェーズ2**: 代表的なルートを移行
- 高頻度で使用されるルートから移行開始
- 例: `/api/pets/route.ts`, `/api/pets/[petId]/route.ts`

**フェーズ3**: 残りのルートを移行
- すべてのAPIルートを新しいユーティリティに移行

### 3. オプション: ルートハンドララッパー
予期せぬエラーを自動キャッチするラッパー関数の提供（オプション）：

```typescript
export const withErrorHandler = <T>(
  handler: (...args: T[]) => Promise<NextResponse>
) => {
  return async (...args: T[]): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("Unhandled route error:", error);
      return serverError();
    }
  };
};
```

## 期待されるメリット

### 1. 一貫性
- すべてのルートが同じフォーマットでエラーを返す
- フロントエンドでのエラーハンドリングが簡素化

### 2. 保守性
- エラーハンドリングロジックを1箇所で変更可能
- 新しいエラーパターンの追加が容易

### 3. デバッグ性
- 集中的なエラーログ出力
- 将来的にリクエストIDの追跡も容易に追加可能

### 4. 安全性
- 予期せぬエラーの自動キャッチで未処理の500エラーを防止
- エラーメッセージの一貫性でセキュリティリスク低減

## 移行例

### 変更前
```typescript
if (!parsedParams.success) {
  return NextResponse.json({ error: parsedParams.error.flatten() }, { status: 400 });
}
```

### 変更後
```typescript
import { badRequest } from "@/lib/api-error";

if (!parsedParams.success) {
  return badRequest(parsedParams.error);
}
```

### 認証エラーの変更前
```typescript
if (error || !user) {
  return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
}
```

### 認証エラーの変更後
```typescript
import { unauthorized } from "@/lib/api-error";

if (error || !user) {
  return unauthorized();
}
```

## 実装計画

1. `src/lib/api-error.ts` を作成
2. 2-3個の代表的なAPIルートを移行して動作確認
3. `npm run lint` を実行
4. `npx vitest run` を実行
5. 必要に応じてE2Eテストを実行
6. 残りのAPIルートを段階的に移行

## リスク評価

### 低リスク
- 新しいユーティリティの導入は既存コードに影響しない
- 段階的な移行で問題を早期発見可能
- エラーレスポンスフォーマットは実質的に変更なし

### 注意点
- 既存のテストがエラーレスポンスの正確なフォーマットに依存している場合、調整が必要
- カスタムエラーメッセージを持つルートは移行時にメッセージを維持する必要あり
