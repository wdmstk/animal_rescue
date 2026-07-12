# 08. テスト設計

作成日: 2026-07-12 | バージョン: 1.0.0

---

## 目次
1. [テスト戦略](#1-テスト戦略)
2. [テスト層定義](#2-テスト層定義)
3. [テストマップ（改訂版）](#3-テストマップ改訂版)
4. [テスト優先度](#4-テスト優先度)
5. [テスト設計ギャップ](#5-テスト設計ギャップ)

---

## 1. テスト戦略

### テストピラミッド

```
          E2E テスト
        （少数・重要フロー）
       /─────────────────\
      / 統合テスト         \
     /（API + DB層）        \
    /───────────────────────\
   /  ユニットテスト          \
  /（ドメインロジック・バリデーション）\
 /───────────────────────────────\
```

### テスト方針

```
テスト必須の状況:
  - 全ての機能追加・バグ修正に伴うテスト
  - 境界値・エラーケースのテスト
  - 認可境界（他ユーザーのデータアクセス不可）のテスト
  - 課金状態による機能制限のテスト

禁止事項:
  - 意味のないアサーション（expect(true).toBe(true)）
  - 本番ロジックをテストパスのためにハードコード
  - テストのためのフラグ追加
```

---

## 2. テスト層定義

### ユニットテスト（Vitest）

**対象**: ドメインロジック・バリデーション・ユーティリティ関数

**ディレクトリ**: `tests/unit/`

**実行**: `npx vitest run`

**テストファイル一覧（現状）**:

| ファイル | テスト対象 |
|---|---|
| `validators.test.ts` | 入力バリデーション（電話番号・UUID等） |
| `emergency-token.test.ts` | QRトークンの形式判定 |
| `public-emergency-response.test.ts` | 緊急公開レスポンスの整形 |
| `medication-calendar.test.ts` | 投薬カレンダー計算ロジック |
| `vaccination.test.ts` | ワクチン種別・期限計算 |
| `medical-timeline.test.ts` | 医療タイムラインの並び順 |
| `health-input-ui-validators.test.ts` | 健康入力UIのバリデーション |
| `health-validators.test.ts` | 健康記録のドメインバリデーション |
| `health-trends.test.ts` | 健康推移データの集計 |
| `health-series-filter.test.ts` | 健康データのフィルタリング |
| `health-graph-summary.test.ts` | グラフ表示用サマリー生成 |
| `invite-code.test.ts` | 招待コードの生成・検証 |
| `invite-validators.test.ts` | 招待入力バリデーション |
| `photo-gallery.test.ts` | 写真ギャラリーの並び順 |

---

### 統合テスト（Vitest + テストDB）

**対象**: APIエンドポイント + データベース操作

**ディレクトリ**: `tests/integration/`

**環境**: テスト用データベース（本番DBとは別）

**テストファイル一覧（現状）**:

| ファイル | テスト対象 |
|---|---|
| `auth-login-route.test.ts` | ログインAPI |
| `auth-signup-route.test.ts` | サインアップAPI |
| `pets-route.test.ts` | ペット一覧・作成API |
| `pet-route.test.ts` | ペット詳細・削除API |
| `emergency-info-route.test.ts` | 緊急情報更新API |
| `qr-token-route.test.ts` | QRトークンAPI |
| `public-emergency-route.test.ts` | 公開緊急情報API |
| `qr-image-route.test.ts` | QR画像API |
| `pet-photos-route.test.ts` | 写真一覧・登録API |
| `pet-photo-upload-url-route.test.ts` | 写真アップロードURL |
| `medical-records-route.test.ts` | 医療記録API |
| `medications-route.test.ts` | 投薬API |
| `medication-reminders-route.test.ts` | リマインダーAPI |
| `vaccinations-route.test.ts` | ワクチンAPI |
| `health-core-metrics-route.test.ts` | コアメトリクスAPI |
| `health-lab-results-route.test.ts` | 検査値API |
| `health-extensions-route.test.ts` | 拡張項目API |
| `health-trends-route.test.ts` | 健康推移API |
| `household-join-route.test.ts` | 世帯参加API |
| `household-invite-codes-route.test.ts` | 招待コードAPI |
| `household-members-route.test.ts` | メンバー管理API |
| `billing-portal-route.test.ts` | 課金ポータルAPI |
| `api-error.test.ts` | エラーハンドリング統一 |

---

### E2Eテスト（Playwright）

**対象**: ユーザーの操作フロー全体

**ディレクトリ**: `tests/e2e/`

**実行**: `npm run test:e2e`

**テストファイル一覧（現状）**:

| ファイル | テスト対象 |
|---|---|
| `login.spec.ts` | ログインフロー |
| `signup.spec.ts` | サインアップフロー |
| `invite.spec.ts` | 招待・参加フロー |
| `health.spec.ts` | ペット詳細・健康記録フロー |
| `public-emergency.spec.ts` | 公開緊急画面フロー |
| `settings-account.spec.ts` | 設定画面フロー |

---

## 3. テストマップ（改訂版）

### クリティカルパス（最優先でテストが必要）

```
1. 緊急公開フロー（最重要）
   Unit: emergency-token.test.ts, public-emergency-response.test.ts
   Integration: qr-token-route.test.ts, public-emergency-route.test.ts
   E2E: public-emergency.spec.ts
   
2. 認可境界（セキュリティ最重要）
   Integration: 各APIで「他世帯のpetIdを指定した場合404を返す」テスト
   現状: 一部のAPIにしかない → 全APIに追加必要
   
3. 課金フロー
   Integration: billing-portal-route.test.ts, webhook処理テスト
   E2E: 課金状態による機能制限の確認
```

---

## 4. テスト優先度

### テスト追加が必要な領域（詳細テスト仕様）

| 優先度 | テスト機能 | テストケース分類 | 具体的な検証要件 |
|---|---|---|---|
| **P0** | **パスワードリセット** | 正常系 (リクエスト) | 有効なメールアドレスで再設定要求し、200応答を返す |
| | | 異常系 (リクエスト) | 無効なメールアドレス形式で400応答を返す |
| | | セキュリティ (隠蔽) | 存在しないアドレスでも200を返し、「送信完了」同等メッセージになること |
| | | 正常系 (再設定) | 回復トークン(Temp JWT)を用いた新パスワード更新処理の成功 |
| | | 異常系 (再設定) | 短すぎる、または英数字混合でない新パスワード設定時の400エラー |
| **P0** | **アカウント削除** | 正常系 | 退会実行時に世帯、ペット、医療記録、Stripeサブスクリプション(即時キャンセル)が全て削除されること |
| | | 異常系 (OWNER不整合) | 所属世帯で唯一のOWNERであるユーザー自身がアカウント削除を試み、かつ他に世帯メンバーが存在する場合に409競合エラーを返すこと |
| | | 異常系 (認可) | 世帯に属さない他ユーザーのアカウント削除要求に対して401/403エラーとなること |
| **P0** | **レート制限** | 正常系 | 通常のAPIアクセス頻度下で正常に応答（200 OK）すること |
| | | 異常系 (超過) | ログインAPIに対して短時間に10回/分を超えるアクセスを行い、429 Too Many Requests応答となること |
| | | 異常系 (障害耐性) | Upstash Redisとの接続タイムアウト(例外)発生時に、チェックがFail-Openとして働きAPI処理が継続されること |
| **P1** | **認可境界テスト** | セキュリティ | 全APIエンドポイントに他世帯ペットIDを指定してアクセスした際、404 Not Foundを返すこと |
| **P1** | **課金機能制限** | 正常系 (機能制限) | トライアル終了/Expired状態のユーザーによるペット新規作成・更新リクエストが402 Payment Requiredになること |
| **P2** | **緊急QR 2タップ** | E2E (UI) | ペット一覧カードの「緊急QR」ボタン押下から2タップで全画面QRコード表示に至るパスの検証 |

---

## 5. テスト設計ギャップ

### 現状のギャップ

```
ギャップ1: QRコードのスキャン実動作E2E未整備
  問題: カメラを使ったQRスキャンは自動テストが困難
  対策: QRコード生成→URL直接アクセスのフローでカバー

ギャップ2: 認可境界テストの不均一
  問題: 一部のAPIは他世帯のpetIdアクセスを拒否するテストがない
  対策: 全統合テストに「他世帯petIdで404」テストを追加

ギャップ3: 課金状態の境界テスト不足
  問題: trial/active/inactive/expired の全状態でのテストがない
  対策: 各APIに課金状態によるアクセス制御テストを追加

ギャップ4: パフォーマンステストなし
  問題: ページロードタイム・APIレスポンスタイムの計測がない
  対策: k6 または Playwright の performance API での計測追加

ギャップ5: 管理画面テストなし
  問題: 管理画面が未実装のためテストも未整備
  対策: 管理画面実装と同時にテスト追加
```

### テストデータ戦略

```
現状: seed:test:baseline / seed:test:showcase の2種類
  baseline: 自動テスト用（最小限のデータ）
  showcase: UI確認用（10匹・複数ケース）

改善提案:
  - 課金状態別のseedデータを追加
    (trial / active / inactive / expired の4パターン)
  - OWNER不在状態のseedデータを追加
  - 期限切れワクチンを持つペットのseedデータを追加
```
