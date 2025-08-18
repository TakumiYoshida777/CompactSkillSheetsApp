# SkillSheetsMgmtAPp - エンジニアスキルシート管理システム

## 概要
SES企業向けの企業間エンジニア情報共有プラットフォーム

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

1. **依存関係のインストール**
```bash
# フロントエンド
cd frontend
npm install

# バックエンド
cd ../backend
npm install
```

2. **Docker環境の起動**
```bash
docker-compose up -d
```

3. **データベースマイグレーション**
```bash
cd backend
npx prisma migrate dev
```

4. **開発サーバーの起動**

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
npm test
npm run test:coverage
```

### バックエンド
```bash
cd backend
npm test
npm run test:coverage
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
docker exec -it SkillSheetsMgmtAPp-postgres-1 psql -U skillsheet -d skillsheet_dev
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

## 開発ガイドライン

詳細は`CLAUDE.md`を参照してください。

## ライセンス

Proprietary