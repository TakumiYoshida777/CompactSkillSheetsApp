# エンジニア1 - バックエンドAPI基盤実装指示書

## 担当者: エンジニア1
## 優先度: 最高（他のエンジニアの作業の前提となるため）
## 実装期限: 2営業日以内

---

## 1. 担当範囲

### 1.1 API基盤整備
- APIルーティング基盤の構築
- 共通ミドルウェアの実装
- エラーハンドリング統一
- レスポンスフォーマット標準化
- 環境変数設定の修正

### 1.2 データベース基盤
- 必要なテーブルの作成
- リポジトリパターンの実装
- トランザクション管理
- マイグレーション作成

---

## 2. 実装タスク詳細

### 2.1 環境変数設定の修正

#### 現在の問題
```typescript
// frontend/src/App.tsx:4行目
axios.defaults.baseURL = 'http://localhost:8000';  // ハードコーディング
```

#### 実装内容
```typescript
// backend/.env.development
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/skillsheet_dev

// backend/src/config/environment.ts
export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    version: 'v1',
    prefix: '/api/v1'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  database: {
    url: process.env.DATABASE_URL
  }
};
```

### 2.2 API基盤の実装

#### 2.2.1 ルーティング構造
```typescript
// backend/src/routes/v1/index.ts
import { Router } from 'express';
import engineerRoutes from './engineer.routes';
import projectRoutes from './project.routes';
import approachRoutes from './approach.routes';
import partnerRoutes from './partner.routes';

const router = Router();

// SES企業向けAPI
router.use('/engineers', engineerRoutes);
router.use('/projects', projectRoutes);
router.use('/approaches', approachRoutes);
router.use('/business-partners', partnerRoutes);

// 共通API
router.use('/skills', skillRoutes);
router.use('/search', searchRoutes);
router.use('/export', exportRoutes);
router.use('/files', fileRoutes);

export default router;
```

#### 2.2.2 共通ミドルウェア実装
```typescript
// backend/src/middleware/company.middleware.ts
export const companyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // X-Company-IDヘッダーから企業IDを取得
  const companyId = req.headers['x-company-id'];
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'COMPANY_ID_REQUIRED',
        message: '企業IDが指定されていません'
      }
    });
  }
  
  req.companyId = companyId as string;
  next();
};

// backend/src/middleware/pagination.middleware.ts
export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  req.pagination = { page, limit, offset };
  next();
};
```

#### 2.2.3 統一レスポンスフォーマット
```typescript
// backend/src/utils/response.util.ts
export class ApiResponse {
  static success<T>(data: T, meta?: any) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        version: 'v1',
        ...meta
      }
    };
  }
  
  static error(code: string, message: string, details?: any) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        documentation: `https://docs.api.example.com/errors/${code}`
      }
    };
  }
  
  static paginated<T>(data: T[], pagination: PaginationInfo) {
    return this.success(data, {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      }
    });
  }
}
```

### 2.3 データベース基盤実装

#### 2.3.1 必要なテーブル作成
```sql
-- migrations/001_create_projects_table.sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  contract_type VARCHAR(50),
  monthly_rate INTEGER,
  required_engineers INTEGER DEFAULT 1,
  description TEXT,
  required_skills JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/002_create_project_assignments.sql
CREATE TABLE project_assignments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  engineer_id INTEGER NOT NULL REFERENCES engineers(id),
  role VARCHAR(100),
  start_date DATE,
  end_date DATE,
  allocation_percentage INTEGER DEFAULT 100,
  status VARCHAR(50) DEFAULT 'assigned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/003_create_approaches.sql
