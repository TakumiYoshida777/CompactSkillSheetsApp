# オファー機能 データベース設計ドキュメント

## 概要
取引先企業向けオファー機能のデータベース層実装を完了しました。

## 実装内容

### 1. データベーステーブル

#### offers テーブル
- オファー情報を管理するメインテーブル
- 案件情報、期間、必要スキル、単価などを保持
- ステータス管理（SENT, OPENED, PENDING, ACCEPTED, DECLINED, WITHDRAWN）

#### offer_engineers テーブル
- オファー対象エンジニアを管理（N:M関係）
- 個別のステータス管理が可能
- エンジニアごとの返答を記録

### 2. インデックス設計

#### パフォーマンス最適化のためのインデックス
```sql
-- offers テーブル
CREATE INDEX offers_client_company_id_idx ON offers(client_company_id);
CREATE INDEX offers_status_idx ON offers(status);
CREATE INDEX offers_sent_at_idx ON offers(sent_at);
CREATE UNIQUE INDEX offers_offer_number_key ON offers(offer_number);

-- offer_engineers テーブル
CREATE INDEX offer_engineers_offer_id_idx ON offer_engineers(offer_id);
CREATE INDEX offer_engineers_engineer_id_idx ON offer_engineers(engineer_id);
CREATE INDEX offer_engineers_individual_status_idx ON offer_engineers(individual_status);
CREATE UNIQUE INDEX offer_engineers_offer_id_engineer_id_key ON offer_engineers(offer_id, engineer_id);
```

### 3. リポジトリ層

#### OfferRepository
主要メソッド：
- `createOffer()` - 新規オファー作成
- `findOfferById()` - ID検索
- `findOffersByCompany()` - 企業別一覧取得
- `updateOfferStatus()` - ステータス更新
- `sendReminder()` - リマインド送信
- `getOfferStatistics()` - 統計情報取得
- `bulkUpdateStatus()` - 一括ステータス更新

#### OfferEngineerRepository
主要メソッド：
- `addEngineersToOffer()` - エンジニア追加
- `findEngineersByOffer()` - オファー別エンジニア取得
- `updateEngineerStatus()` - 個別ステータス更新
- `bulkUpdateStatuses()` - 一括ステータス更新
- `checkEngineerAvailability()` - 利用可能状況確認
- `findAvailableEngineers()` - オファー可能エンジニア検索

### 4. テスト実装

#### TDDアプローチ
- 全メソッドに対する単体テスト実装
- モックを使用した依存性の分離
- エッジケースのカバレッジ

#### テストカバレッジ
- OfferRepository: 12テスト（全パス）
- OfferEngineerRepository: 11テスト（全パス）

## パフォーマンス最適化

### 1. クエリ最適化
- 適切なインデックス配置による検索高速化
- N+1問題の回避（include使用）
- バッチ処理による一括更新

### 2. データ取得最適化
- 必要なフィールドのみselect
- ページネーション対応
- キャッシュ戦略の考慮

### 3. トランザクション管理
- 複数テーブル更新時の整合性確保
- デッドロック回避

## セキュリティ考慮事項

### 1. データ分離
- 企業IDによる完全なデータ分離
- 取引先企業は自社のオファーのみアクセス可能

### 2. 入力検証
- Prismaの型安全性による検証
- ビジネスロジックレベルでの追加検証

## 今後の拡張ポイント

### 1. 機能拡張
- オファーテンプレート機能
- 自動マッチング機能
- 詳細な統計・分析機能

### 2. パフォーマンス改善
- Redis導入によるキャッシュ層
- 読み取り専用レプリカの活用
- 非同期処理の導入

## 成果物一覧

### 実装ファイル
- `/backend/prisma/schema.prisma` - スキーマ定義（更新）
- `/backend/src/repositories/offerRepository.ts` - オファーリポジトリ
- `/backend/src/repositories/offerEngineerRepository.ts` - オファーエンジニアリポジトリ
- `/backend/src/repositories/__tests__/offerRepository.test.ts` - テスト
- `/backend/src/repositories/__tests__/offerEngineerRepository.test.ts` - テスト

### マイグレーション
- `/backend/prisma/migrations/20250117_add_offer_tables/migration.sql`

## 動作確認

### テスト実行
```bash
# 個別テスト
npm test -- src/repositories/__tests__/offerRepository.test.ts
npm test -- src/repositories/__tests__/offerEngineerRepository.test.ts

# 全テスト
npm test
```

### マイグレーション適用
```bash
npx prisma migrate deploy
npx prisma generate
```

## 注意事項

1. **BigInt型の扱い**
   - JavaScriptのBigInt型を使用
   - JSON変換時は文字列化が必要

2. **日付の扱い**
   - タイムゾーンはUTCで統一
   - フロントエンドで適切に変換

3. **ステータス管理**
   - Enumで厳密に型定義
   - 不正な状態遷移を防ぐ

## まとめ

エンジニアBとして、オファー機能のデータベース層を完全に実装しました。
TDDアプローチにより高品質なコードを実現し、パフォーマンスとセキュリティを考慮した設計となっています。
次のステップとして、APIエンドポイントの実装（エンジニアA担当）との統合が可能です。