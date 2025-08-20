# React + Zustand認証フローでログイン後すぐにログイン画面に戻される問題

AIが誤解しない粒度で回答してください。

## 問題の概要
React + TypeScript + Zustandを使用した認証システムで、ログインに成功した直後にダッシュボード画面に遷移するが、すぐにログイン画面に戻されてしまう問題が発生しています。

## 技術スタック
- Frontend: React 18 + TypeScript + Vite
- 状態管理: Zustand (persist middleware使用)
- HTTPクライアント: Axios
- ルーティング: React Router v6
- Backend: Node.js + Express + Prisma

## 現在の実装構造

### 1. 認証ストア (authStore.ts)
```typescript
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        // APIを呼び出してログイン
        const response = await AuthService.performLogin('/api/auth/login', { email, password });
        set({
          user: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },
      
      checkAuth: async () => {
        const { token, user, isAuthenticated } = get();
        
        // すでに認証済みの場合はスキップ
        if (isAuthenticated && user && token) {
          return;
        }
        
        // API経由でユーザー情報を取得
        const result = await AuthCheckService.performAuthCheck({ token, user });
        
        if (result.success) {
          set({ user: result.user, isAuthenticated: true });
        } else {
          // 失敗時にログアウト
          get().logout();
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      }
    }),
    {
      name: 'auth-storage', // LocalStorageのキー
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      })
    }
  )
);
```

### 2. AuthGuardコンポーネント
```typescript
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, checkAuth, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      if (isAuthenticated) {
        setIsInitialized(true);
      } else if (token && !isAuthenticated) {
        checkAuth().finally(() => setIsInitialized(true));
      } else {
        setIsInitialized(true);
      }
    }
  }, [token, isAuthenticated, checkAuth, isInitialized]);
  
  if (isLoading || !isInitialized) {
    return <Spin />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};
```

### 3. Axiosインターセプター
```typescript
instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // リフレッシュトークンで再試行
      // 失敗したらログアウト
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. ログインフロー
```typescript
const handleLogin = async (values) => {
  await login(values.email, values.password); // Zustand store
  const user = useAuthStore.getState().user;
  navigate('/dashboard'); // React Router navigate
};
```

## 発生している問題の詳細

1. ユーザーがログインフォームに入力して送信
2. ログインAPIが成功し、トークンとユーザー情報がZustandストアに保存される
3. `isAuthenticated`がtrueになる
4. `/dashboard`に遷移する
5. AuthGuardコンポーネントがマウントされる
6. 何らかの理由で`checkAuth()`が呼ばれる
7. `checkAuth()`が失敗し、`logout()`が実行される
8. ユーザーが`/login`にリダイレクトされる

## 試した対策（効果なし）

1. AuthGuardで`isAuthenticated`が既にtrueの場合は`checkAuth`をスキップ
2. APIエンドポイントのパスを修正（`/api/auth/me`）
3. checkAuth内で既に認証済みならAPIコールをスキップ
4. useEffectの依存配列の調整

## 質問

1. **Zustand + persistミドルウェアを使用している場合、ページリロード時の状態復元とAuthGuardの初期化タイミングの競合を防ぐベストプラクティスは何ですか？**

2. **React 18のStrictModeでuseEffectが2回実行される問題が、この認証フローに影響を与える可能性はありますか？その場合の対策は？**

3. **LocalStorageから復元された状態（rehydrated state）と、初回レンダリング時の状態の不整合を防ぐ方法は？**

4. **checkAuth APIコールが失敗した際に、即座にログアウトするのではなく、より適切なエラーハンドリング方法はありますか？**

5. **AuthGuardコンポーネントの`isInitialized`フラグの管理方法は適切ですか？より良い実装パターンはありますか？**

## 期待する回答

- 問題の根本原因の特定
- 具体的なコード修正案
- 認証フローのベストプラクティス
- デバッグ方法の提案

## 追加情報

- エラーメッセージはコンソールに表示されていない
- LocalStorageには正しくトークンが保存されている
- バックエンドのAPIは正常に動作している（Postmanでテスト済み）
- 開発環境: Vite dev server (http://localhost:3001)