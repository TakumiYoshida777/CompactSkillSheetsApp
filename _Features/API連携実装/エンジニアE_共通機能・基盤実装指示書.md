# エンジニアE - 共通機能・基盤 API連携実装指示書

## 担当者: エンジニアE
## 優先度: 最高（全機能の基盤となるため、最初に着手）

---

## 1. 担当範囲

### 1.1 API基盤構築
- Axios設定・インターセプター
- エラーハンドリング基盤
- API クライアント実装
- レスポンス型定義

### 1.2 共通機能・ユーティリティ
- 通知システム
- ファイルアップロード
- データエクスポート
- 検索・フィルター基盤
- ページネーション

### 1.3 UI共通コンポーネント
- レイアウトコンポーネント
- フォームコンポーネント
- テーブルコンポーネント
- モーダル・ダイアログ
- 通知・アラート

### 1.4 システム管理機能
- ログ管理
- エラー監視
- パフォーマンス監視
- ヘルスチェック

---

## 2. 実装タスク詳細

### 2.1 API基盤構築

#### 2.1.1 Axios設定
```typescript
// api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Company-ID': getCompanyId()
  }
})

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // 認証トークンは認証担当が実装
    // ここでは共通ヘッダーのみ設定
    return config
  },
  (error) => Promise.reject(error)
)

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // エラーハンドリング
    return Promise.reject(error)
  }
)
```

#### 2.1.2 API レスポンス型定義
```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: {
    timestamp: string
    requestId: string
    version: string
    pagination?: PaginationMeta
  }
}

export interface ApiError {
  code: string
  message: string
  details?: ErrorDetail[]
  documentation?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

#### 2.1.3 エラーハンドリング基盤
```typescript
// utils/errorHandler.ts
export class ApiErrorHandler {
  static handle(error: AxiosError<ApiError>): void {
    const errorCode = error.response?.data?.code
    
    switch (errorCode) {
      case 'AUTH_001':
        this.handleAuthError(error)
        break
      case 'VAL_001':
        this.handleValidationError(error)
        break
      case 'BIZ_001':
        this.handleBusinessError(error)
        break
      default:
        this.handleGenericError(error)
    }
  }
  
  private static handleAuthError(error: AxiosError): void {
    // 認証エラー処理は認証担当が実装
    toast.error('認証エラーが発生しました。')
  }
  
  private static handleValidationError(error: AxiosError<ApiError>): void {
    // バリデーションエラー処理
    const details = error.response?.data?.details || []
    details.forEach(detail => {
      formStore.setFieldError(detail.field, detail.message)
    })
  }
}
```

### 2.2 共通機能実装

#### 2.2.1 通知システム
```typescript
// 実装するAPI接続
GET /api/v1/notifications
POST /api/v1/notifications/mark-read
POST /api/v1/notifications/mark-all-read
DELETE /api/v1/notifications/{notificationId}
WS /api/v1/notifications/subscribe
```

**実装要件:**
- リアルタイム通知（WebSocket/SSE）
- 通知の種類別表示
- 未読数管理
- 通知設定管理
- デスクトップ通知連携

#### 2.2.2 ファイルアップロード
```typescript
// 実装するAPI接続
POST /api/v1/files/upload
GET /api/v1/files/{fileId}
DELETE /api/v1/files/{fileId}
POST /api/v1/files/validate
```

**実装要件:**
- ドラッグ&ドロップ対応
- 複数ファイル同時アップロード
- プログレス表示
- ファイルサイズ・形式検証
- 画像プレビュー機能

#### 2.2.3 データエクスポート
```typescript
// 実装するAPI接続
POST /api/v1/export/csv
POST /api/v1/export/excel
POST /api/v1/export/pdf
GET /api/v1/export/status/{jobId}
GET /api/v1/export/download/{jobId}
```

**実装要件:**
- 非同期エクスポート処理
- ジョブステータス管理
- ダウンロード管理
- エクスポート履歴

### 2.3 共通UIコンポーネント

#### 2.3.1 レイアウトコンポーネント
```typescript
// components/layout/MainLayout.tsx
export const MainLayout: React.FC = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <main className="content">
        <Breadcrumb />
        {children}
      </main>
      <NotificationContainer />
    </div>
  )
}

// components/layout/Header.tsx
- ユーザーメニュー
- 通知アイコン
- 検索バー
- テナント切替（管理者用）
```

#### 2.3.2 フォームコンポーネント
```typescript
// components/form/FormField.tsx
interface FormFieldProps {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'date'
  validation?: ValidationRule
  placeholder?: string
  required?: boolean
}

// components/form/AutoComplete.tsx
- 非同期データ取得
- デバウンス処理
- カスタムレンダリング
- マルチセレクト対応
```

#### 2.3.3 テーブルコンポーネント
```typescript
// components/table/DataTable.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: PaginationOptions
  sorting?: SortingOptions
  filtering?: FilteringOptions
  selection?: SelectionOptions
  onRowClick?: (row: T) => void
}

// 機能
- ソート可能なカラム
- フィルタリング
- ページネーション
- 行選択
- カスタムセル レンダリング
- 仮想スクロール対応
```

#### 2.3.4 モーダル・ダイアログ
```typescript
// components/modal/Modal.tsx
- 確認ダイアログ
- フォームモーダル
- 情報表示モーダル
- フルスクリーンモーダル
- ドロワー

