# Developer3 Docker環境

## 概要
3つ目の開発環境用Docker設定です。

## ポート割り当て
| サービス | ポート番号 |
|---------|-----------|
| Frontend | 3002 |
| Backend | 8002 |
| Backend Debug | 9231 |
| PostgreSQL | 5434 |
| Redis | 6381 |
| Elasticsearch | 9202 |
| Elasticsearch Transport | 9302 |

## 使用方法

### 起動
```bash
cd ~/workspace/Project/CompactSkillSheetsApp
docker-compose -f Developer3_Docker/docker-compose-dev3.yml up -d
```

### 停止
```bash
docker-compose -f Developer3_Docker/docker-compose-dev3.yml down
```

### ボリューム削除
```bash
docker-compose -f Developer3_Docker/docker-compose-dev3.yml down -v
```

## アクセスURL
- Frontend: http://localhost:3002
- Backend: http://localhost:8002