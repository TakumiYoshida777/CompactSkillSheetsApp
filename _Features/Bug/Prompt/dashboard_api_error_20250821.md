# ダッシュボードAPI接続エラーの調査依頼（複数環境並列開発環境）

## 問題の概要
SESスキル管理システムを複数の開発環境で並列開発している環境において、ダッシュボード画面でAPIからデータを取得できず、「データの取得に失敗しました」というエラーが表示されています。AIが誤解しない粒度で回答してください。

## 重要な前提条件
- **複数の開発環境が同一マシン上で並列稼働している**
- **各環境は異なるポート番号を使用して分離されている**
- **同じアプリケーションを複数チームが並列で開発している**
- **環境間の設定混在や干渉を防ぐ必要がある**

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

### 複数環境の構成例
```bash
# Dev1環境のコンテナ（別チームが使用）
dev1_compactskillsheetsapp-backend-1   # ポート8001で動作
dev1_compactskillsheetsapp-frontend-1  # ポート3000で動作
skillsheet-postgres-dev1                # ポート5432で動作

# Dev2環境のコンテナ（現在作業中の環境）
dev2_compactskillsheetsapp-backend-1   # ポート8000で動作
dev2_compactskillsheetsapp-frontend-1  # ポート3001で動作
skillsheet-postgres-dev2                # ポート5433で動作

# Dev3環境のコンテナ（別機能開発チームが使用）
dev3_compactskillsheetsapp-backend-1   # ポート8002で動作
dev3_compactskillsheetsapp-frontend-1  # ポート3002で動作
skillsheet-postgres-dev3                # ポート5434で動作
```

### Dev2環境の環境変数設定
```bash
# frontend/.env（Dev2環境用）
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_PORT=3001  # Dev2環境のフロントエンドポート

# frontend/.env.local（Dev2環境用）
VITE_API_URL=http://localhost:8000/api  # Dev2のバックエンドポート
VITE_WS_URL=ws://localhost:8000
```

### バックエンド環境変数（Dev2環境用）
```bash
DATABASE_URL=postgresql://skillsheet:password@host.docker.internal:5433/skillsheet_dev2
JWT_SECRET=dev2-jwt-secret-change-in-production  # 環境ごとに異なるシークレット
CORS_ORIGIN=http://localhost:3001  # Dev2のフロントエンドポートのみ許可
PORT=8000  # Dev2のバックエンドポート
```

### 環境分離の問題点
- **問題**: フロントエンドが誤ってDev1環境のAPI（ポート8001）にアクセスしている
- **期待**: Dev2環境のAPI（ポート8000）にアクセスすべき
- **影響**: 異なる環境のデータが混在する可能性がある

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
- フロントエンドがポート8001（Dev1環境）にアクセスしていたのを8000（Dev2環境）に修正
- `.env.local`の`VITE_API_URL`を更新
- フロントエンドコンテナを再起動

**結果**: **変化なし、依然として8001（Dev1環境）にアクセスしている**
- **考えられる原因**: 環境変数のキャッシュ、または他の環境設定ファイルの干渉

## 動作確認の結果

### curlコマンドでの確認（成功）
```bash
# Dev2環境のAPIエンドポイントへの直接アクセス
curl -s -H "Authorization: Bearer [TOKEN]" http://localhost:8000/api/v1/analytics/dashboard

# 結果: Dev2環境から正常にデータが返される
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
- **問題**: URLが`http://localhost:8001/api/v1/analytics/dashboard`（Dev1環境）になっている
- **期待**: `http://localhost:8000/api/v1/analytics/dashboard`（Dev2環境）にアクセスすべき
- **症状**: 環境変数を8000に変更したにも関わらず、Dev1環境（8001）にアクセスし続けている
- **影響**: Dev1環境のバックエンドが起動していない場合、接続エラーになる

## 考えられる原因（複数環境特有の問題）

1. **環境変数の混在**
   - 複数環境で共通の環境変数ファイルを参照している可能性
   - Viteのビルドキャッシュが他の環境の設定を保持している可能性
   - Docker Composeのプロジェクト名が適切に分離されていない可能性

2. **ポートマッピングの競合**
   - 複数のDockerネットワークが同じポートにバインドしようとしている
   - ホストマシンのポートフォワーディングが競合している

3. **axiosインスタンスの設定問題**
   - `frontend/src/lib/axios.ts`でbaseURLがハードコードされている可能性
   - 環境変数の読み込み順序が他の環境に影響されている
   - 複数環境間で共有されているnode_modulesキャッシュの問題

4. **Dockerボリュームの共有問題**
   - 複数環境が同じボリュームをマウントしている可能性
   - ビルド成果物が環境間で混在している

5. **ブラウザ・開発ツールのキャッシュ**
   - 同じlocalhostドメインで複数環境を切り替えているため、ブラウザが混乱
   - Service Workerが古い環境の設定を保持している

## 質問

1. **複数環境で並列開発している際のVite環境変数管理のベストプラクティス**
   - 同一マシン上で複数の開発環境（Dev1、Dev2、Dev3）を運用する際の環境変数の分離方法
   - `.env.local`を変更後もブラウザが別環境のAPIエンドポイントにアクセスし続ける問題の解決策

2. **Docker Composeで複数環境を完全に分離する方法**
   - プロジェクト名、ネットワーク、ボリュームを環境ごとに分離する設定
   - 環境間でポート番号やリソースが競合しないようにする方法

3. **フロントエンドコンテナ内で環境変数を確認・デバッグする方法**
   - 実際にViteが読み込んでいる環境変数の値を確認する手順
   - 複数環境が混在している場合の環境変数の優先順位の確認方法

4. **axiosのbaseURLを環境別に動的に設定する方法**
   - 環境変数の変更が即座に反映されるような実装方法
   - 複数環境で同じコードベースを使用する際のAPI接続先の切り替え方法

5. **複数環境でのキャッシュクリア戦略**
   - Viteのビルドキャッシュを環境別に管理する方法
   - Docker環境で特定の環境のみを完全にリセットする手順
   - ブラウザキャッシュが複数環境間で混在しないようにする方法

## 追加情報
- フレームワーク: React + TypeScript + Vite
- HTTPクライアント: Axios
- 状態管理: Zustand + TanStack Query
- コンテナ: Docker Compose
- バックエンド: Node.js + Express + Prisma
- **開発環境数**: 同一マシン上で3つ以上の環境を並列運用
- **開発チーム**: 複数チームが同時に異なる機能を開発

## 期待する回答
1. **複数環境での環境変数混在の原因と解決策**
   - なぜDev2環境がDev1環境のポートにアクセスしてしまうのか
   - 環境変数を確実に分離・反映させる具体的な手順

2. **複数環境並列開発のためのDocker設定**
   - docker-compose.ymlの環境別設定方法
   - プロジェクト名、ネットワーク、ボリュームの分離設定例

3. **環境切り替えのベストプラクティス**
   - 開発者が環境を切り替える際の手順
   - 環境間の干渉を防ぐための設定方法
   - CI/CD環境への展開を考慮した構成

4. **トラブルシューティング手順**
   - 環境変数が正しく設定されているか確認する方法
   - キャッシュクリアの正しい手順
   - 環境間の設定混在を検出する方法