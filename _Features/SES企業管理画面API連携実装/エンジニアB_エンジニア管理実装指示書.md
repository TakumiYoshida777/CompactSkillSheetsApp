# エンジニアB - エンジニア管理機能 API連携実装指示書

## 担当者: エンジニアB
## 優先度: 高（コア機能のため）

---

## 1. 担当範囲

### 1.1 エンジニア管理機能
- エンジニア一覧画面（ENG001）
- エンジニア詳細画面（ENG002）
- スキルシート編集画面（SKL002）
- エンジニア登録・更新機能
- スキルシート管理機能

### 1.2 検索・フィルタリング機能
- 高度な検索機能
- フィルター機能
- ソート機能
- 一括操作機能

---

## 2. 実装タスク詳細

### 2.1 エンジニア一覧機能

#### 2.1.1 データ取得・表示
```typescript
// 実装するAPI接続
GET /api/v1/engineers
GET /api/v1/engineers?status={status}&skills={skills}&page={page}&limit={limit}
GET /api/v1/engineers/export/csv
GET /api/v1/engineers/export/excel
```

**実装要件:**
- ページネーション（無限スクロール対応）
- リアルタイム検索（デバウンス処理）
- 複数条件フィルタリング
- 表示形式切替（リスト/カード）
- CSV/Excel エクスポート機能

#### 2.1.2 検索・フィルター機能
```typescript
// 実装するAPI接続
GET /api/v1/search/engineers
POST /api/v1/search/saved
GET /api/v1/search/suggestions
```

**実装要件:**
- 全文検索機能
- スキルタグによる絞り込み
- 稼働状況フィルター
- 経験年数範囲指定
- 検索条件の保存・呼び出し

#### 2.1.3 一括操作機能
```typescript
// 実装するAPI接続
PATCH /api/v1/engineers/bulk/status
POST /api/v1/engineers/bulk/email
DELETE /api/v1/engineers/bulk
```

**実装要件:**
- 複数選択UI
- 一括ステータス変更
- 一括メール送信
- 一括削除（確認ダイアログ）

### 2.2 エンジニア詳細機能

#### 2.2.1 詳細情報表示
```typescript
// 実装するAPI接続
GET /api/v1/engineers/{engineerId}
GET /api/v1/engineers/{engineerId}/skill-sheets
GET /api/v1/engineers/{engineerId}/projects
GET /api/v1/engineers/{engineerId}/approaches
```

**実装要件:**
- タブ構成での情報表示
- 基本情報の表示・編集
- スキルシート表示
- プロジェクト履歴表示
- アプローチ履歴表示

#### 2.2.2 エンジニア登録・更新
```typescript
// 実装するAPI接続
POST /api/v1/engineers
PUT /api/v1/engineers/{engineerId}
PATCH /api/v1/engineers/{engineerId}
DELETE /api/v1/engineers/{engineerId}
```

**実装要件:**
- フォームバリデーション
- 画像アップロード機能
- 下書き保存機能
- 変更履歴管理

### 2.3 スキルシート管理機能

#### 2.3.1 スキルシート編集
```typescript
// 実装するAPI接続
GET /api/v1/skill-sheets/{sheetId}
PUT /api/v1/skill-sheets/{sheetId}
PATCH /api/v1/skill-sheets/{sheetId}/skills
POST /api/v1/skill-sheets/{sheetId}/publish
```

**実装要件:**
- アコーディオン形式のUI
- 自動保存機能（5秒間隔）
- 入力進捗表示（パーセンテージ）
- スキルレベル評価（5段階）
- プレビュー機能

#### 2.3.2 スキル管理
```typescript
// 実装するAPI接続
GET /api/v1/skills/master
POST /api/v1/skills
DELETE /api/v1/skills/{skillId}
GET /api/v1/skills/suggestions
```

**実装要件:**
- スキルマスタからの選択
- カスタムスキル追加
- スキルのカテゴリ分類
- オートコンプリート機能

---

## 3. 状態管理設計

### 3.1 Zustand Store構成
```typescript
// stores/engineerStore.ts
interface EngineerState {
  engineers: Engineer[]
  selectedEngineer: Engineer | null
  filters: FilterOptions
  pagination: PaginationState
  viewMode: 'list' | 'card'
  isLoading: boolean
  
  // Actions
  fetchEngineers: (params?: FilterParams) => Promise<void>
  selectEngineer: (id: string) => Promise<void>
  updateEngineer: (id: string, data: Partial<Engineer>) => Promise<void>
  deleteEngineer: (id: string) => Promise<void>
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>
}

// stores/skillSheetStore.ts
interface SkillSheetState {
  skillSheet: SkillSheet | null
  isDirty: boolean
  autoSaveEnabled: boolean
  progress: number
  
  // Actions
  loadSkillSheet: (id: string) => Promise<void>
  updateSkillSheet: (data: Partial<SkillSheet>) => Promise<void>
  autoSave: () => Promise<void>
  publishSkillSheet: () => Promise<void>
}
```

