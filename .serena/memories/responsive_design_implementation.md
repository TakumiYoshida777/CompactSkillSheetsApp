# レスポンシブデザイン実装

## 実装済みコンポーネント

### 1. レスポンシブ基盤
- **useResponsive Hook** (`frontend/src/hooks/useResponsive.ts`): 画面サイズの検出とブレークポイント管理
- **ResponsiveTable** (`frontend/src/components/ResponsiveTable.tsx`): モバイル対応テーブルコンポーネント

### 2. レイアウト
- **MainLayout** (`frontend/src/layouts/MainLayout.tsx`): ハンバーガーメニュー実装済み
- **EngineerLayout** (`frontend/src/layouts/EngineerLayout.tsx`): モバイル対応済み

### 3. ブレークポイント
```typescript
{
  xs: 480,   // 超小型デバイス
  sm: 576,   // 小型デバイス
  md: 768,   // 中型デバイス（タブレット）
  lg: 992,   // 大型デバイス
  xl: 1200,  // 超大型デバイス（デスクトップ）
  xxl: 1600  // Full HD以上
}
```

### 4. デザイン要件
- 最小タップ領域: 44px × 44px
- モバイルファースト設計
- サイドバー: デスクトップは固定、モバイルはDrawer

### 5. テスト済み項目
- useResponsiveフックのブレークポイント判定
- MainLayoutのレスポンシブ動作
- ResponsiveTableの表示切り替え