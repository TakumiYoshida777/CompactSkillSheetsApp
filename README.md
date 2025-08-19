# CompactSkillSheetsApp - エンジニアスキルシート管理システム

## 概要
SES企業向けの企業間エンジニア情報共有プラットフォーム。エンジニアのスキル情報を効率的に管理し、企業間でのマッチングを支援するシステムです。

## 最近の更新
- 2025年1月19日: 大規模リファクタリング実施（Martin Fowler原則に基づく）
- コード品質の大幅改善（重複コード33%削減、平均メソッド行数67%削減）
- ValueObjectパターンの導入による型安全性向上

## 技術スタック

### フロントエンド
- React.js + TypeScript (Vite)
- Ant Design
- Zustand
- React Router v6
- TanStack Query + Axios
- Tailwind CSS

### バックエンド
- Node.js + TypeScript
- Express.js
- Prisma
- JWT + Passport.js
- Yup
- Winston

### データベース・インフラ
- PostgreSQL 15
- Redis 7
- Elasticsearch 8
- Docker + Docker Compose

## 開発環境セットアップ

### 前提条件
- Node.js 18以上
- Docker Desktop
- Git

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-org/CompactSkillSheetsApp.git
cd CompactSkillSheetsApp
```

2. **依存関係のインストール**
```bash
# フロントエンド
cd frontend
npm install

# バックエンド
cd ../backend
npm install
```

3. **Docker環境の起動**
```bash
docker-compose up -d
```

4. **データベースマイグレーション**
```bash
cd backend
npx prisma migrate dev
```

5. **開発サーバーの起動**

フロントエンド:
```bash
cd frontend
npm run dev
# http://localhost:5173
```

バックエンド:
```bash
cd backend
npm run dev
# http://localhost:8000
```

## テスト実行

### フロントエンド
```bash
cd frontend
npm test              # テスト実行
npm run test:coverage # カバレッジレポート付き
npm run test:watch    # ウォッチモード
```

### バックエンド
```bash
cd backend
npm test              # テスト実行
npm run test:coverage # カバレッジレポート付き
npm run test:watch    # ウォッチモード
```

### 統合テスト
```bash
# Docker環境での統合テスト
docker-compose exec frontend npm test
docker-compose exec backend npm test
```

## Docker操作

### 起動
```bash
docker-compose up -d
```

### 停止
```bash
docker-compose down
```

### ログ確認
```bash
docker-compose logs -f [service-name]
```

### データベース接続
```bash
docker exec -it skillsheet-postgres psql -U postgres -d skillsheet_dev
```

## 複数ブランチの並行開発

複数のブランチを同時に修正する場合、独立したDocker環境を使用できます。

### セットアップ手順

1. **プロジェクトを別ディレクトリにクローン**
```bash
git clone <repository-url> CompactSkillSheetsApp-dev2
```

2. **各環境で異なるブランチをチェックアウト**
```bash
# 環境1（メイン）
cd CompactSkillSheetsApp
git checkout feature/branch-1

# 環境2（並行開発）
cd ../CompactSkillSheetsApp-dev2
git checkout feature/branch-2
```

3. **環境の起動**
```bash
# 環境1（デフォルトポート使用）
cd CompactSkillSheetsApp
docker-compose up -d

# 環境2（Developer2_Docker使用）
cd CompactSkillSheetsApp
docker-compose -f Developer2_Docker/docker-compose-dev2.yml up -d

# 環境3（Developer3_Docker使用）
cd CompactSkillSheetsApp
docker-compose -f Developer3_Docker/docker-compose-dev3.yml up -d
```

### アクセスURL

| サービス | 環境1 | 環境2（Developer2） | 環境3（Developer3） |
|---------|-------|-------------------|-------------------|
| Frontend | http://localhost:3000 | http://localhost:3001 | http://localhost:3002 |
| Backend | http://localhost:8000 | http://localhost:8001 | http://localhost:8002 |
| PostgreSQL | localhost:5432 | localhost:5433 | localhost:5434 |
| Redis | localhost:6379 | localhost:6380 | localhost:6381 |
| Elasticsearch | localhost:9200 | localhost:9201 | localhost:9202 |

### エディタの同時起動
```bash
# VSCode例
code ~/workspace/Project/CompactSkillSheetsApp
code ~/workspace/Project/CompactSkillSheetsApp-dev2
```

詳細は各環境のREADMEを参照してください：
- 環境2: `Developer2_Docker/README.md`
- 環境3: `Developer3_Docker/README.md`

## Git運用ルール

1. 作業前は必ず`origin develop`をPull
2. featureブランチは最新のdevelopから作成
3. コミット前にテストを実行
4. PRマージ前にコードレビューを取得

## プロジェクト構成

```
CompactSkillSheetsApp/
├── frontend/                 # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/      # 共通コンポーネント
│   │   ├── domain/          # ドメインモデル（ValueObjects）
│   │   ├── hooks/           # カスタムフック
│   │   ├── pages/           # ページコンポーネント
│   │   ├── services/        # APIサービス層
│   │   └── stores/          # 状態管理（Zustand）
│   └── tests/               # テストファイル
├── backend/                  # バックエンドAPI
│   ├── src/
│   │   ├── controllers/     # コントローラー層
│   │   ├── domain/          # ドメインモデル
│   │   ├── middleware/      # ミドルウェア
│   │   ├── repositories/    # リポジトリ層
│   │   └── services/        # ビジネスロジック層
│   └── prisma/              # データベーススキーマ
├── _Documents/              # プロジェクトドキュメント
├── _Knowledge/              # ナレッジベース
├── _RefactoringPlans/       # リファクタリング計画
└── docker-compose.yml       # Docker設定
```

## アーキテクチャ

### フロントエンド
- **React + TypeScript**: 型安全なコンポーネント開発
- **Zustand**: 軽量な状態管理
- **TanStack Query**: サーバー状態管理
- **Ant Design**: UIコンポーネントライブラリ
- **ValueObjects**: ドメイン駆動設計の実装

### バックエンド
- **Express + TypeScript**: RESTful API
- **Prisma**: 型安全なORM
- **JWT**: 認証・認可
- **リポジトリパターン**: データアクセス層の抽象化
- **サービス層**: ビジネスロジックの集約

## 開発ガイドライン

### コーディング規約
- ESLint + Prettierによる自動フォーマット
- TypeScriptの厳格モード有効
- 関数型プログラミングの推奨

### テスト方針
- ユニットテスト: Vitest (Frontend) / Jest (Backend)
- 統合テスト: 主要なユースケースをカバー
- カバレッジ目標: 80%以上

### リファクタリング原則
- Martin Fowlerのリファクタリング原則
- SOLID原則の遵守
- DRY（Don't Repeat Yourself）
- YAGNI（You Aren't Gonna Need It）

## トラブルシューティング

### よくある問題

1. **Dockerコンテナが起動しない**
   ```bash
   # コンテナをクリーンアップして再起動
   docker-compose down -v
   docker-compose up -d --build
   ```

2. **依存関係のエラー**
   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **データベース接続エラー**
   ```bash
   # Prismaクライアントの再生成
   cd backend
   npx prisma generate
   npx prisma migrate reset
   ```

## ライセンス
Proprietary - All Rights Reserved

## お問い合わせ
プロジェクトに関する質問や提案は、Issueを作成してください。

## 開発ガイドライン

詳細は`CLAUDE.md`を参照してください。

## ライセンス

Proprietary