### 3.2 TanStack Query設定
```typescript
// queries/engineerQueries.ts
export const useEngineers = (params: FilterParams) => {
  return useQuery({
    queryKey: ['engineers', params],
    queryFn: () => engineerAPI.fetchList(params),
    staleTime: 30 * 1000,
    keepPreviousData: true
  })
}

export const useEngineerDetail = (id: string) => {
  return useQuery({
    queryKey: ['engineer', id],
    queryFn: () => engineerAPI.fetchDetail(id),
    enabled: !!id
  })
}

// mutations/engineerMutations.ts
export const useUpdateEngineer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: engineerAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries(['engineers'])
    }
  })
}
```

---

## 4. UI/UXコンポーネント

### 4.1 一覧画面コンポーネント
```typescript
// components/engineers/EngineerList.tsx
- EngineerListHeader（検索・フィルター）
- EngineerListTable（テーブル表示）
- EngineerCard（カード表示）
- BulkActionBar（一括操作）
- Pagination（ページネーション）
```

### 4.2 詳細画面コンポーネント
```typescript
// components/engineers/EngineerDetail.tsx
- EngineerProfileCard（基本情報）
- TabNavigation（タブナビ）
- SkillSheetView（スキルシート表示）
- ProjectHistory（プロジェクト履歴）
- ApproachHistory（アプローチ履歴）
```

### 4.3 編集画面コンポーネント
```typescript
// components/skillsheet/SkillSheetEdit.tsx
- ProgressIndicator（進捗表示）
- BasicInfoSection（基本情報）
- SkillSection（スキル管理）
- ProjectSection（プロジェクト）
- AutoSaveIndicator（自動保存表示）
```

---

## 5. パフォーマンス最適化

### 5.1 データ取得最適化
- 仮想スクロール実装（大量データ対応）
- 遅延ローディング
- データプリフェッチ
- キャッシュ戦略

### 5.2 レンダリング最適化
```typescript
// 最適化技術
- React.memo使用
- useMemo/useCallback活用
- 仮想化リスト（react-window）
- 画像の遅延読み込み
```

---

## 6. テスト要件

### 6.1 単体テスト
```typescript
// __tests__/engineers/list.test.ts
- フィルタリング機能
- ソート機能
- ページネーション
- 一括操作
```

### 6.2 統合テスト
```typescript
// __tests__/integration/engineer-management.test.ts
- エンジニア登録→一覧表示→詳細確認
- スキルシート編集→自動保存→公開
- 検索→フィルター→エクスポート
```

---

## 7. エラーハンドリング

### 7.1 エラー処理パターン
```typescript
// utils/engineerErrorHandler.ts
- 404: エンジニアが見つかりません
- 409: データの競合が発生しました
- 422: 入力値にエラーがあります
- 500: サーバーエラーが発生しました
```

### 7.2 ユーザーフィードバック
- トースト通知
- インラインエラー表示
- エラー境界の実装
- リトライ機能

---

## 8. 完了条件

### 8.1 機能要件
- [ ] エンジニア一覧の表示・検索
- [ ] エンジニア詳細情報の表示
- [ ] スキルシート編集・保存
- [ ] 一括操作機能
- [ ] エクスポート機能

### 8.2 非機能要件
- [ ] 1000件のデータで1秒以内表示
- [ ] 自動保存の信頼性99.9%
- [ ] テストカバレッジ 80%以上

### 8.3 ドキュメント
- [ ] コンポーネント設計書
- [ ] API連携仕様書
- [ ] テスト仕様書

---

## 9. 依存関係

### 9.1 必要なパッケージ
```json
{
  "dependencies": {
    "react-window": "^1.8.10",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "react-select": "^5.8.0",
    "react-dropzone": "^14.2.3",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21"
  }
}
```

### 9.2 他チームとの連携
- エンジニアC: 取引先への公開設定
- エンジニアE: 共通コンポーネント利用

---

## 10. 参考資料

- `/Documents/画面設計書/画面設計書.md`
- `/Documents/API設計書/エンドポイント定義書.md`
- `/Documents/データベース設計/テーブル定義書.md`

---

## 11. 注意事項

- マルチテナント対応を考慮（企業IDでの分離）
- 個人情報保護を厳守
- パフォーマンスを常に意識
- アクセシビリティ対応を忘れずに