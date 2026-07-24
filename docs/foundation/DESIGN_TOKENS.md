# DESIGN_TOKENS.md
Version: 1.2  
Status: Official  
Author: さけLab  
Parent Documents:  
- DESIGN_SYSTEM.md (v2.1.1)  
- FOUNDATION.md  
- BRAND_GUIDELINES.md  
- PRODUCT_PRINCIPLES.md

---

# 1 目的

本書は、さけLab における **Design Token の唯一の正式仕様書** である。  
Design Token の命名規則、階層、カテゴリ、テーマ、アクセシビリティ関連トークン、エクスポート形式およびバージョン管理方針を定義する。  
本書は実装値（カラーコードやフォント名など）を直接定義しない。具体的な値は各プラットフォーム向けのトークンファイル（tokens ファイル）で管理する。

---

# 2 命名規則

**基本方針**  
- **役割ベース**で命名する（例: `color.background.surface`）。  
- **階層は左から右へ**：カテゴリ → サブカテゴリ → 役割 → 状態。  
- **小文字とドット区切り**を採用する。スペースやキャメルケースは使用しない。  
- **状態は末尾に付与**する（例: `button.primary.background.hover`）。  
- **意味的に一貫**した語彙を使う（primary/secondary/semantic/neutral/brand）。  
- **短く明確**に。冗長な語は避ける。  
- **プラットフォーム固有の差分は Platform Tokens で扱う**。

**命名例**  
- `color.primary`  
- `color.semantic.error`  
- `font.size.body`  
- `space.3`  
- `motion.duration.fast`

---

# 3 Token 階層とカテゴリ

トップレベルのカテゴリは次のとおり。各カテゴリはさらに役割トークンと状態トークンを持つ。

| カテゴリ | 役割 |
|---|---|
| **color** | ブランド色、セマンティック色、中立色、アクセント |
| **typography** | フォントファミリ、サイズ、ウェイト、行間、字間 |
| **spacing** | 余白スケール（space.1..n） |
| **radius** | 角丸スケール（radius.sm..lg） |
| **border** | 境界線の幅とスタイル（border.width.sm 等） |
| **elevation** | レイヤーの役割（elevation.card 等） |
| **shadow** | シャドウの役割（shadow.card 等） |
| **opacity** | 透明度の役割（opacity.disabled 等） |
| **motion** | モーションの役割（motion.duration, motion.easing） |
| **duration** | 時間のプリセット（duration.fast 等） |
| **easing** | イージングプリセット（easing.standard 等） |
| **breakpoint** | ブレークポイント（breakpoint.sm 等） |
| **grid** | グリッド列数・コンテナ幅の役割 |
| **zindex** | レイヤー順序（z.modal, z.tooltip 等） |
| **icon** | アイコンサイズと役割（icon.size.small 等） |
| **illustration** | イラストの色・トーン役割 |
| **semantic** | 高レベル意味トークン（semantic.success 等） |
| **alias** | コンポーネント向けエイリアス（alias.button.primary.bg 等） |
| **platform** | プラットフォーム差分（platform.ios.font.family 等） |
| **theme** | テーマ定義（theme.light, theme.dark） |
| **accessibility** | 高コントラストや拡張アクセシビリティ用トークン |

---

# 4 Color トークン

**役割ベースの定義**（値は実装ファイルへ委譲）

- **color.brand.primary**: ブランドの主要色（UI の信頼感を支える）  
- **color.brand.secondary**: ブランドの補助色（アクセントや強調）  
- **color.neutral.0..n**: 中立色スケール（背景・境界・テキストの階層化）  
- **color.semantic.success / warning / error / info**: 意味ベースの色（状態表示）  
- **color.action.primary / secondary / destructive**: ボタンやアクションの背景色役割  
- **color.surface.* / color.background.* / color.overlay.***: 表面・背景・オーバーレイの役割  
- **color.text.primary / secondary / tertiary**: テキストの階層化  
- **color.icon.primary / disabled**: アイコンの役割色

**状態トークン**  
- `color.action.primary.hover`  
- `color.action.primary.active`  
- `color.surface.inverse`（ダークモード用の反転役割）

**アクセシビリティ指針**  
- 色はコントラスト基準（WCAG）を満たすことを前提に選定する。  
- 色だけで意味を伝えないために `semantic` トークンは必ずラベルやアイコンと併用する。

---

# 4.x 色彩運用ルール（追加）

