# JWT認証401エラー - Axiosインスタンス不一致問題

## 問題の概要
ログインは成功するが、その直後の認証チェック（`/api/auth/me`）で401 Unauthorizedエラーが発生し、ログイン画面に戻される問題。

### 症状
- ログイン自体は成功（200 OK、トークン発行済み）
- ログイン直後の`GET /api/auth/me`リクエストで401エラー
- curlコマンドで同じトークンを使用すると正常に動作する
- ブラウザからのリクエストのみ失敗する

## 根本原因
**Axiosインスタンスのトークン管理の不一致**
- `lib/axios.ts`のインターセプターが`localStorage`からトークンを取得
- アプリケーションはZustandストアでトークンを管理
- 結果：Authorizationヘッダーが実際のリクエストに付与されない

### なぜcurlでは成功するのか
- curlはCORSの制約を受けない
- プロキシやAxiosの設定干渉がない
- 手動でヘッダーを設定するため確実にトークンが送信される

## 解決方法

### 1. Axiosインターセプターの修正
`frontend/src/lib/axios.ts`を以下のように修正：

```typescript
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
instance.interceptors.request.use(
  (config) => {
    // Zustandストアから認証トークンを取得
    const token = useAuthStore.getState().token;
    console.log('[Axios Interceptor] Adding token to request:', token ? 'Token exists' : 'No token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Interceptor] Authorization header set:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（リフレッシュトークン処理）
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await instance.post('auth/refresh', {
            refreshToken: refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Zustandストアを更新
          useAuthStore.getState().setAuthTokens(
            useAuthStore.getState().user,
            accessToken,
            newRefreshToken
          );
          
          // 元のリクエストを再実行
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // リフレッシュ失敗時はログアウト
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
```

### 2. AuthServiceの修正
`setAuthorizationHeader`と`removeAuthorizationHeader`メソッドを非推奨に：

```typescript
/**
 * @deprecated インターセプターで自動的に設定されるため不要
 */
static setAuthorizationHeader(token: string): void {
  // インターセプターで自動的に設定されるため、何もしない
  console.log('[AuthService] setAuthorizationHeader called (deprecated)');
}

/**
 * @deprecated インターセプターで自動的に処理されるため不要
 */
static removeAuthorizationHeader(): void {
  // インターセプターで自動的に処理されるため、何もしない
  console.log('[AuthService] removeAuthorizationHeader called (deprecated)');
}
```

## デバッグ方法

### フロントエンド側の確認
1. **ブラウザのNetworkタブで確認**
   - `/api/auth/me`のRequest Headersに`Authorization: Bearer xxx`が付いているか
   - 付いていない → Axios設定の問題
   - 付いている → サーバー側の問題

2. **コンソールログで確認**
   ```
   [Axios Interceptor] Adding token to request: Token exists
   [Axios Interceptor] Authorization header set: Bearer eyJ...
   ```

### バックエンド側の確認
認証ミドルウェアにデバッグログを追加：

```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('[Auth Middleware] All headers:', JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth Middleware] Authorization header:', authHeader);
  console.log('[Auth Middleware] Extracted token:', token ? `Token exists (length: ${token.length})` : 'No token');

  if (!token) {
    console.log('[Auth Middleware] No token found - returning 401');
    return res.status(401).json({
      success: false,
      message: '認証トークンが必要です'
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.log('[Auth Middleware] JWT verification failed:', err.message);
      console.log('[Auth Middleware] JWT_SECRET length:', secret.length);
      return res.status(403).json({
        success: false,
        message: 'トークンが無効です'
      });
    }
    
    console.log('[Auth Middleware] JWT verification successful, user:', decoded);
    // ...
  });
};
```

## ベストプラクティス

### 1. Axiosインスタンスの一元管理
- プロジェクト全体で単一のAxiosインスタンスを使用
- `lib/axios.ts`からのみエクスポート
- 生の`axios`を直接使用しない

### 2. トークン管理の統一
- Zustandストアで一元管理
- localStorageとの併用を避ける
- インターセプターで自動的にトークンを付与

### 3. エラーハンドリング
- 401エラー時は自動的にリフレッシュトークンで再試行
- リフレッシュ失敗時は自動的にログアウト

### 4. CORS設定の確認
```typescript
// Express側
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // トークンベース認証の場合
}));
```

## トラブルシューティングチェックリスト

- [ ] ブラウザのNetworkタブでAuthorizationヘッダーの有無を確認
- [ ] Axiosインスタンスが統一されているか確認
- [ ] トークンの保存場所（localStorage vs Zustand）が一致しているか
- [ ] CORS設定でAuthorizationヘッダーが許可されているか
- [ ] JWT_SECRETが環境間で一致しているか
- [ ] トークンの有効期限が切れていないか
- [ ] プロキシやリバースプロキシでヘッダーが削除されていないか

## 関連ファイル
- `/frontend/src/lib/axios.ts` - Axiosインスタンス設定
- `/frontend/src/services/authService.ts` - 認証サービス
- `/frontend/src/stores/authStore.ts` - 認証状態管理
- `/backend/src/middleware/auth.middleware.ts` - 認証ミドルウェア

## 参考
- 発生日: 2025-08-20
- 解決方法: Axiosインターセプターでトークン管理を統一
- ChatGPTの回答: 「curlは通る（CORSやAxiosの干渉がない）」という差分がヒント