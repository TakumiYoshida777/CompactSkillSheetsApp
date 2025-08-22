# JWT認証トークン401エラーの解決依頼

## 問題の概要
SESスキル管理システムにおいて、ログインは成功するが、その直後の認証チェック（`/api/auth/me`）で401 Unauthorizedエラーが発生し、ログイン画面に戻されてしまう問題が発生しています。

## 現在の状況

### 1. 症状
- ログイン自体は成功（200 OK、トークン発行済み）
- ログイン直後の`GET /api/auth/me`リクエストで401エラー
- curlコマンドで同じトークンを使用すると正常に動作する
- ブラウザからのリクエストのみ失敗する

### 2. 確認済み事項

#### フロントエンド側のログ
```javascript
// トークンは正しく設定されている
[AuthService] Setting Authorization header with token: Token exists
[AuthService] Current Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（有効なトークン）

// しかし401エラーが発生
GET http://localhost:8001/api/auth/me 401 (Unauthorized)
```

#### バックエンド側のログ
```
// ログインは成功
POST /api/auth/login 200 80.551 ms
// 認証チェックは失敗
GET /api/auth/me 401 9.394 ms - 89
```

#### curlでのテスト結果（成功）
```bash
curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
# → 200 OK、正常にユーザー情報を取得
```

### 3. 技術スタック
- **フロントエンド**: React 18.3.1 + TypeScript + Axios + Zustand
- **バックエンド**: Node.js + Express + TypeScript + JWT
- **認証**: JWT (jsonwebtoken)
- **環境**: Docker（Developer2環境）

### 4. 関連コード

#### フロントエンド - axios設定 (lib/axios.ts)
```typescript
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### フロントエンド - 認証サービス (services/authService.ts)
```typescript
static setAuthorizationHeader(token: string): void {
  console.log('[AuthService] Setting Authorization header with token:', token ? 'Token exists' : 'No token');
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

static async fetchUserInfo(endpoint: string): Promise<any> {
  try {
    console.log('[AuthService] Fetching user info from:', endpoint);
    console.log('[AuthService] Current Authorization header:', axiosInstance.defaults.headers.common['Authorization']);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    throw this.handleAuthError(error);
  }
}
```

#### バックエンド - 認証ミドルウェア (middleware/auth.middleware.ts)
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth Middleware] Authorization header:', authHeader);
  console.log('[Auth Middleware] Extracted token:', token ? 'Token exists' : 'No token');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '認証トークンが必要です'
    });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'トークンが無効です'
      });
    }
    // ...
  });
};
```

#### バックエンド - ルート設定 (routes/authRoutes.ts)
```typescript
router.get('/me', authenticateToken, authController.getCurrentUser);
```

### 5. 環境変数設定
```env
# frontend/.env.local
VITE_API_URL=http://localhost:8001/api

# backend/.env.development
JWT_SECRET=dev2-jwt-secret-change-in-production
CORS_ORIGIN=http://localhost:3001
```

## 試したこと
1. トークンの有効期限確認 → 8時間有効で期限内
2. CORS設定の確認 → 正しく設定済み
3. Authorization ヘッダーの確認 → 正しく設定されている
4. バックエンドのデバッグログ追加 → ログが出力されない（コードが反映されていない可能性）
5. コンテナの再起動 → 改善なし
6. ブラウザキャッシュのクリア → 改善なし

## 質問

**AIが誤解しない粒度で回答してください**

1. **なぜcurlでは成功するのにブラウザからのaxiosリクエストでは401エラーになるのか、根本原因を特定してください。**

2. **以下の可能性について検証方法と解決策を教えてください：**
   - axiosのインターセプターが干渉している
   - リクエストヘッダーが途中で書き換えられている
   - CORSプリフライトリクエストの影響
   - axiosのdefaults.headers.commonの設定が反映されていない

3. **デバッグログがバックエンド側で出力されない問題の解決方法を教えてください。**
   - ts-node-devのホットリロードが効いていない可能性
   - Dockerコンテナ内でのコード反映の問題

4. **この問題を確実に解決するための段階的なトラブルシューティング手順を提供してください。**

5. **同様の問題を防ぐためのベストプラクティスを教えてください。**

## 追加情報
- 2つの環境（通常環境とDeveloper2環境）が同じマシンで動作
- Developer2環境: フロントエンド（port 3001）、バックエンド（port 8001）
- 通常環境: フロントエンド（port 3000）、バックエンド（port 8000）