# DESIGN_GOVERNANCE.md
Version: 1.2  
Status: Official  
Author: さけLab DesignOps  
Parent Documents:  
- DESIGN_SYSTEM.md (v2.1.1)  
- FOUNDATION.md  
- BRAND_GUIDELINES.md  
- PRODUCT_PRINCIPLES.md

---

# 1 目的

本書は、さけLab の Design System を安全かつ一貫して運用するための**運用規程**である。  
Design System の変更、レビュー、承認、公開、廃止、移行、貢献、品質管理、アクセシビリティ審査、ドキュメント運用、デザイン品質保証（Design QA）に関する手順と責任を定義する。  
本書は思想やコンポーネント仕様、トークン値を定義するものではない。これらはそれぞれの親文書と実装ドキュメントに従う。

---

# 2 用語定義

- **Design System Owner**: Design System の最終責任者。方針決定と最終承認を行う。  
- **DesignOps**: 日常の運用、変更管理、ドキュメント整備、レビュー運用を担当するチーム。  
- **Component Owner**: 各コンポーネントカテゴリの責任者。仕様変更の提案と実装確認を行う。  
- **Design Review Board**: 主要変更の審査を行う委員会（DesignOps、プロダクト、法務、セキュリティ、アクセシビリティ代表を含む）。  
- **ADR（Architectural Decision Record）**: 重要な設計判断を記録する文書。変更理由、代替案、影響範囲を明示する。

---

# 3 組織と役割

- **Design System Owner**: 方針の最終承認、重大な方針変更の決裁。  
- **DesignOps**: 変更受付、レビュー運用、版管理、ドキュメント公開、教育実施。  
- **Component Owner**: コンポーネントの仕様作成、実装レビュー、品質保証。  
- **Accessibility Lead**: アクセシビリティ審査の実施と合格基準の維持。  
- **Security / Privacy**: セキュリティ・プライバシー影響評価の実施。  
- **Legal / Compliance**: 法令・規制対応の確認。  
- **Engineering Representative**: 実装可能性と運用コストの評価。

---

# 4 変更管理ワークフロー

## 4.1 変更の分類
- **Patch**: 文言修正、誤字、軽微なガイドライン修正（PATCH）。  
- **Minor**: 新しいパターンやトークンの追加、後方互換性のある改善（MINOR）。  
- **Major**: トークン名の削除、互換性を壊す変更、ブランドカラーの大幅変更（MAJOR）。

## 4.2 変更申請手順
1. **提案作成**: 提案者は ADR を作成し、影響範囲、代替案、テスト計画を記載する。  
2. **事前レビュー**: Component Owner と DesignOps が初期レビューを行う。  
3. **ステークホルダー確認**: 必要に応じて法務、セキュリティ、アクセシビリティ、エンジニアリングに確認を依頼。  
4. **Design Review Board 提出**: Minor/Major は Board の承認を必須とする。Patch は DesignOps 承認で可。  
5. **実装と検証**: 承認後、実装チームが実装し、Design QA とアクセシビリティチェックを実施。  
6. **公開**: ドキュメント更新、CHANGELOG 追記、関係者への周知を行う。  
7. **モニタリング**: リリース後の影響を一定期間モニタリングし、問題があればロールバックまたは修正を行う。

---

# 5 バージョン管理とリリースポリシー

- ドキュメントは Git リポジトリで管理し、Semantic Versioning を採用する。  
- すべての変更は Pull Request を通じて行い、少なくとも 2 名のレビュアー承認を必要とする（Component Owner と DesignOps）。  
- 重大変更（MAJOR）は Design Review Board の承認を得てからマージする。  
- リリースノート（CHANGELOG）には影響範囲、移行手順、テスト結果を明記する。

---

# 6 Quality Gate と Design QA

