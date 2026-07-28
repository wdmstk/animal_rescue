# TASK-331: AniLink MVP Discovery検証結果反映・仕様変更設計書

## 1. 概要と背景
最新のDiscovery検証結果（飼い主原則無料／フリーミアム／ボトムアップGTM）に合わせて、MVPの認証・料金・機能制限・データ保存・動物病院提示UIを改修・リファクタリングするための詳細仕様書。

---

## 2. 仕様変更要件

### 2.1 【Task 1】認証・ユーザープラン権限（原則無料化）
- **背景・目的**:
  ネットワーク効果を最大化しペットの健康データを蓄積するため、飼い主の基本機能（プロファイル、基本記録、診察提示画面）に対する月額680円 Paywall を廃止し、永続無料化する。
- **詳細仕様**:
  - `src/lib/billing/access-policy.ts`: `resolveBillingAccessState()` において、`planTier: "free"` の場合でも `accessPolicy` の `canCreate`, `canEdit`, `canNotify`, `canShare`, `canExport` を常に `true` とし、`historyWindowDays` を `null`（無制限）にする。
  - `src/lib/billing/access-guard.ts`: 基本機能へのガード（`requireCreateAccess` 等）は常に通過（許可）するように変更。
  - `src/app/(dashboard)/settings/_client-settings.tsx` & `page.tsx`: 契約ステータスを「原則無料プラン (FREE)」と表記し、旧サブスク課金誘導のメッセージを整理する。

---

### 2.2 【Task 2】AI/OCR処理のフリーミアム・レートリミット & 免責事項
- **背景・目的**:
  無料ユーザーによるAI/OCR処理の過剰呼び出し（APIコスト爆発）を防御し、かつ医療判断トラブルを回避するため、利用制限と免責事項表示を導入する。
- **詳細仕様**:
  - **OCR利用制限（月2枚まで無料）**:
    - 今月のOCR利用回数を計算するサービス/ロジック `getMonthlyOcrUsage(userId: string)` を実装。
    - 無料枠（当月2枚超過時）の場合、`requireOcrAccess()` にて HTTP `402 Payment Required`（`code: "OCR_LIMIT_EXCEEDED"`）を返却。
    - フロントエンドの `medical-record-manager.tsx` では、無料枠残数を表示し、上限到達時には Proプラン案内（モーダル）を表示。
  - **API呼び出しハードリミット**:
    - 短時間の連打・不正ループ対策として、1分あたり5回 / 1日あたり20回のハードリミット（Rate Limiter）を適用。
  - **共通医療免責事項コンポーネント (`MedicalDisclaimer`)**:
    - `src/components/common/medical-disclaimer.tsx` を新設。
    - 文言：「※本機能による抽出結果・サマリーは医療判断を提供するものではありません。診断・処方・治療については必ず獣医師の指示に従ってください。」
    - AI問診、AIサマリー、OCR結果等の表示部すべてに本コンポーネントを埋め込む。

---

### 2.3 【Task 3】データ保存ロジック軽量化（Supabase無料枠対策）
- **背景・目的**:
  SupabaseのStorage容量（無料枠）の枯渇を防ぐため、端末側での画像圧縮およびOCR処理後の画像非保存（テキストデータのみ保持）を実現する。
- **詳細仕様**:
  - **クライアント側画像圧縮**:
    - `src/components/features/pets/medical-record-manager.tsx` にて、アップロード前に HTML Canvas を使用して長辺1200px以下へのリサイズおよび JPEG Quality 0.8 への圧縮を実行。
  - **OCRテキストデータのみDB保存**:
    - `src/app/api/pets/[petId]/medical-documents/[documentId]/extract/route.ts` および `medical-document-ocr.ts` において、OCR解析結果（`ocrText`, `ocrStructuredJson`）を DB (`PetMedicalDocument`) に保存した後、ストレージ上の画像ファイルは保存しない（DataURLのメモリ内処理のみ、または解析後ストレージ破棄）方式に変更。

---

### 2.4 【Task 4】動物病院向け提示用画面（AniLinkパス）
- **背景・目的**:
  動物病院側にアカウント登録やシステム導入を強制せず、飼い主がワンタップ／QRコード提示で診察用サマリーを共有できるボトムアップGTM（BYOD）用UIを提供する。
- **詳細仕様**:
  - **ルーティング & パブリックアクセス**:
    - 共有URL `/pass/[token]` を新設。
    - `middleware.ts` の `PUBLIC_PATHS` に `/pass` を追加し、非ログイン状態でも閲覧可能にする。
  - **SBAR形式の診察サマリーUI (`AniLinkPassView`)**:
    - **Situation (主訴・現在の状況)**: 問診サマリー、直近の症状・変化
    - **Background (背景・既往歴)**: 年齢、性別、去勢状態、既往症、アレルギー、緊急連絡先
    - **Assessment (最新数値・検査)**: 最新の血液検査数値一覧（CRE, BUN, ALT, ALP, etc.）
    - **Recommendation (依頼事項・予防歴)**: 予防接種歴（狂犬病・コアワクチン・フィラリア）、投薬状況
  - モバイル・タブレット・PCレスポンシブWeb対応とし、視認性の高いダーク/クリーンデザインを適用。

---

## 3. テスト計画・完了条件
1. `npm run lint` が警告・エラーなしで通過すること。
2. `npx vitest run` の全ユニットテストおよびインテグレーションテストがグリーンであること。
3. FREEユーザーが基本機能（ペット作成・記録登録・閲覧）を問題なく利用できること。
4. OCR利用制限（3枚目で402エラー/Pro表示）が正常に機能すること。
5. `/pass/[token]` でログインなしにSBAR形式の診察サマリーが閲覧できること。
