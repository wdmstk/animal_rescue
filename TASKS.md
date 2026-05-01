# TASKS.md

Development Task List

---

## TASK運用ルール
- Task ID 形式: `TASK-xxx`
- 正式タスクは `TASK INDEX` と詳細セクションを必ずセットで更新
- 新規TASK作成時は、対応するGitHub Issueを必ず作成し、TASK詳細にIssue番号を記載する
- IssueはCodexAppでの同時並行実装を想定し、独立実装可能な単位で分割する（API/UI/Test/Docs など）
- Issue分割時は依存関係（blocked by / prerequisite）を明示する
- TASKを`done`へ更新する際は、対応Issueをクローズしてから反映する
- 表示順序:
  1. `in_progress`
  2. `todo`
  3. `blocked`
  4. `done`
- 同一ステータス内は Task ID 降順

---

## TASK INDEX

### in_progress
1. `TASK-174` Seedデータ再設計（2名・10匹のケース拡充）

### todo
（なし）

### blocked
（なし）

### done
1. `TASK-177` サブスク課金 UI/UX 刷新（設定画面・転換率最適化）
2. `TASK-176` 商用化運用ドキュメント整備（法務/運用/事業/チェックリスト）
3. `TASK-175` 課金必須化（30日トライアル/680円）と世帯自動作成・seed削除導線整備
4. `TASK-173` 投薬リマインダー日次判定のタイムゾーン基準化
5. `TASK-172` GitHub Actions Nodeランタイム更新（deprecation対応）
6. `TASK-171` 緊急公開向け入力品質のバリデーション強化
7. `TASK-170` 投薬リマインダーの定期送信ジョブ化
8. `TASK-169` 変更履歴の時刻精度改善（updatedAt基準化）
9. `TASK-168` Post-Mergeチェック項目のCI強制ガード追加
4. `TASK-167` PR作成〜mainマージ運用の段階ガード化（実態厳密）
4. `TASK-166` 初回オンボーディング導線
4. `TASK-165` データ共有出力（PDF/印刷向け）
5. `TASK-164` 変更履歴（監査ログ）表示
6. `TASK-163` 通知設定UI（投薬リマインダー実利用化）
7. `TASK-162` Empty State改善（次アクション導線つき）
8. `TASK-161` ローディング/スケルトンの統一
9. `TASK-160` 共通フィードバックUI（成功/失敗トースト）導入
10. `TASK-159` ペット詳細ページの情報密度最適化（セクションナビ）
11. `TASK-158` 緊急公開画面の視認性改善（救急モードUI）
6. `TASK-157` 緊急公開画面にワンタップ導線追加
6. `TASK-156` 設定表示APIのPrisma delegate未生成時500エラー修正
4. `TASK-155` 検査/設定修正 + 拡張項目自由化（複数指定）
5. `TASK-154` ペット詳細表示時のコンソールエラー修正
6. `TASK-153` PRマージ前チェックをCI実行結果と連動強制
7. `TASK-152` 検査カテゴリ基盤再設計（DB/API/型）
8. `TASK-151` 健康記録UIをカテゴリ分離 + 尿項目段階導入
9. `TASK-150` ペット単位表示設定のデータモデル/API実装
10. `TASK-149` 設定画面での表示ON/OFF管理UI
11. `TASK-148` 緊急公開画面への追加表示（直近サマリー）反映
12. `TASK-147` 設定画面のログイン情報更新失敗を修正
13. `TASK-146` 課金機能（Stripe定期課金MVP・月額500円）
14. `TASK-145` 家族情報＋ログイン情報の表示/追加/編集（権限管理込み）
15. `TASK-144` ログアウト機能（UI導線）
16. `TASK-143` ペット詳細ページ Runtime Error 修正
17. `TASK-142` テストデータ基盤整備（UI確認＋自動テスト両立）
18. `TASK-141` PRチェックCI再発火最適化とセルフレビュー3観点必須化
19. `TASK-140` PRチェックのマージ前/マージ後CI検証追加
20. `TASK-139` PR運用チェック項目のタイムライン整備
21. `TASK-138` 保護APIの認証・所有境界チェック強化
22. `TASK-137` ペット一覧/詳細の実データ化（モック撤去）
23. `TASK-136` ペット新規登録導線
24. `TASK-135` ペット基本情報編集導線
25. `TASK-134` 緊急情報・投薬の編集導線実装
26. `TASK-133` 家族招待コード発行・共有導線
27. `TASK-132` ログイン失敗時のランタイム例外表示修正
28. `TASK-131` 新規ユーザー登録導線の追加
29. `TASK-130` 公開緊急RPC未配置時のフォールバック対応
30. `TASK-129` TASK完了時のIssueクローズ必須化
29. `TASK-128` TASK作成時のIssue必須化と並行実装向け分割方針の追加
30. `TASK-127` 公開緊急導線の整合化（QRトークン/ドキュメント/E2E）
31. `TASK-126` 実装運用の必須ガード（AGENTS/PRテンプレ/CI）
32. `TASK-125` health APIのpetId UUIDバリデーション強化（500→400）
33. `TASK-124` Prisma adapter未設定による500エラー修正
34. `TASK-123` 健康トラッキングのテスト拡充（unit/integration/e2e）
35. `TASK-122` 健康トラッキングのグラフ可視化UI
36. `TASK-121` 健康トラッキングの入力UI
37. `TASK-120` 健康トラッキングAPI/スキーマ整備
38. `TASK-119` 実DB統合テスト + CI記載更新
39. `TASK-118` ワクチン履歴編集フロー
40. `TASK-117` 投薬リマインダー実送信
41. `TASK-116` 医療記録追加フォーム永続化
42. `TASK-115` 写真Storageアップロード接続
43. `TASK-114` QRトークン再生成UI連携
44. `TASK-113` 公開緊急APIのRPC移行
45. `TASK-112` 認証/招待ユーザー連携
46. `TASK-111` 疾患非依存の健康トラッキング + グラフ表示
47. `TASK-110` 基盤セットアップ（Next.js + Supabase + Prisma）
48. `TASK-109` 認証 + 家族招待コード基盤
49. `TASK-108` スキーマ + RLS実装
50. `TASK-107` ペットプロフィール + 写真管理
51. `TASK-106` 緊急情報 + QR公開画面
52. `TASK-105` 医療タイムライン
53. `TASK-104` 投薬管理 + カレンダー
54. `TASK-103` ワクチン・予防歴
55. `TASK-102` 統合テスト（unit/integration/e2e）
56. `TASK-101` ドキュメント整備

