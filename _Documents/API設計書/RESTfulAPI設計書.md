# RESTful API仕様書 - エンジニアスキルシート管理システム

## 1. API概要

### 1.1 基本情報
| 項目 | 内容 |
|------|------|
| API名 | エンジニアスキルシート管理システム API |
| バージョン | v1.0.0 |
| ベースURL | https://api.engineer-skillsheet.com/v1 |
| 認証方式 | JWT Bearer Token + OAuth 2.0 |
| データ形式 | JSON |
| 文字エンコーディング | UTF-8 |
| 日時フォーマット | ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) |
| API設計原則 | RESTful Architecture |

### 1.2 RESTful設計原則

#### 1.2.1 リソース指向設計
```
リソース階層構造：
/companies/{companyId}/users/{userId}
/companies/{companyId}/engineers/{engineerId}
/engineers/{engineerId}/skill-sheets
/engineers/{engineerId}/projects
/projects/{projectId}/engineers
```

#### 1.2.2 HTTPメソッドの適切な使用
| メソッド | 用途 | 冪等性 | 安全性 |
|----------|------|--------|--------|
| GET | リソース取得 | ○ | ○ |
| POST | リソース作成 | × | × |
| PUT | リソース更新（完全更新） | ○ | × |
| PATCH | リソース更新（部分更新） | × | × |
| DELETE | リソース削除 | ○ | × |

#### 1.2.3 ステータスレスな設計
- 各リクエストは独立して処理される
- サーバーはクライアント状態を保持しない
- 認証情報はJWTトークンで管理

#### 1.2.4 統一されたインターフェース
```json
// 共通レスポンス形式
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "message": "処理が完了しました",
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789",
    "version": "v1.0.0"
  }
}
```

## 2. APIリソース設計

### 2.1 主要リソース一覧

#### 2.1.1 認証・ユーザー管理
```
/auth                    # 認証関連
├── /login              # ログイン
├── /logout             # ログアウト
├── /register           # ユーザー登録
├── /refresh            # トークン更新
├── /mfa                # 多要素認証
└── /password           # パスワード管理

/users                  # ユーザー管理
├── /{userId}           # 特定ユーザー
├── /{userId}/roles     # ユーザーロール
└── /{userId}/profile   # プロフィール
```

#### 2.1.2 エンジニア・スキル管理
```
/engineers              # エンジニア管理
├── /{engineerId}       # 特定エンジニア
├── /{engineerId}/skill-sheets  # スキルシート
├── /{engineerId}/projects      # 参画プロジェクト
├── /{engineerId}/status        # ステータス管理
└── /{engineerId}/availability  # 稼働可能時期

/skill-sheets           # スキルシート管理
├── /{sheetId}          # 特定スキルシート
├── /{sheetId}/skills   # スキル詳細
└── /{sheetId}/export   # エクスポート機能
```

#### 2.1.3 プロジェクト管理
```
/projects               # プロジェクト管理
├── /{projectId}        # 特定プロジェクト
├── /{projectId}/engineers      # 参画エンジニア
├── /{projectId}/timeline       # プロジェクト進行
└── /{projectId}/assignments    # アサイン管理
```

#### 2.1.4 営業・アプローチ管理
```
/approaches             # アプローチ管理
├── /{approachId}       # 特定アプローチ
├── /periodic           # 定期アプローチ
├── /templates          # メールテンプレート
└── /history            # アプローチ履歴

/business-partners      # 取引先管理
├── /{partnerId}        # 特定取引先
├── /{partnerId}/access-urls    # アクセスURL
└── /{partnerId}/permissions    # 権限設定
```

#### 2.1.5 検索・分析
```
/search                 # 検索機能
├── /engineers          # エンジニア検索
├── /projects           # プロジェクト検索
├── /saved              # 保存済み検索
└── /suggestions        # 検索提案

/analytics              # 分析機能
├── /dashboard          # ダッシュボード
├── /reports            # レポート生成
└── /exports            # データエクスポート
```

#### 2.1.6 システム管理
```
/admin                  # 管理者機能
├── /companies          # 企業管理
├── /contracts          # 契約管理
├── /invoices           # 請求管理
├── /support            # サポート管理
├── /maintenance        # メンテナンス管理
├── /security           # セキュリティ管理
└── /features           # 機能制御管理

/system                 # システム機能
├── /health             # ヘルスチェック
├── /version            # バージョン情報
├── /metrics            # メトリクス
└── /logs               # ログ管理
```

### 2.2 リソース命名規則

#### 2.2.1 URL命名規則
```yaml
基本原則:
  - 小文字とハイフンを使用: /skill-sheets
  - 複数形を使用: /engineers, /projects
  - 階層構造を明確に: /engineers/{id}/projects
  - 動詞の使用を避ける: ❌ /getEngineers → ⭕ /engineers

例外的な動詞の使用:
  - /auth/login, /auth/logout (認証アクション)
  - /search (検索アクション)
  - /export (エクスポートアクション)
```

#### 2.2.2 クエリパラメータ命名
```yaml
フィルタリング:
  - status: ステータスフィルター
  - skills: スキルフィルター
  - dateFrom, dateTo: 日付範囲

ページネーション:
  - page: ページ番号
  - limit: 件数制限
  - offset: オフセット

ソート:
  - sortBy: ソートフィールド
  - sortOrder: ソート順（asc/desc）

検索:
  - q, search: 検索キーワード
  - filter: 複合フィルター
```

