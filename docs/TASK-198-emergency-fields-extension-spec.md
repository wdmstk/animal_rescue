# TASK-198: 拡張緊急フィールドのデータ登録＆緊急公開画面UIの拡張

## 概要

血液型、夜間救急病院、第二緊急連絡先のデータ登録と、緊急公開画面への優先レイアウト表示を実装する。

## 仕様

### 1. データベーススキーマ拡張

#### PetEmergencyInfoへのフィールド追加

```prisma
model PetEmergencyInfo {
  id                  String   @id @default(uuid()) @db.Uuid
  petId                String   @unique @db.Uuid
  disease              String?
  allergy              String?
  currentMedications   String?
  vetName              String?
  vetPhone             String?
  emergencyContactName String?
  emergencyContactPhone String?
  
  // 新規追加フィールド
  bloodType                  String?   @db.Text  // 血液型（例: DEA 1.1+, DEA 1.1-）
  emergencyVetName           String?   @db.Text  // 夜間救急病院名
  emergencyVetPhone          String?   @db.Text  // 夜間救急病院電話番号
  emergencyContactName2      String?   @db.Text  // 第二緊急連絡先名
  emergencyContactPhone2     String?   @db.Text  // 第二緊急連絡先電話番号
  
  updatedAt            DateTime @updatedAt

  pet Pet @relation(fields: [petId], references: [id], onDelete: Cascade)
}
```

#### マイグレーション計画

```bash
npx prisma migrate dev --name add_emergency_extension_fields
```

### 2. API仕様拡張

#### PUT /api/pets/:petId/emergency-info

##### リクエストボディ拡張

```typescript
{
  disease?: string                   // 持病（最大1000文字）
  allergy?: string                   // アレルギー（最大1000文字）
  currentMedications?: string        // 現在の薬（最大1000文字）
  vetName?: string                   // 病院名（最大200文字）
  vetPhone?: string                  // 電話番号（正規化後: 000-0000-0000 形式）
  emergencyContactName?: string      // 緊急連絡先名（最大100文字）
  emergencyContactPhone?: string     // 電話番号（正規化後）
  
  // 新規追加フィールド
  bloodType?: string                 // 血液型（最大50文字、フリーテキスト）
  emergencyVetName?: string          // 夜間救急病院名（最大200文字）
  emergencyVetPhone?: string         // 夜間救急病院電話番号（正規化後）
  emergencyContactName2?: string     // 第二緊急連絡先名（最大100文字）
  emergencyContactPhone2?: string    // 第二緊急連絡先電話番号（正規化後）
}
```

##### バリデーションルール

```typescript
// 血液型: フリーテキスト（最大50文字）
bloodType: z.string().max(50).nullable().optional()

// 夜間救急病院名: 最大200文字
emergencyVetName: z.string().max(200).nullable().optional()

// 夜間救急病院電話番号: 既存の電話番号正規化ロジックを適用
emergencyVetPhone: nullablePhone

// 第二緊急連絡先名: 最大100文字
emergencyContactName2: z.string().max(100).nullable().optional()

// 第二緊急連絡先電話番号: 既存の電話番号正規化ロジックを適用
emergencyContactPhone2: nullablePhone
```

### 3. UI仕様拡張

#### 3.1 ペット一覧カードへの🚨緊急QRショートカット追加

##### 対象画面
- `/pets` (ペット一覧画面)

##### 実装内容
各ペットカードに「🚨緊急QR」ボタンを追加し、詳細ページを介さずにQRコード表示画面へ遷移できるようにする。

##### レイアウト
```
┌─────────────────────────────────┐
│ [写真] [名前] [種類・年齢]      │
│       [持病バッジ]              │
│ [詳細へ ▶]   [🚨緊急QR]        │ ← 新規追加
└─────────────────────────────────┘
```

##### 遷移先
- タップ時: QRコード表示モーダル/全画面
- QRコード表示: 既存のQRトークン取得APIを使用

##### 実装要件
- ボタンは緊急感のある色（#DC2626）
- タッチターゲット: 44px以上
- アイコン: 🚨または同等の緊急アイコン

#### 3.2 緊急公開画面(/e/[token])のファーストビュー再構成

##### 対象画面
- `/e/[token]` (緊急公開画面)

##### 実装内容
持病・アレルギーを最上部に固定表示し、拡張された救急病院・血液型を正しく優先配置する。

##### 新しいレイアウト（優先度順）
```
┌─────────────────────────────────┐
│ [救急情報] ※ロゴを最小化       │
│                                  │
│ ┌─[アニマルアイコン]─────────┐ │
│ │  チョコ（柴犬・オス・3歳）  │ │
│ │  体重: 10.2kg  血液型: DEA1.1+│ │ ← 血液型追加
│ └────────────────────────────┘ │
│                                  │
│ ┌─⚠️ 持病・既往歴 ──────────┐ │  ← 最優先表示（最上部固定）
│ │  糖尿病（2023年診断）       │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌─⛔ アレルギー ────────────┐ │  ← 最優先表示（最上部固定）
│ │  ペニシリン系抗生物質       │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌─💊 現在の投薬 ────────────┐ │
│ │  インスリン グラルギン 2U  │ │
│ │  毎日朝食後                │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌─📞 緊急連絡先1（第一）───────┐ │
│ │  田中 花子                  │ │
│ │  [電話をかける: 090-xxxx]   │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌─📞 緊急連絡先2（第二）───────┐ │  ← 新規追加
│ │  田中 太郎                  │ │
│ │  [電話をかける: 080-xxxx]   │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌─🏥 かかりつけ病院 ─────────┐│
│ │  ○○動物病院               │ │
│ │  [電話: 03-xxxx][地図]     │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌─🏥 夜間対応救急病院 ───────┐│  ← 新規追加
│ │  XX夜間動物救急センター     │ │
│ │  [電話: 03-yyyy][地図]     │ │
│ └────────────────────────────┘ │
│                                  │
│ ─────────────────────────────  │
│ ▼ 詳細情報（スクロールで表示） │
│ ワクチン状況 / 直近の受診記録   │
│                                  │
└─────────────────────────────────┘
```

