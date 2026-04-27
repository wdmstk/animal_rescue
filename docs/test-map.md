# テストマップ

機能ごとに、どのテスト層で担保しているかを対応付けた一覧です。

## 認証・参加導線

| 機能 | Unit | Integration | E2E |
|---|---|---|---|
| ログイン入力/バリデーション | `tests/unit/validators.test.ts` | `tests/integration/household-invite-codes-route.test.ts`（認証関連分岐） | `tests/e2e/login.spec.ts` |
| 招待コード参加 | `tests/unit/invite-code.test.ts`, `tests/unit/invite-validators.test.ts` | `tests/integration/household-join-route.test.ts`, `tests/integration/household-invite-codes-route.test.ts` | `tests/e2e/invite.spec.ts` |

## ペット基本情報・メディア

| 機能 | Unit | Integration | E2E |
|---|---|---|---|
| ペット一覧/作成/詳細取得 | `tests/unit/validators.test.ts` | `tests/integration/pets-route.test.ts`, `tests/integration/pet-route.test.ts` | `tests/e2e/invite.spec.ts`（一覧→詳細遷移） |
| 写真一覧/登録/並び替え | `tests/unit/photo-gallery.test.ts` | `tests/integration/pet-photos-route.test.ts`, `tests/integration/pet-photo-upload-url-route.test.ts` | `tests/e2e/health.spec.ts`（詳細画面表示） |

## 緊急公開（QR）

| 機能 | Unit | Integration | E2E |
|---|---|---|---|
| トークン生成・形式判定・無効化 | `tests/unit/emergency-token.test.ts` | `tests/integration/qr-token-route.test.ts`（GET/POST/DELETE） | - |
| 公開緊急レスポンス整形 | `tests/unit/public-emergency-response.test.ts` | `tests/integration/public-emergency-route.test.ts` | `tests/e2e/public-emergency.spec.ts`（正常系/不正トークン404/有効形式だが不一致404） |
| QR画像生成 | - | `tests/integration/qr-image-route.test.ts` | `tests/e2e/health.spec.ts`（緊急導線表示） |

## 医療・投薬・ワクチン

| 機能 | Unit | Integration | E2E |
|---|---|---|---|
| 緊急情報更新 | `tests/unit/validators.test.ts` | `tests/integration/emergency-info-route.test.ts` | `tests/e2e/health.spec.ts` |
| 投薬管理/通知 | `tests/unit/medication-calendar.test.ts` | `tests/integration/medications-route.test.ts`, `tests/integration/medication-reminders-route.test.ts` | `tests/e2e/health.spec.ts` |
| ワクチン管理 | `tests/unit/vaccination.test.ts` | `tests/integration/vaccinations-route.test.ts` | `tests/e2e/health.spec.ts` |
| 医療記録 | `tests/unit/medical-timeline.test.ts` | `tests/integration/medical-records-route.test.ts` | `tests/e2e/health.spec.ts` |

## 健康トラッキング

| 機能 | Unit | Integration | E2E |
|---|---|---|---|
| 入力/ドメインバリデーション | `tests/unit/health-input-ui-validators.test.ts`, `tests/unit/health-validators.test.ts` | `tests/integration/health-core-metrics-route.test.ts`, `tests/integration/health-lab-results-route.test.ts`, `tests/integration/health-extensions-route.test.ts` | `tests/e2e/health.spec.ts` |
| 推移集計/表示制御 | `tests/unit/health-trends.test.ts`, `tests/unit/health-series-filter.test.ts`, `tests/unit/health-graph-summary.test.ts` | `tests/integration/health-trends-route.test.ts` | `tests/e2e/health.spec.ts` |
| 実DB整合（任意実行） | - | `tests/integration/health-db-real-route.test.ts`, `tests/integration/schema-rls-db-real.test.ts` | - |

## ギャップ（現時点）
- QR画像の表示・読み取り結果（端末カメラ相当）を含むE2Eは未整備。
