# コーディング規約・スタイルガイド

## 基本原則
- **言語**: すべて日本語（コメント、コミットメッセージ、ドキュメント）
- **設計思想**: Clean Architecture、DRY原則、SOLID原則
- **テスト**: TDD（テスト駆動開発）、カバレッジ80%以上

## 命名規則

### TypeScript/JavaScript
```typescript
// インターフェース: PascalCase + I prefix 不要
interface UserProfile { }

// 型エイリアス: PascalCase
type UserId = string;

// クラス: PascalCase
class UserService { }

// 関数・メソッド: camelCase
function getUserById() { }

// 変数・定数: camelCase
const userName = "田中";

// 定数（不変値）: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// React コンポーネント: PascalCase
const UserProfile: React.FC = () => { };

// カスタムフック: use + PascalCase
const useUserData = () => { };
```

### ファイル名
- **React コンポーネント**: PascalCase.tsx (例: UserProfile.tsx)
- **カスタムフック**: use + PascalCase.ts (例: useAuth.ts)
- **ユーティリティ**: camelCase.ts (例: dateUtils.ts)
- **テストファイル**: 対象ファイル名.test.ts(x)

## React/TypeScript 規約

### コンポーネント定義
```typescript
// 関数コンポーネント + TypeScript
interface Props {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<Props> = ({ userId, onUpdate }) => {
  // フックは最上部で宣言
  const [loading, setLoading] = useState(false);
  const { data, error } = useUserData(userId);

  // イベントハンドラーは handle プレフィックス
  const handleSubmit = () => {
    // 処理
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default UserProfile;
```

### インポート順序
1. React 関連
2. 外部ライブラリ
3. 内部モジュール（絶対パス）
4. 相対パス import
5. 型定義
6. スタイル

```typescript
import React, { useState, useEffect } from 'react';
import { Button, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import UserCard from '../components/UserCard';
import type { User } from '@/types';
import './UserProfile.css';
```

## API設計

### RESTful エンドポイント
```
GET    /api/users          # 一覧取得
GET    /api/users/:id      # 詳細取得
POST   /api/users          # 新規作成
PUT    /api/users/:id      # 更新
DELETE /api/users/:id      # 削除
```

### レスポンス形式
```json
{
  "success": true,
  "data": { },
  "message": "処理成功",
  "error": null
}
```

## Git コミット規約

### コミットメッセージ形式
```
<type>: <subject>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type プレフィックス
- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメント
- **style**: フォーマット
- **refactor**: リファクタリング
- **test**: テスト
- **chore**: ビルド・設定

## テスト規約

### テスト構造
```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('正常にユーザーを取得できる', async () => {
      // Arrange
      const userId = 'test-id';
      
      // Act
      const result = await getUserById(userId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });

    it('存在しないユーザーの場合はエラーを返す', async () => {
      // テストケース
    });
  });
});
```

### テストファイル配置
- 単体テスト: `__tests__/` ディレクトリ
- 統合テスト: `tests/integration/`
- E2Eテスト: `tests/e2e/`

## CSS/スタイリング規約

### Tailwind CSS 優先
```tsx
// Good: Tailwind クラス使用
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// Avoid: インラインスタイル
<div style={{ display: 'flex', padding: '16px' }}>
```

### カスタムクラス命名
- BEM記法: `block__element--modifier`
- アプリ固有: `app-` プレフィックス

## 品質基準
- **テストカバレッジ**: 80%以上
- **TypeScript**: strict モード有効
- **ESLint**: エラー0
- **Prettier**: 自動フォーマット適用
- **コメント**: 複雑なロジックには必ず日本語コメント