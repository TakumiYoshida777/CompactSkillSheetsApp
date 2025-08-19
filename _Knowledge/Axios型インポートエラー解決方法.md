# Axios型インポートエラー解決方法

## 作成日時
作成日: 2025年1月19日
作成者: Claude Code
バージョン: 1.0

---

## 事象
Vite環境で以下のようなエラーが発生し、画面が白画面になる問題：

```
Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/axios.js?v=46dc7a8b' does not provide an export named 'AxiosResponse'
```

## 原因分析

### 根本原因
ViteとTypeScriptの`verbatimModuleSyntax`設定が有効な場合、型のインポートと値のインポートを明確に区別する必要がある。

### 問題のあるコード
```typescript
// ❌ エラーが発生するパターン
import axios, { AxiosResponse } from 'axios';
```

`AxiosResponse`は型であり、実行時には存在しないため、通常のimportでインポートするとViteのモジュール解決でエラーになる。

## 解決方法

### 1. 型インポートを分離する
```typescript
// ✅ 正しいパターン1: 型インポートを分離
import axios from 'axios';
import type { AxiosResponse } from 'axios';
```

### 2. インライン型インポートを使用
```typescript
// ✅ 正しいパターン2: インライン型インポート
import axios, { type AxiosResponse } from 'axios';
```

### 3. 型のみのインポート文を使用
```typescript
// ✅ 正しいパターン3: 型のみをインポートする場合
import type { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
```

## 適用後の処理

### Viteキャッシュのクリア
修正後、Viteのキャッシュをクリアする必要がある場合があります：

```bash
# Dockerコンテナ内のViteキャッシュをクリア
docker-compose exec frontend sh -c 'rm -rf node_modules/.vite'

# フロントエンドコンテナを再起動
docker-compose restart frontend
```

### ブラウザのハードリロード
- Chrome/Edge: `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Windows)
- Safari: `Cmd + Option + R` (Mac)

## 影響範囲

この問題は以下のような場合に発生する可能性があります：

1. **Axiosの型を使用している箇所**
   - APIクライアントの実装
   - エラーハンドリング
   - インターセプターの設定

2. **他のライブラリの型インポート**
   - React Routerの型
   - Ant Designの型
   - その他のサードパーティライブラリ

## 予防策

### tsconfig.jsonの設定
```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,  // 型インポートを強制
    "importsNotUsedAsValues": "error"  // 未使用インポートをエラーに
  }
}
```

### ESLintルール
```json
{
  "rules": {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports",
        "disallowTypeAnnotations": true
      }
    ]
  }
}
```

## トラブルシューティングチェックリスト

- [ ] 型インポートに`type`キーワードが付いているか確認
- [ ] Viteキャッシュ（node_modules/.vite）をクリア
- [ ] ブラウザのキャッシュをクリア（ハードリロード）
- [ ] TypeScriptのバージョンが5.0以上か確認
- [ ] tsconfig.jsonの設定を確認

## 関連ファイル例

### 修正前後の例: authService.ts
```typescript
// Before (エラー発生)
import axios, { AxiosResponse } from 'axios';

// After (修正後)
import axios from 'axios';
import type { AxiosResponse } from 'axios';
```

### 修正前後の例: API呼び出し
```typescript
// Before
import { AxiosError } from 'axios';

// After
import type { AxiosError } from 'axios';
```

## 注意事項

1. **型と値の区別**
   - 型定義（interface, type, enum）は`type`インポートを使用
   - 実際の値（関数、クラス、定数）は通常のインポートを使用

2. **自動修正**
   - VSCodeの自動インポート機能が正しく`type`を追加しない場合がある
   - 手動で確認と修正が必要

3. **ビルド時と実行時の違い**
   - 開発時（vite dev）では問題なくても、ビルド時にエラーになることがある
   - 本番ビルド前に必ず確認

## 参考資料
- [TypeScript 5.0 verbatimModuleSyntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#verbatimmodulesyntax)
- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [TypeScript Type-Only Imports and Exports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-exports)

## 関連ナレッジ
- `スキルシート編集画面の白画面問題対策.md`
- `vite-environment-variable-cache-resolution.md`

## 最終更新
2025-01-19 - リファクタリング作業中に発生した問題を解決