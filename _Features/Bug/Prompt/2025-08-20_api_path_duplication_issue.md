# APIパスの重複問題の根本的解決方法

**AIが誤解しない粒度で回答してください**

## 現在の問題

ReactアプリケーションからバックエンドAPIを呼び出す際に、URLパスが二重になる問題が発生しています。

### エラー例
```
GET http://localhost:8001/api/api/auth/me 404 (Not Found)
POST http://localhost:8001/api/api/auth/refresh 404 (Not Found)
```

期待される正しいURL:
```
GET http://localhost:8001/api/v1/auth/me
POST http://localhost:8001/api/v1/auth/refresh
```

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **HTTPクライアント**: Axios
- **バックエンド**: Express (Node.js)
- **環境**: Docker複数コンテナ環境
  - frontend: localhost:3001
  - backend: localhost:8001

## 現在の設定

### 1. Axios設定 (frontend/src/lib/axios.ts)
```typescript
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // ...
});
```

### 2. 環境変数 (.env.local)
```
VITE_API_URL=http://localhost:8001/api
```

### 3. AuthServiceでの呼び出し (一部修正済み)
```typescript
// 修正前
await AuthService.performLogin('/api/auth/login', credentials);

// 修正後
await AuthService.performLogin('/auth/login', credentials);
```

### 4. バックエンドのルーティング
```typescript
// backend/src/index.ts
app.use('/api/v1', v1Routes);

// backend/src/routes/v1/index.ts
router.use('/auth', authRoutes);
```

## 問題の詳細

1. **一部のファイルがまだ古いパスを使用**
   - `/api/auth/me` を呼び出している箇所がある
   - `/api/auth/refresh` を呼び出している箇所がある

2. **axiosInstance vs axios の混在**
   - 一部で設定済みのaxiosInstanceを使用
   - 一部で生のaxiosを使用している可能性

3. **ブラウザキャッシュの問題**
   - Viteのホットリロードが完全に反映されていない可能性

## 質問

### 1. 根本的な解決方法
この問題を根本的に解決するための最適なアプローチを教えてください。特に以下の点について：

- baseURLの設定方法（`/api` vs `/api/v1` どちらを含めるべきか）
- エンドポイントパスの記述方法（先頭の`/`を含めるべきか）
- 環境変数の最適な設定値

### 2. 全ファイルの一括修正方法
プロジェクト全体で一貫性を保つために、すべてのAPIエンドポイントパスを正しく修正する方法を教えてください：

- grepやsedを使った一括置換のコマンド例
- 修正すべきパターンのリスト
- 修正後の検証方法

### 3. Viteキャッシュのクリア方法
開発環境でViteのキャッシュを完全にクリアし、変更を確実に反映させる方法を教えてください。

### 4. ベストプラクティス
今後このような問題を防ぐためのベストプラクティスを教えてください：

- APIクライアントの設計パターン
- 環境変数の管理方法
- TypeScriptでの型安全なAPI呼び出し方法

## 期待する回答形式

1. **即座に実行可能な修正手順**
   - 具体的なコマンドとコード例
   - 実行順序

2. **長期的な改善案**
   - アーキテクチャの改善提案
   - 保守性を高める設計パターン

3. **検証方法**
   - 修正が正しく適用されたことを確認する方法
   - テストコードの例

よろしくお願いします。