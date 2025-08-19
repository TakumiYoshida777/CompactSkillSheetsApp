# エンジニアD - プロジェクト・アプローチ管理機能 API連携実装指示書

## 担当者: エンジニアD
## 優先度: 中～高（営業活動の効率化に重要）

---

## 1. 担当範囲

### 1.1 プロジェクト管理機能
- プロジェクト一覧画面（PRJ001）
- プロジェクト詳細画面（PRJ002）
- プロジェクト登録・編集
- アサイン管理
- 稼働状況管理

### 1.2 アプローチ・営業管理機能
- アプローチ履歴画面（APP001）
- アプローチ作成画面（APP002）
- 定期アプローチ設定
- メールテンプレート管理
- フリーランスアプローチ

---

## 2. 実装タスク詳細

### 2.1 プロジェクト管理機能

#### 2.1.1 プロジェクト一覧・検索
```typescript
// 実装するAPI接続
GET /api/v1/projects
GET /api/v1/projects?status={status}&dateFrom={date}&dateTo={date}
POST /api/v1/projects/search
GET /api/v1/projects/calendar
```

**実装要件:**
- カンバンボード表示（進行中/待機予定/完了）
- リスト表示切替
- カレンダー表示機能
- プロジェクトフィルタリング
- ドラッグ&ドロップによるステータス変更

#### 2.1.2 プロジェクト詳細管理
```typescript
// 実装するAPI接続
GET /api/v1/projects/{projectId}
POST /api/v1/projects
PUT /api/v1/projects/{projectId}
DELETE /api/v1/projects/{projectId}
PATCH /api/v1/projects/{projectId}/status
```

**実装要件:**
- プロジェクト基本情報管理
- 契約情報（期間、単価、人数）
- 必要スキル管理
- クライアント情報
- プロジェクト進捗管理

#### 2.1.3 アサイン管理
```typescript
// 実装するAPI接続
GET /api/v1/projects/{projectId}/assignments
POST /api/v1/projects/{projectId}/assignments
PUT /api/v1/projects/{projectId}/assignments/{assignmentId}
DELETE /api/v1/projects/{projectId}/assignments/{assignmentId}
GET /api/v1/engineers/available
```

**実装要件:**
- エンジニアアサイン機能
- スキルマッチング表示
- 稼働率管理
- アサイン履歴
- 候補エンジニア提案

#### 2.1.4 稼働状況管理
```typescript
// 実装するAPI接続
GET /api/v1/projects/timeline
GET /api/v1/projects/utilization
GET /api/v1/projects/{projectId}/timeline
POST /api/v1/projects/{projectId}/extend
```

**実装要件:**
- ガントチャート表示
- リソース使用率分析
- 契約延長管理
- 終了予定アラート
- 稼働予測機能

### 2.2 アプローチ管理機能

#### 2.2.1 アプローチ履歴管理
```typescript
// 実装するAPI接続
GET /api/v1/approaches
GET /api/v1/approaches/{approachId}
GET /api/v1/approaches/statistics
DELETE /api/v1/approaches/{approachId}
```

**実装要件:**
- タイムライン形式の履歴表示
- ステータス管理（送信/開封/返信/成約）
- フィルタリング（期間、企業、種別）
- 効果測定（開封率、返信率）
- アプローチ統計ダッシュボード

#### 2.2.2 アプローチ作成
```typescript
// 実装するAPI接続
POST /api/v1/approaches
POST /api/v1/approaches/bulk
GET /api/v1/approaches/templates
POST /api/v1/approaches/templates
PUT /api/v1/approaches/templates/{templateId}
```

**実装要件:**
- ウィザード形式の作成フロー
- 対象選択（企業/フリーランス）
- エンジニア複数選択
- メールテンプレート選択・編集
- プレビュー機能
- 送信スケジューリング

