# ポート8001でAPIにアクセスできない問題の解決方法

## 問題の症状

```
POST http://localhost:8001/api/auth/login net::ERR_EMPTY_RESPONSE
```

複数のDockerコンテナを使用している環境で、フロントエンド（localhost:3001）からバックエンド（localhost:8001）のAPIにアクセスできない。

## 発生日時
2025年8月19日

## 原因

1. **環境変数の不一致**
   - フロントエンドの`VITE_API_URL`が`localhost:8000`を指している
   - 実際のバックエンドは`localhost:8001`で動作

2. **バックエンドの起動エラー**
   - 必要なコントローラーファイルが不足
   - `skill.controller.ts`、`search.controller.ts`、`export.controller.ts`、`file.controller.ts`が存在しない

3. **CORS設定の不一致**
   - バックエンドのCORS設定が`localhost:3000`のみ許可
   - フロントエンドは`localhost:3001`で動作

## 解決手順

### 1. フロントエンド環境変数の修正

`.env.local`ファイルを作成して環境変数を上書き：

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8001/api
VITE_WS_URL=ws://localhost:8001
```

### 2. 不足しているコントローラーの作成

最低限の実装でコントローラーファイルを作成：

```typescript
// backend/src/controllers/skill.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';
import logger from '../config/logger';

export class SkillController {
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success([]));
    } catch (error) {
      logger.error('スキル一覧取得エラー:', error);
      next(error);
    }
  };
  // ... 他のメソッド
}
```

同様に`search.controller.ts`、`export.controller.ts`、`file.controller.ts`も作成。

### 3. ルートの一時的な無効化（オプション）

実装が完了していないルートがある場合、`backend/src/routes/v1/index.ts`で一時的にコメントアウト：

```typescript
// 共通API（一時的にコメントアウト）
// router.use('/skills', skillRoutes);
// router.use('/search', searchRoutes);
// router.use('/export', exportRoutes);
// router.use('/files', fileRoutes);
```

### 4. CORS設定の修正

`backend/.env.development`のCORS設定を更新：

```env
# 変更前
CORS_ORIGIN=http://localhost:3000

# 変更後
CORS_ORIGIN=http://localhost:3001
```

### 5. コンテナの再起動

```bash
# バックエンドコンテナを再起動
docker restart skillsheet-backend-dev2

# フロントエンドコンテナを再起動
docker restart skillsheet-frontend-dev2
```

### 6. ブラウザのキャッシュクリア

Viteは環境変数をビルド時に埋め込むため、ハードリフレッシュが必要：
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## 確認方法

1. APIヘルスチェック：
```bash
curl http://localhost:8001/api/v1/health
```

2. バックエンドログ確認：
```bash
docker logs skillsheet-backend-dev2 --tail 20
```

正常なログ例：
```
[32minfo[39m: CORS Origin: {"corsOrigin":"http://localhost:3001","timestamp":"2025-08-20 07:18:26"}
[32minfo[39m: 🚀 サーバーが起動しました {"environment":"development","port":"8000","timestamp":"2025-08-20 07:18:26","url":"http://localhost:8000"}
```

## 予防策

1. **環境変数の管理**
   - 各開発環境用の`.env.local`ファイルを用意
   - ポート番号は環境ごとに明確に分離

2. **必須ファイルのチェック**
   - 新しいルートを追加する際は、対応するコントローラーも同時に作成
   - CI/CDでファイルの存在チェックを実装

3. **CORS設定の柔軟化**
   - 開発環境では複数のオリジンを許可するか、環境変数で動的に設定

## 関連情報

- Docker Composeでの複数環境管理
- Viteの環境変数キャッシュ問題（`vite-environment-variable-cache-resolution.md`参照）
- CORS設定のベストプラクティス

## タグ
#docker #port-conflict #cors #vite #environment-variables #api-connection