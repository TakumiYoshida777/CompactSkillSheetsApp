# Vite環境変数キャッシュ問題の解決方法

## 問題の概要
Vite + Docker環境で、環境変数を変更してもブラウザ側で古い値が使用され続ける問題。

## 発生した具体的な症状
1. `.env.development`で`VITE_API_URL`を変更（`/api/v1` → `/api`）
2. Dockerコンテナを再起動
3. しかしブラウザでは依然として古いURL（`/api/v1`）へのリクエストが送信される

```
POST http://localhost:8000/api/v1/client/auth/login 404 (Not Found)
```

## 根本原因

### 1. Docker Compose環境変数の優先順位
**最も重要な原因**: `docker-compose.yml`で定義された環境変数が`.env`ファイルより優先される

```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      - VITE_API_URL=http://localhost:8000/api/v1  # これが優先される！
```

### 2. Viteの環境変数の仕組み
- `import.meta.env`はビルド時（Viteサーバー起動時）に静的に埋め込まれる
- `.env.*`ファイルを変更しても、Viteサーバーを再起動しない限り反映されない

### 3. Axiosインスタンスの生成タイミング
```typescript
// モジュール読み込み時に一度だけ実行される
const clientAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});
```
- HMR（ホットリロード）で他の部分が更新されても、一度作られたAxiosインスタンスのbaseURLは変わらない

## 解決手順

### 即座に解決する方法

1. **docker-compose.ymlの環境変数を修正**
```yaml
environment:
  - VITE_API_URL=http://localhost:8000/api  # v1を削除
```

2. **コンテナを完全に再起動**
```bash
docker-compose down
docker-compose up -d
```

3. **Viteキャッシュをクリア（必要に応じて）**
```bash
docker-compose exec frontend sh -c 'rm -rf node_modules/.vite'
docker-compose exec frontend npm run dev -- --force
```

4. **ブラウザのハードリロード**
- Chrome/Edge: `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Windows)
- またはDevToolsを開いて、Networkタブで「Disable cache」にチェック

## デバッグ方法

### 1. 現在の環境変数値を確認
```javascript
// ブラウザコンソールで実行
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
```

### 2. コンテナ内の環境変数を確認
```bash
# .envファイルの内容確認
docker-compose exec frontend sh -c 'grep VITE_API_URL .env.development'

# 環境変数の確認
docker-compose exec frontend sh -c 'printenv | grep VITE'
```

### 3. 実際のリクエストURLを確認
- DevTools > Networkタブで実際に送信されているリクエストのURLを確認

## ベストプラクティス

### 1. 環境変数の管理方法
- **開発環境**: `.env.development`ファイルを使用
- **docker-compose.yml**: 環境変数をハードコードしない、または`.env`ファイルから読み込む

```yaml
# 推奨: envファイルから読み込む
env_file:
  - .env.development
```

### 2. 動的な設定の実装
ランタイム設定を使用して、再ビルドなしで環境変数を変更可能にする：

```typescript
// config.ts
export const getApiBaseUrl = () => {
  // 優先順位: ランタイム設定 → Vite環境変数 → デフォルト
  return (window as any).__APP_CONFIG__?.API_URL
      ?? import.meta.env.VITE_API_URL
      ?? 'http://localhost:8000/api';
};

// api.ts
export const createClient = () => {
  return axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### 3. Dockerでの注意点
- `docker-compose restart`だけでは不十分な場合がある
- キャッシュが疑われる場合は完全に停止・起動：
  ```bash
  docker-compose down && docker-compose up -d
  ```
- さらに必要なら：
  ```bash
  docker-compose build --no-cache frontend
  ```

## トラブルシューティングチェックリスト

- [ ] docker-compose.ymlの環境変数を確認
- [ ] .env.developmentファイルの内容を確認
- [ ] コンテナ内に.envファイルが正しくマウントされているか確認
- [ ] Viteキャッシュ（node_modules/.vite）をクリア
- [ ] docker-compose down && up -dで完全再起動
- [ ] ブラウザのキャッシュをクリア（ハードリロード）
- [ ] localStorage/sessionStorageをクリア
- [ ] シークレットモードで確認

## 関連ファイル
- `/docker-compose.yml` - Docker Compose設定
- `/frontend/.env.development` - フロントエンド環境変数
- `/frontend/src/stores/clientAuthStore.ts` - Axios設定を含む認証ストア

## 参考資料
- [Vite環境変数のドキュメント](https://vitejs.dev/guide/env-and-mode.html)
- ChatGPTによる詳細な分析: `_Features/Prompt/vite-env-variable-cache-issue.md`

## 最終更新
2025-08-19 - 取引先企業認証機能実装時に発生した問題を解決