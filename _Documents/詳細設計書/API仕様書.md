# 詳細設計書 - API仕様書（OpenAPI/Swagger）

## 1. API概要

### 1.1 基本情報
| 項目 | 内容 |
|------|------|
| API名 | エンジニアスキルシート管理システム API |
| バージョン | v1.0.0 |
| ベースURL | https://api.engineer-skillsheet.com/v1 |
| 認証方式 | JWT Bearer Token |
| データ形式 | JSON |
| 文字エンコーディング | UTF-8 |

### 1.2 API分類
```
/api/v1/
├── auth/                # 認証・認可
├── users/               # ユーザー管理
├── engineers/           # エンジニア管理
├── skill-sheets/        # スキルシート管理
├── projects/            # プロジェクト管理
├── approaches/          # アプローチ管理
├── business-partners/   # 取引先管理
├── search/              # 検索機能
├── admin/               # 管理者機能
└── system/              # システム機能
```

## 2. 認証・認可API

### 2.1 ユーザー登録
```yaml
POST /auth/register
```

#### リクエスト
```json
{
  "name": "田中太郎",
  "email": "tanaka@company.com",
  "personalEmail": "tanaka.personal@gmail.com",
  "password": "SecurePassword123!",
  "phone": "03-1234-5678",
  "companyId": "uuid-company-id"
}
```

#### レスポンス（201 Created）
```json
{
  "message": "ユーザーを作成しました",
  "data": {
    "user": {
      "id": "uuid-user-id",
      "name": "田中太郎",
      "email": "tanaka@company.com",
      "companyId": "uuid-company-id",
      "roles": ["engineer"],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-string"
  }
}
```

### 2.2 ログイン
```yaml
POST /auth/login
```

