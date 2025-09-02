# TODOコメント整理レポート

## 作成日
2025-08-25

## 概要
Issue #31に対応して、プロジェクト全体のTODOコメントを調査・整理しました。

## 削除したTODOコメント

### フロントエンド
1. **frontend/src/mocks/dashboardData.ts**
   - 削除理由: モックデータに関するコメントだが、ファイル自体が将来削除予定なので個別のTODOは不要

2. **frontend/src/components/layout/Header.tsx**
   - 削除理由: TODOを通常のコメントに変更（認証実装待ち）

3. **frontend/src/components/layout/Sidebar.tsx**
   - 削除理由: TODOを通常のコメントに変更（ロール管理実装待ち）

4. **frontend/src/components/common/NotificationContainer.tsx**
   - 削除理由: TODOを通常のコメントに変更（WebSocket実装待ち）

5. **frontend/src/api/client.ts**
   - 削除理由: 一部のTODOを通常のコメントに変更

## 残したTODOコメント（実装が必要）

### 優先度: 高

#### セキュリティ関連
1. **backend/src/index.ts**
   - レート制限の有効化（rateLimiter問題修正後）
   - 本番環境のセキュリティ対策として必須

2. **backend/src/routes/engineer/dashboardRoutes.ts**
   - 本番環境での認証有効化
   - セキュリティ上必須

#### 認証・権限管理
1. **frontend/src/api/client.ts**
   - カンパニーID取得ロジックの実装
   - 認証システムの中核機能

2. **frontend/src/api/partnerApi.ts**
   - リフレッシュトークンを使用した再認証実装

3. **backend/src/routes/authRoutes.ts**
   - checkPermissionメソッドの実装

4. **backend/src/services/authService.old.ts**
   - ロール管理の実装
   - 会社名の実際の取得処理

### 優先度: 中

#### API実装
1. **frontend/src/stores/partnerStore.ts**
   - 各種API実装（20箇所以上）
   - モックデータからの移行

2. **backend/src/routes/v1/notification.routes.ts**
   - データベースクエリの実装（8箇所）

3. **backend/src/controllers/clientEngineerController.ts**
   - オファー機能との連携（11箇所）
   - 経験年数の計算ロジック

#### エラー監視
1. **frontend/src/components/ErrorBoundary/QueryErrorBoundary.tsx**
   - Sentry等のエラー監視サービス導入

2. **frontend/src/utils/errorHandler.ts**
   - エラーログAPIへの送信

### 優先度: 低

#### データ永続化
1. **backend/src/repositories/emailTemplateRepository.ts**
   - email_templatesテーブル作成後の実装

2. **backend/src/repositories/emailLogRepository.ts**
   - email_logsテーブル作成後の実装

#### その他
1. **frontend/src/pages/BusinessPartners/ClientUserManagement.tsx**
   - パスワードリセットAPI呼び出し

2. **backend/src/services/engineer.service.ts**
   - エクスポート処理の実装（2箇所）

## 統計サマリー

- **総TODOコメント数**: 約70箇所
- **削除したTODO**: 5箇所
- **通常コメントに変更**: 4箇所
- **残存TODO**: 約61箇所

### カテゴリ別内訳
- セキュリティ関連: 3箇所
- 認証・権限管理: 6箇所
- API実装: 40箇所以上
- エラー監視: 2箇所
- データ永続化: 8箇所
- その他: 2箇所

## 推奨事項

1. **即座に対応すべき項目**
   - レート制限の有効化
   - 本番環境での認証有効化

2. **短期的に対応すべき項目**
   - 認証・権限管理の完全実装
   - エラー監視サービスの導入

3. **中期的に対応すべき項目**
   - モックデータからAPI実装への移行
   - データベーステーブルの作成と実装

## 次のステップ

1. セキュリティ関連のTODOを最優先で対応
2. 認証・権限管理システムの完成
3. API実装を段階的に進める
4. エラー監視システムの導入
5. データ永続化層の実装

## 備考

- 多くのTODOコメントはモックデータからの移行に関連
- セキュリティ関連のTODOは本番環境前に必ず対応が必要
- API実装は機能ごとに段階的に進めることを推奨