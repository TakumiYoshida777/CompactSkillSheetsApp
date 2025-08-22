#!/bin/bash

# SES企業管理者ログインテスト
echo "SES企業管理者ログインテスト..."
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example-ses.local\",\"password\":\"Admin123!\"}"

echo ""
echo ""

# エンジニアログインテスト（モックユーザー）
echo "エンジニアログインテスト..."
curl -X POST http://localhost:8001/api/engineer/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"engineer@demo.example.com\",\"password\":\"password123\"}"