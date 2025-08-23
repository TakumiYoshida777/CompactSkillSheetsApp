# 権限管理システム移行ガイド

## 概要
このドキュメントは、ハードコーディングされた権限管理システムからデータベースベースの権限管理システムへの移行手順を説明します。

## 移行手順

### 1. データベースの準備

#### 1.1 権限データの投入
```bash
# Dockerコンテナに入る
docker-compose exec backend sh

# Node.jsでスクリプトを実行
node scripts/seed-permissions.js

# またはSQLを直接実行
docker-compose exec postgres psql -U skillsheet -d skillsheet_dev2 < /app/prisma/seeds/001_roles_permissions.sql
```

#### 1.2 デモ管理者ユーザーの作成（オプション）
```bash
# 環境変数を設定して実行
CREATE_DEMO_ADMIN=true node scripts/seed-permissions.js
```

作成されるデモ管理者：
- Email: admin@demo-ses.example.com
- Password: Admin@123

### 2. アプリケーションの再起動

```bash
# Dockerコンテナを再起動
docker-compose restart backend
docker-compose restart frontend
```

### 3. 動作確認

#### 3.1 ロールと権限の確認
データベースで以下のSQLを実行して確認：

```sql
-- ロール一覧
SELECT * FROM roles;

-- 権限一覧
SELECT * FROM permissions;

-- ロールと権限のマッピング
SELECT 
    r.name as role_name,
    r.display_name as role_display,
    p.name as permission_name,
    p.resource,
    p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.resource, p.action;
```

#### 3.2 ログインテスト
各ロールでログインして権限が正しく動作することを確認：

1. 管理者ログイン
2. マネージャーログイン
3. 営業ログイン
4. エンジニアログイン

### 4. 既存ユーザーへのロール割り当て

既存ユーザーにロールを割り当てる必要がある場合：

```sql
-- 例：ユーザーID 1に管理者ロールを割り当て
INSERT INTO user_roles (user_id, role_id, granted_by, created_at)
SELECT 
    1,  -- ユーザーID
    r.id,
    1,  -- 付与者のユーザーID
    CURRENT_TIMESTAMP
FROM roles r
WHERE r.name = 'admin';
```

## 新機能

### 1. データベースベースの権限管理
- 権限はデータベースから動的に取得
- 運用中に権限の追加・変更が可能

### 2. 新しいミドルウェア
```javascript
// 権限ベースのアクセス制御
app.get('/api/users', 
  authenticateToken,
  requirePermission('user', 'view'),
  getUsersController
);

// ロールベースのアクセス制御
app.post('/api/projects',
  authenticateToken,
  requireRole(['admin', 'manager']),
  createProjectController
);
```

### 3. フロントエンドでの権限チェック
```javascript
// 権限チェック
if (authStore.hasPermission('user', 'create')) {
  // ユーザー作成ボタンを表示
}

// ロールチェック
if (authStore.hasRole('admin')) {
  // 管理者メニューを表示
}
```

## トラブルシューティング

### 問題: ログイン後に権限が反映されない
**解決策**: 
1. ブラウザのキャッシュをクリア
2. localStorageをクリア
3. 再ログイン

### 問題: 権限チェックで403エラー
**解決策**:
1. user_rolesテーブルでユーザーにロールが割り当てられているか確認
2. role_permissionsテーブルでロールに権限が割り当てられているか確認
3. バックエンドのログを確認

### 問題: 新しいAuthServiceでエラー
**解決策**:
1. Prismaクライアントが正しく生成されているか確認
   ```bash
   cd backend
   npx prisma generate
   ```
2. データベース接続を確認
3. 環境変数DATABASE_URLが正しいか確認

## ロールバック手順

何か問題が発生した場合のロールバック：

1. 旧authServiceに戻す
```bash
mv backend/src/services/authService.ts backend/src/services/authService.new.ts
mv backend/src/services/authService.old.ts backend/src/services/authService.ts
```

2. アプリケーションを再起動
```bash
docker-compose restart backend
```

## 参考資料
- [権限管理実装調査レポート](../_Features/権限管理実装調査レポート.md)
- [Prismaドキュメント](https://www.prisma.io/docs)
- [JWT認証ベストプラクティス](https://jwt.io/introduction/)