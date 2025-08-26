# TanStack Query v5 マイグレーションガイド

## 1. useInfiniteQueryのinitialPageParam必須化

### 問題
TanStack Query v5では、`useInfiniteQuery`フックで`initialPageParam`プロパティが必須になりました。

### エラーメッセージ
```
Property 'initialPageParam' is missing in type but required in type 'UseInfiniteQueryOptions'
```

### 解決方法
```typescript
// Before (v4)
useInfiniteQuery({
  queryKey: ['items'],
  queryFn: ({ pageParam = 1 }) => fetchItems(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

// After (v5)
useInfiniteQuery({
  queryKey: ['items'],
  queryFn: ({ pageParam }) => fetchItems(pageParam),
  initialPageParam: 1, // 必須プロパティを追加
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## 2. Query関数でundefinedを返すエラー

### 問題
Query関数がundefinedを返すと警告が表示されます。

### エラーメッセージ
```
Query data cannot be undefined. Please make sure to return a value other than undefined from your query function.
```

### 原因
- APIレスポンスのデータ展開処理が不適切
- レスポンスインターセプターで意図しないデータ変換

### 解決方法
axiosのレスポンスインターセプターで、特定のエンドポイントのみデータを展開するように制限：

```typescript
// axios.ts
instance.interceptors.response.use(
  (response) => {
    // 特定のエンドポイントのみデータを展開
    const url = response.config.url || '';
    if (response.data && 
        response.data.success === true && 
        response.data.data !== undefined &&
        url.includes('/business-partners')) { // 条件を追加
      const responseData = response.data.data;
      if (response.data.meta?.pagination) {
        responseData.pagination = response.data.meta.pagination;
      }
      response.data = responseData;
    }
    return response;
  }
);
```

## 3. TypeScript型エラーの解決

### any型の使用を避ける
```typescript
// Before
onError: (error: any) => {
  const errorMessage = error.response?.data?.message;
}

// After
onError: (error: Error & { response?: { data?: { message?: string } } }) => {
  const errorMessage = error.response?.data?.message;
}
```

### null許容型の適切な処理
```typescript
// Before
useAuthStore.getState().setAuthTokens(
  useAuthStore.getState().user, // user can be null
  accessToken,
  newRefreshToken
);

// After
const user = useAuthStore.getState().user;
if (refreshToken && user) { // null check
  useAuthStore.getState().setAuthTokens(
    user,
    accessToken,
    newRefreshToken
  );
}
```

## 4. 取引先企業管理機能の修正内容

### APIエンドポイントの統一
すべてのビジネスパートナー関連APIに`/v1/`プレフィックスを追加：
- `/business-partners` → `/v1/business-partners`
- `/business-partners/stats` → `/v1/business-partners/stats`

### ルーティングの整理
```typescript
// backend/src/routes/v1/index.ts
import businessPartnerRoutes from './businessPartner.routes';
router.use('/business-partners', businessPartnerRoutes);
```

### コントローラーメソッドの正しいバインディング
```typescript
// businessPartner.routes.ts
router.get(
  '/',
  authMiddleware,
  (req, res) => businessPartnerController.getBusinessPartners(req, res)
);
```

## トラブルシューティング

### 問題: 401 Unauthorized Error
**原因**: 認証トークンが正しく送信されていない、またはAPIエンドポイントが間違っている

**解決**: 
1. axiosインスタンスで認証ヘッダーが正しく設定されているか確認
2. APIエンドポイントのパスが正しいか確認（`/v1/`プレフィックス）
3. authMiddlewareが正しく適用されているか確認

### 問題: データ形式の不一致
**原因**: バックエンドとフロントエンドで期待するデータ形式が異なる

**解決**: 
1. transformToLegacyFormat関数でデータを適切に変換
2. レスポンスインターセプターで必要に応じてデータを展開

## 参考リンク
- [TanStack Query v5 Migration Guide](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5)
- [Axios Interceptors Documentation](https://axios-http.com/docs/interceptors)