---

## 正式タスク詳細

### サブスク課金 UI/UX 刷新（設定画面・転換率最適化）
- Task ID: `TASK-177`
- ブランチ: `feat/TASK-177-billing-ux-conversion-refresh`
- ステータス: `done`
- 概要: `/settings` の課金セクションを行動中心に再設計し、Checkout遷移率の改善と契約中ユーザーの自己解決導線（管理ポータル）を整備する
- Issue: `#183`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `POST /api/billing/portal` を追加し、認証ユーザーがStripe管理ポータルへ遷移できる
  - 課金セクションを状態別アクション中心へ刷新し、非アクティブ時はCheckout、アクティブ時はPortal導線を表示する
  - 課金文言を定数化し、将来A/Bテストで差し替えしやすい構造にする
  - `tests/integration/billing-portal-route.test.ts` を追加する
  - `tests/e2e/settings-account.spec.ts` で状態別CTA表示・押下ハンドリングを検証する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 商用化運用ドキュメント整備（法務/運用/事業/チェックリスト）
- Task ID: `TASK-176`
- ブランチ: `docs/TASK-176-commercial-readiness-docs`
- ステータス: `done`
- 概要: 商用利用へ向けた法務・運用・事業観点のガイドとローンチチェックリストを追加し、README から参照可能にする
- Issue: `#181`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `docs/commercial-legal-ja.md` / `docs/commercial-operations-ja.md` / `docs/commercial-business-ja.md` を追加する
  - `docs/commercial-launch-checklist-ja.md` を追加する
  - README のドキュメント一覧に商用化ドキュメント導線を追加する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 課金必須化（30日トライアル/680円）と世帯自動作成・seed削除導線整備
- Task ID: `TASK-175`
- ブランチ: `feat/TASK-175-billing-paywall-trial-30d`
- ステータス: `done`
- 概要: 30日無料トライアル + 月額680円の課金必須化を実装し、トライアル終了後の運用機能停止を徹底する。あわせてsignup後の世帯未作成による400を解消し、seedデータ削除専用コマンドを追加する
- Issue: `#178`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - 課金APIが `planTier` / `subscriptionStatus` / `trialEndsAt` / `accessPolicy` を返す
  - inactive時に作成/編集/通知/共有/出力が停止し、履歴閲覧は30日に制限される
  - signup直後ユーザーで `/api/households/members` と `/api/settings/display` が400にならない
  - `seed:test:clear` コマンドでseedデータを再投入なしに削除できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### GitHub Actions Nodeランタイム更新（deprecation対応）
- Task ID: `TASK-172`
- ブランチ: `chore/TASK-172-actions-node-runtime-upgrade`
- ステータス: `done`
- 概要: GitHub Actions の Node deprecation 警告に対応し、CIワークフローの将来停止リスクを解消する
- Issue: `#166`
- 依存関係:
  - prerequisite: なし
- 派生元（PR/Issue）:
  - PR: `#109`
- 完了条件:
  - deprecation対象のAction/ランタイムを特定し、サポート対象へ更新する
  - CI主要ジョブがグリーンであることを確認する
  - `docs/development-workflow.md` の運用記述を必要に応じて更新する
  - `npm run lint` / `npx vitest run` が通る

### 緊急公開向け入力品質のバリデーション強化
- Task ID: `TASK-171`
- ブランチ: `fix/TASK-171-emergency-input-validation-hardening`
- ステータス: `done`
- 概要: 緊急公開画面の即時行動導線（tel/地図）の信頼性向上のため、電話番号・病院名など入力品質の検証を強化する
- Issue: `#165`
- 依存関係:
  - prerequisite: なし
- 派生元（PR/Issue）:
  - PR: `#146`
  - Issue: `#136`
- 完了条件:
  - 緊急情報APIで電話番号・病院名のバリデーション方針を明確化し実装する
  - UI入力補助（形式ヒント、エラー文言など）を追加する
  - 公開画面で無効値の安全フォールバックを確認する
  - 境界値テスト（integration/e2e）を追加する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 投薬リマインダーの定期送信ジョブ化
- Task ID: `TASK-170`
- ブランチ: `feat/TASK-170-medication-reminder-scheduler`
- ステータス: `done`
- 概要: 投薬リマインダー設定UIは実装済みのため、定期送信ジョブを実装して実運用で通知が発火する状態にする
- Issue: `#164`
- 依存関係:
  - prerequisite: なし
- 派生元（PR/Issue）:
  - PR: `#157`
  - Issue: `#142`
- 完了条件:
  - 定期実行ジョブ（cron/worker）で有効なリマインダーを走査して送信できる
  - 失敗時リトライ/ログ方針を定義する
  - 最小限の統合テストを追加し、重複送信を防止する
  - `npm run lint` / `npx vitest run`（必要なら `npm run test:e2e`）が通る

### 投薬リマインダー日次判定のタイムゾーン基準化
- Task ID: `TASK-173`
- ブランチ: `feat/TASK-173-reminder-timezone-basis`
- ステータス: `done`
- 概要: 投薬リマインダーの日次重複判定がUTC基準のため、運用タイムゾーン基準で判定できるようにする
- Issue: `#173`
- 依存関係:
  - prerequisite: `TASK-170`
- 完了条件:
  - 日次判定の基準タイムゾーンを設定可能にする
  - 既存挙動との互換（未設定時のデフォルト）を定義する
  - ユニット/統合テストで日付境界ケースを追加する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### Seedデータ再設計（2名・10匹のケース拡充）