## 6.1 Quality Gate
- 変更は以下のチェックを満たすことが必須：アクセシビリティ基準、セキュリティレビュー、法令遵守、実装可能性、ユーザーテスト（必要時）、およびブランド感情スコア（Calm/Warmth/Trust Score）の基準値適合（詳細は `docs/foundation/BRAND_UX_AI_INTEGRATION_GUIDE.md #6` 参照）。  
- 自動チェック（コントラスト、トークン整合性、Lint、禁止語リストチェック）と手動チェック（アクセシビリティ、UX、ブランド統合チェック）を組み合わせる。

### 6.1.1 ガバナンス法務チェックリスト（Legal Checklist）
デザインシステムのコンポーネントやプロセスの変更公開にあたり、法務観点の以下のチェックリストをすべて通過しなければならない。

1. **表現の誇張（Exaggerated Expressions）**:
   - 変更によって導入される表現やUIが、過度に利用者の期待をあおる（例: 「絶対安全」「100%回復」など）ものになっていないか（詳細は `docs/foundation/BRAND_GUIDELINES.md #14` 禁止語リストを参照）。
2. **利用者同意（User Consent）**:
   - 新しい入力コンポーネントやデータ収集プロセスにおいて、利用者が明示的に同意可能な同意用チェックボックスや規約導線が設計されているか。
3. **保存期間（Data Retention Period）**:
   - 変更に関連するデータベースの保存期間が定義され、法的根拠（高重要度7年など）がクリアであるか（詳細は `docs/foundation/DESIGN_GOVERNANCE.md #19.3` を参照）。
4. **第三者権利の確認（Third-party Rights Verification）**:
   - 外部ライブラリ、Webフォント、アイコンパック等をデザインシステムへ統合する際、ライセンス（MIT, Apache 2.0等）および商標等の権利関係を確認し、クリアしていること。

## 6.2 Design QA
- Design QA は実装前後に実施する。実装前は仕様の妥当性、実装後はビジュアル回帰とアクセシビリティ確認を行う。  
- QA 結果は PR に添付し、承認の証跡とする。

---

# 7 アクセシビリティレビュー

- すべての主要フローは WCAG 2.1 AA を満たすことを最低基準とする。重要フロー（緊急、医療）は AAA を目指す。  
- アクセシビリティレビューは DesignOps と Accessibility Lead が共同で実施する。自動ツールとユーザーテスト（支援技術利用者）を組み合わせる。  
- 変更提案にはアクセシビリティ影響評価を添付すること。

## 7.1 アクセシビリティテスト定義（Accessibility Test Definitions）
アクセシビリティの品質ゲートを通過するためのテスト定義および合否判定基準を以下に定める。

1. **自動ツールテスト合格基準**:
   - `axe-core`, `Lighthouse` または `cypress-axe` 等の検証ツールにおいて、アクセシビリティスコアがすべての画面で **95点以上**、またはエラー数 **0** であること。
2. **ユーザーテスト合格基準**:
   - スクリーンリーダー（NVDA, VoiceOver）を使用するテスター、または肢体不自由によりスイッチコントロール等の代替入力デバイスを常用するテスターによる実機検証を実施する。
   - 主要シナリオ（アカウント作成、緊急公開情報へのアクセス、投薬管理）において、他者の支援なしにキーボードや音声読み上げだけでタスクを完了できること。

---

# 8 承認フローと責任の明確化

- Patch: Component Owner + DesignOps の承認で可。  
- Minor: Component Owner + DesignOps + 関連ステークホルダー（法務/セキュリティ/Brand Integration Lead等）の確認（ブランド統合チェックの実施）後、Design Review Board に報告。  
- Major: Design Review Board の承認必須。Board は Design System Owner の最終承認を得る。

---

# 9 Deprecation と Migration

- 廃止（Deprecation）は段階的に行う。まず「非推奨（Deprecated）」としてドキュメントに明記し、代替案と移行期間を提示する。  
- 互換性を壊す変更は十分な移行期間（通常 6–12 ヶ月）を設け、移行ガイドと自動変換ツールを提供する。  
- 廃止の影響は CHANGELOG と ADR に記録する。

---

# 10 Contribution と承認基準

