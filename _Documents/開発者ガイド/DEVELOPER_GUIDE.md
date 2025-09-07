# 開発者ガイド

## 目次
1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [アーキテクチャ概要](#アーキテクチャ概要)
3. [コーディング規約](#コーディング規約)
4. [テスト戦略](#テスト戦略)
5. [デバッグ方法](#デバッグ方法)
6. [デプロイメント](#デプロイメント)

---

## 開発環境のセットアップ

### 必要なツール
- Node.js 18.x以上
- Docker Desktop
- VSCode（推奨エディタ）
- Git

### 推奨VSCode拡張機能
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-tslint-plugin",
    "Prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "antfu.browse-lite"
  ]
}
```

### 初回セットアップ
```bash
# 1. リポジトリのクローン
git clone https://github.com/your-org/CompactSkillSheetsApp.git
cd CompactSkillSheetsApp

# 2. 環境変数の設定
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 3. Dockerコンテナの起動
docker-compose up -d

# 4. 依存関係のインストール
npm run install:all

# 5. データベースの初期化
npm run db:setup

# 6. 開発サーバーの起動
npm run dev
```

---

## アーキテクチャ概要

### システム構成図
```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│   (React)   │     │  (Express)   │     └──────────────┘
└─────────────┘     └──────────────┘              │
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐     ┌──────────────┐
                     │    Redis     │     │Elasticsearch │
                     └──────────────┘     └──────────────┘
```

### レイヤード・アーキテクチャ

#### フロントエンド層構造
```
src/
├── pages/          # ページコンポーネント（ルーティング単位）
├── components/     # 再利用可能なUIコンポーネント
├── services/       # API通信ロジック
├── stores/         # グローバル状態管理（Zustand）
├── hooks/          # カスタムフック
├── domain/         # ドメインモデル（ValueObjects）
└── utils/          # ユーティリティ関数
```

#### バックエンド層構造
```
src/
├── controllers/    # HTTPリクエスト処理
├── services/       # ビジネスロジック
├── repositories/   # データアクセス層
├── domain/         # ドメインモデル
├── middleware/     # Express ミドルウェア
└── validators/     # バリデーションロジック
```

### データフロー
1. **ユーザー操作** → React Component
2. **状態更新** → Zustand Store
3. **API呼び出し** → TanStack Query → Axios
4. **リクエスト処理** → Express Controller
5. **ビジネスロジック** → Service Layer
6. **データアクセス** → Repository → Prisma → PostgreSQL
7. **レスポンス** → 逆順で返却

---

## コーディング規約

### TypeScript
```typescript
// ✅ Good: 明示的な型定義
interface UserProps {
  id: string;
  name: string;
  email: Email; // ValueObject使用
}

// ❌ Bad: any型の使用
const processData = (data: any) => { ... }

// ✅ Good: 関数の戻り値型を明示
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React コンポーネント
```tsx
// ✅ Good: 関数コンポーネント + TypeScript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Bad: クラスコンポーネント（新規作成では使用しない）
class Button extends React.Component { ... }
```

### ValueObjects 使用例
```typescript
import { Email, OfferStatus, DateRange } from '@/domain/valueObjects';

// メールアドレスの検証
const userEmail = new Email('user@example.com');
console.log(userEmail.getDomain()); // 'example.com'

// ステータス管理
const status = OfferStatus.PENDING;
if (status.canTransitionTo(OfferStatus.ACCEPTED)) {
  // 遷移可能な場合の処理
}

// 期間の管理
const projectPeriod = new DateRange('2024-01-01', '2024-12-31');
console.log(projectPeriod.getDays()); // 366（うるう年）
```

### エラーハンドリング
```typescript
// ✅ Good: 具体的なエラー処理
try {
  const result = await offerService.createOffer(data);
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn('Validation failed:', error.details);
    throw new BadRequestError('入力データが不正です');
  }
  if (error instanceof DatabaseError) {
    logger.error('Database error:', error);
    throw new InternalServerError('システムエラーが発生しました');
  }
  throw error;
}

// ❌ Bad: 汎用的なcatch
try {
  // ...
} catch (error) {
  console.log(error);
  throw new Error('エラーが発生しました');
}
```

---

## テスト戦略

### テストピラミッド
```
         /\
        /  \  E2E Tests (10%)
       /────\
      /      \  Integration Tests (20%)
     /────────\
    /          \  Unit Tests (70%)
   /────────────\
```

### ユニットテスト
```typescript
// frontend/src/services/__tests__/authService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../authService';

describe('AuthService', () => {
  describe('validateCredentials', () => {
    it('有効な認証情報を受け入れる', () => {
      const isValid = AuthService.validateCredentials({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });
      expect(isValid).toBe(true);
    });
  });
});
```

### 統合テスト
```typescript
// frontend/src/__tests__/integration/auth.integration.test.tsx
describe('認証フロー統合テスト', () => {
  it('ログインから認証チェックまでの完全なフロー', async () => {
    // 1. ログイン実行
    const authResponse = await AuthService.performLogin(...);
    
    // 2. トークン保存
    useAuthStore.getState().setAuth(...);
    
    // 3. 認証チェック
    const checkResult = await AuthCheckService.performAuthCheck(...);
    
    expect(checkResult.isAuthenticated).toBe(true);
  });
});
```

### テスト実行
```bash
# フロントエンド
npm run test:frontend        # 単体実行
npm run test:frontend:watch  # ウォッチモード
npm run test:frontend:coverage # カバレッジ付き

# バックエンド
npm run test:backend
npm run test:backend:watch
npm run test:backend:coverage

# 全テスト実行
npm test
```

---

## デバッグ方法

### フロントエンドデバッグ

#### React Developer Tools
1. Chrome拡張機能をインストール
2. F12でDevToolsを開く
3. React タブでコンポーネントツリーを確認

#### VSCode デバッグ設定
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

### バックエンドデバッグ

#### Node.js デバッグ
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Debug Backend",
      "port": 9229,
      "restart": true
    }
  ]
}
```

#### ログ確認
```bash
# Docker ログ
docker-compose logs -f backend

