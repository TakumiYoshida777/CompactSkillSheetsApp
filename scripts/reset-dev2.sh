#!/bin/bash

# ===============================================
# Dev2環境完全リセットスクリプト
# ===============================================
# 用途: Dev2環境のキャッシュクリアと再起動
# 複数環境並列開発での環境分離問題を解決
# ===============================================

set -e

echo "================================================"
echo "       Dev2環境リセットスクリプト"
echo "================================================"
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 現在のディレクトリ確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}プロジェクトルート: ${PROJECT_ROOT}${NC}"
echo ""

# ステップ1: 既存のDev2コンテナを停止
echo -e "${YELLOW}[1/7] 既存のDev2コンテナを停止中...${NC}"
cd "$PROJECT_ROOT"
docker compose -p dev2 down || true
echo -e "${GREEN}✓ コンテナ停止完了${NC}"
echo ""

# ステップ2: Viteキャッシュをクリア
echo -e "${YELLOW}[2/7] Viteキャッシュをクリア中...${NC}"
if [ -d "$PROJECT_ROOT/frontend/node_modules/.vite" ]; then
    rm -rf "$PROJECT_ROOT/frontend/node_modules/.vite"
    echo -e "${GREEN}✓ Viteキャッシュをクリアしました${NC}"
else
    echo -e "${BLUE}→ Viteキャッシュは存在しません${NC}"
fi
echo ""

# ステップ3: Dev2のDockerボリュームをクリア（オプション）
echo -e "${YELLOW}[3/7] Dev2のDockerボリュームを確認中...${NC}"
read -p "Dockerボリュームもクリアしますか？ (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose -p dev2 down -v
    echo -e "${GREEN}✓ ボリュームをクリアしました${NC}"
else
    echo -e "${BLUE}→ ボリュームは保持されます${NC}"
fi
echo ""

# ステップ4: 環境変数ファイルの確認
echo -e "${YELLOW}[4/7] 環境変数ファイルを確認中...${NC}"

# フロントエンド環境変数
if [ ! -f "$PROJECT_ROOT/frontend/.env.development.dev2" ]; then
    echo -e "${RED}警告: frontend/.env.development.dev2 が存在しません${NC}"
    echo "デフォルト設定を作成しています..."
    cat > "$PROJECT_ROOT/frontend/.env.development.dev2" << EOF
# Dev2環境専用の環境変数設定
VITE_API_URL=http://localhost:8001/api
VITE_API_BASE_URL=http://localhost:8001/api/v1
VITE_WS_URL=ws://localhost:8001
VITE_APP_PORT=3001
VITE_APP_ENV=dev2
VITE_ENV_NAME=development.dev2
VITE_DEBUG_MODE=true
EOF
    echo -e "${GREEN}✓ フロントエンド環境変数ファイルを作成しました${NC}"
else
    echo -e "${GREEN}✓ フロントエンド環境変数ファイルが存在します${NC}"
fi

# バックエンド環境変数
if [ ! -f "$PROJECT_ROOT/backend/.env.dev2" ]; then
    echo -e "${YELLOW}警告: backend/.env.dev2 が存在しません${NC}"
    echo -e "${BLUE}→ docker-compose.dev2.yml の環境変数を使用します${NC}"
else
    echo -e "${GREEN}✓ バックエンド環境変数ファイルが存在します${NC}"
fi
echo ""

# ステップ5: Docker Composeファイルの確認
echo -e "${YELLOW}[5/7] Docker Composeファイルを確認中...${NC}"
if [ -f "$PROJECT_ROOT/docker-compose.dev2.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.dev2.yml が存在します${NC}"
else
    echo -e "${RED}エラー: docker-compose.dev2.yml が存在しません${NC}"
    echo "スクリプトを終了します"
    exit 1
fi
echo ""

# ステップ6: Dev2コンテナを起動
echo -e "${YELLOW}[6/7] Dev2コンテナを起動中...${NC}"
docker compose -p dev2 -f docker-compose.dev2.yml up -d --build

# 起動状態の確認
sleep 5
docker compose -p dev2 ps
echo -e "${GREEN}✓ コンテナ起動完了${NC}"
echo ""

# ステップ7: ブラウザキャッシュクリアの案内
echo -e "${YELLOW}[7/7] ブラウザ設定の案内${NC}"
echo ""
echo -e "${BLUE}========== 重要：ブラウザでの作業 ==========${NC}"
echo "1. Chrome DevToolsを開く (F12)"
echo "2. Applicationタブ → Service Workers → Unregister"
echo "3. Networkタブ → Disable cacheにチェック"
echo "4. ブラウザの更新ボタンを長押し → 'Empty cache and hard reload'"
echo -e "${BLUE}============================================${NC}"
echo ""

# 環境情報の表示
echo -e "${GREEN}========== Dev2環境情報 ==========${NC}"
echo "フロントエンド: http://localhost:3001"
echo "バックエンド API: http://localhost:8001"
echo "PostgreSQL: localhost:5433"
echo "Redis: localhost:6380"
echo "Elasticsearch: http://localhost:9201"
echo -e "${GREEN}===================================${NC}"
echo ""

# フロントエンド起動コマンドの案内
echo -e "${YELLOW}フロントエンドを起動するには:${NC}"
echo "cd $PROJECT_ROOT/frontend"
echo "npm run dev:dev2:force"
echo ""

echo -e "${GREEN}✨ Dev2環境のリセットが完了しました！${NC}"