#### 2.2.3 定期アプローチ設定
```typescript
// 実装するAPI接続
GET /api/v1/approaches/periodic
POST /api/v1/approaches/periodic
PUT /api/v1/approaches/periodic/{periodicId}
DELETE /api/v1/approaches/periodic/{periodicId}
POST /api/v1/approaches/periodic/{periodicId}/pause
```

**実装要件:**
- 定期送信スケジュール設定
- 対象企業の選択
- エンジニア自動選択条件
- 除外設定（NG管理）
- 一時停止/再開機能

#### 2.2.4 フリーランスアプローチ
```typescript
// 実装するAPI接続
GET /api/v1/freelancers
POST /api/v1/approaches/freelance
GET /api/v1/approaches/freelance/history
POST /api/v1/approaches/freelance/bulk
```

**実装要件:**
- フリーランス検索機能
- GitHubプロフィール確認
- アプローチ制限管理（3ヶ月間隔）
- プロジェクト詳細入力
- 履歴管理・追跡

### 2.3 メール配信管理

#### 2.3.1 メールテンプレート管理
```typescript
// 実装するAPI接続
GET /api/v1/email/templates
POST /api/v1/email/templates
PUT /api/v1/email/templates/{templateId}
DELETE /api/v1/email/templates/{templateId}
POST /api/v1/email/preview
```

**実装要件:**
- テンプレート作成・編集（リッチテキストエディタ）
- 変数埋め込み機能
- カテゴリ管理
- プレビュー機能
- バージョン管理

#### 2.3.2 メール送信管理
```typescript
// 実装するAPI接続
POST /api/v1/email/send
GET /api/v1/email/queue
GET /api/v1/email/sent
POST /api/v1/email/resend
GET /api/v1/email/bounces
```

**実装要件:**
- 送信キュー管理
- 送信ステータス追跡
- バウンス処理
- 配信停止管理
- 送信ログ表示

---

## 3. 状態管理設計

### 3.1 Zustand Store構成
```typescript
// stores/projectStore.ts
interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  assignments: Assignment[]
  timeline: TimelineData | null
  viewMode: 'kanban' | 'list' | 'calendar'
  
  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>
  createProject: (data: ProjectData) => Promise<void>
  updateProjectStatus: (id: string, status: string) => Promise<void>
  assignEngineer: (projectId: string, engineerId: string) => Promise<void>
  fetchTimeline: () => Promise<void>
}

// stores/approachStore.ts
interface ApproachState {
  approaches: Approach[]
  templates: EmailTemplate[]
  periodicSettings: PeriodicApproach[]
  statistics: ApproachStatistics | null
  
  // Actions
  fetchApproaches: (filters?: ApproachFilters) => Promise<void>
  createApproach: (data: ApproachData) => Promise<void>
  sendBulkApproach: (data: BulkApproachData) => Promise<void>
  updateTemplate: (id: string, template: EmailTemplate) => Promise<void>
  fetchStatistics: (period: DateRange) => Promise<void>
}
```

### 3.2 TanStack Query設定
```typescript
// queries/projectQueries.ts
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectAPI.fetchProjects(filters),
    staleTime: 2 * 60 * 1000
  })
}

export const useProjectTimeline = (projectId: string) => {
  return useQuery({
    queryKey: ['project-timeline', projectId],
    queryFn: () => projectAPI.fetchTimeline(projectId),
    enabled: !!projectId
  })
}

// queries/approachQueries.ts
export const useApproachStatistics = (period: DateRange) => {
  return useQuery({
    queryKey: ['approach-statistics', period],
    queryFn: () => approachAPI.fetchStatistics(period),
    refetchInterval: 5 * 60 * 1000
  })
}
```

---

## 4. UI/UXコンポーネント

### 4.1 プロジェクト管理コンポーネント
```typescript
// components/projects/ProjectManagement.tsx
- KanbanBoard（カンバンボード）
- ProjectList（リスト表示）
- ProjectCalendar（カレンダー）
- ProjectDetail（詳細表示）
- AssignmentManager（アサイン管理）
- GanttChart（ガントチャート）
```