## 4.x.1 目的
役割ベースのトークン運用を実務で一貫して行うための最小限の運用ルールを定義する。具体的なカラーコードは各プラットフォームの tokens ファイルに委譲するが、**用途と制約**はここで定義する。
色彩トークンの選定にあたっては、`BRAND_UX_AI_INTEGRATION_GUIDE.md` で規定されたブランド感情スコア（Calm/Warmth/Trust）の適用ルールを遵守する。各色彩トークンが利用者に与える情緒的効果をスコアで客観化し、一貫性を確保する。

## 4.x.2 色の用途と優先順位（簡潔ルール）
- **brand.primary**: ブランドの識別と信頼感の補強に使用。大面積の背景には原則使用しない（アクセント用途）。  
- **brand.secondary**: 補助アクセント。CTA（非緊急）や強調に限定。  
- **semantic.error / warning / success / info**: 状態表示専用。緊急時は semantic.error のみを緊急色として使用する。  
- **neutral.0..n**: 背景・境界・テキスト階層に使用。背景は neutral の低明度、テキストは高コントラスト側を選ぶ。  
- **action.primary / destructive**: ボタン等の主要アクションに使用。destructive は削除等の危険操作に限定。

## 4.x.3 コントラスト最低値（役割別最小基準）
- **主要テキスト（color.text.primary）**: WCAG AA 相当以上（最小コントラスト比 4.5:1）。  
- **補助テキスト（color.text.secondary）**: 最小コントラスト比 3:1（ただし重要情報は 4.5:1 を満たすこと）。  
- **ボタンのラベル（action）**: 背景とのコントラスト 4.5:1 以上。  
- **アイコン・インフォ（小さい要素）**: 小さい要素は 4.5:1 を目標とする（視認性優先）。

## 4.x.4 緊急色の運用
- 緊急色は **semantic.error** のみを使用し、他のアクセント色と混用しない。  
- 緊急色は必ずアイコン・ラベル・形状で補強し、色だけで意味を伝えない。
- 緊急色の運用においては、ブランド感情スコアの「Calm（落ち着き）≧ 90%」を最優先とし、赤色を過剰に使用してユーザーのパニックを誘発するレイアウトを避ける（`BRAND_UX_AI_INTEGRATION_GUIDE.md #4` 参照）。

## 4.x.5 色の変更ガイド（運用手順）
- ブランド色や semantic マッピングを変更する場合は DESIGN_GOVERNANCE の Minor/Major フローに従う。変更提案には影響範囲（主要画面一覧）、コントラストチェック結果、アクセシビリティテスト計画を添付すること。

---

# 5 Typography トークン

**カテゴリと役割**（値は実装ファイルへ委譲）

- **font.family.base**: 基本フォントファミリ（プラットフォーム差分は platform トークンで扱う）  
- **font.family.mono**: 等幅フォント（コードやデータ表示）  
- **font.size.display / heading / subheading / body / caption / small**: 役割別サイズ  
- **font.weight.light / regular / medium / bold**: ウェイト定義  
- **font.lineHeight.* / font.letterSpacing.***: 行間・字間の役割  
- **font.scale**: サイズスケールの一貫性を保つための参照

**状態トークン**  
- `font.size.body.large`（アクセシビリティ拡張用）  
- `font.weight.emphasis`（強調用）

**アクセシビリティ指針**  
- 主要テキストは可読性を最優先にし、最小サイズを定義する。  
- 拡大表示や高コントラスト時の代替トークンを用意する。

---

# 6 Spacing トークン

**余白スケール**（モバイルファースト）

- `space.0`（0）  
- `space.1`（最小）  
- `space.2`（小）  
- `space.3`（標準）  
- `space.4`（大）  
- `space.5`（最大）

**用途**  
- コンポーネント内パディング、コンポーネント間マージン、グリッドギャップに使用する。  
- ブレークポイントに応じてスケールを調整する。

---

# 7 Radius トークン

**角丸スケール**

- `radius.none`  
- `radius.sm`  
- `radius.md`  
- `radius.lg`  
- `radius.pill`（完全丸）

**用途**  
- ボタン、カード、入力フィールド、モーダルなどの一貫した角丸設計に使用。

---

# 8 Border トークン

**境界線の役割**

- `border.width.xs` / `border.width.sm` / `border.width.md`  
- `border.color.divider`（中立色の境界）  
- `border.style.solid`（標準） / `border.style.dashed`（補助）

**用途**  
- セパレータ、カード境界、フォーカスリングの補助に使用。

---

# 9 Elevation と Shadow トークン

**Elevation 役割**