- Task ID: `TASK-174`
- ブランチ: `test/TASK-174-seed-showcase-2-members-10-pets`
- ステータス: `in_progress`
- 概要: Seedデータを1世帯2名・10匹へ整理し、ケース多様性と再投入時のクリーン性を両立する
- Issue: `#176`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `showcase` シナリオで2名（OWNER/FAMILY）と10匹が作成される
  - ペットごとに疾患有無・投薬有無・ワクチン期限・検査値差分など複数ケースを持つ
  - 既存seed残骸が `reset -> seed` で残らない
  - `npm run lint` / `npx vitest run` が通る

### 変更履歴の時刻精度改善（updatedAt基準化）
- Task ID: `TASK-169`
- ブランチ: `feat/TASK-169-change-history-updated-at`
- ステータス: `done`
- 概要: 変更履歴（監査ログ）で投薬/ワクチン/医療記録が createdAt 基準になっているため、更新追跡の精度を改善する
- Issue: `#163`
- 依存関係:
  - prerequisite: なし
- 派生元（PR/Issue）:
  - PR: `#158`
  - Issue: `#143`
- 完了条件:
  - 投薬/ワクチン/医療記録で更新時刻を保持できる（updatedAtまたは同等）
  - 変更履歴表示が更新時刻基準で並ぶ
  - 既存データ互換方針を定義し、回帰テストを追加する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### PR作成〜mainマージ運用の段階ガード化（実態厳密）
- Task ID: `TASK-167`
- ブランチ: `feat/TASK-167-ci-stage-guard-strict-flow`
- ステータス: `done`
- 概要: PR本文チェックとCIガードの評価タイミングを段階化し、運用ルールと実態の時系列不整合を解消する
- Issue: `#147`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - PR初期イベントで `ci_*` チェックボックス未入力でも `PR Pre-Merge Guard` が失敗しない
  - `edited` イベント時のみ `ci_green_confirmed` / `self_review_final_done_after_ci_green` / `ready_for_main_merge` を検証する
  - `push` on `main` 時に `issue_closed_on_task_done` と対応Issueのクローズ状態を検証できる
  - PRテンプレと運用ドキュメントが段階ガードの時系列に一致する
  - `npm run lint` / `npx vitest run` が通る

### 緊急公開画面にワンタップ導線追加
- Task ID: `TASK-157`
- ブランチ: `feat/TASK-157-emergency-public-quick-actions`
- ステータス: `done`
- 概要: 緊急公開画面に電話・地図のワンタップ導線を追加し、救急時の即応性を高める
- Issue: `#136`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `tel:` リンクで緊急連絡先/病院へ1タップ発信できる
  - 病院名登録時のみ地図リンクを表示する
  - 未登録項目は安全に非表示で表示崩れがない
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 緊急公開画面の視認性改善（救急モードUI）
- Task ID: `TASK-158`
- ブランチ: `feat/TASK-158-emergency-public-visual-priority`
- ステータス: `done`
- 概要: 薬・アレルギー・連絡先を優先表示する救急モードUIへ再構成する
- Issue: `#137`
- 依存関係:
  - blocked by: `TASK-157`
- 完了条件:
  - 重要情報がファーストビューで確認可能
  - 文字サイズ/余白が救急閲覧向けに最適化される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ペット詳細ページの情報密度最適化（セクションナビ）
- Task ID: `TASK-159`
- ブランチ: `feat/TASK-159-pet-detail-section-navigation`
- ステータス: `done`
- 概要: `/pets/[petId]` にセクションナビを追加し、主要機能へ即時遷移できるようにする
- Issue: `#138`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - 基本/緊急/投薬/健康/記録へのジャンプ導線がある
  - 初回表示の探索コストが低減する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 共通フィードバックUI（成功/失敗トースト）導入
- Task ID: `TASK-160`
- ブランチ: `feat/TASK-160-shared-feedback-toast`
- ステータス: `done`
- 概要: 主要画面の成功/失敗メッセージを共通トーストコンポーネントへ統一する
- Issue: `#139`
- 依存関係:
  - blocked by: `TASK-159`
- 完了条件:
  - settings/invite/new pet/主要編集カードで共通表示になる
  - 文言/色/表示ルールが統一される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ローディング/スケルトンの統一
- Task ID: `TASK-161`
- ブランチ: `feat/TASK-161-shared-loading-skeleton`
- ステータス: `done`
- 概要: 主要CRUD画面に初期ロードスケルトンと送信中UIを統一導入する
- Issue: `#140`
- 依存関係:
  - blocked by: `TASK-160`
- 完了条件:
  - 読み込み中の無反応に見える状態が解消される
  - 保存中状態が統一される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### Empty State改善（次アクション導線つき）
- Task ID: `TASK-162`
- ブランチ: `feat/TASK-162-empty-state-cta`
- ステータス: `done`
- 概要: 空状態にCTAを追加し、初回ユーザーが次アクションを理解できるようにする
- Issue: `#141`
- 依存関係:
  - blocked by: `TASK-161`
- 完了条件:
  - pets一覧/健康記録/医療記録/写真の空状態にCTAがある
  - 次操作が迷わず実行できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 通知設定UI（投薬リマインダー実利用化）
- Task ID: `TASK-163`
- ブランチ: `feat/TASK-163-medication-reminder-settings-ui`
- ステータス: `done`
- 概要: 投薬リマインダーに設定UIを追加し、通知のON/OFFや送信先を管理可能にする
- Issue: `#142`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - 通知設定の保存と反映ができる
  - 既存リマインダー基盤と整合する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 変更履歴（監査ログ）表示
- Task ID: `TASK-164`
- ブランチ: `feat/TASK-164-change-history-view`
- ステータス: `done`
- 概要: 緊急情報/投薬/ワクチン/医療記録の更新履歴を表示し共同編集の追跡性を上げる
- Issue: `#143`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - 更新時刻と変更対象の一覧が表示される
  - 家族運用で変更追跡できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### データ共有出力（PDF/印刷向け）
