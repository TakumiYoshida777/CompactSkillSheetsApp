# エンジニアC - 取引先・オファー管理機能 API連携実装指示書

## 担当者: エンジニアC
## 優先度: 高（収益に直結する機能のため）

---

## 1. 担当範囲

### 1.1 取引先管理機能
- 取引先企業管理
- アクセス権限設定
- 取引先ダッシュボード（CLI001）
- エンジニア公開設定

### 1.2 オファー管理機能
- オファーボード（CLI001）
- オファー送信機能（CLI003）
- オファー管理画面（CLI004）
- オファー履歴・統計

---

## 2. 実装タスク詳細

### 2.1 取引先企業管理

#### 2.1.1 取引先情報管理
```typescript
// 実装するAPI接続
GET /api/v1/business-partners
GET /api/v1/business-partners/{partnerId}
POST /api/v1/business-partners
PUT /api/v1/business-partners/{partnerId}
DELETE /api/v1/business-partners/{partnerId}
```

**実装要件:**
- 取引先企業の CRUD 操作
- 契約ステータス管理
- 利用制限設定（閲覧可能エンジニア数等）
- アクセスURL生成・管理
- 契約期限アラート表示

#### 2.1.2 アクセス権限管理
```typescript
// 実装するAPI接続
GET /api/v1/business-partners/{partnerId}/permissions
PUT /api/v1/business-partners/{partnerId}/permissions
POST /api/v1/business-partners/{partnerId}/access-urls
DELETE /api/v1/business-partners/{partnerId}/access-urls/{urlId}
```

**実装要件:**
- エンジニア個別公開設定
- 待機ステータス別の自動公開
- NG設定の管理
- アクセスURL有効期限管理

#### 2.1.3 取引先ユーザー管理
```typescript
// 実装するAPI接続
GET /api/v1/business-partners/{partnerId}/users
POST /api/v1/business-partners/{partnerId}/users
PUT /api/v1/business-partners/{partnerId}/users/{userId}
DELETE /api/v1/business-partners/{partnerId}/users/{userId}
```

**実装要件:**
- 取引先ユーザーアカウント作成
- ロール設定（管理者、営業、PM）
- ログイン履歴管理
- パスワードリセット機能

### 2.2 オファーボード機能

#### 2.2.1 オファー可能エンジニア表示
```typescript
// 実装するAPI接続
GET /api/v1/offers/available-engineers
GET /api/v1/offers/engineers/{engineerId}/status
POST /api/v1/offers/engineers/filter
```

**実装要件:**
- リアルタイム稼働状況表示
- フィルタリング機能（スキル、経験年数、稼働時期）
- オファー済みステータス表示
- お気に入り機能
- 一括選択UI

#### 2.2.2 オファー送信機能
```typescript
// 実装するAPI接続
POST /api/v1/offers
POST /api/v1/offers/bulk
GET /api/v1/offers/templates
POST /api/v1/offers/{offerId}/resend
```

**実装要件:**
- 単一/複数オファー送信
- 案件詳細入力フォーム
- メールテンプレート管理
- 送信プレビュー機能
- 送信スケジューリング

#### 2.2.3 オファー管理・追跡
```typescript
// 実装するAPI接続
GET /api/v1/offers
GET /api/v1/offers/{offerId}
PATCH /api/v1/offers/{offerId}/status
GET /api/v1/offers/{offerId}/history
DELETE /api/v1/offers/{offerId}
```

**実装要件:**
- オファーステータス管理（送信済、検討中、承諾、辞退）
- 開封率・返信率追跡
- フォローアップリマインダー
- オファー有効期限管理

### 2.3 オファー統計・分析

#### 2.3.1 統計ダッシュボード
```typescript
// 実装するAPI接続
GET /api/v1/offers/statistics
GET /api/v1/offers/statistics/monthly
GET /api/v1/offers/statistics/by-company
GET /api/v1/offers/conversion-rate
```

**実装要件:**
- 月次オファー統計表示
- 成約率分析
- 企業別パフォーマンス
- トレンドグラフ表示
- KPI監視ダッシュボード

#### 2.3.2 レポート生成
```typescript
// 実装するAPI接続
POST /api/v1/offers/reports/generate
GET /api/v1/offers/reports/{reportId}
GET /api/v1/offers/reports/export
```

**実装要件:**
- 定期レポート自動生成
- カスタムレポート作成
- PDF/Excel エクスポート
- メール配信機能

---

## 3. 状態管理設計

### 3.1 Zustand Store構成
```typescript
// stores/partnerStore.ts
interface PartnerState {
  partners: BusinessPartner[]
  selectedPartner: BusinessPartner | null
  permissions: PartnerPermissions | null
  
  // Actions
  fetchPartners: () => Promise<void>
  updatePartnerPermissions: (partnerId: string, permissions: PartnerPermissions) => Promise<void>
  generateAccessUrl: (partnerId: string) => Promise<string>
}

// stores/offerStore.ts
interface OfferState {
  availableEngineers: Engineer[]
  offers: Offer[]
  selectedOffers: string[]
  statistics: OfferStatistics | null
  filters: OfferFilters
  
  // Actions
  fetchAvailableEngineers: () => Promise<void>
  sendOffer: (offerData: OfferData) => Promise<void>
  bulkSendOffers: (offers: OfferData[]) => Promise<void>
  updateOfferStatus: (offerId: string, status: string) => Promise<void>
  fetchStatistics: (period?: DateRange) => Promise<void>
}
```