# アプリケーションログ
tail -f backend/logs/app.log

# エラーログ
tail -f backend/logs/error.log
```

### データベースデバッグ
```bash
# Prisma Studio起動（GUIでDB確認）
cd backend
npx prisma studio

# SQLログ有効化
# backend/.env
DATABASE_URL="postgresql://...?schema=public&log=['query','error']"
```

---

## デプロイメント

### 環境別設定

#### 開発環境
```env
# frontend/.env.development
VITE_API_URL=http://localhost:8000
VITE_ENV=development
```

#### ステージング環境
```env
# frontend/.env.staging
VITE_API_URL=https://staging-api.example.com
VITE_ENV=staging
```

#### 本番環境
```env
# frontend/.env.production
VITE_API_URL=https://api.example.com
VITE_ENV=production
```

### ビルド手順
```bash
# フロントエンドビルド
cd frontend
npm run build
# dist/ ディレクトリが生成される

# バックエンドビルド
cd backend
npm run build
# dist/ ディレクトリが生成される
```

### Dockerイメージ作成
```bash
# フロントエンド
docker build -f frontend/Dockerfile -t skillsheets-frontend:latest ./frontend

# バックエンド
docker build -f backend/Dockerfile -t skillsheets-backend:latest ./backend
```

### CI/CD パイプライン（GitHub Actions例）
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm ci
          npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # デプロイスクリプト実行
          ./scripts/deploy.sh
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. TypeScriptエラー
```bash
# 型定義の再生成
npm run generate:types

# tsconfig確認
npx tsc --noEmit
```

#### 2. Prismaエラー
```bash
# クライアント再生成
npx prisma generate

# マイグレーションリセット
npx prisma migrate reset
```

#### 3. Docker関連
```bash
# 全コンテナ停止・削除
docker-compose down -v

# イメージ再ビルド
docker-compose build --no-cache

# ログ確認
docker-compose logs [service-name]
```

#### 4. パフォーマンス問題
- React DevToolsのProfilerタブで確認
- Chrome DevToolsのPerformanceタブで分析
- Lighthouseでパフォーマンス監査

---

## ベストプラクティス

### セキュリティ
- 環境変数で機密情報を管理
- SQLインジェクション対策（Prisma使用）
- XSS対策（React自動エスケープ）
- CORS設定の適切な管理

### パフォーマンス
- React.memoで不要な再レンダリング防止
- useMemoとuseCallbackの適切な使用
- 画像の遅延読み込み
- コード分割（React.lazy）

### 保守性
- 単一責任の原則
- DRY原則の遵守
- 適切なコメント記述
- ドキュメントの更新

---

## リソース

### 公式ドキュメント
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/docs)
- [Express](https://expressjs.com/)

### 内部ドキュメント
- [CLAUDE.md](./CLAUDE.md) - AI開発ガイドライン
- [API仕様書](./_Documents/API仕様書.md)
- [データベース設計書](./_Documents/データベース設計書.md)

### サポート
- Slackチャンネル: #dev-skillsheets
- Wiki: https://wiki.example.com/skillsheets
- Issue: https://github.com/your-org/CompactSkillSheetsApp/issues

---

最終更新: 2025年1月19日