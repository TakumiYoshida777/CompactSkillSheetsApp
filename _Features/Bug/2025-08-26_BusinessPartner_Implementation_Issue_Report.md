# 取引先一覧機能 実装調査レポート
**作成日**: 2025-08-26  
**調査者**: ClaudeCode  
**優先度**: 🔴 緊急

## エグゼクティブサマリー

取引先一覧機能に**重大な実装問題**が発見されました。現在、設計書で定義されたテーブル構造（`business_partners`テーブル）が使用されておらず、ハードコーディングされたダミーデータに依存した暫定実装が稼働しています。これによりデータの信頼性、拡張性、保守性に深刻な問題が生じています。

## 1. 現状の問題点

### 1.1 二重実装の存在

現在、同じ機能に対して2つの異なる実装が存在しています：

| 項目 | 暫定実装（現在使用中） | 正式実装（未使用） |
|------|----------------------|------------------|
| エンドポイント | `/partner-list` | `/business-partners` |
| サービス | `partnerListService` | `businessPartnerService` |
| データソース | `company`テーブル | `business_partners`テーブル |
| 実装状態 | ハードコーディング多数 | 設計書準拠 |

### 1.2 データソースの問題

#### 現在の実装（問題あり）
```typescript
// backend/src/services/partnerListService.ts
const companies = await prismaService.company.findMany({
  where: {
    companyType: 'CLIENT'  // companyテーブルから取得
  }
});
```

#### 本来の設計
```prisma
// backend/prisma/schema.prisma
model BusinessPartner {
  id              BigInt   @id @default(autoincrement())
  sesCompanyId    BigInt
  clientCompanyId BigInt
  // ... 正式なフィールド定義
}
```

### 1.3 ハードコーディングの実態

```typescript
// 実装例：backend/src/services/partnerListService.ts 91-103行目
const industryMap: { [key: string]: string } = {
  '株式会社ABC商事': 'IT・通信',
  'XYZ株式会社': '金融・保険',
  // ... 企業名でハードコーディング
};

// ランダム値での統計生成
currentEngineers: Math.floor(Math.random() * 10),
monthlyRevenue: Math.floor(Math.random() * 10000000),
```

## 2. 影響範囲

### 2.1 ビジネスへの影響
- **データ信頼性**: 表示される数値（売上、エンジニア数等）がダミーデータ
- **意思決定リスク**: 誤ったデータに基づく経営判断の可能性
- **顧客対応**: 実際の取引先情報が正しく管理されない

### 2.2 技術的影響
- **拡張困難**: 新機能追加時に2つの実装を考慮する必要
- **保守性低下**: どちらの実装を修正すべきか不明確
- **データ整合性**: テーブル間のリレーションが機能していない

## 3. 原因分析

### 3.1 開発プロセスの問題
1. プロトタイプ実装がそのまま本番に残存
2. 設計書とコード実装の乖離
3. レビュープロセスの不足

### 3.2 技術的要因
1. Prismaスキーマと実装の非同期更新
2. テストデータの本格実装化
3. API設計の不統一

## 4. 推奨対応策

### 4.1 緊急対応（1週間以内）

#### Step 1: フロントエンドのエンドポイント切り替え
```typescript
// frontend/src/api/businessPartner.ts
// 変更前
const response = await api.get('/partner-list', { params });

// 変更後
const response = await api.get('/business-partners', { params });
```

#### Step 2: データマッピング調整
正式実装のレスポンス形式に合わせてフロントエンドを調整

### 4.2 短期対応（1ヶ月以内）

1. **データマイグレーション**
   - `company`テーブルから`business_partners`テーブルへデータ移行
   - ハードコーディングデータの実データ化

2. **暫定実装の廃止**
   - `partnerListService`の削除
   - 関連ルートの削除

### 4.3 中長期対応（3ヶ月以内）

1. **設計レビュープロセス確立**
   - 実装前の設計書レビュー必須化
   - 定期的な設計・実装整合性チェック

2. **データ品質管理**
   - ハードコーディング禁止ルールの徹底
   - データベースマスター管理の確立

## 5. リスクと対策

| リスク | 影響度 | 対策 |
|-------|-------|------|
| 移行時のデータ損失 | 高 | バックアップとロールバック計画 |
| 既存機能への影響 | 中 | 段階的移行と十分なテスト |
| パフォーマンス劣化 | 低 | インデックス最適化 |

## 6. 実装修正の詳細

### 6.1 現在のコールフロー
```
Frontend → /partner-list → partnerListService → companyテーブル
                                ↓
                        ハードコーディングデータ
```

### 6.2 修正後のコールフロー
```
Frontend → /business-partners → businessPartnerService → business_partnersテーブル
                                        ↓
                                実データベース
```

## 7. テスト計画

### 7.1 単体テスト
- businessPartnerServiceの全機能テスト
- データ変換ロジックのテスト

### 7.2 統合テスト
- API経由でのCRUD操作
- 権限チェック機能
- ページネーション、フィルタリング

### 7.3 E2Eテスト
- 取引先一覧表示
- 検索・フィルタリング
- 詳細表示

## 8. 作業見積もり

| タスク | 工数 | 担当 |
|--------|------|------|
| エンドポイント切り替え | 4h | FE開発 |
| データマイグレーション | 16h | BE開発 |
| テスト実装・実行 | 8h | QA |
| リリース作業 | 4h | DevOps |
| **合計** | **32h** | - |

## 9. 結論

現在の取引先一覧機能は**設計と実装が大きく乖離**しており、**ビジネスリスク**を抱えています。特に、ハードコーディングされたダミーデータは実際の事業運営において誤った情報を提供しており、早急な対応が必要です。

推奨される対応順序：
1. 🔴 **即座に**: ハードコーディングデータの影響範囲を関係者に周知
2. 🟡 **1週間以内**: 正式実装への切り替え準備
3. 🟢 **1ヶ月以内**: 完全移行の実施

## 10. 付録

### 10.1 関連ファイル一覧

#### フロントエンド
- `/frontend/src/pages/BusinessPartners/BusinessPartnerList.tsx`
- `/frontend/src/api/businessPartner.ts`

#### バックエンド（暫定実装）
- `/backend/src/routes/v1/partnerList.routes.ts`
- `/backend/src/controllers/partnerListController.ts`
- `/backend/src/services/partnerListService.ts`

#### バックエンド（正式実装）
- `/backend/src/routes/businessPartnerRoutes.ts`
- `/backend/src/controllers/businessPartnerController.ts`
- `/backend/src/services/businessPartnerService.ts`

#### データベース
- `/backend/prisma/schema.prisma`
- `business_partners`テーブル定義
- `business_partner_settings`テーブル定義

### 10.2 ハードコーディング箇所一覧

| ファイル | 行番号 | 内容 |
|---------|-------|------|
| partnerListService.ts | 91-103 | 業界マッピング |
| partnerListService.ts | 105-117 | 従業員数マッピング |
| partnerListService.ts | 119-131 | スキルマッピング |
| partnerListService.ts | 133-145 | 契約形態マッピング |
| partnerListService.ts | 147-159 | Webサイトマッピング |

---

**対応状況**: ⏳ 未対応  
**次回レビュー日**: 2025-09-02