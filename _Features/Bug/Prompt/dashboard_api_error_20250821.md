# ダッシュボードAPI接続エラーの調査依頼

## 問題の概要
SESスキル管理システムのダッシュボード画面でAPIからデータを取得できず、「データの取得に失敗しました」というエラーが表示されています。AIが誤解しない粒度で回答してください。

## エラーの詳細

### ブラウザコンソールのエラー
```
GET http://localhost:8001/api/v1/analytics/dashboard 400 (Bad Request)
[Axios Response Error] Status: 400
[Axios Response Error] Data: {success: false, message: '入力データが不正です'}
```

### 画面表示
```
エラー
データの取得に失敗しました。ページを更新してください。
```

## 現在の環境構成

### コンテナ構成
```bash
# 実行中のコンテナ
dev2_compactskillsheetsapp-backend-1   # ポート8000で動作
dev2_compactskillsheetsapp-frontend-1  # ポート3001で動作
skillsheet-postgres-dev2                # ポート5433で動作（Dev2データベース）
```

### フロントエンド環境変数
```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api/v1

# frontend/.env.local
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

### バックエンド環境変数
```bash
DATABASE_URL=postgresql://skillsheet:password@host.docker.internal:5433/skillsheet_dev2
JWT_SECRET=dev-jwt-secret-change-in-production
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## 実施した対策と結果

### 1. モックデータの削除
**実施内容**:
- `frontend/src/api/ses/dashboardApi.ts`からモックデータのフォールバック処理を削除
- エラー時にモックデータを返すのではなく、実際のエラーをスローするように変更

**結果**: エラーが表示されるようになったが、データ取得は失敗

### 2. バックエンドAPIの実装修正
**実施内容**:
- `backend/src/routes/v1/analytics.routes.ts`でハードコードされたダミーデータを削除
- 実際のコントローラー（`analyticsController`）を使用するように変更
- Prismaクエリを現在のスキーマに合わせて修正
  - `projects` → `engineerProjects`
  - `status` → `currentStatus`
  - `approach.engineer.companyId` → `approach.fromCompanyId`
  - `ACCEPTED` → `REPLIED`（ENUMの値を修正）

**結果**: curlコマンドでは正常にデータ取得可能

### 3. 認証とミドルウェアの修正
**実施内容**:
- JWTトークンのペイロード構造を修正（`userId`を正しく処理）
- companyMiddlewareでcompanyIdを正しく設定
- RBACミドルウェアでroleがundefinedの場合の処理を追加

**結果**: curlでのAPI呼び出しは成功

### 4. ポート設定の修正
**実施内容**:
- フロントエンドがポート8001にアクセスしていたのを8000に修正
- `.env.local`の`VITE_API_URL`を更新
- フロントエンドコンテナを再起動

**結果**: **変化なし、依然として8001にアクセスしている**

## 動作確認の結果

### curlコマンドでの確認（成功）
```bash
curl -s -H "Authorization: Bearer [TOKEN]" http://localhost:8000/api/v1/analytics/dashboard

# 結果: 正常にデータが返される
{
  "success": true,
  "data": {
    "kpi": {
      "totalEngineers": 10,
      "activeEngineers": 0,
      "waitingEngineers": 10,
      "monthlyRevenue": 0,
      "acceptanceRate": 17
    },
    ...
  }
}
```

### ブラウザからのアクセス（失敗）
- URLが`http://localhost:8001/api/v1/analytics/dashboard`になっている
- 環境変数を8000に変更したにも関わらず、8001にアクセスし続けている

## 考えられる原因

1. **環境変数が反映されていない**
   - Viteのビルドキャッシュが残っている可能性
   - コンテナ再起動だけでは不十分な可能性

2. **axiosインスタンスの設定問題**
   - `frontend/src/lib/axios.ts`でbaseURLがハードコードされている可能性
   - 環境変数の読み込みタイミングの問題

3. **別の設定ファイルの存在**
   - `.env.development`や`.env.production`など、優先度の高い設定ファイルが存在する可能性

4. **ブラウザキャッシュ**
   - Service Workerやブラウザキャッシュが古い設定を保持している可能性

## 質問

1. **Viteアプリケーションで環境変数が更新されない場合の対処法を教えてください**
   - 特に、`.env.local`を変更後もブラウザが古いAPIエンドポイントにアクセスし続ける問題

2. **フロントエンドコンテナ内で環境変数を確認する方法**
   - 実際にViteが読み込んでいる環境変数の値を確認したい

3. **axiosのbaseURLを動的に変更する最適な方法**
   - 環境変数の変更が即座に反映されるような実装方法

4. **Docker環境でViteの開発サーバーを完全にリセットする方法**
   - キャッシュやビルド成果物を完全にクリアして再起動する手順

## 追加情報
- フレームワーク: React + TypeScript + Vite
- HTTPクライアント: Axios
- 状態管理: Zustand + TanStack Query
- コンテナ: Docker Compose
- バックエンド: Node.js + Express + Prisma

## 期待する回答
1. なぜ環境変数の変更が反映されないのか、その原因
2. 環境変数を確実に反映させる具体的な手順
3. 今後同様の問題を防ぐためのベストプラクティス