- `elevation.level.0`（フラット）  
- `elevation.level.1`（カード）  
- `elevation.level.2`（浮き上がり）  
- `elevation.level.3`（モーダル）

**Shadow 役割**

- `shadow.card` / `shadow.focus` / `shadow.overlay`

**用途**  
- 情報の階層化と視覚的優先度の表現に使用。ダークモードでは影の扱いを再評価する。

---

# 10 Opacity トークン

**透明度の役割**

- `opacity.disabled`（無効状態）  
- `opacity.overlay`（オーバーレイ）  
- `opacity.muted`（補助テキスト）

**用途**  
- 状態表現や視覚的階層化に使用。

---

# 11 Motion Duration と Easing

**Duration**

- `motion.duration.instant`（0ms）  
- `motion.duration.fast`（短）  
- `motion.duration.standard`（標準）  
- `motion.duration.slow`（長）

**Easing**

- `motion.easing.linear`  
- `motion.easing.standard`（デフォルト）  
- `motion.easing.decelerate`  
- `motion.easing.accelerate`

**用途**  
- トランジション、フィードバック、遷移の一貫性を保つ。

---

# 12 Breakpoint と Grid

**Breakpoint**

- `breakpoint.xs` / `breakpoint.sm` / `breakpoint.md` / `breakpoint.lg` / `breakpoint.xl`  
- 各ブレークポイントはモバイルファーストの閾値として定義する（具体値は実装ファイルで管理）。

**Grid**

- `grid.columns`（例: 4 / 8 / 12 の役割）  
- `grid.container.maxWidth`（役割）  
- `grid.gutter`（カラム間隔）

**用途**  
- レイアウトの一貫性とレスポンシブ挙動の基準。

---

# 13 Z-index トークン

**レイヤー順序**

- `z.base`  
- `z.dropdown`  
- `z.modal`  
- `z.tooltip`  
- `z.overlay`

**用途**  
- レイヤーの優先順位を明確にし、衝突を防ぐ。

---

# 14 Icon と Illustration トークン

**Icon**

- `icon.size.xs` / `icon.size.sm` / `icon.size.md` / `icon.size.lg`  
- `icon.color.primary` / `icon.color.secondary`（役割）

**Illustration**

- `illustration.tone.warm` / `illustration.tone.neutral` / `illustration.tone.calm`（役割）

**用途**  
- アイコンとイラストの一貫したサイズ・色・トーン管理。

---

# 15 Semantic Tokens と Alias Tokens

**Semantic Tokens**  
- 高レベルの意味を表すトークン。実装値はテーマやプラットフォームで解決される。  
- 例: `semantic.background.primary` → 実装で `color.surface.100` にマップされる。

**Alias Tokens**  
- コンポーネント向けのエイリアス。コンポーネントは alias を参照し、alias は semantic や color にマップされる。  
- 例: `alias.button.primary.bg` → `semantic.background.primary` に紐づく。

**目的**  
- 抽象化レイヤーを設けることで、テーマ切替やブランド変更時の影響範囲を最小化する。

---

# 16 Platform Tokens

**役割**  
- プラットフォーム固有の差分を管理するトークン群。実装は platform 名をプレフィックスにする。  
- 例: `platform.ios.font.family.base` / `platform.android.font.family.base` / `platform.web.font.family.base`

**用途**  
- ネイティブと Web 間の表現差を安全に管理する。

---

# 17 Theme とダークモード

**Theme 構造**  
- `theme.light` と `theme.dark` を基本とする。各テーマは semantic トークンを解決するマッピングを持つ。  
- テーマは alias を通じてコンポーネントに適用される。

**ダークモード方針**  
- ダークモードは単なる色反転ではない。**感情と可読性**を保つために明度・コントラスト・トーンを再評価する。  
- ダークテーマでは `semantic` トークンのマッピングを再定義し、アクセシビリティ基準を満たすことを必須とする。

---

# 18 High Contrast と Accessibility Tokens

**High Contrast**  
- `theme.highContrast` を用意し、視認性が必要なユーザー向けにコントラストを強化したマッピングを提供する。

**Accessibility Tokens**  
- `accessibility.fontSize.large`（拡大表示用）  
- `accessibility.touchTarget.minSize`（タップ領域最小値の役割）  
- `accessibility.reducedMotion`（モーション抑制フラグの役割）

**用途**  
- アクセシビリティ要件を満たすためのトークンを明示的に用意する。

---

## 18.x コンポーネント適用例とコントラスト基準
デザインシステムを構成する主要コンポーネントに対して、WCAG 2.1 に準拠したコントラスト基準（比率）と推奨する色トークンの適用例を以下に定義する。

