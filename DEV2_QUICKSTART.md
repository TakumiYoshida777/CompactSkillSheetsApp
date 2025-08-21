# Dev2環境 クイックスタートガイド

## 概要
このガイドは、Dev2環境を正しく起動し、ポート8001（Dev1）への誤接続を防ぐための手順書です。

## 前提条件
- 複数の開発環境（Dev1、Dev2、Dev3）が同一マシンで並列稼働
- 各環境は異なるポート番号で分離されている

## ポート構成
| 環境 | フロントエンド | バックエンド | PostgreSQL | Redis | Elasticsearch |
|------|---------------|-------------|------------|-------|---------------|
| Dev1 | 3000 | 8000 | 5432 | 6379 | 9200 |
| Dev2 | 3001 | 8001 | 5433 | 6380 | 9201 |
| Dev3 | 3002 | 8002 | 5434 | 6381 | 9202 |

## 問題が発生した場合の完全リセット手順

### 1. 自動リセット（推奨）
```bash
# リセットスクリプトを実行
./scripts/reset-dev2.sh
```

### 2. 手動リセット

#### Step 1: ブラウザキャッシュのクリア
1. Chrome DevToolsを開く（F12）
2. **Application**タブ → **Service Workers** → **Unregister**をクリック
3. **Network**タブ → **Disable cache**にチェック
4. ブラウザの更新ボタンを長押し → **Empty cache and hard reload**を選択

#### Step 2: Viteキャッシュのクリア
```bash
cd frontend
rm -rf node_modules/.vite
```

#### Step 3: Dockerコンテナの再起動
```bash
# Dev2環境を停止（ボリュームも削除）
docker compose -p dev2 down -v

# Dev2環境を再ビルド・起動
docker compose -p dev2 -f docker-compose.dev2.yml up -d --build
```

#### Step 4: フロントエンドの起動
```bash
cd frontend

# キャッシュを強制クリアして起動
npm run dev:dev2:force

# または
npm run clean:dev2
```

## 環境変数の確認方法

### フロントエンドで環境変数を確認
ブラウザのコンソールで以下を実行：
```javascript
console.table(import.meta.env)
```

以下の値が正しいことを確認：
- `VITE_API_BASE_URL`: `http://localhost:8001/api/v1`
- `VITE_APP_PORT`: `3001`
- `VITE_APP_ENV`: `dev2`

### APIエンドポイントの確認
ブラウザのNetworkタブで、APIリクエストが以下のURLに向かっていることを確認：
- ✅ 正しい: `http://localhost:8001/api/v1/...`（Dev2のAPI）
- ❌ 間違い: `http://localhost:8000/api/v1/...`（これはDev1）

## 日常の起動手順

### 1. バックエンドの起動
```bash
# Dev2専用のdocker-composeを使用
docker compose -p dev2 -f docker-compose.dev2.yml up -d
```

### 2. フロントエンドの起動
```bash
cd frontend

# Dev2モードで起動（ポート3001）
npm run dev:dev2

# キャッシュに問題がある場合
npm run dev:dev2:force
```

### 3. アクセス
- フロントエンド: http://localhost:3001
- バックエンドAPI: http://localhost:8001/api/v1

## トラブルシューティング

### 問題: APIが8000に接続してしまう
**原因**: Viteのキャッシュまたはブラウザキャッシュ

**解決策**:
1. `npm run clean:dev2`を実行
2. ブラウザでハードリロード（Shift + F5）
3. Service Workerをアンレジスター

### 問題: "Port already in use"エラー
**原因**: 他の環境のコンテナが起動中

**解決策**:
```bash
# 全環境の状態確認
docker ps

# 特定環境のみ停止
docker compose -p dev1 stop  # Dev1を停止
docker compose -p dev3 stop  # Dev3を停止
```

### 問題: 環境変数が反映されない
**原因**: Viteの開発サーバーが古い設定をキャッシュ

**解決策**:
1. Viteサーバーを停止（Ctrl+C）
2. `rm -rf frontend/node_modules/.vite`
3. `npm run dev:dev2:force`で再起動

## デバッグ用コマンド

### Docker状態確認
```bash
# Dev2環境のコンテナ状態
docker compose -p dev2 ps

# ネットワーク確認
docker network ls | grep dev2

# ログ確認
docker compose -p dev2 logs -f backend
docker compose -p dev2 logs -f frontend
```

### ポート使用状況確認
```bash
# Mac/Linux
lsof -i :3001  # フロントエンド
lsof -i :8001  # バックエンド

# 全ポート確認
netstat -an | grep -E ':(3000|3001|3002|8000|8001|8002)'
```

## 重要な注意事項

1. **プロジェクト名の分離**: 必ず`-p dev2`オプションを使用
2. **環境変数ファイル**: `.env.development.dev2`が存在することを確認
3. **ブラウザタブ**: 複数環境を同時に開く場合は、別のブラウザプロファイルを推奨
4. **Service Worker**: PWAを使用している場合は定期的にクリア

## 関連ファイル
- Docker設定: `docker-compose.dev2.yml`
- フロントエンド環境変数: `frontend/.env.development.dev2`
- バックエンド環境変数: `backend/.env.dev2`
- リセットスクリプト: `scripts/reset-dev2.sh`
- HTTP設定: `frontend/src/lib/http.ts`

## サポート
問題が解決しない場合は、以下の情報と共に報告してください：
1. `docker compose -p dev2 ps`の出力
2. ブラウザコンソールのエラー
3. Networkタブで失敗しているリクエストのURL