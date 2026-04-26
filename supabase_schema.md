# Supabase Schema Design

本ドキュメントは、`prisma/schema.prisma` を基準にした現在のER構成です。

## ER図（Mermaid）
```mermaid
erDiagram
  Household ||--o{ HouseholdMember : has
  Household ||--o{ HouseholdInviteCode : issues
  Household ||--o{ Pet : owns

  Pet ||--o{ PetPhoto : has
  Pet ||--|| PetEmergencyInfo : has
  Pet ||--o{ PetMedicalRecord : has
  Pet ||--o{ PetMedication : has
  Pet ||--o{ PetVaccination : has
  Pet ||--|| PetEmergencyToken : has
  Pet ||--o{ PetCoreMetricEntry : records
  Pet ||--o{ PetLabResultEntry : records
  Pet ||--o{ PetHealthExtensionEntry : records

  Household {
    uuid id PK
    text name
    timestamptz createdAt
    timestamptz updatedAt
  }

  HouseholdMember {
    uuid id PK
    uuid householdId FK
    uuid userId
    enum role
    timestamptz createdAt
  }

  HouseholdInviteCode {
    uuid id PK
    uuid householdId FK
    text code UK
    timestamptz expiresAt
    timestamptz usedAt
    uuid usedBy
    uuid createdBy
    timestamptz createdAt
  }

  Pet {
    uuid id PK
    uuid householdId FK
    text name
    text species
    text breed
    enum sex
    timestamptz birthday
    int ageYears
    decimal weightKg
    text mainPhotoUrl
    text notesPersonality
    text notesFeatures
    text microchipNumber
    timestamptz createdAt
    timestamptz updatedAt
  }

  PetPhoto {
    uuid id PK
    uuid petId FK
    text photoUrl
    int sortOrder
    timestamptz createdAt
  }

  PetEmergencyInfo {
    uuid id PK
    uuid petId FK,UK
    text disease
    text allergy
    text currentMedications
    text vetName
    text vetPhone
    text emergencyContactName
    text emergencyContactPhone
    timestamptz updatedAt
  }

  PetMedicalRecord {
    uuid id PK
    uuid petId FK
    timestamptz date
    enum recordType
    text title
    text description
    text photoUrl
    timestamptz createdAt
  }

  PetMedication {
    uuid id PK
    uuid petId FK
    text name
    text dosage
    text frequency
    timestamptz startDate
    timestamptz endDate
    timestamptz createdAt
  }

  PetVaccination {
    uuid id PK
    uuid petId FK
    enum type
    timestamptz date
    timestamptz nextDue
    timestamptz createdAt
  }

  PetEmergencyToken {
    uuid id PK
    uuid petId FK,UK
    uuid token UK
    bool isActive
    timestamptz rotatedAt
    timestamptz createdAt
  }

  PetCoreMetricEntry {
    uuid id PK
    uuid petId FK
    enum type
    decimal value
    timestamptz recordedAt
    text note
    timestamptz createdAt
  }

  PetLabResultEntry {
    uuid id PK
    uuid petId FK
    enum marker
    decimal value
    text unit
    timestamptz recordedAt
    text note
    timestamptz createdAt
  }

  PetHealthExtensionEntry {
    uuid id PK
    uuid petId FK
    enum key
    decimal value
    text unit
    timestamptz recordedAt
    text note
    timestamptz createdAt
  }
```

## 補足
- すべての外部キーは `ON DELETE CASCADE`。
- 1:1は `PetEmergencyInfo.petId` と `PetEmergencyToken.petId` の `UNIQUE` で担保。
- `HouseholdMember.userId`, `HouseholdInviteCode.usedBy`, `HouseholdInviteCode.createdBy` は Supabase Auth (`auth.users.id`) を参照する想定。