### 3.2 TanStack Query設定
```typescript
// queries/partnerQueries.ts
export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: partnerAPI.fetchAll,
    staleTime: 5 * 60 * 1000
  })
}

export const usePartnerPermissions = (partnerId: string) => {
  return useQuery({
    queryKey: ['partner-permissions', partnerId],
    queryFn: () => partnerAPI.fetchPermissions(partnerId),
    enabled: !!partnerId
  })
}

// queries/offerQueries.ts
export const useAvailableEngineers = (partnerId: string) => {
  return useQuery({
    queryKey: ['available-engineers', partnerId],
    queryFn: () => offerAPI.fetchAvailableEngineers(partnerId),
    refetchInterval: 60 * 1000 // 1分ごと更新
  })
}
```

---

## 4. UI/UXコンポーネント

### 4.1 取引先管理コンポーネント
```typescript
// components/partners/PartnerManagement.tsx
- PartnerList（取引先一覧）
- PartnerDetail（取引先詳細）
- PermissionSettings（権限設定）
- AccessUrlManager（URL管理）
- UserManagement（ユーザー管理）
```

### 4.2 オファーボードコンポーネント
```typescript
// components/offers/OfferBoard.tsx
- EngineerSelector（エンジニア選択）
- OfferForm（オファーフォーム）
- OfferPreview（プレビュー）
- BulkOfferModal（一括オファー）
- OfferStatus（ステータス表示）
```

### 4.3 統計・分析コンポーネント
```typescript
// components/offers/OfferAnalytics.tsx
- StatisticsCard（統計カード）
- ConversionChart（成約率グラフ）
- TrendAnalysis（トレンド分析）
- ReportGenerator（レポート生成）
```

---

## 5. セキュリティ要件

### 5.1 アクセス制御
- 企業間データの完全分離
- 取引先別の閲覧権限制御
- IPアドレス制限機能
- アクセスログ記録

### 5.2 データ保護
- 個人情報のマスキング
- エンジニア情報の選択的公開
- セキュアなURL生成（ワンタイムトークン）
- 通信の暗号化

---

## 6. パフォーマンス最適化

### 6.1 データ取得最適化
```typescript
// 最適化ポイント
- GraphQL的な選択的フィールド取得
- データのバッチ取得
- キャッシュ戦略（staleWhileRevalidate）
- 楽観的更新の実装
```

### 6.2 UI最適化
- 仮想スクロール（大量オファー表示）
- 遅延ローディング
- デバウンス処理（リアルタイム検索）
- メモ化による再レンダリング防止

---

## 7. テスト要件

### 7.1 単体テスト
```typescript
// __tests__/partners/permissions.test.ts
- 権限設定の更新
- アクセスURL生成
- NG設定の適用
```

### 7.2 統合テスト
```typescript
// __tests__/integration/offer-flow.test.ts
- エンジニア選択→オファー作成→送信→統計更新
- 取引先設定→権限付与→エンジニア公開
- オファー送信→ステータス変更→レポート生成
```

### 7.3 E2Eテスト
```typescript
// cypress/e2e/offer-management.cy.ts
- 完全なオファーフロー
- 取引先ユーザーログイン→閲覧→オファー
```

---

## 8. エラーハンドリング

### 8.1 ビジネスロジックエラー
```typescript
// エラーケース
- 契約期限切れ
- 利用制限超過
- 重複オファー防止
- 権限不足エラー
```

### 8.2 ユーザーフィードバック
- 成功/失敗のトースト通知
- 確認ダイアログ（削除、重要操作）
- プログレス表示（一括処理）
- エラー詳細の表示

---

## 9. 完了条件

### 9.1 機能要件
- [ ] 取引先企業の登録・管理
- [ ] エンジニア公開設定
- [ ] オファー送信機能
- [ ] オファー統計表示
- [ ] レポート生成

### 9.2 非機能要件
- [ ] 企業間データ分離の保証
- [ ] オファー送信の成功率99%以上
- [ ] 統計データのリアルタイム性（1分以内）
- [ ] テストカバレッジ 80%以上

### 9.3 ドキュメント
- [ ] 取引先管理フロー図
- [ ] オファー管理仕様書
- [ ] セキュリティチェックリスト

---

## 10. 依存関係

### 10.1 必要なパッケージ
```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "react-email-editor": "^1.7.0",
    "react-beautiful-dnd": "^13.1.1",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "date-fns": "^2.30.0"
  }
}
```

### 10.2 他チームとの連携
- エンジニアB: エンジニアデータの参照
- エンジニアD: アプローチ機能との連携
- エンジニアE: 共通コンポーネント利用

---

## 11. 注意事項

- **重要**: 取引先企業間のデータ分離を厳守
- オファー送信は取引先の承認フロー考慮
- 個人情報保護法への準拠
- 成約率向上のためのUI/UX改善を意識
- メール送信のレート制限に注意

---

## 12. 参考資料

- `/Documents/画面設計書/画面設計書.md` (CLI001-004セクション)
- `/Documents/API設計書/エンドポイント定義書.md`
- `/Documents/個人情報保護設計書.md`
- `/Documents/要件定義書/要件定義書.md` (取引先管理セクション)