- Task ID: `TASK-165`
- ブランチ: `feat/TASK-165-care-summary-print-export`
- ステータス: `done`
- 概要: 通院提出用の基本/緊急/投薬サマリーを印刷またはPDF出力可能にする
- Issue: `#144`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - 詳細画面から1クリックで出力導線を実行できる
  - 出力内容に基本/緊急/投薬が含まれる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 初回オンボーディング導線
- Task ID: `TASK-166`
- ブランチ: `feat/TASK-166-first-time-onboarding-checklist`
- ステータス: `done`
- 概要: 初回ユーザー向けに3ステップチェックリストを実装し、完了率計測可能な状態を作る
- Issue: `#145`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - ペット登録→緊急情報→QR共有の進行表示がある
  - 3ステップの完了率計測の土台がある
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 検査/設定修正 + 拡張項目自由化（複数指定）
- Task ID: `TASK-155`
- ブランチ: `feat/TASK-155-health-settings-extension-multi`
- ステータス: `done`
- 概要: 検査カテゴリ分離の未反映修正、表示トグルのオーナー単位化、拡張項目の自由キー化・複数指定対応、ワクチン履歴補完（日付説明/OTHER自由記載）を同時実装する
- Issue: `#132`
- 依存関係:
  - prerequisite: `TASK-152`
  - prerequisite: `TASK-151`
  - prerequisite: `TASK-150`
- 完了条件:
  - 検査マーカーが `血液18項目 + 尿5項目 + 内分泌7項目` に拡張される
  - `category-marker` 整合バリデーションとUI選択肢が新マーカーセットに追従する
  - 拡張項目が自由キー名 + 数値値で複数指定でき、履歴/グラフに反映される
  - `POST/GET /api/pets/[petId]/health/extensions` が `name` ベース契約へ移行する
  - 既存 `INFUSION_ML` データが `name=点滴量` として互換表示される
  - ワクチン履歴で日付説明が追加され、`OTHER` 選択時に自由記載名が保存される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 設定表示APIのPrisma delegate未生成時500エラー修正
- Task ID: `TASK-156`
- ブランチ: `fix/TASK-156-settings-display-prisma-delegate-guard`
- ステータス: `done`
- 概要: `/api/settings/display` で `prisma.ownerDisplaySettings` が未生成な実行環境でも500で落ちないように防御し、再発防止テストを追加する
- Issue: `#134`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `GET /api/settings/display` で delegate未生成時に500を返さず、既定設定で応答できる
  - `PATCH /api/settings/display` で delegate未生成時は明示的なエラーを返す
  - 対象APIのテストで未生成ケースを検証できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### PRマージ前チェックをCI実行結果と連動強制
- Task ID: `TASK-153`
- ブランチ: `feat/TASK-153-pre-merge-guard-ci-linked`
- ステータス: `done`
- 概要: PR本文チェックの自己申告だけではなく、head SHAの必須CIチェック結果を参照してマージ前ガードを強制する
- Issue: `#125`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `PR Pre-Merge Guard` が `Lint` / `Unit/Integration (Vitest)` / `DB Integration (Real Postgres)` / `E2E (Playwright)` の成功を確認する
  - CI未完了または失敗時に、PR本文で `ci_green_confirmed` をチェックしてもガードが失敗する
  - `npm run lint` / `npx vitest run` が通る

### ペット詳細表示時のコンソールエラー修正
- Task ID: `TASK-154`
- ブランチ: `fix/TASK-154-pet-detail-console-error`
- ステータス: `done`
- 概要: `/pets/[petId]` 表示時に発生するコンソールエラーを、DBスキーマの正規適用で解消する
- Issue: `#130`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - `PetLabResultEntry.category` を含む最新マイグレーションが適用され、ペット詳細APIで500が発生しない
  - ローカル初期化手順としてDBスキーマ最新化コマンドが運用ドキュメント化される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 検査カテゴリ基盤再設計（DB/API/型）
- Task ID: `TASK-152`
- ブランチ: `feat/TASK-152-health-lab-category-foundation`
- ステータス: `done`
- 概要: 健康記録の検査データにカテゴリ（BLOOD/URINE/ENDOCRINE）を導入し、API契約とバリデーション、既存データ移行を整備する
- Issue: `#117`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - Prisma migration でカテゴリ列が追加され、既存データに `BLOOD` が移行される
  - `/api/pets/[petId]/health/lab-results` が `category` を扱い、category-marker整合性を検証する
  - 型/バリデーション/テストが新契約に追従する
  - `npm run lint` / `npx vitest run` が通る

### 健康記録UIをカテゴリ分離 + 尿項目段階導入
- Task ID: `TASK-151`
- ブランチ: `feat/TASK-151-health-ui-category-split`
- ステータス: `done`
- 概要: 健康記録UIを血液・尿・内分泌で分離し、尿項目（尿糖/尿ケトン/尿比重/尿蛋白/UPCR）を段階導入する
- Issue: `#118`
- 依存関係:
  - blocked by: `TASK-152`
- 完了条件:
  - 健康記録フォームがカテゴリ別に分離される
  - 尿カテゴリで `URINE_GLUCOSE` / `URINE_KETONE` / `USG` / `URINE_PROTEIN` / `UPCR` を選択できる
  - 履歴/表示がカテゴリモデルに対応する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ペット単位表示設定のデータモデル/API実装
- Task ID: `TASK-150`
- ブランチ: `feat/TASK-150-pet-display-settings-api`
- ステータス: `done`
- 概要: ペット単位で詳細カード表示・緊急追加表示を制御する設定モデルとAPIを実装する
- Issue: `#119`
- 依存関係:
  - prerequisite: なし
- 完了条件:
  - ペット単位表示設定（詳細4カード+緊急3項目）の永続化モデルが追加される
  - 設定GET/PATCH API が認可境界を満たして実装される
  - 未設定時は全ONのデフォルト挙動を満たす
  - `npm run lint` / `npx vitest run` が通る

