# プロジェクト開発コマンド集

## 開発サーバー起動
```bash
# Docker環境起動
docker-compose up -d

# フロントエンド開発サーバー
cd frontend
npm run dev

# バックエンド開発サーバー
cd backend
npm run dev
```

## テスト実行
### フロントエンド
```bash
cd frontend
# テスト実行
npm test -- --run

# カバレッジ付きテスト
npm test -- --coverage --run

# ウォッチモード
npm test
```

### バックエンド
```bash
cd backend
# テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# 特定ファイルのテスト
npm test -- <ファイル名>
```

## コード品質チェック
### フロントエンド
```bash
cd frontend
# ESLint
npm run lint

# TypeScript型チェック
npm run type-check

# Prettier フォーマット
npm run format
```

### バックエンド
```bash
cd backend
# ESLint
npm run lint

# TypeScript型チェック
npm run type-check
```

## ビルド
```bash
# フロントエンドビルド
cd frontend
npm run build

# バックエンドビルド
cd backend
npm run build
```

## データベース操作
```bash
# マイグレーション実行
cd backend
npx prisma migrate dev

# マイグレーション作成
npx prisma migrate dev --name <マイグレーション名>

# データベース接続
docker exec -it SkillSheetsMgmtAPp-postgres-1 psql -U skillsheet -d skillsheet_dev
```

## Git操作
```bash
# ステータス確認
git status

# 差分確認
git diff

# コミット（日本語メッセージ）
git add .
git commit -m "feat: 機能説明"

# プルリクエスト作成
gh pr create --title "タイトル" --body "説明"
```

## Docker操作
```bash
# コンテナ起動
docker-compose up -d

# コンテナ停止
docker-compose down

# ログ確認
docker-compose logs -f [サービス名]

# コンテナ再起動
docker-compose restart [サービス名]
```

## システム確認
```bash
# Node.jsバージョン
node -v

# npmバージョン
npm -v

# Docker状態確認
docker ps

# ポート使用状況確認
lsof -i :3000  # フロントエンド
lsof -i :8000  # バックエンド
```