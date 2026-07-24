# BRAND_UX_AI_INTEGRATION_ROADMAP.md
Version: 1.0  
Status: Official  
Author: さけLab  
Parent Documents:  
- BRAND_GUIDELINES.md  
- UX_PATTERNS.md  
- DESIGN_SYSTEM.md  
- DESIGN_GOVERNANCE.md  
- DESIGN_TOKENS.md  
- PRODUCT_PRINCIPLES.md  
- FOUNDATION.md  

---

# 1. 目的（Purpose）

本ロードマップは、  
新規文書 **BRAND_UX_AI_INTEGRATION_GUIDE.md** を既存体系へ安全に統合し、  
ブランド・UX・AI・ガバナンスの一貫性を 100 点に引き上げるための  
**段階的な統合計画**を定義する。

既存の責務分離（Separation of Concerns）を維持しつつ、  
体系全体の「横断整合性」を最大化することを目的とする。

---

# 2. 統合対象（Integration Scope）

本ロードマップは以下の領域に適用する。

- ブランド表現（文言・トーン・禁止語）
- UXパターン（画面フロー・緊急時体験）
- AIインタラクション（提案・要約・根拠表示）
- コンポーネント文言（COMPONENT_LIBRARY）
- デザイン表現（色・余白・タイポ）
- ガバナンス（承認・監査・保存期間）

---

# 3. 統合ロードマップ（全体像）

統合は以下の 5 フェーズで実施する。

1. **Phase 1 — 文書追加（統合レイヤーの作成）**  
2. **Phase 2 — 既存文書への参照リンク追加**  
3. **Phase 3 — 実務フローの統合（コピー承認・AI監査）**  
4. **Phase 4 — UI/UXへの適用（画面・コンポーネント）**  
5. **Phase 5 — 品質ゲートの統合（自動チェック）**

---

# 4. Phase 1 — 文書追加（統合レイヤーの作成）

## 4.1 新規文書の追加
- `BRAND_UX_AI_INTEGRATION_GUIDE.md` を正式文書として追加する  
- 既存文書の責務を侵害しないよう「横断統合レイヤー」として位置づける  

## 4.2 追加後の体系構造

FOUNDATION
├ BRAND_GUIDELINES
├ PRODUCT_PRINCIPLES
├ DESIGN_SYSTEM
│    ├ UX_PATTERNS
│    ├ COMPONENT_LIBRARY
│    ├ DESIGN_TOKENS
│    └ BRAND_UX_AI_INTEGRATION_GUIDE ← 新規
└ DESIGN_GOVERNANCE


---

# 5. Phase 2 — 既存文書への参照リンク追加

各文書に以下の参照を追加する。

### BRAND_GUIDELINES.md  
→ 「ブランド × UX × AI 統合ルールは BRAND_UX_AI_INTEGRATION_GUIDE を参照」

### UX_PATTERNS.md  
→ 「AI提案表示テンプレートのブランド整合性は統合ガイドを参照」

### DESIGN_SYSTEM.md  
→ 「ブランド感情スコア（Calm / Warmth / Trust）は統合ガイドを参照」

### COMPONENT_LIBRARY.md  
→ 「コンポーネント文言のブランド整合性は統合ガイドを参照」

### DESIGN_GOVERNANCE.md  
→ 「コピー承認・AI監査のブランド整合性は統合ガイドを参照」

---

# 6. Phase 3 — 実務フローの統合（コピー承認・AI監査）

## 6.1 コピー承認フローの統合
- 禁止語チェック  
- ブランド感情スコアチェック  
- 緊急時テンプレート適合性  
- AI出力テンプレート適合性  

## 6.2 AI監査フローの統合
- explanation（根拠）  
- sources（出典）  
- confidence_score（確信度）  
- audit_tags（監査タグ）  
- user_action（承認・編集・破棄）  

---

# 7. Phase 4 — UI/UXへの適用（画面・コンポーネント）

## 7.1 緊急画面
- 緊急コピーガイドラインを適用  
- Calm Score を最優先  
- semantic.error の使用ルールを統合ガイドに従う  

## 7.2 AI提案カード
- 要約 → 根拠 → 出典 → 確信度 → 免責事項  
- Warmth / Trust Score を満たす文言へ統一  

## 7.3 コンポーネント文言
- ラベル・エラー文言・説明文を統合ガイドに準拠  
- 禁止語リストを自動チェック  

---

# 8. Phase 5 — 品質ゲートの統合（自動チェック）

## 8.1 自動チェック項目
- 禁止語  
- Calm / Warmth / Trust Score  
- コントラスト比  
- AIテンプレート準拠  
- 緊急時文字数上限  
- 出典・更新日時の明示  

## 8.2 CI/CD への統合（推奨）
- 文言チェック  
- コントラストチェック  
- AIメタデータ検証  

---

# 9. 完了条件（Definition of Done）

以下を満たした時点で統合完了とする。

- 新規文書が正式採用されている  
- 全文書に参照リンクが追加されている  
- コピー承認フローが統合ガイドに準拠  
- AI出力が統合ガイドのテンプレートに完全準拠  
- 緊急時コピーが 60 文字以内  
- Calm / Warmth / Trust Score が基準値以上  
- コントラスト比が WCAG AA 以上  
- ガバナンスの監査ログが統合ガイドに準拠  

---

# 10. 版履歴（Version History）

| Version | Date | Description |
|---:|:---:|:---|
| 1.0 | 2026-07-22 | 初版作成：ブランド × UX × AI 統合ロードマップ |

---

# 11. Closing Statement

本ロードマップは、  
さけLab のブランド思想を UX・AI・ガバナンスへ完全に接続し、  
体系全体を 100 点の品質へ引き上げるための正式な統合計画である。

本書に従うことで、  
すべての画面・文言・AI出力・コンポーネントが  
「安心を設計する」という使命に完全準拠する。

---