### 設定画面での表示ON/OFF管理UI
- Task ID: `TASK-149`
- ブランチ: `feat/TASK-149-settings-pet-display-toggles`
- ステータス: `done`
- 概要: 設定画面にペット単位の表示ON/OFFトグルUIを追加し、詳細カード4種と緊急追加表示3種を管理可能にする
- Issue: `#120`
- 依存関係:
  - blocked by: `TASK-150`
- 完了条件:
  - 設定画面でペットごとの表示設定を編集できる
  - 詳細カード（投薬/ワクチン/健康/医療記録）表示トグルが保存される
  - 緊急追加表示（投薬/ワクチン/医療記録）トグルが保存される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 緊急公開画面への追加表示（直近サマリー）反映
- Task ID: `TASK-148`
- ブランチ: `feat/TASK-148-emergency-public-extra-summary`
- ステータス: `done`
- 概要: 緊急公開画面に投薬・ワクチン・医療記録の直近サマリー表示を設定連動で追加する
- Issue: `#121`
- 依存関係:
  - blocked by: `TASK-150`
- 完了条件:
  - 公開緊急データ取得で表示設定を参照し、ON項目のみ返却する
  - `EmergencyViewPayload` と画面表示が追加セクションに対応する
  - 各カテゴリは最新3件の要約を表示できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 設定画面のログイン情報更新失敗を修正
- Task ID: `TASK-147`
- ブランチ: `fix/TASK-147-settings-account-update-failure`
- ステータス: `done`
- 概要: 設定画面の「ログイン情報」更新時に失敗する不具合を修正し、再発防止テストを追加する
- Issue: `#115`
- 依存関係:
  - prerequisite: `TASK-145`
- 完了条件:
  - 設定画面から表示名またはパスワード更新操作が失敗せず完了できる
  - 更新不要（変更なし）時にユーザーへ適切な案内を表示できる
  - account更新API/画面のテストで再発防止を確認できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 課金機能（Stripe定期課金MVP・月額500円）
- Task ID: `TASK-146`
- ブランチ: `feat/TASK-146-stripe-subscription-mvp`
- ステータス: `done`
- 概要: Stripeテストモードで単一プラン（500 JPY / month）の定期課金MVPを実装する
- Issue: `#111`
- 依存関係:
  - prerequisite: `TASK-145`
  - prerequisite: `TASK-144`
- 完了条件:
  - プラン表示UIとCheckout開始導線を提供する
  - Webhookで契約状態をDBへ反映できる
  - 非契約ユーザーに機能制限表示を出せる
  - テスト決済で `active` への遷移を確認できる
  - 解約/失敗時の状態遷移を確認できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 家族情報＋ログイン情報の表示/追加/編集（権限管理込み）
- Task ID: `TASK-145`
- ブランチ: `feat/TASK-145-family-account-management`
- ステータス: `done`
- 概要: 家族情報とログイン情報の表示/追加/編集導線を整備し、メンバー権限管理を追加する
- Issue: `#112`
- 完了条件:
  - 家族メンバー一覧を表示できる
  - 招待/参加管理ができる
  - メンバー権限（閲覧/編集）変更が反映される
  - 非権限ユーザーの編集操作を拒否できる
  - メール表示・パスワード変更・プロフィール編集（表示名など）ができる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ログアウト機能（UI導線）
- Task ID: `TASK-144`
- ブランチ: `feat/TASK-144-logout-ui-flow`
- ステータス: `done`
- 概要: 既存の `POST /api/auth/logout` をUI導線から実行できるようにする
- Issue: `#110`
- 完了条件:
  - ログイン状態から1操作でログアウトできる
  - ログアウト成功時に `/login` へ遷移する
  - ログアウト後に保護ページへ直接アクセスしても `/login` に戻る
  - ログアウト失敗時にユーザー向けエラーメッセージを表示する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ペット詳細ページ Runtime Error 修正
- Task ID: `TASK-143`
- ブランチ: `feat/TASK-142-test-data-seed-scenarios`
- ステータス: `done`
- 概要: `/pets/[petId]` で `Failed to load pet detail` が発生するケースを修正し、再発防止テストを追加する
- Issue: `#108`
- 完了条件:
  - ペット詳細ページで Runtime Error が発生しない
  - API失敗時に画面がクラッシュせず、適切な遷移またはエラー表示になる
  - `npm run lint` / `npx vitest run` が通る

### テストデータ基盤整備（UI確認＋自動テスト両立）
- Task ID: `TASK-142`
- ブランチ: `feat/TASK-142-test-data-seed-scenarios`
- ステータス: `done`
- 概要: 手動UI確認向け多ケースデータと自動テスト向け軽量データを分離投入できるseed基盤を追加する
- Issue: `#107`
- 完了条件:
  - `npm run seed:test:baseline` / `npm run seed:test:showcase` / `npm run seed:test:reset` を提供する
  - seed対象のみを限定削除して再投入できる（他データを保持）
  - pets / emergency / medications / vaccinations / health / invite の主要ケースを投入できる
  - seed識別ロジックと削除制限をunit testで検証する
  - 実行手順と注意点（テスト/ローカルDB用途）をドキュメント化する

### PRチェックCI再発火最適化とセルフレビュー3観点必須化
- Task ID: `TASK-141`
- ブランチ: `fix/TASK-141-pr-ci-efficiency-self-review`
- ステータス: `done`
- 概要: PR本文更新（edited）でガードのみ再評価できるようCIを最適化し、最終セルフレビューを3観点テンプレで必須化する
- Issue: `#101`
- 完了条件:
  - PR本文更新時にガードジョブだけ再実行され、重いテストジョブは再実行されない
  - 空コミットなしでマージ前チェックを再評価できる
  - 最終セルフレビュー3観点（差分妥当性/不要変更混入/残リスク）がPR本文で必須化される
  - 関連ドキュメント（PRテンプレ説明/開発フロー）が運用と一致する

