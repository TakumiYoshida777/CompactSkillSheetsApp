# エンジニアA - ダッシュボード機能 API連携実装指示書

## 担当者: エンジニアA
## 優先度: 高

---

## 1. 担当範囲

### 1.1 ダッシュボード機能
- SES企業ダッシュボード（DASH001）
- KPI表示機能
- 最新情報表示
- クイックアクション

---

## 2. 実装タスク詳細

### 2.1 ダッシュボード機能実装

#### 2.1.1 KPIデータ取得
```typescript
// 実装するAPI接続
GET /api/v1/analytics/dashboard
GET /api/v1/engineers/statistics
GET /api/v1/approaches/statistics
```

**実装要件:**
- リアルタイムデータ更新（WebSocket考慮）
- データキャッシュ戦略
- エラー時のフォールバック表示

#### 2.1.2 エンジニア状況表示
```typescript
// 実装するAPI接続
GET /api/v1/engineers?status=waiting&limit=5
GET /api/v1/engineers?status=upcoming&limit=5
```

**実装要件:**
- ページネーション処理
- フィルタリング機能
- ソート機能

#### 2.1.3 最新情報・通知
```typescript
// 実装するAPI接続
GET /api/v1/notifications
GET /api/v1/system/announcements
POST /api/v1/notifications/mark-read
```

**実装要件:**
- 未読数バッジ表示
- リアルタイム通知（SSE/WebSocket）
- 通知設定管理

---

## 3. 状態管理設計

### 3.1 Zustand Store構成
```typescript
// stores/dashboardStore.ts
interface DashboardState {
  kpiData: KPIData | null
  engineers: Engineer[]
  notifications: Notification[]
  isLoading: boolean
  fetchDashboardData: () => Promise<void>
  updateKPI: () => Promise<void>
}
```

### 3.2 TanStack Query設定
```typescript
// queries/dashboardQueries.ts
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardAPI.fetchData,
    staleTime: 5 * 60 * 1000, // 5分
    refetchInterval: 30 * 1000 // 30秒
  })
}
```

---

## 4. エラーハンドリング

### 4.1 共通エラー処理
```typescript
// utils/errorHandler.ts
export const handleAPIError = (error: AxiosError) => {
  switch (error.response?.status) {
    case 403:
      // 権限エラー表示
      break
    case 429:
      // レート制限エラー表示
      break
    case 500:
      // サーバーエラー表示
      break
    default:
      // 一般エラー表示
  }
}
```

---

## 5. 表示要件

### 5.1 レスポンシブ対応
- PC（1920px）
- タブレット（768px）
- スマートフォン（375px）

### 5.2 アクセシビリティ
- WCAG 2.1 AA準拠
- キーボード操作対応
- スクリーンリーダー対応

---

## 6. テスト要件

### 6.1 単体テスト
```typescript
// __tests__/dashboard/kpi.test.ts
- KPIデータ取得
- 統計情報表示
- エラー時のフォールバック
```

### 6.2 統合テスト
```typescript
// __tests__/integration/dashboard-flow.test.ts
- ダッシュボード初期表示
- データ自動更新
- 通知受信と表示
```

### 6.3 E2Eテスト
```typescript
// cypress/e2e/dashboard.cy.ts
- ダッシュボード全体フロー
- リアルタイム更新確認
```

---

## 7. 開発環境セットアップ

### 7.1 必要な依存関係
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0"
  }
}
```

### 7.2 環境変数設定
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
```

---

## 8. 完了条件

### 8.1 機能要件
- [ ] ダッシュボードデータの表示
- [ ] KPI表示の実装
- [ ] 通知機能の実装
- [ ] エラーハンドリング実装

### 8.2 非機能要件
- [ ] レスポンス時間 0.5秒以内
- [ ] テストカバレッジ 80%以上
- [ ] アクセシビリティ WCAG 2.1 AA準拠

### 8.3 ドキュメント
- [ ] API連携仕様書
- [ ] 状態管理設計書
- [ ] テスト仕様書

---

## 9. 参考資料

- `/Documents/API設計書/エンドポイント定義書.md`
- `/Documents/画面設計書/画面設計書.md`
- `/Documents/詳細設計書/画面詳細仕様書.md`

---

## 10. 連絡事項

- 不明点は随時Slackで確認
- 日次で進捗報告
- ブロッカーは即座にエスカレーション
- コードレビューは機能単位で実施