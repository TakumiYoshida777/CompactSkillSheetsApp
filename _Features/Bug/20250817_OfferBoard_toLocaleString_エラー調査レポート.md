# OfferBoard index.tsx toLocaleString エラー調査レポート

## 作成日時
作成日: 2025年8月17日

## エラー概要
```
index.tsx:213 Uncaught TypeError: Cannot read properties of undefined (reading 'toLocaleString')
    at render (index.tsx:213:50)
```

## エラー発生箇所
- **ファイル**: `frontend/src/pages/Client/OfferBoard/index.tsx`
- **行番号**: 213行目
- **該当コード**:
```typescript
render: (rate) => (
  <span data-testid="engineer-rate">¥{rate.toLocaleString()}</span>
),
```

## 根本原因
データの不整合により、`hourlyRate`フィールドがundefinedになっているため、`toLocaleString()`メソッドを呼び出せずにエラーが発生。

### 詳細分析

#### 1. テーブルカラム定義（index.tsx）
```typescript
{
  title: '単価',
  dataIndex: 'hourlyRate',  // ← hourlyRateを参照
  key: 'hourlyRate',
  width: 120,
  sorter: true,
  render: (rate) => (
    <span data-testid="engineer-rate">¥{rate.toLocaleString()}</span>
  ),
}
```

#### 2. モックデータ構造（offerApi.ts）
```typescript
engineers: [
  {
    id: '1',
    name: '田中太郎',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: 5,
    availability: '2024-02-01',
    availabilityStatus: 'available',
    rate: { min: 60, max: 80 },  // ← hourlyRateではなくrateオブジェクト
    lastOfferStatus: null,
    offerHistory: [],
  },
  // ...
]
```

#### 3. 問題点
- テーブルカラムは`hourlyRate`フィールドを期待
- モックデータは`rate`オブジェクト（min/maxプロパティ付き）を提供
- `hourlyRate`が存在しないため、undefinedになる
- undefined.toLocaleString()でTypeErrorが発生

## 影響範囲
- オファーボード画面（`/client/offer-board`）
- エンジニア一覧テーブルの単価列
- 画面全体のレンダリングが失敗し、真っ白になる可能性

## 解決方法

### 方法1: render関数でのnullチェック（即座の修正）
```typescript
render: (rate) => (
  <span data-testid="engineer-rate">
    {rate ? `¥${rate.toLocaleString()}` : '-'}
  </span>
),
```

### 方法2: データ構造の修正（推奨）
モックデータを修正して正しい構造にする：
```typescript
engineers: [
  {
    id: '1',
    name: '田中太郎',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: 5,
    hourlyRate: 7000,  // ← hourlyRateフィールドを追加
    availability: '2024-02-01',
    availabilityStatus: 'available',
    rate: { min: 60, max: 80 },
    lastOfferStatus: null,
    offerHistory: [],
  },
  // ...
]
```

### 方法3: dataIndexの修正
rateオブジェクトの特定のプロパティを参照：
```typescript
{
  title: '単価',
  dataIndex: ['rate', 'max'],  // ← ネストされたプロパティにアクセス
  key: 'hourlyRate',
  width: 120,
  sorter: true,
  render: (rate) => (
    <span data-testid="engineer-rate">
      {rate ? `¥${rate.toLocaleString()}/月` : '-'}
    </span>
  ),
}
```

### 方法4: カスタムレンダリング（範囲表示）
```typescript
{
  title: '単価',
  dataIndex: 'rate',
  key: 'hourlyRate',
  width: 120,
  sorter: true,
  render: (rate) => (
    <span data-testid="engineer-rate">
      {rate && rate.min && rate.max 
        ? `¥${rate.min}〜${rate.max}万/月`
        : '-'}
    </span>
  ),
}
```

## 推奨される修正手順

1. **即座の修正**（エラーを解消）
   - render関数にnullチェックを追加
   
2. **データ構造の統一**（長期的な解決）
   - バックエンドAPIとフロントエンドの型定義を確認
   - OfferBoardDataの型定義を確認・修正
   - モックデータと実データの構造を統一

3. **テストの追加**
   - undefinedやnullデータのテストケースを追加
   - 型安全性を確保するためのTypeScript設定強化

## 関連ファイル
- `frontend/src/pages/Client/OfferBoard/index.tsx`
- `frontend/src/api/client/offerApi.ts`
- `frontend/src/types/offer.ts`
- `frontend/src/hooks/useOfferBoard.ts`

## 予防策
1. TypeScriptの厳格モードを有効化（strictNullChecks）
2. データ取得時のバリデーション実装
3. Optional chainingの使用（`rate?.toLocaleString()`）
4. デフォルト値の設定
5. PropTypesまたはZodによるランタイム型チェック

## 緊急度
**高** - 画面が表示されないクリティカルなエラーのため、即座の修正が必要