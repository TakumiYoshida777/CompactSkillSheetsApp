# エンジニア登録エラーの調査依頼

## 重要な前提
**同じPC上で複数の開発環境が同時に動作しています。各環境は異なるポート番号で稼働しており、環境間の競合に注意が必要です。**

## 環境情報
- **プロジェクト**: CompactSkillSheetsApp（SESスキルシート管理システム）
- **フロントエンド**: React + TypeScript (http://localhost:3000)
- **バックエンド**: Node.js + Express + TypeScript (http://localhost:8000)
- **データベース**: PostgreSQL (ポート5432)
- **キャッシュ**: Redis (ポート6379)
- **検索エンジン**: Elasticsearch (ポート9200)
- **実行環境**: Docker Compose

## 発生している問題

### 症状
1. エンジニア登録画面（http://localhost:3000/engineers/register）で「登録する」ボタンを押下
2. 「予期しないエラーが発生しました」というエラーメッセージが表示される
3. 登録処理が失敗する

### エラーの詳細
```
ApiError: 予期しないエラーが発生しました
```

## これまでの調査内容

### 1. ネットワークタブでの確認
- APIエンドポイント: POST http://localhost:8000/api/v1/engineers
- レスポンスステータス: 500 Internal Server Error
- リクエストペイロード例:
```json
{
  "name": "山田 太郎",
  "email": "yamada@example.com",
  "phone": "090-1234-5678",
  "engineerType": "employee",
  "status": "waiting",
  "nearestStation": "東京駅",
  "birthDate": "1990-01-01",
  "gender": "male"
}
```

### 2. バックエンドログの確認
過去のエラーログ（backend/logs/error-2025-09-09.log）:
```
TypeError: Do not know how to serialize a BigInt
    at JSON.stringify (<anonymous>)
    at stringify (/app/node_modules/express/lib/response.js:1020:12)
    at ServerResponse.json (/app/node_modules/express/lib/response.js:243:14)
    at getById (/app/src/controllers/engineer.controller.ts:74:11)
```

### 3. 実施した修正
1. **API URLの重複問題を修正**
   - axios baseURLが既に`/api`を含んでいたため、エンドポイントを`/v1/engineers`に修正

2. **フィールド名の不一致を修正**
   - フロントエンド: `currentStatus` → `status`に変更
   - 型定義（EngineerCreateRequest）も同様に修正

3. **バリデーションスキーマの確認**
   - backend/src/validators/engineer.validator.ts:
```typescript
create: yup.object({
  body: yup.object({
    name: yup.string().required('氏名は必須です'),
    email: yup.string().email().required('メールアドレスは必須です'),
    phone: yup.string().optional(),
    status: yup.string()
      .oneOf(['waiting', 'assigned', 'upcoming', 'inactive'])
      .optional(),
    // ... 他のフィールド
  })
})
```

## 調査してほしいポイント

### AIが誤解しない粒度で回答してください

1. **BigIntシリアライゼーションエラーの根本原因**
   - PostgreSQLのBIGINT型をNode.jsで扱う際の問題
   - JSON.stringify()でBigIntを処理できない問題の解決方法

2. **エンジニア登録APIの完全な動作フロー**
   - POST /api/v1/engineers のリクエスト処理の流れ
   - engineer.controller.ts → engineer.service.ts → Prismaの処理フロー
   - トランザクション処理の有無と影響

3. **考えられる他の原因**
   - Prismaスキーマとバリデーションスキーマの不一致
   - 必須フィールドの不足
   - データ型の不一致（特に日付フィールド）
   - 権限/認証の問題

4. **デバッグ手順の提案**
   - 500エラーの詳細なスタックトレースを取得する方法
   - リクエスト/レスポンスの詳細ログを有効にする方法
   - Prismaクエリログの確認方法

5. **推奨される修正方針**
   - BigInt問題の解決（カスタムシリアライザー、型変換など）
   - エラーハンドリングの改善
   - バリデーションエラーの詳細化

## 関連ファイルパス
- フロントエンド:
  - /frontend/src/pages/Engineers/EngineerRegister.tsx
  - /frontend/src/api/engineers/engineerApi.ts
  - /frontend/src/types/engineer.ts

- バックエンド:
  - /backend/src/routes/v1/engineer.routes.ts
  - /backend/src/controllers/engineer.controller.ts
  - /backend/src/services/engineer.service.ts
  - /backend/src/validators/engineer.validator.ts
  - /backend/prisma/schema.prisma

## 追加情報
- Docker環境で動作
- 開発環境での問題
- 他の機能（エンジニア一覧表示など）は正常に動作
- 最近TypeScript型安全性の改善を実施

この問題を解決するための具体的な手順と修正コードを提供してください。