### PRチェックのマージ前/マージ後CI検証追加
- Task ID: `TASK-140`
- ブランチ: `fix/TASK-140-pr-checklist-merge-phase-guard`
- ステータス: `done`
- 概要: PRテンプレートの「マージ前（CI完了後）」「マージ後」チェック項目をCIで検証できるようにし、未実施のまま通過しない運用へ揃える
- Issue: `#98`
- 完了条件:
  - PR作成前/作成時チェックに加えて、マージ前チェックをCIで検証できる
  - マージ後チェック（Issueクローズ）をCIで検知できる
  - PRテンプレートとCI実装の必須項目が一致する

### PR運用チェック項目のタイムライン整備
- Task ID: `TASK-139`
- ブランチ: `docs/TASK-139-pr-checklist-timeline`
- ステータス: `done`
- 概要: PR作成前/作成時/CI完了後/マージ後の実施順に合わせて、AGENTS・PRテンプレート・Codex公開スキルの運用チェック項目を整備する
- Issue: `#95`
- 完了条件:
  - 通常PR（Ready for review）をデフォルト運用として明記される
  - 一次セルフレビュー（PR前）と最終セルフレビュー（CI完了後）が明記される
  - チェック項目が時系列に沿って整理される
  - TASK完了時のIssueクローズがマージ後工程として明記される

### 保護APIの認証・所有境界チェック強化
- Task ID: `TASK-138`
- ブランチ: `fix/TASK-138-pets-api-authz-boundary`
- ステータス: `done`
- 概要: `/api/pets*` 全体で `auth.getUser()` 確認と household/pet 所属境界チェックを統一し、保護APIの認可を強化する
- Issue: `#88`
- 完了条件:
  - 未認証アクセスで 401 を返す
  - 他世帯データアクセスを 403/404 で遮断する
  - 既存正常系を維持する
  - 境界系 integration test を追加する

### ペット一覧/詳細の実データ化（モック撤去）
- Task ID: `TASK-137`
- ブランチ: `feat/TASK-137-pets-pages-real-data`
- ステータス: `done`
- 概要: `mockPets` と固定 `pet` オブジェクトを撤去し、`/pets` と `/pets/[petId]` を永続データ表示へ切り替える
- Issue: `#91`
- 完了条件:
  - `/pets` が実データ一覧・空状態・エラー状態を表示する
  - `/pets/[petId]` の初期表示が永続データに一致する
  - リロードで更新内容が反映される

### ペット新規登録導線
- Task ID: `TASK-136`
- ブランチ: `feat/TASK-136-pet-create-flow`
- ステータス: `done`
- 概要: `/pets/new` を追加し、`POST /api/pets` に接続して新規ペット作成導線を提供する
- Issue: `#92`
- 完了条件:
  - 一覧に「ペットを追加」導線がある
  - 作成成功で詳細または一覧へ遷移する
  - 入力バリデーションとエラー表示を実装する

### ペット基本情報編集導線
- Task ID: `TASK-135`
- ブランチ: `feat/TASK-135-pet-profile-edit`
- ステータス: `done`
- 概要: 基本プロフィール編集UIと `PATCH /api/pets/[petId]` を追加する
- Issue: `#90`
- 完了条件:
  - 詳細画面から編集導線を追加する
  - `PATCH /api/pets/[petId]` を追加する
  - 更新後表示が即時反映される

### 緊急情報・投薬の編集導線実装
- Task ID: `TASK-134`
- ブランチ: `feat/TASK-134-emergency-medication-edit-flow`
- ステータス: `done`
- 概要: 表示中心の `EmergencyCard` と `MedicationCalendar` を実運用入力に接続する
- Issue: `#89`
- 完了条件:
  - 緊急情報の編集フォームを実装する（既存PUT API利用）
  - 投薬の追加/編集UIを実装する（必要に応じPATCH API追加）
  - 初期表示と保存結果が一致する

### 家族招待コード発行・共有導線
- Task ID: `TASK-133`
- ブランチ: `feat/TASK-133-household-invite-code-ui`
- ステータス: `done`
- 概要: `POST /api/households/invite-codes` のUI導線を追加し、招待コード発行・共有を可能にする
- Issue: `#93`
- 完了条件:
  - 招待コード発行画面/操作を提供する
  - 発行後にコピー・共有しやすい表示を提供する
  - 失敗時のユーザー向けエラーハンドリングを実装する

### ログイン失敗時のランタイム例外表示修正
- Task ID: `TASK-132`
- ブランチ: `fix/TASK-132-login-error-handling`
- ステータス: `done`
- 概要: ログイン失敗時にランタイム例外を出さず、ログイン画面でユーザー向けエラーメッセージを表示する
- Issue: `#86`
- 完了条件:
  - 認証失敗時に `throw` せずログイン画面でエラーメッセージが表示される
  - `/login` 画面からエラー状態を確認できるUIテストが追加される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 新規ユーザー登録導線の追加
- Task ID: `TASK-131`
- ブランチ: `feat/TASK-131-user-signup-flow`
- ステータス: `done`
- 概要: メール/パスワードで新規ユーザー登録できる画面導線と認証APIを追加
- Issue: `#84`
- 完了条件:
  - `/signup` 画面からメール/パスワードで登録リクエストを送信できる
  - `POST /api/auth/signup` が入力バリデーションとSupabase登録呼び出しを実装する
  - `/login` と `/signup` 間の遷移リンクが利用できる
  - 登録成功後に `/login` 上で確認メール送信案内が表示される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 公開緊急RPC未配置時のフォールバック対応
- Task ID: `TASK-130`
- ブランチ: `fix/TASK-130-public-emergency-rpc-fallback`
- ステータス: `done`
- 概要: `get_public_emergency_by_token` がSupabase環境で未検出の場合でも公開緊急ページ/APIが500にならないようにする
- Issue: `#82`
- 完了条件:
  - RPC未検出エラー時に公開緊急データ取得がフォールバック経路で継続できる
  - 通常のRPCエラーは従来どおり例外として扱われる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### TASK完了時のIssueクローズ必須化