- 社内外の貢献は歓迎する。貢献は Pull Request 形式で受け付け、DesignOps が初期レビューを行う。  
- 貢献者は ADR とテスト計画を添付すること。小さな改善は Patch として迅速に取り込む。  
- 外部コントリビューションは法務チェックを経て受け入れる。

---

# 11 Design Debt と監査

- 定期的に Design Debt の棚卸を行い、優先度に基づいて返済計画を立てる。  
- 重大な Design Debt は ADR として記録し、改善期限を設定する。  
- 四半期ごとに Design Audit を実施し、品質指標（アクセシビリティ、ビジュアル回帰、ユーザー苦情）をレビューする。

---

# 12 Documentation Rule とツール運用ルール

- ドキュメントは常に最新を保つ。変更は PR と CHANGELOG で追跡する。  
- Figma、Storybook、ドキュメントサイトは同期ポリシーを定め、DesignOps が同期状況を監視する。  
- ドキュメントは英語と日本語で管理し、主要な変更は両言語で公開する。

---

# 13 Release Policy と配布

- 公式リリースは DesignOps が管理する。リリース時は関係者へメールと社内チャネルで周知する。  
- 重大変更は段階的ロールアウトを推奨する（Feature Flag、パイロットユーザー）。  
- リリース後はモニタリング期間を設け、問題があれば即時ロールバック手順を実行する。

---

# 14 Design QA 実務ルール

- 実装前: 仕様レビュー、アクセシビリティ影響評価、トークン整合性チェック。  
- 実装中: ビジュアルスナップショット、アクセシビリティ自動チェック、ユニットテスト。  
- 実装後: ビジュアル回帰テスト、ユーザーテスト（必要時）、アクセシビリティユーザーテスト。  
- QA 合格基準は PR に明記し、合格証跡を残す。

---

# 15 承認フロー図（要約）

1. 提案 → 2. 初期レビュー（DesignOps + Component Owner） → 3. ステークホルダー確認 → 4. Design Review Board（Minor/Major） → 5. 実装 → 6. Design QA → 7. 公開 → 8. モニタリング

---

# 16 緊急対応とロールバック

- 緊急の修正は DesignOps が暫定承認し、事後に Board に報告する。  
- ロールバック手順は事前に定義し、実行時の責任者と連絡手順を明確にする。  
- 緊急対応後は必ず事後レビューを行い、恒久対策を ADR として記録する。

---

# 17 コントリビューションの奨励と教育

- DesignOps は定期的にワークショップを開催し、ドキュメントの使い方、レビュー手順、アクセシビリティ基準を教育する。  
- 新規参加者向けにオンボーディングチェックリストを提供する。

---

# 18 監査と継続的改善

- 四半期ごとに Design Audit を実施し、指標（アクセシビリティ合格率、ビジュアル回帰失敗率、ユーザー苦情数）をレビューする。  
- 監査結果は Board に報告し、改善計画を策定する。

---

# 19 AI 監査の運用指針（追加）

## 19.1 目的
AI 出力の説明可能性と監査可能性を担保するため、AI 提案・生成物に付与すべき**必須メタデータ項目**、保存方針、アクセス制御、監査ワークフローを定義する。

## 19.2 必須メタデータ項目（AI 出力ごとに保存）
- **proposal_id**: 一意の識別子（UUID）。  
- **generated_at**: 生成日時（ISO 8601）。  
- **model_id**: 使用したモデルの識別（バージョン含む）。  
- **prompt_snapshot**: 提案生成に用いたプロンプトの要約（機密情報は除外）。  
- **input_context_id**: 参照したデータセットやドキュメントの識別子（出典リスト）。  
- **confidence_score**: モデルが返す信頼度スコア（存在する場合）。  
- **explanation**: 提案の根拠を短く要約したテキスト（人が理解できる形）。  
- **sources**: 参照した外部ソースの一覧（可能な限り URL または出典 ID）。  
- **user_action**: ユーザーが取ったアクション（承認 / 編集 / 破棄 等）。  
- **user_edit_delta**: ユーザーによる編集の要約（承認以外の場合）。  
- **generated_by**: System Component Name（例: `assistant.summarizer.v2`）。  
- **audit_tags**: 監査用タグ（医療提案、緊急、個人情報含む等）。