## 3. HTTPステータスコードの使用

### 3.1 成功レスポンス
| コード | 説明 | 使用場面 |
|--------|------|----------|
| 200 OK | 成功 | GET, PUT, PATCH 成功時 |
| 201 Created | 作成成功 | POST でリソース作成成功時 |
| 204 No Content | 内容なし成功 | DELETE 成功時 |

### 3.2 クライアントエラー
| コード | 説明 | 使用場面 |
|--------|------|----------|
| 400 Bad Request | リクエストエラー | 構文エラー、不正なパラメータ |
| 401 Unauthorized | 認証エラー | トークン不正・期限切れ |
| 403 Forbidden | 認可エラー | 権限不足 |
| 404 Not Found | 未発見 | リソースが存在しない |
| 409 Conflict | 競合 | データ重複、状態競合 |
| 422 Unprocessable Entity | 処理不能 | バリデーションエラー |
| 429 Too Many Requests | レート制限 | API使用制限超過 |

### 3.3 サーバーエラー
| コード | 説明 | 使用場面 |
|--------|------|----------|
| 500 Internal Server Error | サーバー内部エラー | 予期しないサーバーエラー |
| 502 Bad Gateway | 不正なゲートウェイ | 上流サーバーエラー |
| 503 Service Unavailable | サービス利用不可 | メンテナンス中、過負荷 |
| 504 Gateway Timeout | ゲートウェイタイムアウト | 上流サーバータイムアウト |

## 4. コンテンツネゴシエーション

### 4.1 リクエストヘッダー
```http
Accept: application/json
Accept-Language: ja-JP,ja;q=0.9,en;q=0.8
Accept-Encoding: gzip, deflate, br
Content-Type: application/json; charset=utf-8
```

### 4.2 レスポンスヘッダー
```http
Content-Type: application/json; charset=utf-8
Content-Language: ja-JP
Content-Encoding: gzip
Cache-Control: private, max-age=3600
```

## 5. キャッシング戦略

### 5.1 キャッシュ制御ヘッダー
```http
# 静的データ（マスタデータ）
Cache-Control: public, max-age=86400

# 動的データ（ユーザー固有）
Cache-Control: private, max-age=3600

# 機密データ
Cache-Control: private, no-cache, no-store, must-revalidate

# リアルタイムデータ
Cache-Control: no-cache
```

### 5.2 ETag の使用
```http
# レスポンスヘッダー
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 条件付きリクエスト
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 304 Not Modified レスポンス
HTTP/1.1 304 Not Modified
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

## 6. バージョニング戦略

### 6.1 URL バージョニング
```
現在: /api/v1/engineers
次版: /api/v2/engineers
```

### 6.2 後方互換性保証
```yaml
保証期間: 最低2バージョン
移行期間: 6ヶ月間の並行運用
非推奨通知: レスポンスヘッダーで警告
```

## 7. エラーハンドリング

### 7.1 エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値にエラーがあります",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください",
        "value": "invalid-email",
        "location": "body"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789",
    "documentation": "https://docs.engineer-skillsheet.com/errors/VAL_001"
  }
}
```

### 7.2 エラーコード体系
```yaml
分類:
  AUTH_xxx: 認証・認可エラー
  VAL_xxx: バリデーションエラー  
  BIZ_xxx: ビジネスロジックエラー
  SYS_xxx: システムエラー
  EXT_xxx: 外部連携エラー
```

## 8. セキュリティ考慮事項

### 8.1 HTTPS 強制
```yaml
要件: 全通信でHTTPS必須
証明書: TLS 1.3 以上
HSTS: 有効化必須
```

### 8.2 CORS 設定
```yaml
許可オリジン: 設定されたドメインのみ
許可メソッド: GET, POST, PUT, PATCH, DELETE
許可ヘッダー: Authorization, Content-Type, X-Company-ID
```

### 8.3 レート制限
```yaml
認証API: 10回/15分
検索API: 100回/1時間
一般API: 1000回/1時間
管理者API: 5000回/1時間
```

## 9. 監視・ログ

### 9.1 アクセスログ
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "method": "GET",
  "path": "/api/v1/engineers",
  "statusCode": 200,
  "responseTime": 150,
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "userId": "uuid-user-id",
  "companyId": "uuid-company-id"
}
```

### 9.2 エラーログ
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "ERROR",
  "requestId": "req_123456789",
  "error": {
    "code": "DATABASE_CONNECTION_ERROR",
    "message": "データベース接続に失敗しました",
    "stack": "Error: Connection timeout..."
  },
  "context": {
    "userId": "uuid-user-id",
    "endpoint": "/api/v1/engineers",
    "method": "GET"
  }
}
```

## 10. パフォーマンス最適化

### 10.1 ページネーション
```yaml
デフォルト件数: 20件
最大件数: 100件
カーソルベース: 大量データ用
オフセットベース: 小規模データ用
```

### 10.2 フィールド選択
```yaml
# 必要なフィールドのみ取得
GET /engineers?fields=id,name,skills,status

# 関連データの制御
GET /engineers?include=skillSheet,currentProject
GET /engineers?exclude=internalNotes
```

### 10.3 圧縮
```yaml
Gzip: 全レスポンスで有効
Brotli: 対応ブラウザで有効
最小サイズ: 1KB以上で圧縮
```

このRESTful API仕様書により、一貫性のある設計原則とベストプラクティスに基づいたAPI実装が可能になります。