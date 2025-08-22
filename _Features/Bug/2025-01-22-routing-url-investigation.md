# 画面遷移とURL構築に関する調査レポート

**作成日**: 2025年1月22日  
**調査者**: Claude Code  
**調査対象**: CompactSkillSheetsApp フロントエンドのルーティング実装

## 1. 現状の実装状況

### 1.1 使用技術
- **ルーティングライブラリ**: React Router v6 (react-router-dom)
- **主要コンポーネント**: BrowserRouter, Routes, Route, Navigate
- **画面遷移方法**: useNavigate Hook

### 1.2 ルーティング構成
- **メインルート**: `/` (AuthGuard付き)
- **エンジニア用ルート**: `/engineer/*` (専用レイアウト)
- **取引先企業用ルート**: `/client/*` (ClientPrivateRoute付き)
- **認証画面**: `/login`, `/client/login`, `/engineer/login`

## 2. 画面遷移の実装パターン

### 2.1 正しい実装パターン（現在使用中）

#### A. useNavigate Hookを使用した遷移
```typescript
// 絶対パスを指定（推奨）
navigate('/dashboard');
navigate(`/engineers/${engineerId}`);
navigate('/business-partners/new');
```

#### B. React RouterのLinkコンポーネント
```tsx
<Link to="/login">
  <Button>ログインへ</Button>
</Link>
```

### 2.2 問題のある実装パターン

#### A. window.location.hrefの直接操作
```typescript
// lib/axios.ts, lib/http.tsで発見
window.location.href = '/client/login';  // ページ全体をリロード
window.location.href = '/login';
```

#### B. window.location.reloadの使用
```typescript
// components/ErrorBoundary.tsxで発見
window.location.reload();  // アプリケーション全体を再読み込み
```

## 3. 発見された問題点

### 3.1 相対パスの文字列結合問題
**調査結果**: 現在のコードベースには、カレントURLに相対パスを文字列結合しているような実装は発見されませんでした。

### 3.2 実際に発見された問題

#### 問題1: window.locationの使用
**場所**: 
- `lib/axios.ts:86-90`
- `lib/http.ts:150-154`
- `config/queryClient.ts:12`

**問題内容**:
- SPAのメリットを失う（全体リロードが発生）
- React Routerの状態管理が破壊される
- ユーザー体験の低下（画面がちらつく）

**推奨される修正**:
```typescript
// 修正前
window.location.href = '/login';

// 修正後
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/login');
```

#### 問題2: MainLayoutでのメニュー遷移
**場所**: `layouts/MainLayout.tsx:140`

**現在の実装**:
```typescript
navigate(`/${e.key}`);  // "/"が重複する可能性
```

**潜在的な問題**:
- メニューキーが既に"/"を含む場合、"//dashboard"のような不正なパスになる可能性

**推奨される修正**:
```typescript
// パスの正規化を行う
const path = e.key.startsWith('/') ? e.key : `/${e.key}`;
navigate(path);
```

## 4. ベストプラクティス

### 4.1 画面遷移の実装方針

1. **React Router APIの使用**
   - 常に`useNavigate`または`<Link>`コンポーネントを使用
   - `window.location`の使用は避ける

2. **パスの指定方法**
   - 絶対パス（`/`から始まる）を使用
   - パス結合が必要な場合は、適切なユーティリティ関数を作成

3. **エラーハンドリング時の遷移**
   - 401エラー時も`navigate`を使用
   - グローバルなエラーハンドラーで統一的に処理

### 4.2 推奨ユーティリティ関数

```typescript
// utils/navigation.ts
export const buildPath = (...parts: string[]): string => {
  return '/' + parts
    .map(part => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
};

// 使用例
buildPath('business-partners', partnerId, 'edit');  // => '/business-partners/123/edit'
buildPath('/engineers/', engineerId);               // => '/engineers/456'
```

## 5. 修正が必要な箇所

### 優先度: 高
1. **lib/axios.ts** - 401エラー時のリダイレクト処理
2. **lib/http.ts** - 認証エラー時のリダイレクト処理
3. **config/queryClient.ts** - セッション切れ時のリダイレクト

### 優先度: 中
1. **components/ErrorBoundary.tsx** - エラー時のリロード処理
2. **components/ErrorBoundary/QueryErrorBoundary.tsx** - ホームへ戻る処理

### 優先度: 低
1. **layouts/MainLayout.tsx** - メニュー遷移のパス構築改善

## 6. 修正による影響範囲

### 6.1 影響を受けるコンポーネント
- 認証系のエラーハンドリング全般
- エラーバウンダリーコンポーネント
- メインレイアウトのナビゲーション

### 6.2 テストが必要な項目
1. 認証エラー時の適切なログインページへの遷移
2. エラー発生時の画面遷移
3. メニューからの各画面への遷移
4. ディープリンクの動作確認

## 7. 推奨される実装手順

1. **Step 1**: ナビゲーションユーティリティの作成
2. **Step 2**: axios/httpインターセプターの修正
3. **Step 3**: エラーハンドリングコンポーネントの修正
4. **Step 4**: 全体的な動作確認とテスト

## 8. まとめ

現在のコードベースでは、相対パスの文字列結合による問題は発見されませんでしたが、`window.location`を使用した画面遷移が複数箇所で実装されており、これがSPAの動作を阻害する可能性があります。

React Routerの`useNavigate`を統一的に使用することで、より良いユーザー体験と保守性の高いコードベースを実現できます。