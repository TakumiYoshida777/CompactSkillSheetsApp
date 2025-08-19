# CORSエラー調査報告書

## 発生日時
2025年8月19日

## エラー内容
```
Access to XMLHttpRequest at 'http://localhost:8000/api/auth/login' from origin 'http://localhost:3001' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000' that is not equal to the supplied origin.
```

## 環境構成

### Port 3000（compactskillsheetsapp） - 正常動作
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8000
- CORS設定: `http://localhost:3000`

### Port 3001（skillsheet-dev2） - エラー発生
- フロントエンド: http://localhost:3001  
- バックエンド: http://localhost:8001
- CORS設定: `http://localhost:3001`

## 問題の原因

Port 3001のフロントエンドが、間違ったバックエンド（Port 8000）にアクセスしようとしていることが原因。

### 詳細な調査結果

1. **Docker環境変数の確認**
   - skillsheet-frontend-dev2コンテナの環境変数:
     - `VITE_API_URL=http://localhost:8001/api/v1`
   - skillsheet-backend-dev2コンテナの環境変数:
     - `CORS_ORIGIN=http://localhost:3001`
     - `PORT=8000`（コンテナ内部ポート）

2. **問題点**
   - フロントエンド（Port 3001）のauthStoreが`http://localhost:8000/api/auth/login`にアクセス
   - 本来は`http://localhost:8001/api/auth/login`にアクセスすべき
   - Port 8000のバックエンドはCORS設定で`http://localhost:3000`のみ許可
   - そのため、Port 3001からのアクセスが拒否される

## 根本原因

フロントエンドのコード内で、API URLが環境変数から正しく読み込まれていない、またはハードコーディングされている可能性がある。

## 解決策

### 1. 即時対応
フロントエンドのauthStore.tsまたは関連するAPI設定ファイルで、APIのベースURLが環境変数（`VITE_API_URL`）から正しく読み込まれているか確認し、修正する。

### 2. 確認事項
- `/frontend/src/stores/authStore.ts`のAPI URL設定
- `/frontend/src/lib/axios.ts`のベースURL設定
- その他のAPI呼び出し箇所でハードコーディングされていないか

### 3. 修正方法
```typescript
// 誤った設定例
const API_URL = 'http://localhost:8000/api';

// 正しい設定例
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

## 影響範囲
- Port 3001で動作するdev2環境のログイン機能
- その他のAPI通信機能全般

## 再発防止策
1. 環境変数の使用を徹底し、ハードコーディングを避ける
2. 複数環境を同時に起動する場合のポート設定をドキュメント化
3. Docker Composeファイルで環境変数の設定を明確にする