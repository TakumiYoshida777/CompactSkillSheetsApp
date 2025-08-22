#!/bin/bash

echo "=== ログインテスト開始 ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local endpoint=$3
    local description=$4
    
    echo "Testing: $description"
    echo "Email: $email"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -X POST "$endpoint" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ ログイン成功${NC}"
        
        # Extract and test refresh token
        refresh_token=$(echo "$response" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
        if [ ! -z "$refresh_token" ]; then
            echo "  Testing refresh token..."
            refresh_response=$(curl -s -X POST "http://localhost:8001/api/auth/refresh" \
                -H "Content-Type: application/json" \
                -d "{\"refreshToken\":\"$refresh_token\"}")
            
            if echo "$refresh_response" | grep -q '"success":true'; then
                echo -e "  ${GREEN}✓ リフレッシュトークン成功${NC}"
            else
                echo -e "  ${RED}✗ リフレッシュトークン失敗${NC}"
                echo "  Response: $refresh_response"
            fi
        fi
    else
        echo -e "${RED}✗ ログイン失敗${NC}"
        echo "Response: $response"
    fi
    echo "---"
    echo ""
}

# Test SES Admin
test_login "admin@demo-ses.example.com" "password123" \
    "http://localhost:8001/api/auth/login" \
    "SES企業管理者"

# Test Engineer
test_login "engineer@demo.example.com" "password123" \
    "http://localhost:8001/api/auth/engineer/login" \
    "エンジニア"

# Test Sales
test_login "sales@demo-ses.example.com" "password123" \
    "http://localhost:8001/api/auth/login" \
    "営業担当者"

# Test Client
test_login "admin@example-client.local" "Admin123!" \
    "http://localhost:8001/api/auth/client/login" \
    "クライアント管理者"

echo "=== ログインテスト完了 ==="
