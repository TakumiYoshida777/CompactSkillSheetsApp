#!/bin/bash

# Feature Flag テストスクリプト（簡易版）
echo "========================================"
echo "   Feature Flag API テスト"
echo "========================================"
echo ""

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API設定
API_BASE="http://localhost:8000"

# 1. ヘルスチェック
echo "📝 Testing: ヘルスチェック"
response=$(curl -s "$API_BASE/health")
if [[ $response == *"OK"* ]]; then
    echo -e "   ${GREEN}✅ Passed${NC}"
else
    echo -e "   ${RED}❌ Failed${NC}"
fi
echo ""

# 2. 暫定実装API（現在稼働中）
echo "📝 Testing: 暫定実装API (/api/v1/partner-list)"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/v1/partner-list?page=1&limit=10")
if [[ $response == "200" ]]; then
    echo -e "   ${GREEN}✅ Status: 200 OK${NC}"
    data=$(curl -s "$API_BASE/api/v1/partner-list?page=1&limit=10")
    count=$(echo $data | jq '. | length' 2>/dev/null || echo "0")
    echo "   データ件数: $count"
    
    # 最初のデータを表示
    if [[ $count -gt 0 ]]; then
        company=$(echo $data | jq -r '.[0].companyName' 2>/dev/null || echo "N/A")
        echo "   最初の企業: $company"
    fi
elif [[ $response == "401" ]]; then
    echo -e "   ${YELLOW}⚠️  認証が必要（想定内）${NC}"
else
    echo -e "   ${RED}❌ Status: $response${NC}"
fi
echo ""

# 3. 正式実装API
echo "📝 Testing: 正式実装API (/api/business-partners)"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/business-partners?page=1&limit=10")
if [[ $response == "200" ]]; then
    echo -e "   ${GREEN}✅ Status: 200 OK${NC}"
    data=$(curl -s "$API_BASE/api/business-partners?page=1&limit=10")
    
    # データ構造の確認
    if echo $data | jq -e '.data' >/dev/null 2>&1; then
        echo "   レスポンス形式: 新実装（data/totalフィールドあり）"
        count=$(echo $data | jq '.data | length' 2>/dev/null || echo "0")
        total=$(echo $data | jq '.total' 2>/dev/null || echo "0")
        echo "   データ件数: $count / 総件数: $total"
    elif echo $data | jq -e '.partners' >/dev/null 2>&1; then
        echo "   レスポンス形式: 旧実装（partnersフィールドあり）"
        count=$(echo $data | jq '.partners | length' 2>/dev/null || echo "0")
        echo "   パートナー数: $count"
    else
        echo "   レスポンス形式: 不明"
    fi
elif [[ $response == "401" ]]; then
    echo -e "   ${YELLOW}⚠️  認証が必要（想定内）${NC}"
elif [[ $response == "500" ]]; then
    echo -e "   ${RED}❌ サーバーエラー${NC}"
else
    echo -e "   ${RED}❌ Status: $response${NC}"
fi
echo ""

# 4. 現在のFeature Flag設定を確認
echo "🔄 Feature Flag 設定確認"
echo "----------------------------------------"
if [ -f "../.env.development" ]; then
    use_new_api=$(grep "USE_NEW_BP_API" ../.env.development | cut -d'=' -f2 | tr -d ' ' | head -1)
    if [[ $use_new_api == "true" ]]; then
        echo -e "USE_NEW_BP_API: ${GREEN}true${NC} (新実装を使用)"
    else
        echo -e "USE_NEW_BP_API: ${YELLOW}false${NC} (旧実装を使用)"
    fi
else
    echo -e "${RED}⚠️  .env.developmentファイルが見つかりません${NC}"
fi
echo ""

# 5. 推奨事項
echo "💡 推奨される次のステップ:"
echo "----------------------------------------"
echo "1. データマイグレーションの実行:"
echo "   npx ts-node scripts/migrate-business-partners.ts migrate"
echo ""
echo "2. Feature Flagを有効化してテスト:"
echo "   USE_NEW_BP_API=true (.env.developmentを編集)"
echo "   docker-compose restart backend"
echo ""
echo "3. 問題がある場合の切り戻し:"
echo "   USE_NEW_BP_API=false"
echo "   docker-compose restart backend"
echo ""