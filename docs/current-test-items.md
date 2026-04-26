# Current Test Items

## 実装前チェック
- 要件が明確か
- 境界値/異常系/エラー系を列挙したか
- 既存仕様への影響範囲を確認したか

## Unit Test チェック
- 具体的入力と期待出力を検証している
- 無意味なアサーションがない
- テスト名が検証内容を表している

## Integration Test チェック
- APIバリデーション
- 認証/認可
- 主要分岐の成功・失敗

## E2E Test チェック
- ログイン
- 招待コード参加画面表示
- リソースA登録
- リソースB登録
- ペット一覧から詳細画面遷移
- 投薬カレンダー表示
- ファイルアップロード

## PR前チェック
1. `npm run lint`
2. `npx vitest run`
3. `npm run test:e2e`（影響範囲のみでも可）
4. 実DB統合テストが必要な変更時は `RUN_DB_INTEGRATION=1 npx vitest run tests/integration/health-db-real-route.test.ts`
