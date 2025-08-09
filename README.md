# CompactSkillSheetsApp - エンジニアスキルシート管理システム

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
docker exec -it compactskillsheetsapp-postgres-1 psql -U skillsheet -d skillsheet_dev
```

## Git運用ルール

1. 作業前は必ず`origin develop`をPull
2. featureブランチは最新のdevelopから作成
3. コミット前にテストを実行
4. PRマージ前にコードレビューを取得

## 開発ガイドライン

詳細は`CLAUDE.md`を参照してください。

## ライセンス

Proprietary