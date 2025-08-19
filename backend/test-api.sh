#!/bin/bash

echo "=== 取引先・アプローチ管理API テスト ==="

API_URL="http://localhost:8000/api/v1"
COMPANY_ID="1"
AUTH_TOKEN="test-token"

echo ""
echo "1. ヘルスチェック"
curl -s "$API_URL/health" | python3 -m json.tool

echo ""
echo "2. 取引先一覧取得"
curl -s -H "X-Company-ID: $COMPANY_ID" \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     "$API_URL/business-partners" | python3 -m json.tool | head -20

echo ""
echo "3. メールテンプレート一覧取得"
curl -s -H "X-Company-ID: $COMPANY_ID" \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     "$API_URL/approaches/templates" | python3 -m json.tool | head -20

echo ""
echo "4. アプローチ履歴取得"
curl -s -H "X-Company-ID: $COMPANY_ID" \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     "$API_URL/approaches" | python3 -m json.tool | head -20

echo ""
echo "=== テスト完了 ==="