#### リクエスト
```json
{
  "email": "tanaka@company.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

#### レスポンス（200 OK）
```json
{
  "message": "ログインしました",
  "data": {
    "user": {
      "id": "uuid-user-id",
      "name": "田中太郎",
      "email": "tanaka@company.com",
      "companyId": "uuid-company-id",
      "roles": ["engineer", "sales"],
      "lastLoginAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-string",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

### 2.3 ログアウト
```yaml
POST /auth/logout
```

#### レスポンス（200 OK）
```json
{
  "message": "ログアウトしました"
}
```

### 2.4 トークン更新
```yaml
POST /auth/refresh
```

#### レスポンス（200 OK）
```json
{
  "data": {
    "token": "new-jwt-token-string",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

## 3. エンジニア管理API

### 3.1 エンジニア一覧取得
```yaml
GET /engineers
```

#### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|------|
| page | integer | No | ページ番号（デフォルト: 1） |
| limit | integer | No | 件数（デフォルト: 20, 最大: 100） |
| status | string | No | ステータス（working/waiting/waiting_soon） |
| skills | string | No | スキル（カンマ区切り） |
| search | string | No | 検索キーワード |

#### レスポンス（200 OK）
```json
{
  "data": [
    {
      "id": "uuid-engineer-id",
      "name": "田中太郎",
      "email": "tanaka@company.com",
      "currentStatus": "waiting",
      "engineerType": "employee",
      "availableDate": "2024-02-01",
      "skills": ["JavaScript", "React", "Node.js"],
      "experienceYears": 5,
      "nearestStation": "新宿駅",
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3.2 エンジニア詳細取得
```yaml
GET /engineers/{engineerId}
```

#### レスポンス（200 OK）
```json
{
  "data": {
    "id": "uuid-engineer-id",
    "name": "田中太郎",
    "nameKana": "タナカタロウ",
    "email": "tanaka@company.com",
    "phone": "03-1234-5678",
    "birthDate": "1990-01-01",
    "gender": "male",
    "nearestStation": "新宿駅",
    "githubUrl": "https://github.com/tanaka",
    "engineerType": "employee",
    "currentStatus": "waiting",
    "availableDate": "2024-02-01",
    "isPublic": true,
    "companyId": "uuid-company-id",
    "skillSheet": {
      "id": "uuid-skillsheet-id",
      "summary": "フルスタックエンジニアとして...",
      "totalExperienceYears": 5,
      "programmingLanguages": [
        {
          "name": "JavaScript",
          "level": 4,
          "experienceYears": 5
        }
      ],
      "possibleRoles": ["PG", "PL"],
      "possiblePhases": ["development", "testing"],
      "isCompleted": true
    },
    "currentProject": {
      "id": "uuid-project-id",
      "name": "ECサイト開発",
      "role": "フロントエンドエンジニア",
      "startDate": "2023-10-01",
      "plannedEndDate": "2024-01-31"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3.3 エンジニア作成
```yaml
POST /engineers
```

#### リクエスト
```json
{
  "name": "佐藤花子",
  "nameKana": "サトウハナコ",
  "email": "sato@company.com",
  "phone": "03-1234-5679",
  "birthDate": "1995-05-15",
  "gender": "female",
  "nearestStation": "渋谷駅",
  "githubUrl": "https://github.com/sato",
  "engineerType": "employee",
  "availableDate": "2024-03-01"
}
```

#### レスポンス（201 Created）
```json
{
  "message": "エンジニアを作成しました",
  "data": {
    "id": "uuid-engineer-id",
    "name": "佐藤花子",
    "email": "sato@company.com",
    "engineerType": "employee",
    "currentStatus": "working",
    "isPublic": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3.4 エンジニア更新
```yaml
PUT /engineers/{engineerId}
```

#### リクエスト
```json
{
  "name": "佐藤花子",
  "phone": "03-1234-9999",
  "nearestStation": "新橋駅",
  "availableDate": "2024-04-01"
}
```

#### レスポンス（200 OK）
```json
{
  "message": "エンジニア情報を更新しました",
  "data": {
    "id": "uuid-engineer-id",
    "name": "佐藤花子",
    "phone": "03-1234-9999",
    "nearestStation": "新橋駅",
    "availableDate": "2024-04-01",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 4. スキルシート管理API

### 4.1 スキルシート取得
```yaml
GET /skill-sheets/{engineerId}
```

#### レスポンス（200 OK）
```json
{
  "data": {
    "id": "uuid-skillsheet-id",
    "engineerId": "uuid-engineer-id",
    "summary": "5年間のWebアプリケーション開発経験...",
    "totalExperienceYears": 5,
    "programmingLanguages": [
      {
        "name": "JavaScript",
        "level": 4,
        "experienceYears": 5
      },
      {
        "name": "TypeScript",
        "level": 3,
        "experienceYears": 2
      }
    ],
    "frameworks": [
      {
        "name": "React",
        "level": 4,
        "experienceYears": 3
      }
    ],
    "databases": [
      {
        "name": "PostgreSQL",
        "level": 3,
        "experienceYears": 3
      }
    ],
    "cloudServices": [
      {
        "name": "AWS",
        "level": 3,
        "experienceYears": 2
      }
    ],
    "tools": ["Git", "Docker", "VSCode"],
    "certifications": [
      {
        "name": "AWS Solutions Architect Associate",
        "acquiredDate": "2023-06-01",
        "expiryDate": "2026-06-01"
      }
    ],
    "possibleRoles": ["PG", "PL"],
    "possiblePhases": ["design", "development", "testing"],
    "educationBackground": [
      {
        "schoolName": "東京大学",
        "degree": "学士",
        "field": "情報工学",
        "graduationYear": 2018
      }
    ],
    "careerSummary": "新卒でSIerに入社し...",
    "specialSkills": "アジャイル開発、チームリーダー経験",
    "isCompleted": true,
    "lastUpdatedBy": "uuid-user-id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 スキルシート更新
```yaml
PUT /skill-sheets/{engineerId}
```

#### リクエスト
```json
{
  "summary": "更新されたサマリー...",
  "totalExperienceYears": 6,
  "programmingLanguages": [
    {
      "name": "JavaScript",
      "level": 5,
      "experienceYears": 6
    }
  ],
  "possibleRoles": ["PG", "PL", "PM"],
  "isCompleted": true
}
```

#### レスポンス（200 OK）
```json
{
  "message": "スキルシートを更新しました",
  "data": {
    "id": "uuid-skillsheet-id",
    "summary": "更新されたサマリー...",
    "totalExperienceYears": 6,
    "isCompleted": true,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 5. プロジェクト管理API

### 5.1 プロジェクト一覧取得
```yaml
GET /projects
```

#### レスポンス（200 OK）
```json
{
  "data": [
    {
      "id": "uuid-project-id",
      "name": "ECサイトリニューアル",
      "clientCompany": "株式会社サンプル",
      "startDate": "2023-10-01",
      "endDate": null,
      "plannedEndDate": "2024-03-31",
      "projectScale": "medium",
      "industry": "EC",
      "businessType": "Webアプリケーション開発",
      "developmentMethodology": "アジャイル",
      "teamSize": 8,
      "description": "既存ECサイトのフルリニューアル...",
      "engineers": [
        {
          "engineerId": "uuid-engineer-id",
          "name": "田中太郎",
          "role": "フロントエンドエンジニア",
          "startDate": "2023-10-01",
          "isCurrent": true
        }
      ],
      "createdAt": "2023-09-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### 5.2 プロジェクト作成
```yaml
POST /projects
```

#### リクエスト
```json
{
  "name": "新規Webアプリ開発",
  "clientCompany": "テスト株式会社",
  "startDate": "2024-04-01",
  "plannedEndDate": "2024-12-31",
  "projectScale": "large",
  "industry": "金融",
  "businessType": "Webアプリケーション開発",
  "developmentMethodology": "ウォーターフォール",
  "teamSize": 15,
  "description": "金融機関向けの新規Webアプリケーション開発"
}
```

## 6. アプローチ管理API

### 6.1 アプローチ履歴取得
```yaml
GET /approaches
```

#### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|------|
| type | string | No | アプローチ種別（manual/periodic/assign_request） |
| status | string | No | ステータス（sent/opened/replied/rejected） |
| startDate | string | No | 開始日（YYYY-MM-DD） |
| endDate | string | No | 終了日（YYYY-MM-DD） |

#### レスポンス（200 OK）
```json
{
  "data": [
    {
      "id": "uuid-approach-id",
      "fromCompanyId": "uuid-from-company-id",
      "toCompanyId": "uuid-to-company-id",
      "toFreelancerId": null,
      "approachType": "manual",
      "contactMethods": ["email", "phone"],
      "targetEngineers": [
        {
          "engineerId": "uuid-engineer-id",
          "name": "田中太郎",
          "skills": ["React", "Node.js"]
        }
      ],
      "projectDetails": "新規プロジェクトでReactエンジニアを募集しています...",
      "messageContent": "いつもお世話になっております...",
      "status": "sent",
      "sentBy": {
        "userId": "uuid-user-id",
        "name": "営業担当者"
      },
      "sentAt": "2024-01-01T10:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 6.2 アプローチ送信
```yaml
POST /approaches
```

#### リクエスト
```json
{
  "toCompanyId": "uuid-to-company-id",
  "approachType": "manual",
  "contactMethods": ["email"],
  "targetEngineers": ["uuid-engineer-1", "uuid-engineer-2"],
  "projectDetails": "新規ECサイト開発プロジェクトでフロントエンドエンジニアを募集...",
  "messageContent": "貴社エンジニアの方々にプロジェクト参画をご検討いただきたく...",
  "emailTemplateId": "uuid-template-id"
}
```

#### レスポンス（201 Created）
```json
{
  "message": "アプローチを送信しました",
  "data": {
    "id": "uuid-approach-id",
    "status": "sent",
    "sentAt": "2024-01-01T10:00:00Z",
    "targetEngineersCount": 2,
    "estimatedDeliveryTime": "2024-01-01T10:05:00Z"
  }
}
```

## 7. 検索API

### 7.1 エンジニア検索
```yaml
POST /search/engineers
```

#### リクエスト
```json
{
  "skills": ["React", "TypeScript"],
  "experienceYears": {
    "min": 3,
    "max": 10
  },
  "status": ["waiting", "waiting_soon"],
  "availableDate": {
    "from": "2024-02-01",
    "to": "2024-06-30"
  },
  "roles": ["PG", "PL"],
  "phases": ["development", "testing"],
  "location": "東京都",
  "engineerType": ["employee", "freelance"],
  "sortBy": "experienceYears",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20
}
```

#### レスポンス（200 OK）
```json
{
  "data": [
    {
      "id": "uuid-engineer-id",
      "name": "田中太郎",
      "skills": ["React", "TypeScript", "Node.js"],
      "experienceYears": 5,
      "currentStatus": "waiting",
      "availableDate": "2024-02-01",
      "possibleRoles": ["PG", "PL"],
      "nearestStation": "新宿駅",
      "engineerType": "employee",
      "matchScore": 85,
      "highlightedSkills": ["React", "TypeScript"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  },
  "aggregations": {
    "skillsCount": {
      "React": 35,
      "TypeScript": 28,
      "Vue.js": 15
    },
    "experienceYearsRange": {
      "1-3": 12,
      "3-5": 18,
      "5-10": 10,
      "10+": 2
    },
    "statusCount": {
      "waiting": 25,
      "waiting_soon": 17
    }
  },
  "searchSuggestions": {
    "skills": ["Vue.js", "Angular", "Next.js"],
    "relatedSearches": ["React Redux", "TypeScript Express"]
  }
}
```

## 8. 管理者API

### 8.1 企業一覧取得
```yaml
GET /admin/companies
```

#### レスポンス（200 OK）
```json
{
  "data": [
    {
      "id": "uuid-company-id",
      "name": "株式会社サンプル",
      "companyType": "ses",
      "emailDomain": "sample.com",
      "maxEngineers": 100,
      "currentEngineers": 85,
      "contractStatus": "active",
      "contractPlan": "standard",
      "lastLoginAt": "2024-01-01T09:00:00Z",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### 8.2 アカウントロック
```yaml
POST /admin/accounts/{userId}/lock
```

#### リクエスト
```json
{
  "lockReason": "payment_overdue",
  "lockDetails": "2024年1月分の支払いが遅延しているため",
  "unlockScheduledAt": "2024-02-01T00:00:00Z"
}
```

#### レスポンス（200 OK）
```json
{
  "message": "アカウントをロックしました",
  "data": {
    "lockId": "uuid-lock-id",
    "lockedAt": "2024-01-01T10:00:00Z",
    "unlockScheduledAt": "2024-02-01T00:00:00Z"
  }
}
```

## 9. エラーレスポンス

### 9.1 共通エラー形式
```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": {
    "field": "具体的なエラー詳細"
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/engineers",
  "requestId": "uuid-request-id"
}
```

### 9.2 HTTPステータスコード
| コード | 説明 | 例 |
|--------|------|-----|
| 200 | 成功 | データ取得成功 |
| 201 | 作成成功 | リソース作成成功 |
| 400 | リクエストエラー | バリデーションエラー |
| 401 | 認証エラー | トークン無効 |
| 403 | 認可エラー | 権限不足 |
| 404 | 見つからない | リソースが存在しない |
| 409 | 競合エラー | データ重複 |
| 422 | バリデーションエラー | 入力値エラー |
| 429 | レート制限 | リクエスト過多 |
| 500 | サーバーエラー | 内部エラー |

### 9.3 エラーコード一覧
```typescript
const ERROR_CODES = {
  // 認証関連
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  
  // バリデーション関連
  VALIDATION_REQUIRED_FIELD: 'VAL_001',
  VALIDATION_INVALID_FORMAT: 'VAL_002',
  VALIDATION_OUT_OF_RANGE: 'VAL_003',
  
  // ビジネスロジック関連
  ENGINEER_NOT_FOUND: 'ENG_001',
  ENGINEER_ALREADY_EXISTS: 'ENG_002',
  SKILLSHEET_INCOMPLETE: 'SKL_001',
  
  // システム関連
  RATE_LIMIT_EXCEEDED: 'SYS_001',
  MAINTENANCE_MODE: 'SYS_002'
}
```

## 10. レート制限

### 10.1 制限設定
| エンドポイント | 制限 | 期間 |
|----------------|------|------|
| /auth/login | 10回 | 15分 |
| /auth/register | 5回 | 1時間 |
| 一般API | 100回 | 15分 |
| 検索API | 30回 | 1分 |
| アプローチ送信 | 10回 | 1時間 |

### 10.2 制限ヘッダー
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 11. ページネーション

### 11.1 リクエストパラメータ
```
GET /engineers?page=1&limit=20
```

### 11.2 レスポンス形式
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

この API仕様書により、フロントエンド・バックエンド開発チームが並行して作業を進めることができます。