| コンポーネント | 適用例（テキスト / 背景） | 推奨トークン | 最低コントラスト比（通常 / 高コントラスト） | 準拠レベル |
| :--- | :--- | :--- | :--- | :--- |
| **Body Text** | 通常文字 / 一般背景 | `color.text.primary` / `color.background.surface` | 4.5:1 / 7.0:1 | WCAG AA / AAA |
| **Button Primary** | ボタンテキスト / プライマリ背景 | `color.neutral.0` / `color.action.primary` | 4.5:1 / 7.0:1 | WCAG AA / AAA |
| **Alert/Error Banner** | エラーテキスト / エラー用背景 | `color.semantic.error` / `color.surface.error` | 4.5:1 / 7.0:1 | WCAG AA / AAA |
| **Secondary Button** | セカンダリテキスト / セカンダリ背景 | `color.action.secondary` / `color.background.surface` | 4.5:1 / 7.0:1 | WCAG AA / AAA |
| **Inactive Element** | 非アクティブ要素 / 一般背景 | `color.text.tertiary` / `color.background.surface` | 3.0:1 / 4.5:1 | WCAG AA |

*※詳細な適用マトリクスは `docs/foundation/COMPONENT_LIBRARY.md #1.x` を参照。*

---

# 19 Export 形式と運用

**エクスポート形式（推奨）**  
- **JSON**（tokens.json）: プラットフォーム間での共通交換フォーマット。  
- **YAML**: 人間可読性が必要な場合の補助フォーマット。  
- **Platform-specific**: iOS（.plist / .xcassets 参照）、Android（XML）、Web（CSS Custom Properties / JS オブジェクト）への変換は別ツールで行う。  
- **Design Tool**: Figma Variables 等のデザインツール変数へ同期するためのマッピングを用意する。

**エクスポート方針**  
- トークンは **役割名のみ** を含むマスター定義を保持し、各プラットフォーム向けに変換スクリプトで具体値を生成する。  
- 実装値は DESIGN_TOKENS.md ではなく、各プラットフォームの tokens ファイルで管理する。

---

# 20 Version 管理

**バージョニング方針**  
- トークン仕様はセマンティックバージョンを採用する（MAJOR.MINOR.PATCH）。  
- **MAJOR**: 互換性を壊す変更（トークン名の削除・大幅な再構成）。  
- **MINOR**: 後方互換性のある追加（新トークンの追加、テーマの追加）。  
- **PATCH**: ドキュメント修正や誤字修正。

**変更手順（概要）**  
- トークン名の追加は MINOR。削除やリネームは MAJOR。  
- 変更は DESIGN_GOVERNANCE.md の承認プロセスに従う（実運用ドキュメント参照）。  
- 変更履歴は tokens リポジトリの CHANGELOG に記録する。

---

# 21 Export と同期のベストプラクティス

- **単一のソースオブトゥルース**: マスター tokens ファイルを一箇所で管理する。  
- **自動変換パイプライン**: マスターから各プラットフォーム用に自動生成する。  
- **デザインツール同期**: デザイナーと開発者が同じトークンを参照できるようにする。  
- **テスト**: トークン変更はビジュアル回帰テストとアクセシビリティチェックを通す。

---

# 22 付録 例示的トークン一覧（役割名のみ）

- `color.brand.primary`  
- `color.semantic.error`  
- `color.neutral.100`  
- `font.family.base`  
- `font.size.body`  
- `space.3`  
- `radius.md`  
- `border.width.sm`  
- `elevation.level.1`  
- `shadow.card`  
- `opacity.disabled`  
- `motion.duration.standard`  
- `motion.easing.standard`  
- `breakpoint.md`  
- `grid.columns`  
- `z.modal`  
- `icon.size.md`  
- `semantic.background.primary`  
- `alias.button.primary.bg`  
- `platform.ios.font.family.base`  
- `theme.dark`  
- `accessibility.fontSize.large`

---

# 23 版履歴

| Version | Date | Description |
|---:|:---:|---|
| 1.0 | 2026-07-22 | Official Release: DESIGN_TOKENS.md Version 1.0 |
| 1.1 | 2026-07-22 | Patch: 色彩運用ルール（用途・優先順位・コントラスト基準・緊急色運用）を追加し、トークン運用の実務指針を補強 |
| 1.2 | 2026-07-22 | Add Component Contrast Criteria Table and Cross-Reference Links |
| 1.3 | 2026-07-22 | Integrate Brand Emotion Scores and Emergency Color Rules |

---