- Task ID: `TASK-129`
- ブランチ: `docs/TASK-129-task-done-close-issue`
- ステータス: `done`
- 概要: TASK完了時に対応Issueを必ずクローズする運用を、ドキュメント・PRテンプレート・CIチェックへ反映
- Issue: `#76`
- 完了条件:
  - `AGENTS.md` と `TASKS.md` にTASK完了時のIssueクローズ必須が追記される
  - `docs/development-workflow.md` にIssueクローズ手順が追記される
  - PRテンプレートとCIチェックに `issue_closed_on_task_done` が追加される

### TASK作成時のIssue必須化と並行実装向け分割方針の追加
- Task ID: `TASK-128`
- ブランチ: `docs/TASK-128-task-issue-parallel-policy`
- ステータス: `done`
- 概要: 新規TASK作成時のIssue必須化と、CodexAppの並行実装を想定したIssue分割ルールを運用ドキュメントに追加
- Issue: `#75`
- 完了条件:
  - `AGENTS.md` にTASKとIssueの紐付け必須が追記される
  - `TASKS.md` の運用ルールにIssue作成/分割/依存関係明示が追記される
  - PRテンプレートとCIチェックにIssue管理チェック項目が追加される

### 公開緊急導線の整合化（QRトークン/ドキュメント/E2E）
- Task ID: `TASK-127`
- ブランチ: `feat/TASK-127-public-emergency-flow-alignment`
- ステータス: `done`
- 概要: 公開QR導線のURL整合、トークン無効化API、関連ドキュメント、E2E導線を一貫させる
- 完了条件:
  - `GET /api/pets/[petId]/qr-image` が `PetEmergencyToken` ベースの公開URLを返す
  - `DELETE /api/pets/[petId]/qr-token` でトークン無効化（`isActive=false`）ができる
  - 公開導線のE2E（正常系/404系）が追加される
  - 関連ドキュメント（ER/導線/API/RLS/テストマップ）が実装と整合する
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 実装運用の必須ガード（AGENTS/PRテンプレ/CI）
- Task ID: `TASK-126`
- ブランチ: `chore/TASK-126-delivery-guardrail`
- ステータス: `done`
- 概要: 実装時の必須運用（タスク/ブランチ/テスト/PR/CI/セルフレビュー/mainマージ）を文書化し、PRテンプレートとCIで実行漏れを抑止
- 完了条件:
  - `AGENTS.md` に毎回の必須フローが追記される
  - `.github/pull_request_template.md` に必須チェックリストが追加される
  - `.github/workflows/ci.yml` でブランチ命名とPRチェックリスト完了が検証される

### Prisma adapter未設定による500エラー修正
- Task ID: `TASK-124`
- ブランチ: `fix/TASK-124-prisma-adapter-client-engine`
- ステータス: `done`
- 概要: Prisma Clientの`engineType=client`構成でadapter未指定時に発生するAPI 500を解消
- 完了条件:
  - `src/lib/prisma.ts` が adapter 前提で初期化される
  - `/api/pets/[petId]/health/*` の500が解消する
  - `npm run lint` / `npx vitest run` が通る

### health APIのpetId UUIDバリデーション強化（500→400）
- Task ID: `TASK-125`
- ブランチ: `fix/TASK-125-health-petid-uuid-validation`
- ステータス: `done`
- 概要: `/api/pets/[petId]/health/*` で不正なpetId（UUID以外）入力時に500ではなく400を返す
- 完了条件:
  - health API 4ルート（core-metrics/lab-results/extensions/trends）でpetId UUIDを検証
  - 不正petId時にDBアクセス前に400を返す
  - 該当integration testに不正petIdケースが追加される
  - `npm run lint` / `npx vitest run` が通る

### 疾患非依存の健康トラッキング + グラフ表示
- Task ID: `TASK-111`
- ブランチ: `feat/TASK-111-health-metrics-tracking-graphs`
- ステータス: `done`
- 概要: 全ペット共通コア項目 + 拡張項目（例: 点滴量）を記録し、時系列グラフで可視化
- 完了条件:
  - `POST/GET /api/pets/[petId]/health/core-metrics` が実装される
  - `POST/GET /api/pets/[petId]/health/lab-results` が実装される
  - `POST/GET /api/pets/[petId]/health/extensions` が実装される
  - `GET /api/pets/[petId]/health/trends` が実装される
  - ペット詳細画面に健康記録セクション（入力/履歴/グラフ）が表示される
  - `npm run lint` / `npx vitest run` が通る

### 健康トラッキングAPI/スキーマ整備
- Task ID: `TASK-120`
- ブランチ: `feat/TASK-120-health-metrics-api-schema-clean`
- ステータス: `done`
- 概要: 共通コア + 拡張セットの保存モデルとAPI契約を整備

### 健康トラッキングの入力UI
- Task ID: `TASK-121`
- ブランチ: `feat/TASK-121-health-metrics-input-ui`
- ステータス: `done`
- 概要: 共通フォームと条件付き拡張フォームを提供

### 健康トラッキングのグラフ可視化UI
- Task ID: `TASK-122`
- ブランチ: `feat/TASK-122-health-metrics-graph-ui`
- ステータス: `done`
- 概要: 項目切替可能な時系列グラフを実装

### 健康トラッキングのテスト拡充（unit/integration/e2e）
- Task ID: `TASK-123`
- ブランチ: `test/TASK-123-health-metrics-coverage`
- ステータス: `done`
- 概要: バリデーション、API、主要画面導線を自動テスト化

### 実DB統合テスト + CI記載更新
- Task ID: `TASK-119`
- ブランチ: `test/TASK-119-db-integration-and-ci-docs`
- ステータス: `done`
- 概要: 実DB統合テストとCI連携ドキュメントを更新

### ワクチン履歴編集フロー
- Task ID: `TASK-118`
- ブランチ: `feat/TASK-118-vaccination-edit-flow`
- ステータス: `done`
- 概要: ワクチン履歴の追加/編集導線を実装

### 投薬リマインダー実送信
- Task ID: `TASK-117`
- ブランチ: `feat/TASK-113-117-parallel-backend-wiring`
- ステータス: `done`
- 概要: 現在stubの通知処理を実送信へ切替

