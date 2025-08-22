#!/bin/bash

echo "========================================="
echo "ログインテスト実行"
echo "========================================="
echo ""

# 1. データベースユーザーでのテスト
echo "1. データベース登録ユーザーテスト"
echo "-----------------------------------------"

echo "▶ SES企業管理者 (admin@example-ses.local / Admin123!)"
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example-ses.local","password":"Admin123!"}' \
  2>/dev/null | jq '.success, .data.user.email, .data.user.name' 2>/dev/null || echo "ログイン失敗"

echo ""
echo "▶ SES企業一般ユーザー (user@example-ses.local / User123!)"
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example-ses.local","password":"User123!"}' \
  2>/dev/null | jq '.success, .data.user.email, .data.user.name' 2>/dev/null || echo "ログイン失敗"

echo ""
echo "▶ クライアント企業管理者 (admin@example-client.local / Admin123!)"
curl -X POST http://localhost:8001/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example-client.local","password":"Admin123!"}' \
  2>/dev/null | jq '.success, .message' 2>/dev/null || echo "ログイン失敗"

echo ""
echo ""
echo "2. モックユーザーテスト"
echo "-----------------------------------------"

echo "▶ モック管理者 (admin@demo-ses.example.com / password123)"
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo-ses.example.com","password":"password123"}' \
  2>/dev/null | jq '.success, .data.user.email, .data.user.name' 2>/dev/null || echo "ログイン失敗"

echo ""
echo "▶ モックエンジニア (engineer@demo.example.com / password123)"
curl -X POST http://localhost:8001/api/engineer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"engineer@demo.example.com","password":"password123"}' \
  2>/dev/null | jq '.success, .data.user.email, .data.user.name' 2>/dev/null || echo "ログイン失敗"

echo ""
echo "▶ モック営業 (sales@demo-ses.example.com / password123)"
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sales@demo-ses.example.com","password":"password123"}' \
  2>/dev/null | jq '.success, .data.user.email, .data.user.name' 2>/dev/null || echo "ログイン失敗"

echo ""
echo ""
echo "========================================="
echo "テスト完了"
echo "========================================="