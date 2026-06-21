# APIエラーハンドリング改善 - 実装チェックリスト

## 1. 実装前準備

- [ ] 改善計画ドキュメント (<ref_file file="/home/komug/projects/animal_rescue/docs/api-error-handling-improvement.md" />) を確認
- [ ] 技術仕様書 (<ref_file file="/home/komug/projects/animal_rescue/docs/api-error-handling-spec.md" />) を確認
- [ ] レビュー基準 (<ref_file file="/home/komug/projects/animal_rescue/docs/api-error-handling-review.md" />) を確認
- [ ] 現在のブランチを確認（main から新しいブランチを作成）
- [ ] 作業開始前の最新コードを取得

## 2. 基盤ユーティリティの実装

### 2.1 src/lib/api-error.ts の作成
- [ ] `ApiErrorResponse` 型を定義
- [ ] `apiError` 基底関数を実装
- [ ] `badRequest` ヘルパー関数を実装
- [ ] `unauthorized` ヘルパー関数を実装
- [ ] `forbidden` ヘルパー関数を実装
- [ ] `notFound` ヘルパー関数を実装
- [ ] `paymentRequired` ヘルパー関数を実装
- [ ] `serverError` ヘルパー関数を実装
- [ ] すべての関数に適切なJSDocコメントを追加
- [ ] TypeScript の厳格モードで型エラーがないことを確認

### 2.2 ユニットテストの作成
- [ ] `tests/unit/api-error.test.ts` を作成
- [ ] `apiError` 関数のテストを追加
- [ ] `badRequest` 関数のテストを追加（文字列入力）
- [ ] `badRequest` 関数のテストを追加（ZodError入力）
- [ ] `unauthorized` 関数のテストを追加（デフォルトメッセージ）
- [ ] `unauthorized` 関数のテストを追加（カスタムメッセージ）
- [ ] `forbidden` 関数のテストを追加
- [ ] `notFound` 関数のテストを追加（デフォルトリソース名）
- [ ] `notFound` 関数のテストを追加（カスタムリソース名）
- [ ] `paymentRequired` 関数のテストを追加
- [ ] `serverError` 関数のテストを追加
- [ ] エラーログ出力のモックと確認

## 3. 段階的移行

### 3.1 高優先度ルートの移行（1つ目で動作確認）

#### src/app/api/pets/route.ts
- [ ] `@/lib/api-error` をインポート
- [ ] GET メソッドのエラーハンドリングを確認（変更なし）
- [ ] POST メソッドのバリデーションエラーを `badRequest` に移行
- [ ] POST メソッドのカスタムエラー（"所属世帯が見つかりません"）を適切に処理
- [ ] ローカル動作確認

### 3.2 動作確認
- [ ] `npm run lint` を実行してエラーがないことを確認
- [ ] `npx vitest run` を実行してテストが通過することを確認
- [ ] 該当ルートのインテグレーションテストが通過することを確認

### 3.3 高優先度ルートの残りを移行
- [ ] src/app/api/pets/[petId]/route.ts を移行
- [ ] src/app/api/account/route.ts を移行
- [ ] src/app/api/pets/[petId]/emergency-info/route.ts を移行
- [ ] 各移行後に lint とテストを実行

### 3.4 中優先度ルートの移行
- [ ] src/app/api/pets/[petId]/photos/route.ts を移行
- [ ] src/app/api/pets/[petId]/photos/upload-url/route.ts を移行
- [ ] src/app/api/pets/[petId]/medications/route.ts を移行
- [ ] src/app/api/pets/[petId]/medications/[medicationId]/route.ts を移行
- [ ] src/app/api/pets/[petId]/vaccinations/route.ts を移行
- [ ] src/app/api/households/members/route.ts を移行
- [ ] src/app/api/households/members/[memberId]/route.ts を移行
- [ ] 各移行後に lint とテストを実行

