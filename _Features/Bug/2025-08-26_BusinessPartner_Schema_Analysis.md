# BusinessPartner機能 スキーマ分析レポート
**作成日**: 2025-08-26  
**分析者**: ClaudeCode

## 1. Prismaスキーマ分析結果

### 1.1 BusinessPartnerテーブル構造

```prisma
model BusinessPartner {
  id              BigInt   @id @default(autoincrement())
  sesCompanyId    BigInt   // SES企業ID
  clientCompanyId BigInt   // クライアント企業ID
  accessUrl       String   @unique
  urlToken        String   @unique
  isActive        Boolean  @default(true)
  createdBy       BigInt
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
  
  // リレーション
  sesCompany          Company                 // SES企業
  clientCompany       Company                 // クライアント企業
  clientUsers         ClientUser[]            // 取引先ユーザー
  accessPermissions   ClientAccessPermission[]
  engineerPermissions EngineerPermission[]
  engineerNgLists     EngineerNgList[]
  setting             BusinessPartnerSetting?
}
```

### 1.2 関連テーブル

#### BusinessPartnerSetting
```prisma
model BusinessPartnerSetting {
  id                BigInt   @id
  businessPartnerId BigInt   @unique
  viewType          String   @default("waiting")
  showWaitingOnly   Boolean  @default(true)
  autoApprove       Boolean  @default(false)
}
```

#### ClientUser (取引先企業担当者)
```prisma
model ClientUser {
  id                 BigInt
  businessPartnerId  BigInt
  email              String
  name               String
  phone              String?
  department         String?
  position           String?
  // ... 認証関連フィールド
}
```

## 2. 暫定実装とのギャップ分析

### 2.1 フィールドマッピング

| 暫定実装（画面表示） | Prismaスキーマ | ギャップ |
|---------------------|---------------|----------|
| companyName | clientCompany.name | リレーション経由 |
| companyNameKana | ❌ 存在しない | 追加必要 |
| industry | ❌ 存在しない | Company側に存在？ |
| employeeSize | ❌ 存在しない | Company側に存在？ |
| address | ❌ 存在しない | Company側に存在 |
| phone | ❌ 存在しない | Company側に存在 |
| website | ❌ 存在しない | Company側に存在 |
| contacts[] | clientUsers[] | 構造が異なる |
| contractTypes[] | ❌ 存在しない | 追加必要 |
| budgetMin/Max | ❌ 存在しない | 追加必要 |
| preferredSkills[] | ❌ 存在しない | 追加必要 |
| currentEngineers | ❌ 存在しない | 集計が必要 |
| monthlyRevenue | ❌ 存在しない | 集計が必要 |
| approaches[] | ❌ 直接参照なし | Approachテーブル経由 |

### 2.2 構造的な違い

1. **データの正規化**
   - Prisma: 正規化された構造（BusinessPartner → Company）
   - 暫定: 非正規化（すべてフラット）

2. **担当者情報**
   - Prisma: ClientUserテーブルで管理
   - 暫定: contacts配列で管理

3. **統計情報**
   - Prisma: リアルタイム集計が必要
   - 暫定: ハードコーディング

## 3. データマイグレーション戦略

### 3.1 方針A: スキーマ拡張アプローチ

BusinessPartnerテーブルに必要なフィールドを追加：

```sql
ALTER TABLE business_partners
ADD COLUMN contract_types JSON,
ADD COLUMN budget_min INT,
ADD COLUMN budget_max INT,
ADD COLUMN preferred_skills JSON,
ADD COLUMN notes TEXT;
```

**メリット**: 
- 実装変更が最小限
- 暫定実装との互換性高い

**デメリット**:
- 正規化の原則に反する
- Companyテーブルとの重複

### 3.2 方針B: ビューテーブルアプローチ

集計ビューを作成してデータを提供：

```sql
CREATE VIEW business_partner_view AS
SELECT 
  bp.id,
  c.name as company_name,
  c.name_kana as company_name_kana,
  c.industry,
  c.employee_count as employee_size,
  c.address,
  c.phone,
  c.website,
  (SELECT COUNT(*) FROM project_assignments pa 
   WHERE pa.project_id IN 
     (SELECT id FROM projects WHERE client_company_id = bp.client_company_id)
   AND pa.end_date IS NULL) as current_engineers,
  -- その他の集計フィールド
FROM business_partners bp
INNER JOIN companies c ON bp.client_company_id = c.id
WHERE bp.deleted_at IS NULL;
```

**メリット**:
- 正規化を維持
- リアルタイムデータ