// components/modal/ConfirmDialog.tsx
interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => Promise<void>
  onCancel?: () => void
}
```

### 2.4 ユーティリティ関数

#### 2.4.1 日付処理
```typescript
// utils/dateUtils.ts
export const dateUtils = {
  format: (date: Date, format: string) => {},
  parse: (dateString: string) => {},
  addDays: (date: Date, days: number) => {},
  diffInDays: (date1: Date, date2: Date) => {},
  isBusinessDay: (date: Date) => {},
  getBusinessDays: (start: Date, end: Date) => {}
}
```

#### 2.4.2 バリデーション
```typescript
// utils/validation.ts
export const validators = {
  email: (value: string) => {},
  phone: (value: string) => {},
  password: (value: string) => {},
  url: (value: string) => {},
  japanese: (value: string) => {},
  businessCode: (value: string) => {}
}
```

#### 2.4.3 フォーマッター
```typescript
// utils/formatters.ts
export const formatters = {
  currency: (value: number) => {},
  percentage: (value: number) => {},
  fileSize: (bytes: number) => {},
  phoneNumber: (value: string) => {},
  postalCode: (value: string) => {}
}
```

---

## 3. 状態管理設計

### 3.1 共通Store設計
```typescript
// stores/commonStore.ts
interface CommonState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  loadingTasks: Map<string, boolean>
  errors: Map<string, Error>
  
  // Actions
  setLoading: (key: string, loading: boolean) => void
  setError: (key: string, error: Error) => void
  clearError: (key: string) => void
}

// stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  locale: 'ja' | 'en'
  modals: Map<string, boolean>
  
  // Actions
  toggleSidebar: () => void
  openModal: (key: string) => void
  closeModal: (key: string) => void
}
```

---

## 4. パフォーマンス最適化

### 4.1 コンポーネント最適化
```typescript
// 最適化技術
- React.memo の適切な使用
- useMemo/useCallback の活用
- Code Splitting
- Lazy Loading
- Virtual Scrolling
```

### 4.2 API最適化
```typescript
// api/cache.ts
- Request Deduplication
- Response Caching
- Optimistic Updates
- Batch Requests
- Prefetching
```

---

## 5. テスト要件

### 5.1 単体テスト
```typescript
// __tests__/utils/validation.test.ts
- バリデーション関数のテスト
- フォーマッター関数のテスト
- 日付処理関数のテスト
```

### 5.2 コンポーネントテスト
```typescript
// __tests__/components/DataTable.test.tsx
- ソート機能
- フィルタリング機能
- ページネーション
- 行選択
```

---

## 6. セキュリティ実装

### 6.1 XSS対策
```typescript
// utils/sanitizer.ts
export const sanitizer = {
  html: (input: string) => DOMPurify.sanitize(input),
  url: (input: string) => {},
  sql: (input: string) => {}
}
```

### 6.2 CSRF対策
```typescript
// api/csrf.ts
- CSRFトークン管理
- ヘッダー自動付与
```

---

## 7. 完了条件

### 7.1 機能要件
- [ ] API基盤の完成
- [ ] 全共通コンポーネントの実装
- [ ] エラーハンドリング実装
- [ ] 通知システム実装
- [ ] ファイルアップロード実装

### 7.2 非機能要件
- [ ] コンポーネントのStorybook作成
- [ ] ユニットテスト 90%以上
- [ ] パフォーマンス基準達成
- [ ] セキュリティチェック完了

### 7.3 ドキュメント
- [ ] API クライアント使用ガイド
- [ ] コンポーネントカタログ
- [ ] ユーティリティ関数リファレンス

---

## 8. 依存関係

### 8.1 必要なパッケージ
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "socket.io-client": "^4.5.4",
    "dompurify": "^3.0.6",
    "@tanstack/react-table": "^8.10.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "yup": "^1.3.0"
  },
  "devDependencies": {
    "@storybook/react": "^7.5.0",
    "@testing-library/react": "^14.0.0",
    "msw": "^2.0.0"
  }
}
```

### 8.2 他チームへの提供
- 全チーム: API クライアント、共通コンポーネント
- エンジニアA-D: 業務コンポーネント基盤

---

## 9. 実装優先順位

1. **第1週前半（最優先）**
   - API基盤構築
   - エラーハンドリング
   - 基本的な共通コンポーネント

2. **第1週後半**
   - レイアウトコンポーネント
   - フォームコンポーネント
   - バリデーション

3. **第2週前半**
   - テーブルコンポーネント
   - 通知システム
   - ファイルアップロード

4. **第2週後半**
   - パフォーマンス最適化
   - テスト作成
   - ドキュメント整備

---

## 10. 注意事項

- **重要**: 他チームが依存するため、API基盤を最優先で実装
- マルチテナント対応を全機能で考慮
- 日本語環境での動作を前提に実装
- アクセシビリティ（WCAG 2.1 AA）準拠
- エラーメッセージは日本語で分かりやすく

---

## 11. コミュニケーション

- 日次で実装状況を共有
- API仕様変更は即座に全チームに連絡
- ブロッカーは即エスカレーション
- 共通コンポーネントの使用方法はStorybookで共有

---

## 12. 参考資料

- `/Documents/API設計書/RESTfulAPI設計書.md`
- `/Documents/デザイン定義書.md`
- `/Documents/開発者ガイド/開発設計方針.md`
- `/Documents/詳細設計書/セキュリティ詳細設計書.md`