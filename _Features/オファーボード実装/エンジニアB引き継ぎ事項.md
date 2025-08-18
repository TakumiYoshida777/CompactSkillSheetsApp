# エンジニアB（データベース・インフラ担当）への引き継ぎ事項

作成日: 2025年8月17日
作成者: エンジニアA（バックエンドAPI担当）

## 先行実装したリポジトリファイル

エンジニアBの担当範囲でしたが、API実装のために以下のリポジトリを先行実装しました。
Prismaスキーマ作成後、これらのファイルの実装を更新してください。

### 実装済みファイル
1. `backend/src/repositories/offerRepository.ts`
2. `backend/src/repositories/offerEngineerRepository.ts`
3. `backend/src/repositories/emailTemplateRepository.ts`
4. `backend/src/repositories/emailLogRepository.ts`

### 必要なPrismaモデル

#### 1. Offer（offers）テーブル
```prisma
model Offer {
  id                   BigInt           @id @default(autoincrement())
  offerNumber          String           @unique @map("offer_number")
  clientCompanyId      BigInt           @map("client_company_id")
  status               OfferStatus      @default(SENT)
  projectName          String           @map("project_name")
  projectPeriodStart   DateTime         @map("project_period_start")
  projectPeriodEnd     DateTime         @map("project_period_end")
  requiredSkills       Json?            @map("required_skills")
  projectDescription   String           @map("project_description")
  location             String?
  rateMin              Int?             @map("rate_min")
  rateMax              Int?             @map("rate_max")
  remarks              String?
  sentAt               DateTime         @map("sent_at")
  openedAt             DateTime?        @map("opened_at")
  respondedAt          DateTime?        @map("responded_at")
  reminderSentAt       DateTime?        @map("reminder_sent_at")
  reminderCount        Int              @default(0) @map("reminder_count")
  createdBy            BigInt           @map("created_by")
  createdAt            DateTime         @default(now()) @map("created_at")
  updatedAt            DateTime         @updatedAt @map("updated_at")
  
  clientCompany        Company          @relation(fields: [clientCompanyId], references: [id])
  creator              User             @relation(fields: [createdBy], references: [id])
  offerEngineers       OfferEngineer[]
  
  @@map("offers")
  @@index([clientCompanyId])
  @@index([status])
  @@index([sentAt])
}
```

#### 2. OfferEngineer（offer_engineers）テーブル
```prisma
model OfferEngineer {
  id                BigInt                 @id @default(autoincrement())
  offerId           BigInt                 @map("offer_id")
  engineerId        BigInt                 @map("engineer_id")
  individualStatus  OfferEngineerStatus    @default(SENT) @map("individual_status")
  openedAt          DateTime?              @map("opened_at")
  respondedAt       DateTime?              @map("responded_at")
  responseComment   String?                @map("response_comment")
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  
  offer             Offer                  @relation(fields: [offerId], references: [id])
  engineer          Engineer               @relation(fields: [engineerId], references: [id])
  
  @@unique([offerId, engineerId])
  @@map("offer_engineers")
  @@index([engineerId])
  @@index([individualStatus])
}
```

#### 3. Enum定義
```prisma
enum OfferStatus {
  DRAFT
  SENT
  PARTIAL
  COMPLETED
  WITHDRAWN
  EXPIRED
  
  @@map("offer_status")
}

enum OfferEngineerStatus {
  SENT
  OPENED
  PENDING
  ACCEPTED
  DECLINED
  WITHDRAWN
  
  @@map("offer_engineer_status")
}
```

## 型定義ファイル

以下の型定義を参照してください：
- `backend/src/types/offer.ts`

## リポジトリメソッド一覧

### OfferRepository
- create() - オファー作成
- findById() - ID検索
- findMany() - 一覧取得
- update() - 更新
- updateStatus() - ステータス更新
- getStatistics() - 統計情報取得
- getNextOfferNumber() - オファー番号採番
- など

### OfferEngineerRepository
- create() - 対象エンジニア追加
- createMany() - 複数追加
- findByOfferId() - オファーID検索
- findByEngineerId() - エンジニアID検索
- updateStatus() - ステータス更新
- getStatistics() - 統計情報取得
- など

## 注意事項

1. **bigint型の使用**
   - PrismaはBigInt型を使用します
   - JavaScriptのnumber型との変換に注意

2. **JSON型フィールド**
   - requiredSkillsはJson型として定義
   - 型キャストが必要な場合があります

3. **インデックス**
   - パフォーマンスのため適切なインデックスを設定してください
   - 特に検索・フィルタリングで使用するカラム

4. **リレーション**
   - Company、User、Engineerテーブルとの関連を設定
   - カスケード削除の設定を検討

## テスト

リポジトリ層のテストファイルも作成済みです：
- `backend/src/repositories/__tests__/offerRepository.test.ts`
- `backend/src/repositories/__tests__/offerEngineerRepository.test.ts`

Prismaモデル作成後、これらのテストが通るように実装を調整してください。

## 連携事項

1. マイグレーション実行後、リポジトリの実装を更新してください
2. Prismaクライアントの再生成を忘れずに実行してください
3. 型エラーが発生した場合は、エンジニアAと相談してください

よろしくお願いします。