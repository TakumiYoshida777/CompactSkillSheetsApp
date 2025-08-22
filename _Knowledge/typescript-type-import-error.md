# TypeScript型インポートエラーの解決方法

## 問題
Vite + React + TypeScriptプロジェクトで以下のエラーが発生：
```
Uncaught SyntaxError: The requested module '/src/stores/xxxStore.ts' does not provide an export named 'TypeName'
```

## 原因
TypeScriptのinterface/typeは型レベルの定義で、コンパイル後のJavaScriptには存在しない。
Viteの開発サーバーはブラウザにESMをそのまま配信するため、通常のimportでは実行時エラーになる。

## 解決方法

### 1. import typeを使用（推奨）
```typescript
// ❌ 間違い
import { Notification, SystemAnnouncement } from './notificationStore';

// ✅ 正しい
import type { Notification, SystemAnnouncement } from './notificationStore';
```

### 2. 型と値を分けてインポート
```typescript
import useStore from './store';                    // 値
import type { StoreState, StoreAction } from './store';  // 型
```

## 予防策

### ESLint設定
`.eslintrc.json`に追加：
```json
{
  "rules": {
    "@typescript-eslint/consistent-type-imports": [
      "error", 
      { 
        "prefer": "type-imports", 
        "fixStyle": "separate-type-imports" 
      }
    ],
    "@typescript-eslint/consistent-type-exports": "error"
  }
}
```

### TypeScript設定
`tsconfig.json`に追加：
```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,    // TypeScript 5+
    "isolatedModules": true
  }
}
```

## チェックリスト
- [ ] 型定義（interface/type）のインポートは`import type`を使用
- [ ] 実行時に必要な値と型を明確に分離
- [ ] ESLintルールで自動検出を設定
- [ ] tsconfig.jsonで型インポートを強制

## 関連ファイル
- 修正例：`frontend/src/api/common/notificationApi.ts`
- 修正例：`frontend/src/components/common/OfferStatusBadge/index.tsx`
- 修正例：`frontend/src/hooks/useOffers.ts`