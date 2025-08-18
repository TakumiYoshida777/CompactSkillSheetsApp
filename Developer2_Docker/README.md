# 複数環境での並行開発ガイド

## 概要
このディレクトリには、複数のブランチを同時に修正するための独立したDocker環境設定が含まれています。

## 使用方法

### 1. プロジェクトのクローン作成
```bash
# 別のディレクトリにプロジェクトをクローン
cd ~/workspace/Project
git clone <repository-url> CompactSkillSheetsApp-dev2
```

### 2. 環境の起動

#### 環境1（メイン環境）
```bash
# オリジナルのプロジェクトディレクトリで
cd ~/workspace/Project/CompactSkillSheetsApp
git checkout feature/branch-1
docker-compose up -d
```

アクセスURL:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200

#### 環境2（並行開発環境）
```bash
# クローンしたプロジェクトディレクトリで
cd ~/workspace/Project/CompactSkillSheetsApp-dev2
git checkout feature/branch-2

# DevelopersDockerの設定を使用
docker-compose -f DevelopersDocker/docker-compose-dev2.yml up -d
```

アクセスURL:
- Frontend: http://localhost:3001
- Backend: http://localhost:8001
- PostgreSQL: localhost:5433
- Redis: localhost:6380
- Elasticsearch: http://localhost:9201

### 3. エディタの起動
```bash
# VSCode例
# ターミナル1
code ~/workspace/Project/CompactSkillSheetsApp

# ターミナル2
code ~/workspace/Project/CompactSkillSheetsApp-dev2
```

## ポート割り当て表

| サービス | 環境1（デフォルト） | 環境2 |
|---------|-------------------|--------|
| Frontend | 3000 | 3001 |
| Backend | 8000 | 8001 |
| Backend Debug | 9229 | 9230 |
| PostgreSQL | 5432 | 5433 |
| Redis | 6379 | 6380 |
| Elasticsearch | 9200 | 9201 |
| Elasticsearch Transport | 9300 | 9301 |

## 環境の停止

```bash
# 環境1
docker-compose down

# 環境2
docker-compose -f DevelopersDocker/docker-compose-dev2.yml down
```

## 環境の削除（ボリューム含む）

```bash
# 環境1
docker-compose down -v

# 環境2
docker-compose -f DevelopersDocker/docker-compose-dev2.yml down -v
```

## 注意事項

1. **メモリ使用量**: 2つの環境を同時に起動すると、メモリ使用量が2倍になります。
2. **ポート競合**: 必ず異なるポート番号を使用してください。
3. **データの分離**: 各環境のデータベースは完全に分離されています。
4. **ブランチ管理**: 各環境で作業中のブランチを明確に管理してください。

## トラブルシューティング

### ポート競合エラー
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :8000
```

### コンテナの確認
```bash
# 起動中のコンテナを確認
docker ps

# 環境1のコンテナのみ表示
docker ps --filter "name=skillsheet-"

# 環境2のコンテナのみ表示
docker ps --filter "name=skillsheet-.*-dev2"
```

### ログの確認
```bash
# 環境1
docker-compose logs -f

# 環境2
docker-compose -f DevelopersDocker/docker-compose-dev2.yml logs -f
```