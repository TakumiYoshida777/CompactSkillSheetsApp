# Vite環境変数キャッシュ問題の解決方法

**AIが誤解しない粒度で回答してください**

## 問題の状況

React + Vite環境で、環境変数（.env.development）を変更したにも関わらず、ブラウザ側で古い値がキャッシュされて使用され続ける問題が発生しています。

### 具体的な症状
1. `.env.development`ファイルで`VITE_API_URL`を以下のように変更：
   - 変更前: `VITE_API_URL=http://localhost:8000/api/v1`
   - 変更後: `VITE_API_URL=http://localhost:8000/api`

2. Dockerコンテナを再起動：
   ```bash
   docker-compose restart frontend
   ```

3. しかし、ブラウザのコンソールでは依然として古いURL（`/api/v1`を含む）へのリクエストが送信される：
   ```
   POST http://localhost:8000/api/v1/client/auth/login 404 (Not Found)
   ```

### 環境情報
- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite 6.0.7
- **実行環境**: Docker compose
- **ブラウザ**: Chrome 最新版

### コード構成
```typescript
// clientAuthStore.ts
const clientAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 質問

1. **Viteで環境変数の変更を確実にブラウザに反映させる方法は？**
   - ブラウザキャッシュのクリア以外の方法
   - Vite側での設定変更が必要か

2. **Dockerコンテナでの環境変数の反映について**
   - `docker-compose restart`で不十分な場合の対処法
   - コンテナの完全な再ビルドが必要か

3. **import.meta.env のキャッシュ問題の解決策**
   - Viteの開発サーバーでのホットリロード設定
   - 環境変数の動的読み込み方法

4. **デバッグ方法**
   - 現在ブラウザで読み込まれている環境変数の値を確認する方法
   - Viteの開発サーバーが使用している環境変数を確認する方法

## 試したこと
- [x] .env.developmentファイルの編集
- [x] docker-compose restart frontend
- [x] ブラウザのDevToolsでNetwork タブのDisable cache
- [ ] docker-compose down && docker-compose up -d
- [ ] node_modules/.vite の削除

## 期待する回答
1. この問題の根本原因
2. 即座に解決できる具体的な手順
3. 今後同じ問題を防ぐためのベストプラクティス