### 4.2 アプローチ管理コンポーネント
```typescript
// components/approaches/ApproachManagement.tsx
- ApproachTimeline（タイムライン）
- ApproachWizard（作成ウィザード）
- TemplateEditor（テンプレート編集）
- StatisticsDashboard（統計ダッシュボード）
- PeriodicSettings（定期設定）
```

### 4.3 共通UIコンポーネント
```typescript
// components/common/ProjectComponents.tsx
- StatusBadge（ステータスバッジ）
- SkillTags（スキルタグ）
- DateRangePicker（期間選択）
- ProgressBar（進捗バー）
- EmailPreview（メールプレビュー）
```

---

## 5. ビジネスロジック実装

### 5.1 プロジェクト管理ロジック
```typescript
// utils/projectLogic.ts
- 稼働率計算
- スキルマッチング率算出
- 終了予定日からの待機判定
- リソース最適化提案
- 契約延長判定
```

### 5.2 アプローチ最適化
```typescript
// utils/approachOptimization.ts
- 最適送信時間の判定
- 対象エンジニアの自動選択
- 重複送信の防止
- 成約率向上のための分析
```

---

## 6. テスト要件

### 6.1 単体テスト
```typescript
// __tests__/projects/kanban.test.ts
- ドラッグ&ドロップ機能
- ステータス更新
- フィルタリング
```

### 6.2 統合テスト
```typescript
// __tests__/integration/project-flow.test.ts
- プロジェクト作成→アサイン→進捗管理
- アプローチ作成→送信→効果測定
- 定期アプローチ設定→自動送信
```

### 6.3 E2Eテスト
```typescript
// cypress/e2e/project-management.cy.ts
- 完全なプロジェクトライフサイクル
- アプローチから成約までのフロー
```

---

## 7. パフォーマンス最適化

### 7.1 データ最適化
- ガントチャートの仮想化
- タイムラインの無限スクロール
- 大量メール送信のキューイング
- 統計データのキャッシング

### 7.2 UI最適化
- カンバンボードの最適化レンダリング
- ドラッグ&ドロップのスムーズ化
- リアルタイム更新の効率化

---

## 8. 完了条件

### 8.1 機能要件
- [ ] プロジェクト管理（CRUD、カンバン）
- [ ] アサイン管理機能
- [ ] アプローチ作成・送信
- [ ] 定期アプローチ設定
- [ ] 統計・効果測定

### 8.2 非機能要件
- [ ] カンバンボード 100プロジェクトで快適動作
- [ ] メール送信成功率 99%以上
- [ ] テストカバレッジ 80%以上

### 8.3 ドキュメント
- [ ] プロジェクト管理フロー図
- [ ] アプローチ最適化ガイド
- [ ] メールテンプレート作成ガイド

---

## 9. 依存関係

### 9.1 必要なパッケージ
```json
{
  "dependencies": {
    "@dnd-kit/sortable": "^7.0.2",
    "react-big-calendar": "^1.8.5",
    "gantt-task-react": "^0.3.9",
    "react-quill": "^2.0.0",
    "react-timeline": "^1.0.0",
    "email-validator": "^2.0.4"
  }
}
```

### 9.2 他チームとの連携
- エンジニアB: エンジニア情報の参照
- エンジニアC: 取引先情報の参照
- エンジニアE: メール送信基盤の利用

---

## 10. 注意事項

- プロジェクトの期間管理は営業日ベースで計算
- アプローチの送信は法規制遵守（特電法等）
- フリーランスへの過度なアプローチを防止
- メール送信のレート制限に注意
- 個人情報の取り扱いに十分注意

---

## 11. 参考資料

- `/Documents/画面設計書/画面設計書.md` (PRJ001-002, APP001-002)
- `/Documents/API設計書/エンドポイント定義書.md`
- `/Documents/詳細設計書/バッチ処理設計書.md`
- `/Documents/要件定義書/要件定義書.md` (プロジェクト管理、アプローチ機能)