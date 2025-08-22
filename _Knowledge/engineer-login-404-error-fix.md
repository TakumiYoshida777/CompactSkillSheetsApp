# エンジニアログイン404エラーの解決方法

## 問題概要
エンジニア専用管理画面（`http://localhost:3001/engineer/login`）でログインしようとすると以下のエラーが発生：
- `POST http://localhost:8001/engineer/auth/login 404 (Not Found)`
- `TypeError: Cannot read properties of undefined (reading 'accessToken')`

## 原因
1. **間違ったAPIエンドポイント**: `engineerAuthService`が`engineer/auth/login`という存在しないエンドポイントを使用していた
2. **レスポンス形式の不一致**: APIレスポンスの形式とフロントエンドの期待する形式が異なっていた

## 解決手順

### 1. APIエンドポイントの修正
`frontend/src/services/engineer/authService.ts`を修正：

```typescript
// 修正前
class EngineerAuthService {
  private apiUrl = 'engineer/auth';

// 修正後
class EngineerAuthService {
  private apiUrl = '/api/auth';
```

### 2. レスポンス処理の修正
`frontend/src/services/engineer/authService.ts`の`login`メソッドを修正：

```typescript
async login(data: LoginRequest): Promise<AuthResponse> {
  const response = await axios.post(`${this.apiUrl}/login`, data);
  
  // トークンを保存（APIレスポンスの形式に合わせて修正）
  if (response.data.success && response.data.data) {
    const { accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // axios のデフォルトヘッダーに設定
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    // レスポンスを期待される形式に変換
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        user: response.data.data.user,
        tokens: {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          expiresIn: response.data.data.expiresIn
        }
      }
    };
  }
  
  return response.data;
}
```

### 3. ナビゲーションパスの修正
`frontend/src/pages/Engineer/Login.tsx`を修正：

```typescript
// 修正前
navigate('engineer/skill-sheet');

// 修正後
navigate('/engineer/skill-sheet');
```

### 4. デモアカウントの更新
実際のモックデータに合わせてデモアカウント情報を更新：

```typescript
const demoAccounts = [
  {
    email: 'engineer@demo.example.com',
    password: 'password123',
    description: 'エンジニア太郎',
  },
];
```

## APIレスポンス形式

### 実際のAPIレスポンス
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "engineer-1",
      "email": "engineer@demo.example.com",
      "name": "エンジニア太郎",
      "role": "engineer",
      // ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "37eb2abdc0bb6e1378807e7219ebb07d399315eb...",
    "expiresIn": 28800
  },
  "message": "ログインに成功しました"
}
```

### フロントエンドが期待する形式
```typescript
interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: { /* ... */ };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}
```

## 重要なポイント
1. エンジニアも通常の `/api/auth/login` エンドポイントを使用する（専用エンドポイントは不要）
2. APIレスポンスでは`accessToken`と`refreshToken`がフラットに存在するが、フロントエンドでは`tokens`オブジェクト内に格納する必要がある
3. パスは常に絶対パス（`/`で始まる）を使用する

## 関連ファイル
- `/frontend/src/services/engineer/authService.ts`
- `/frontend/src/pages/Engineer/Login.tsx`
- `/backend/src/routes/authRoutes.ts`
- `/backend/src/services/authService.ts`

## 対応日
2025-08-22