### 3.5 低優先度ルートの移行
- [ ] src/app/api/pets/[petId]/display-settings/route.ts を移行
- [ ] src/app/api/pets/[petId]/qr-token/route.ts を移行
- [ ] src/app/api/pets/[petId]/qr-image/route.ts を移行
- [ ] src/app/api/pets/[petId]/health/core-metrics/route.ts を移行
- [ ] src/app/api/pets/[petId]/health/extensions/route.ts を移行
- [ ] src/app/api/pets/[petId]/health/lab-results/route.ts を移行
- [ ] src/app/api/pets/[petId]/health/trends/route.ts を移行
- [ ] src/app/api/pets/[petId]/medical-records/route.ts を移行
- [ ] src/app/api/pets/[petId]/medical-documents/route.ts を移行
- [ ] src/app/api/pets/[petId]/medical-documents/upload-url/route.ts を移行
- [ ] src/app/api/pets/[petId]/medical-documents/upload/route.ts を移行
- [ ] src/app/api/pets/[petId]/medical-documents/[documentId]/extract/route.ts を移行
- [ ] src/app/api/pets/[petId]/medication-reminders/route.ts を移行
- [ ] src/app/api/settings/display/route.ts を移行
- [ ] src/app/api/settings/owner-profile/route.ts を移行
- [ ] src/app/api/billing/checkout/route.ts を移行
- [ ] src/app/api/billing/portal/route.ts を移行
- [ ] src/app/api/billing/subscription/route.ts を移行
- [ ] src/app/api/billing/webhook/route.ts を移行
- [ ] src/app/api/households/invite-codes/route.ts を移行
- [ ] src/app/api/households/join/route.ts を移行
- [ ] src/app/api/households/recover-owner/route.ts を移行
- [ ] src/app/api/jobs/medication-reminders/route.ts を移行
- [ ] src/app/api/auth/login/route.ts を移行
- [ ] src/app/api/auth/logout/route.ts を移行
- [ ] src/app/api/auth/signup/route.ts を移行
- [ ] src/app/api/public/emergency/[token]/route.ts を移行

## 4. 認可ガード関数の検討

### 4.1 現状分析
- [ ] `src/lib/auth/pet-access.ts` のエラーレスポンスを確認
- [ ] `src/lib/billing/access-guard.ts` のエラーレスポンスを確認
- [ ] 新しいユーティリティとの統合の可否を評価

### 4.2 統合の実施（オプション）
- [ ] 認可ガード関数も新しいユーティリティを使用するように更新（決定した場合）
- [ ] 更新後にテストを実行

## 5. 最終検証

### 5.1 コード品質
- [ ] `npm run lint` を実行してエラーがないことを確認
- [ ] `npx vitest run` を実行してすべてのユニットテストが通過することを確認
- [ ] TypeScript の型チェックが通過することを確認

### 5.2 インテグレーションテスト
- [ ] すべてのインテグレーションテストが通過することを確認
- [ ] エラーシナリオのテストが通過することを確認

### 5.3 E2Eテスト
- [ ] `npm run test:e2e` を実行してすべてのE2Eテストが通過することを確認
- [ ] エラーハンドリングのE2Eテストが通過することを確認

### 5.4 手動テスト
- [ ] ローカル開発環境でアプリケーションを起動
- [ ] バリデーションエラーが正しく表示されることを確認
- [ ] 認証エラーが正しく表示されることを確認
- [ ] 権限エラーが正しく表示されることを確認
- [ ] リソース未検出エラーが正しく表示されることを確認
- [ ] 課金エラーが正しく表示されることを確認

### 5.5 互換性確認
- [ ] 既存のエラーレスポンスフォーマットが維持されていることを確認
- [ ] フロントエンドでのエラーハンドリングが正常に動作することを確認
- [ ] 既存のAPIクライアントが変更なしで動作することを確認

## 6. ドキュメント更新

### 6.1 技術ドキュメント
- [ ] 実装仕様書に実際の実装内容を反映
- [ ] レビュー基準に実際のレビュー結果を反映
- [ ] チェックリストに完了項目を反映

### 6.2 プロジェクトドキュメント
- [ ] AGENTS.md に新しいエラーハンドリングパターンを記載（必要な場合）
- [ ] README.md に変更点を記載（必要な場合）

## 7. Git 作業

### 7.1 コミット準備
- [ ] `git status` を実行して変更ファイルを確認
- [ ] `git diff` を実行して変更内容を確認
- [ ] 不要なファイルが含まれていないことを確認
- [ ] コミットメッセージを準備

### 7.2 コミット
- [ ] 適切なコミットメッセージでコミット
- [ ] コミット形式: `refactor: 集中的なAPIエラーハンドリングユーティリティを追加`

### 7.3 プルリクエスト
- [ ] プルリクエストを作成
- [ ] PRテンプレートを埋める
- [ ] レビュアーをアサイン
- [ ] CIが通過することを確認

### 7.4 マージ
- [ ] レビューを完了
- [ ] CIが通過後にマージ
- [ ] マージ後にブランチを削除

## 8. 事後検証

### 8.1 本番環境での確認（本番デプロイ後）
- [ ] 本番環境でエラーハンドリングが正常に動作することを確認
- [ ] エラーログが適切に出力されていることを確認
- [ ] ユーザーからのエラーレポートがないことを確認

### 8.2 モニタリング
- [ ] エラーレートの増加がないことを確認
- [ ] 新しいエラーパターンの発生がないことを確認
- [ ] パフォーマンスへの影響がないことを確認

## 9. クリーンアップ

### 9.1 一時ファイルの削除
- [ ] テスト用の一時ファイルを削除
- [ ] デバッグ用のコードを削除

### 9.2 コメントの整理
- [ ] TODO コメントを解決または適切に残す
- [ ] 不要なコメントを削除