### 医療記録追加フォーム永続化
- Task ID: `TASK-116`
- ブランチ: `feat/TASK-116-medical-record-form-persistence`
- ステータス: `done`
- 概要: 記録追加UIをAPI永続化に接続

### 写真Storageアップロード接続
- Task ID: `TASK-115`
- ブランチ: `feat/TASK-107-pet-profile-photos`
- ステータス: `done`
- 概要: 画像アップロードをStorageに接続

### QRトークン再生成UI連携
- Task ID: `TASK-114`
- ブランチ: `feat/TASK-114-qr-token-rotation-ui`
- ステータス: `done`
- 概要: QRトークン再生成APIとUIを接続

### 公開緊急APIのRPC移行
- Task ID: `TASK-113`
- ブランチ: `feat/TASK-113-117-parallel-backend-wiring`
- ステータス: `done`
- 概要: 公開参照をRPCベースに統一

### 認証/招待ユーザー連携
- Task ID: `TASK-112`
- ブランチ: `feat/TASK-112-auth-invite-user-linkage`
- ステータス: `done`
- 概要: 招待参加導線を実ユーザー認証と接続

### 基盤セットアップ（Next.js + Supabase + Prisma）
- Task ID: `TASK-110`
- ブランチ: `chore/TASK-110-bootstrap-next-supabase-prisma`
- ステータス: `done`
- 概要: アプリ基盤、型、スタイル、テスト基盤を整備

### 認証 + 家族招待コード基盤
- Task ID: `TASK-109`
- ブランチ: `feat/TASK-109-auth-household-invite`
- ステータス: `done`
- 概要: メールログインと家族共同編集の参加導線を実装
- Issue: `#78`
- 完了条件:
  - `/login` からメール/パスワード認証を実行し、成功時に `/pets` へ遷移できる
  - `/invite/join` から招待コードで `POST /api/households/join` を実行できる
  - 招待参加の失敗時に、入力値を保持したままエラーが表示される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### スキーマ + RLS実装
- Task ID: `TASK-108`
- ブランチ: `feat/TASK-108-schema-rls-emergency-pet`
- ステータス: `done`
- 概要: 救急手帳向けDB設計とRLSポリシーを適用
- Issue: `#80`
- 完了条件:
  - `prisma/schema.prisma` と Supabase migration の主要テーブル構成が整合している
  - 世帯境界テーブルと健康系テーブルのRLS有効化/主要ポリシーを実DBで検証できる
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ペットプロフィール + 写真管理
- Task ID: `TASK-107`
- ブランチ: `feat/TASK-107-pet-profile-photos`
- ステータス: `done`
- 概要: 基本プロフィール編集と写真アップロード
- 完了条件:
  - `GET/POST /api/pets` と `GET /api/pets/[petId]` が integration test で検証される
  - `GET/POST /api/pets/[petId]/photos` と `POST /api/pets/[petId]/photos/upload-url` の正常系・異常系が integration test で検証される
  - ペット詳細画面でプロフィール/写真管理セクション表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 緊急情報 + QR公開画面
- Task ID: `TASK-106`
- ブランチ: `feat/TASK-106-emergency-qr-public-view`
- ステータス: `done`
- 概要: 最小情報公開の閲覧専用画面とQR共有
- 完了条件:
  - `PUT /api/pets/[petId]/emergency-info` の正常系・異常系（petId/入力値/存在確認）が integration test で検証される
  - `GET /api/pets/[petId]/qr-image` の petId バリデーションと生成結果が integration test で検証される
  - ペット詳細画面で緊急情報/QR共有セクションが e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 医療タイムライン
- Task ID: `TASK-105`
- ブランチ: `feat/TASK-105-medical-timeline`
- ステータス: `done`
- 概要: 診療・手術・検査履歴の時系列管理
- 完了条件:
  - `GET/POST /api/pets/[petId]/medical-records` の正常系・異常系が integration test で検証される
  - 医療タイムライングルーピングロジックが unit test で検証される
  - ペット詳細画面で医療記録タイムライン表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 投薬管理 + カレンダー
- Task ID: `TASK-104`
- ブランチ: `feat/TASK-104-medication-calendar-integration`
- ステータス: `done`
- 概要: 投薬スケジュール可視化と外部通知連携I/F
- 完了条件:
  - `GET/POST /api/pets/[petId]/medications` の正常系・異常系が integration test で検証される
  - 投薬カレンダー生成ロジックの境界条件（endDate 含む/開始日前）が unit test で検証される
  - ペット詳細画面で投薬カレンダー表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ワクチン・予防歴
- Task ID: `TASK-103`
- ブランチ: `feat/TASK-103-vaccination-prevention`
- ステータス: `done`
- 概要: 接種履歴と次回予定日管理
- 完了条件:
  - ワクチン履歴API（GET/POST/PATCH）の正常系・異常系が integration test で検証される
  - 次回予定日の期限判定ロジック（overdue/upcoming/ok）が unit test で検証される
  - ペット詳細画面でワクチン・予防歴セクション表示が e2e test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### 統合テスト（unit/integration/e2e）
- Task ID: `TASK-102`
- ブランチ: `test/TASK-102-mvp-test-coverage`
- ステータス: `done`
- 概要: 主要ユーザーフローの自動テスト整備
- 完了条件:
  - 招待コード系APIの異常系分岐（入力不正/期限切れ/使用済み）が integration test で検証される
  - 招待参加画面とペット詳細遷移が e2e test で検証される
  - 招待コード関連バリデータが unit test で検証される
  - `npm run lint` / `npx vitest run` / `npm run test:e2e` が通る

### ドキュメント整備
- Task ID: `TASK-101`
- ブランチ: `docs/TASK-101-mvp-docs-security-ops`
- ステータス: `done`
- 概要: セットアップ、設計、運用手順の明文化
- 完了条件:
  - `README.md` にセットアップ/設計ドキュメント導線が整理される
  - `docs/development-workflow.md` に PR作成〜CI確認〜マージ〜後片付け手順が明記される
  - `docs/security-policy.md` に運用時のセキュリティ確認手順が明記される
