# OfferBoard toLocaleString エラー解決方法

## 作成日時
作成日: 2025年8月17日
作成者: AI開発チーム
バージョン: 1.0

---

## エラー概要
```
index.tsx:213 Uncaught TypeError: Cannot read properties of undefined (reading 'toLocaleString')
```

OfferBoard画面で単価表示時に`toLocaleString()`メソッドを呼び出そうとしてエラーが発生。

---

## 根本原因

### データ構造の不整合
1. **フロントエンドの期待**: `hourlyRate`という数値フィールド
2. **実際のデータ**: `rate`オブジェクト（`{min: number, max: number}`構造）
3. **結果**: `hourlyRate`がundefinedとなり、`undefined.toLocaleString()`でエラー

### 具体的な問題箇所

#### 修正前のコード（問題あり）
```typescript
// index.tsx
{
  title: '単価',
  dataIndex: 'hourlyRate',  // 存在しないフィールド
  key: 'hourlyRate',
  render: (rate) => (
    <span>¥{rate.toLocaleString()}</span>  // undefinedでエラー
  ),
}
```

#### モックデータの構造
```typescript
// offerApi.ts
engineers: [
  {
    rate: { min: 60, max: 80 },  // hourlyRateではなくrateオブジェクト
    // hourlyRate: undefined  // このフィールドは存在しない
  }
]
```

---

## 解決方法

### 1. テーブルカラムの修正
```typescript
// index.tsx
{
  title: '単価',
  dataIndex: 'rate',  // 正しいフィールド名に変更
  key: 'hourlyRate',
  width: 150,
  sorter: true,
  render: (rate) => (
    <span data-testid="engineer-rate">
      {rate && rate.min && rate.max 
        ? `¥${rate.min}〜${rate.max}万/月`  // 範囲表示
        : '-'}  // nullチェック
    </span>
  ),
}
```

### 2. 型定義の更新
```typescript
// types/offer.ts
export interface Engineer {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  availability: string;
  availabilityStatus?: 'available' | 'pending' | 'unavailable';
  rate?: {  // rateオブジェクトを追加
    min: number;
    max: number;
  };
  hourlyRate?: number;  // 後方互換性のため残す（オプショナル）
  lastOfferStatus?: OfferStatus | null;
  // ...
}
```

### 3. モックデータの構造統一
```typescript
// offerApi.ts
const mockOfferBoardData: OfferBoardData = {
  statistics: { /* ... */ },
  summary: {  // OfferSummaryコンポーネント用
    totalOffers: 48,
    monthlyOffers: 15,
    weeklyOffers: 8,
    todayOffers: 3,
    pendingResponses: 12,
    acceptanceRate: 65,
  },
  engineers: [
    {
      id: '1',
      name: '田中太郎',
      rate: { min: 60, max: 80 },  // 統一された構造
      lastOfferStatus: null,
      // ...
    }
  ]
}
```

---

## 予防策

### 1. TypeScriptの厳格な設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "strict": true
  }
}
```

### 2. Optional Chainingの使用
```typescript
// 安全なプロパティアクセス
render: (rate) => (
  <span>{rate?.toLocaleString() ?? '-'}</span>
)
```

### 3. データ検証の実装
```typescript
// データ取得時の検証
const validateEngineerData = (engineer: any): Engineer => {
  return {
    ...engineer,
    rate: engineer.rate || { min: 0, max: 0 },
    hourlyRate: engineer.hourlyRate || null,
  };
};
```

### 4. テストケースの追加
```typescript
// OfferBoard.test.tsx
it('should handle undefined rate gracefully', () => {
  const engineerWithoutRate = {
    id: '1',
    name: 'テスト太郎',
    // rateもhourlyRateも未定義
  };
  
  render(<OfferBoard />);
  expect(screen.getByText('-')).toBeInTheDocument();
});
```

---

## 関連ファイル
- `frontend/src/pages/Client/OfferBoard/index.tsx` - メインコンポーネント
- `frontend/src/api/client/offerApi.ts` - APIクライアントとモックデータ
- `frontend/src/types/offer.ts` - 型定義
- `frontend/src/pages/Client/OfferBoard/OfferSummary.tsx` - サマリーコンポーネント

---

## チェックリスト

### エラー修正時の確認項目
- [ ] undefined/nullチェックの実装
- [ ] 型定義とデータ構造の一致確認
- [ ] モックデータと本番データの構造統一
- [ ] テストケースでエッジケースをカバー
- [ ] TypeScriptコンパイルエラーがないことを確認

### デバッグ手順
1. ブラウザのコンソールでエラー箇所を特定
2. 該当するデータフィールドの存在確認
3. 型定義とデータ構造の比較
4. nullチェックの追加
5. テスト実行で動作確認

---

## 学んだこと

### 1. データ構造の一貫性の重要性
- フロントエンドとバックエンドでデータ構造を統一する
- 型定義は実際のデータに基づいて作成する
- モックデータは本番データと同じ構造にする

### 2. 防御的プログラミング
- 常にnull/undefinedチェックを行う
- Optional chainingを活用する
- デフォルト値を設定する

### 3. TypeScriptの活用
- strictモードで開発する
- 型定義を正確に保つ
- コンパイル時エラーで問題を早期発見

---

## 今後の改善点

1. **APIスキーマの文書化**
   - OpenAPI/Swaggerでスキーマ定義
   - 自動型生成ツールの導入

2. **ランタイム検証**
   - Zodやio-tsでランタイム型チェック
   - APIレスポンスのバリデーション

3. **E2Eテスト**
   - 実際のユーザーフローでテスト
   - エラーケースの網羅的なテスト

4. **エラーバウンダリー**
   - コンポーネントレベルでエラーキャッチ
   - ユーザーフレンドリーなエラー表示