CREATE TABLE approaches (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  target_type VARCHAR(50) NOT NULL, -- 'company' or 'freelance'
  target_id INTEGER,
  engineer_ids JSONB,
  template_id INTEGER,
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/004_create_business_partners.sql
CREATE TABLE business_partners (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  contract_status VARCHAR(50) DEFAULT 'active',
  contract_start_date DATE,
  contract_end_date DATE,
  max_viewable_engineers INTEGER,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/005_create_email_templates.sql
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(500),
  body TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/006_create_email_logs.sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  approach_id INTEGER REFERENCES approaches(id),
  recipient_email VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.3.2 ベースリポジトリ実装
```typescript
// backend/src/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  protected tableName: string;
  protected db: Database;
  
  constructor(tableName: string, db: Database) {
    this.tableName = tableName;
    this.db = db;
  }
  
  async findAll(companyId: number, pagination?: PaginationOptions): Promise<T[]> {
    const query = this.db(this.tableName)
      .where({ company_id: companyId })
      .orderBy('created_at', 'desc');
      
    if (pagination) {
      query.limit(pagination.limit).offset(pagination.offset);
    }
    
    return query;
  }
  
  async findById(id: number, companyId: number): Promise<T | null> {
    return this.db(this.tableName)
      .where({ id, company_id: companyId })
      .first();
  }
  
  async create(data: Partial<T>, companyId: number): Promise<T> {
    const [created] = await this.db(this.tableName)
      .insert({ ...data, company_id: companyId })
      .returning('*');
    return created;
  }
  
  async update(id: number, data: Partial<T>, companyId: number): Promise<T> {
    const [updated] = await this.db(this.tableName)
      .where({ id, company_id: companyId })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updated;
  }
  
  async delete(id: number, companyId: number): Promise<boolean> {
    const deleted = await this.db(this.tableName)
      .where({ id, company_id: companyId })
      .del();
    return deleted > 0;
  }
  
  async count(companyId: number, filters?: any): Promise<number> {
    const query = this.db(this.tableName)
      .where({ company_id: companyId })
      .count('* as count');
      
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.where(key, value);
        }
      });
    }
    
    const result = await query.first();
    return parseInt(result.count);
  }
}
```

### 2.4 エラーハンドリング統一

```typescript
// backend/src/middleware/error.middleware.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // バリデーションエラー
  if (err.name === 'ValidationError') {
    return res.status(422).json(
      ApiResponse.error('VALIDATION_ERROR', 'バリデーションエラー', err.errors)
    );
  }
  
  // 認証エラー
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(
      ApiResponse.error('UNAUTHORIZED', '認証が必要です')
    );
  }
  
  // 権限エラー
  if (err.name === 'ForbiddenError') {
    return res.status(403).json(
      ApiResponse.error('FORBIDDEN', 'アクセス権限がありません')
    );
  }
  
  // データベースエラー
  if (err.code === '23505') {  // PostgreSQL unique violation
    return res.status(409).json(
      ApiResponse.error('DUPLICATE_ENTRY', 'データが既に存在します')
    );
  }
  
  // デフォルトエラー
  res.status(500).json(
    ApiResponse.error('INTERNAL_ERROR', 'サーバーエラーが発生しました')
  );
};
```

### 2.5 テスト環境の準備

```typescript
// backend/src/test/helpers/database.helper.ts
export class TestDatabase {
  private static instance: TestDatabase;
  private db: Database;
  
  static getInstance(): TestDatabase {
    if (!this.instance) {
      this.instance = new TestDatabase();
    }
    return this.instance;
  }
  
  async setup() {
    // テスト用データベース接続
    this.db = knex({
      client: 'postgresql',
      connection: process.env.TEST_DATABASE_URL
    });
    
    // マイグレーション実行
    await this.db.migrate.latest();
  }
  
  async seed(companyId: number) {
    // テストデータ投入
    await this.db('companies').insert({
      id: companyId,
      name: 'テスト企業',
      email: 'test@example.com'
    });
  }
  
  async cleanup() {
    // データクリーンアップ
    await this.db.raw('TRUNCATE TABLE projects, approaches, business_partners CASCADE');
  }
  
  async teardown() {
    await this.db.destroy();
  }
}
```

---

## 3. 実装優先順位

### Day 1（1日目）
1. 環境変数設定の統一
2. API基盤構造の実装
3. 共通ミドルウェアの実装
4. レスポンスフォーマット統一

### Day 2（2日目）
1. データベーステーブル作成（マイグレーション）
2. ベースリポジトリ実装
3. エラーハンドリング実装
4. テスト環境準備

---

## 4. 完了条件

### 必須要件
- [ ] 環境変数が統一され、ハードコーディングが除去されている
- [ ] `/api/v1`プレフィックスでAPIがアクセス可能
- [ ] 統一されたレスポンスフォーマットが実装されている
- [ ] 必要なデータベーステーブルが作成されている
- [ ] ベースリポジトリが動作している
- [ ] エラーハンドリングが統一されている
- [ ] companyIdによるマルチテナント分離が機能している

### テスト要件
- [ ] 各ミドルウェアの単体テスト作成
- [ ] リポジトリの単体テスト作成
- [ ] エラーハンドリングのテスト作成

---

## 5. 成果物

### 作成するファイル
```
backend/
├── src/
│   ├── config/
│   │   └── environment.ts
│   ├── middleware/
│   │   ├── company.middleware.ts
│   │   ├── pagination.middleware.ts
│   │   └── error.middleware.ts
│   ├── repositories/
│   │   └── base.repository.ts
│   ├── routes/
│   │   └── v1/
│   │       └── index.ts
│   ├── utils/
│   │   └── response.util.ts
│   └── test/
│       └── helpers/
│           └── database.helper.ts
├── migrations/
│   ├── 001_create_projects_table.sql
│   ├── 002_create_project_assignments.sql
│   ├── 003_create_approaches.sql
│   ├── 004_create_business_partners.sql
│   ├── 005_create_email_templates.sql
│   └── 006_create_email_logs.sql
└── .env.development
```

---

## 6. 他エンジニアとの連携

### エンジニア2・3への提供
- API基盤構造（ルーティング、ミドルウェア）
- ベースリポジトリクラス
- レスポンスユーティリティ
- エラーハンドリング

### 連携タイミング
- Day 1完了後: エンジニア2・3がAPI実装開始可能
- Day 2完了後: 完全な実装環境提供

---

## 7. 注意事項

- **重要**: マルチテナント対応を全ての実装で考慮すること
- データベース操作は必ずcompanyIdでフィルタリング
- エラーメッセージは日本語で分かりやすく
- 環境変数は`.env.example`にも記載すること
- TypeScriptの型定義を必ず作成すること

---

## 8. 質問・相談先

- 技術的な相談: Slackの#backend-apiチャンネル
- 仕様確認: プロダクトオーナー
- 緊急時: テックリード直接連絡