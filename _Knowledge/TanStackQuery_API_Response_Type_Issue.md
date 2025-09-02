# TanStack Query APIレスポンス型エラーの解決方法

## 問題
BusinessPartnerList.tsxでTanStack QueryのuseQueryを使用してAPIからデータを取得する際、APIの型定義では`{ data: BusinessPartner[]; total: number }`を返すと定義されているが、実際のレスポンスが配列のみを返すケースがあり、型エラーが発生する。

### エラー内容
```typescript
Property 'filter' does not exist on type '{ data: BusinessPartner[]; total: number; }'.
```

## 原因
1. APIの実装と型定義の不一致
2. バックエンドのレスポンス形式が一貫していない
3. 開発環境と本番環境でレスポンス形式が異なる可能性

## 解決方法

### 1. 型ガードを使用した柔軟な対応
```typescript
// APIレスポンスの型を正しく処理
const partners = Array.isArray(partnersData) 
  ? partnersData 
  : (partnersData?.data || []);
  
const total = Array.isArray(partnersData) 
  ? partnersData.length 
  : (partnersData?.total || 0);
```

### 2. 実装のポイント
- `Array.isArray()`を使用してレスポンスが配列か判定
- 配列の場合は直接使用、オブジェクトの場合は`data`プロパティを参照
- `total`も同様に条件分岐で処理

### 3. 注意事項
- パラメータの型注釈を明示的に指定
  ```typescript
  partners.filter((partner: BusinessPartner) => { ... })
  partners.map((partner: BusinessPartner) => { ... })
  ```
- reduce等の集計関数でも型注釈を追加
  ```typescript
  partners.reduce((sum: number, p: BusinessPartner) => { ... }, 0)
  ```

## 関連ファイル
- `/frontend/src/pages/BusinessPartners/BusinessPartnerList.tsx`
- `/frontend/src/api/businessPartner.ts`

## 対応日
2025-08-26

## タグ
#TanStackQuery #TypeScript #型エラー #API連携