### 19.2.1 AIメタデータ実装スキーマ（JSON例）
システムがAIによる出力を監査ログに保存する際のJSONスキーマ例を以下に示す。実装チームはこのフォーマットに従ってデータベースにメタデータ情報を書き込むこと。

```json
{
  "proposal_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "generated_at": "2026-07-22T22:37:56Z",
  "model_id": "gemini-3.5-flash-v1",
  "prompt_snapshot": "Analyze the pet medical history and check medication reminders for today.",
  "input_context_id": "ctx-pet-coco-12345",
  "confidence_score": 0.95,
  "explanation": "coco has chronic diabetes and requires morning insulin dose.",
  "sources": [
    "https://example.com/veterinary-clinical-guidelines-v2"
  ],
  "user_action": "approved",
  "user_edit_delta": null,
  "generated_by": "assistant.summarizer.v2",
  "audit_tags": ["medical_proposal", "critical_alert", "personal_info"],
  "brand_evaluation": {
    "calm_score": 92,
    "warmth_score": 75,
    "trust_score": 98,
    "brand_checklist_passed": true,
    "brand_tags": ["calm_emergency", "no_prohibited_words"]
  }
}
```

## 19.3 保存期間と保持方針
- **保存期間**: 重要度に応じて分類する。  
  - 高重要度（医療・緊急・法的影響あり）: 最低 7 年保存（法令に準拠）。  
  - 中重要度（個人データ含むが即時危険性なし）: 最低 2 年保存。  
  - 低重要度（補助的提案）: 1 年保存。  
- **保存期間の法的根拠**:
  - 獣医療・人医療等に関わる提案履歴、監査記録、および承諾ログは、各種獣医師法・医師法・税法に定められた診療記録・重要取引書類の保存義務（7年間）を法的根拠とし、これを最低保存期間とする。
- **匿名化手順の概要**:
  - 保存期間が経過したデータ、またはユーザーからの明示的なデータ削除要求があった場合、以下の手順で匿名化・削除を行う。
    1. **識別子のハッシュ化**: `userId` や `householdId` を不可逆な一方向ハッシュ関数（SHA-256＋ソルト）でハッシュ化し、特定の個人や家庭を特定できないようにする。
    2. **個人識別情報の物理削除**: 氏名、住所、電話番号、メールアドレス等の直接的な個人情報をデータベースから物理削除（`DELETE` または `UPDATE NULL`）する。
    3. **残存メタデータの維持**: 監査統計用にハッシュ化されたID、モデルID、スコア、時間等の属性値のみを保持し、システム品質評価用の統計データとして利用する。
- **ログの不変性**: 監査ログは改変不可の形式で保存し、変更があった場合は変更履歴（who/when/why）を残す。

## 19.4 アクセス制御と運用
- **保存責任（Owner）**:
  - 本監査データおよびメタデータの保存責任（Data Owner）は `DesignOps` および `システム監査管理者` が負う。
- **アクセス権限マトリクス（Access Control Matrix）**:
  監査データに対する役割ごとのアクセス権限を以下のように定義する。データはすべて改ざん不可能なリードオンリーを原則とする。

  | 役割 (Role) | 読み取り (Read) | 書き込み (Write) | 編集 (Edit) | 削除 (Delete) |
  | :--- | :--- | :--- | :--- | :--- |
  | **System Admin** | 可 | 可 | 不可 (不変ログ) | 不可 (保存期間内) |
  | **DesignOps / Reviewer** | 可 | 不可 | 不可 | 不可 |
  | **Auditor / Compliance** | 可 | 不可 | 不可 | 不可 |
  | **General User** | 不可 | 不可 | 不可 | 不可 |

- **監査リクエスト**: 利用者や第三者からの監査要求は DesignOps 経由で受け付け、法務・コンプライアンスと協議の上で対応する。  
- **定期レビュー**: AI 出力ログは四半期ごとにサンプル監査を実施し、誤情報率やユーザー編集率を評価する。

