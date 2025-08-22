# TypeScriptのインターフェース型インポートエラーに関する質問

AIが誤解しない粒度で回答してください。

## 問題の概要

React + TypeScript + Viteのプロジェクトで、以下のランタイムエラーが発生しています：

```
Uncaught SyntaxError: The requested module '/src/stores/notificationStore.ts' does not provide an export named 'Notification'
```

## 該当コード

### notificationStore.ts（エクスポート側）
```typescript
// 型定義
export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  relatedId?: string;
  relatedType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}
```

### notificationApi.ts（インポート側）
```typescript
import { Notification, SystemAnnouncement } from '../../stores/notificationStore';
```

## 環境情報
- Vite: 最新版
- TypeScript: 最新版
- React: 18.x
- ブラウザ実行時にエラー発生

## 質問

1. TypeScriptのインターフェースは型レベルの定義であり、実行時には存在しないため、Viteのdevサーバーでこのようなエラーが発生する原因と具体的な修正方法を教えてください。

2. 以下の解決方法のうち、最も適切な方法はどれですか？また、その理由も教えてください：
   - a) `import type { Notification, SystemAnnouncement }` を使用する
   - b) インターフェースをクラスに変更する
   - c) 型定義を別ファイル（types.ts）に分離する
   - d) tsconfig.jsonの設定を変更する

3. Vite + TypeScriptプロジェクトにおいて、型定義のインポート/エクスポートのベストプラクティスを教えてください。

4. このエラーを防ぐためのESLintルールやTypeScriptコンパイラオプションがあれば教えてください。

## 期待する回答
- エラーの根本原因の技術的説明
- 具体的な修正コード例
- 今後同様のエラーを防ぐための設計指針
- Vite特有の考慮事項があれば、それも含めて説明してください