##### 優先順位ルール
1. **最上部固定**: 持病・アレルギー（赤い左ボーダー、背景色#FEF2F2）
2. **次優先**: 現在の投薬
3. **連絡先**: 第一緊急連絡先 → 第二緊急連絡先
4. **病院**: かかりつけ病院 → 夜間救急病院
5. **スクロールエリア**: ワクチン状況・直近の受診記録

##### デザイン要件
- 持病・アレルギーカード: 赤い左ボーダー（4px solid #DC2626）
- 血液型: ペット基本情報カード内に表示
- 電話ボタン: 高さ56px以上、幅全体
- 文字サイズ最小: 16px
- コントラスト比: 4.5:1以上

### 4. 公開緊急API拡張

#### GET /api/public/emergency/:token

##### レスポンス拡張

```typescript
{
  data: {
    petName: string
    species: string
    breed: string
    sex: "MALE" | "FEMALE" | "UNKNOWN"
    ageYears: number | null
    weightKg: number | null
    photoUrl: string | null
    
    // 緊急情報
    disease: string | null
    allergy: string | null
    currentMedications: string | null
    
    // 拡張フィールド
    bloodType: string | null              // 新規追加
    
    // かかりつけ病院
    vetName: string | null
    vetPhone: string | null
    
    // 夜間救急病院（新規追加）
    emergencyVetName: string | null
    emergencyVetPhone: string | null
    
    // 緊急連絡先
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    
    // 第二緊急連絡先（新規追加）
    emergencyContactName2: string | null
    emergencyContactPhone2: string | null
    
    // 設定に応じた追加情報
    recentMedications?: MedicationSummary[]
    recentVaccinations?: VaccinationSummary[]
    recentMedicalRecords?: MedicalRecordSummary[]
    
    updatedAt: string
  }
}
```

### 5. テスト計画

#### 5.1 単体テスト

##### バリデーションテスト
- 血液型: 最大50文字まで許容、51文字で拒否
- 夜間救急病院名: 最大200文字まで許容、201文字で拒否
- 第二緊急連絡先: 最大100文字まで許容、101文字で拒否
- 電話番号正規化: 全角数字・記号の正規化確認

##### APIテスト
- 拡張フィールドの保存・取得
- 既存フィールドとの整合性
- null値の扱い

#### 5.2 統合テスト

##### データベース統合
- マイグレーション実行
- 既存データとの互換性
- カスケード削除の確認

##### API統合
- 認証・認可チェック
- 課金ステータスチェック
- エラーハンドリング

#### 5.3 E2Eテスト

##### UIテスト
- ペット一覧カードの🚨ボタン表示
- 🚨ボタン押下時のQR表示遷移
- 緊急公開画面のレイアウト確認
- 持病・アレルギーの最上部表示
- 血液型の表示
- 第二緊急連絡先の表示
- 夜間救急病院の表示

##### シナリオテスト
- 新規ペット登録→緊急情報入力（拡張フィールド含む）→QR表示→公開画面確認
- 既存ペットの緊急情報更新（拡張フィールド追加）→公開画面反映確認

### 6. 実装順序

1. **データベーススキーマ拡張**
   - Prismaスキーマ更新
   - マイグレーション実行
   - 型生成

2. **API拡張**
   - バリデーションスキーマ更新
   - APIルート更新
   - 公開緊急API更新

3. **UI拡張（ペット一覧）**
   - ペット一覧カードに🚨ボタン追加
   - QR表示遷移実装

4. **UI拡張（緊急公開画面）**
   - レイアウト再構成
   - 拡張フィールド表示
   - 優先順位実装

5. **テスト**
   - 単体テスト追加
   - 統合テスト追加
   - E2Eテスト追加

6. **検証**
   - Lint実行
   - テスト実行
   - 手動検証

### 7. 完了条件

- [x] Prismaスキーマおよびマイグレーション実行完了
- [x] PUT /api/pets/[petId]/emergency-info のリクエストボディとバリデーション拡張完了
- [x] ペット一覧カード上に🚨緊急QRへのダイレクトショートカット（2タップ到達）追加完了
- [x] 緊急公開画面(/e/[token])のファーストビューで持病・アレルギーを最上部に固定表示完了
- [x] 拡張された救急病院・血液型を正しく優先配置完了
- [x] npm run lint が通る
- [x] npx vitest run が通る

### 8. 依存関係

なし

### 9. リスクと対策

#### リスク1: マイグレーション失敗
- **対策**: 開発環境で事前検証、ロールバック手順準備

#### リスク2: 既存データの互換性
- **対策**: 拡張フィールドは全てnullable、既存データに影響なし

#### リスク3: 緊急公開画面の表示崩れ
- **対策**: レスポンシブデザイン確認、複数デバイスでテスト

#### リスク4: パフォーマンス劣化
- **対策**: APIレスポンスサイズ増加は最小限、必要なフィールドのみ返却

### 10. 参考資料

- API設計: docs/design/05_api_design.md
- 画面設計: docs/design/03_screen_design.md
- 既存緊急情報API: src/app/api/pets/[petId]/emergency-info/route.ts
- 既存バリデーション: src/lib/validators/emergency.ts