**デメリット**:
- パフォーマンス懸念
- 複雑なクエリ

### 3.3 方針C: 中間テーブルアプローチ

取引先詳細テーブルを新設：

```prisma
model BusinessPartnerDetail {
  id                BigInt @id
  businessPartnerId BigInt @unique
  contractTypes     Json?
  budgetMin         Int?
  budgetMax         Int?
  preferredSkills   Json?
  industry          String?
  employeeSize      String?
  notes             Text?
  // 統計情報（定期更新）
  currentEngineers  Int @default(0)
  monthlyRevenue    Int @default(0)
  totalProposals    Int @default(0)
  acceptedProposals Int @default(0)
  lastUpdatedAt     DateTime
}
```

**メリット**:
- 柔軟な拡張可能
- 既存構造への影響最小

**デメリット**:
- テーブル増加
- 同期処理必要

## 4. 推奨実装計画

### Step 1: 中間テーブル作成（方針C採用）
```bash
# マイグレーションファイル作成
npx prisma migrate dev --name add_business_partner_details
```

### Step 2: データ移行スクリプト
```typescript
// scripts/migrate-business-partners.ts
async function migrateBusinessPartners() {
  // 1. Companyテーブル（CLIENT）からBusinessPartnerを作成
  const clientCompanies = await prisma.company.findMany({
    where: { companyType: 'CLIENT' }
  });
  
  for (const company of clientCompanies) {
    // BusinessPartnerレコード作成
    const bp = await prisma.businessPartner.create({
      data: {
        sesCompanyId: DEFAULT_SES_COMPANY_ID,
        clientCompanyId: company.id,
        accessUrl: generateAccessUrl(),
        urlToken: generateToken(),
        createdBy: SYSTEM_USER_ID
      }
    });
    
    // BusinessPartnerDetailレコード作成
    await prisma.businessPartnerDetail.create({
      data: {
        businessPartnerId: bp.id,
        industry: company.industry,
        employeeSize: company.employeeCount,
        // ハードコーディングデータから移行
        contractTypes: getContractTypes(company.name),
        preferredSkills: getPreferredSkills(company.name),
        currentEngineers: await countCurrentEngineers(company.id),
        monthlyRevenue: await calculateMonthlyRevenue(company.id)
      }
    });
  }
}
```

### Step 3: サービス層の修正
```typescript
// services/businessPartnerService.ts
class BusinessPartnerService {
  async getList() {
    return await prisma.businessPartner.findMany({
      include: {
        clientCompany: true,
        detail: true,  // 新しい詳細テーブル
        clientUsers: true,
        _count: {
          select: {
            engineerPermissions: true
          }
        }
      }
    });
  }
}
```

### Step 4: データ変換層の実装
```typescript
// utils/businessPartnerTransformer.ts
export function transformToLegacyFormat(partner: PrismaBusinessPartner) {
  return {
    id: partner.id.toString(),
    companyName: partner.clientCompany.name,
    companyNameKana: partner.clientCompany.nameKana,
    industry: partner.detail?.industry,
    employeeSize: partner.detail?.employeeSize,
    contacts: partner.clientUsers.map(transformClientUser),
    currentEngineers: partner.detail?.currentEngineers || 0,
    monthlyRevenue: partner.detail?.monthlyRevenue || 0,
    // ... その他のマッピング
  };
}
```

## 5. 実装優先順位

1. **高優先度**
   - BusinessPartnerDetailテーブル作成
   - 基本的なCRUD操作の実装
   - データ変換層

2. **中優先度**
   - 統計情報の集計ロジック
   - 既存データの移行
   - 権限管理の統合

3. **低優先度**
   - パフォーマンス最適化
   - キャッシュ実装
   - UI/UXの改善

## 6. リスクと対策

| リスク | 影響度 | 対策 |
|--------|-------|------|
| データ不整合 | 高 | トランザクション管理、バリデーション強化 |
| パフォーマンス低下 | 中 | インデックス最適化、キャッシュ実装 |
| 移行失敗 | 高 | ロールバックスクリプト準備、段階的移行 |
| 機能の一時停止 | 中 | Feature Flag導入、並行稼働期間設定 |

## 7. 今後のタスク

- [ ] BusinessPartnerDetailモデルの追加
- [ ] Prismaマイグレーションの実行
- [ ] データ移行スクリプトの作成
- [ ] 変換層の実装
- [ ] API統合テスト
- [ ] パフォーマンステスト
- [ ] 本番移行手順書作成

---
**次回アクション**: BusinessPartnerDetailモデルの設計レビュー  
**期限**: 2025-08-28