## 19.5 監査ワークフロー（概要）
1. 監査対象の抽出（ランダムサンプル + リスクベースサンプル）。  
2. 監査チームによる根拠検証（sources と explanation の妥当性確認）。  
3. 必要に応じて専門家レビュー（医療等）。  
4. 結果を ADR または改善提案として記録し、Design Review Board に報告。  
5. 改善が必要な場合はモデル設定・UI 表示・説明文の修正を実施。

---

# 20 Design Decision Rules の運用テンプレート（追加）

## 20.1 目的
Design Decision Rules をレビュー現場で再現可能にするための**レビュー用チェックシート**と合否基準を定義する。これにより Design Review の一貫性と監査性を高める。

## 20.2 レビュー用チェックシート（テンプレート）
- **プロジェクト名**:  
- **提出者**:  
- **日付**:  
- **主要目的（1文）**:  

### 評価項目（各項目に「合格 / 要改善 / 不合格」と記入し、証拠欄に実測値や参照資料を記載）
1. **利用者の安心につながるか**  
   - 証拠: ユーザーテスト結果 / 専門家レビュー / リスク評価  
2. **利用者を迷わせないか**  
   - 証拠: 主要アクション到達時間（秒） / ユーザーテスト観察  
3. **情報を最小化しているか**  
   - 証拠: 要素削減テスト / 説明文の長さ比較  
4. **長期的に耐えうる設計か**  
   - 証拠: 技術依存度評価 / 流行依存度評価  
5. **緊急時にも使えるか**  
   - 証拠: 緊急フローのステップ数 / オフライン対応確認  
6. **アクセシブルか**  
   - 証拠: 自動コントラストチェック結果 / キーボード操作確認結果  
7. **エラー回復が設計されているか**  
   - 証拠: 回復フロー図 / 自動保存の有無  
8. **国際化に耐えうるか**  
   - 証拠: テキスト拡張テスト（+30%）の結果  
9. **AI 提案は説明可能か**  
   - 証拠: explanation フィールドのサンプル / sources の明示  
10. **さけLab らしいか**  
    - 証拠: ブランドチェックリスト（BRAND_GUIDELINES.md）照合

### 合否判定
- **合格条件**: すべての「重要項目」（1,2,5,6,9）は合格であること。その他は 80% 合格。  
- **不合格時の扱い**: 不合格項目は必須修正事項として記録し、再レビューを必須とする。

## 20.3 レビュー証跡
- レビュー結果はレビュー記録として保存し、承認者（コンポーネントオーナー、DesignOps、Board）による電子署名を付与する。レビュー記録は ADR と連携して保存する。

---

# 21 AI 評価メトリクス（運用参照）

- DESIGN_SYSTEM.md に定義された指標（Accuracy、Hallucination Rate、User Edit Rate、User Acceptance Rate、Time-to-Accept、False Positive Rate for Critical Alerts）を用いて、月次ダッシュボードと四半期監査レポートを作成する。  
- 指標の閾値超過時は即時調査を行い、必要に応じて ADR を作成して改善を実施する。

---

# 22 版履歴

| Version | Date | Description |
|---:|:---:|---|
| 1.0 | 2026-07-22 | Official Release: DESIGN_GOVERNANCE.md Version 1.0 |
| 1.1 | 2026-07-22 | Patch: AI 監査の必須メタデータ、保存・保持方針、アクセス制御、監査ワークフロー、Design Decision のレビュー用チェックシートを追加 |
| 1.2 | 2026-07-22 | Add AI Metadata JSON Schema, Access Matrix, Accessibility Test Definition, Legal Checklist, and Retention Rationale |
| 1.3 | 2026-07-22 | Integrate Brand × UX × AI Copy Approval, Brand Tags, and Score Verification |

---

# 23 最後に

本書は運用文書であり、実務での運用を通じて改善される。Design System の一貫性と利用者の安心を守るため、すべての関係者は本書に従い、変更提案とレビューに協力することを求める。  

