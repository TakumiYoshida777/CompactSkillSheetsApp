# リフレッシュトークンAPI 500エラーの解決方法

## 問題概要
`POST http://localhost:8001/api/auth/refresh` エンドポイントで500エラーが発生する問題。

## エラー内容
```
TypeError: authService_1.default.getUserById is not a function
TypeError: errors_1.UnauthorizedError is not a constructor
```

## 原因
1. `authService.ts`に`getUserById`メソッドが存在しない
2. `UnauthorizedError`クラスが`utils/errors.ts`に定義されていない
3. `refreshToken`メソッドの呼び出し方法が間違っている（文字列ではなくオブジェクトを渡す必要がある）

## 解決手順

### 1. UnauthorizedErrorクラスの追加
`backend/src/utils/errors.ts`に以下を追加：

```typescript
/**
 * 認証失敗エラー（401）
 */
export class UnauthorizedError extends Error {
  constructor(message: string = '認証に失敗しました') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

### 2. authServiceへのメソッド追加
`backend/src/services/authService.ts`に以下のメソッドを追加：

#### getUserByIdメソッド
```typescript
/**
 * IDでユーザーを取得
 */
async getUserById(userId: string): Promise<User | null> {
  return this.getCurrentUser(userId);
}
```

#### changePasswordメソッド
```typescript
/**
 * パスワード変更
 */
async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  // データベースからユーザーを検索
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: BigInt(userId) }
    });

    if (dbUser && dbUser.passwordHash) {
      // 現在のパスワードを検証
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('現在のパスワードが正しくありません');
      }

      // 新しいパスワードをハッシュ化して更新
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: BigInt(userId) },
        data: { passwordHash: newPasswordHash }
      });
      return;
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    logger.error('Database changePassword error:', error);
  }

  // モックユーザーの場合の処理
  const mockUser = mockUsers.get(userId);
  if (!mockUser) {
    throw new UnauthorizedError('ユーザーが見つかりません');
  }

  // 現在のパスワードを検証
  const isPasswordValid = await bcrypt.compare(currentPassword, mockUser.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('現在のパスワードが正しくありません');
  }

  // 新しいパスワードをハッシュ化
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  mockUser.passwordHash = newPasswordHash;
}
```

#### hasPermissionメソッドのオーバーロード対応
```typescript
/**
 * リソース・アクション形式のパーミッションチェック（オーバーロード）
 */
hasPermission(user: User, resourceOrPermission: string, action?: string): boolean {
  if (action) {
    // リソースとアクションが分離されている場合
    const permission = `${resourceOrPermission}:${action}`;
    if (user.permissions) {
      return user.permissions.some(p => p.name === permission);
    }
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  } else {
    // 結合された権限文字列の場合
    if (user.permissions) {
      return user.permissions.some(p => p.name === resourceOrPermission);
    }
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(resourceOrPermission);
  }
}
```

### 3. authControllerの修正
`backend/src/controllers/authController.ts`の`refreshToken`メソッド呼び出しを修正：

```typescript
// 修正前
const tokens = await authService.refreshToken(refreshToken);

// 修正後
const tokens = await authService.refreshToken({ refreshToken });
```

### 4. Dockerコンテナの再起動
```bash
cd /Users/takumi/workspace/Project/Dev2_CompactSkillSheetsApp/Dev2_CompactSkillSheetsApp
docker-compose restart backend
```

## 確認方法
```bash
# ログインしてトークンを取得
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo-ses.example.com","password":"password123"}' | jq -r '.data.refreshToken'

# リフレッシュトークンでアクセストークンを更新
REFRESH_TOKEN="取得したトークン"
curl -X POST http://localhost:8001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | jq
```

## 関連ファイル
- `/backend/src/services/authService.ts`
- `/backend/src/utils/errors.ts`
- `/backend/src/controllers/authController.ts`

## 対応日
2025-08-22