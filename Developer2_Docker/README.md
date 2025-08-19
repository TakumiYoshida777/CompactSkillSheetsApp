# Developer2 Docker環境

## 概要
2つ目の開発環境用Docker設定です。複数のブランチを同時に修正するための独立した環境を提供します。

## ポート割り当て
| サービス | ポート番号 |
|---------|-----------|
| Frontend | 3001 |
| Backend | 8001 |
| Backend Debug | 9230 |
| PostgreSQL | 5433 |
| Redis | 6380 |
| Elasticsearch | 9201 |
| Elasticsearch Transport | 9301 |

## 使用方法

### 起動
```bash
cd ~/workspace/Project/CompactSkillSheetsApp
docker-compose -f Developer2_Docker/docker-compose-dev2.yml up -d
```

### 停止
```bash
docker-compose -f Developer2_Docker/docker-compose-dev2.yml down
```

### ボリューム削除
```bash
docker-compose -f Developer2_Docker/docker-compose-dev2.yml down -v
```

## アクセスURL
- Frontend: http://localhost:3001
- Backend: http://localhost:8001

## 注意事項
- メモリ使用量が増加します
- ポート競合に注意してください
- データベースは完全に分離されています