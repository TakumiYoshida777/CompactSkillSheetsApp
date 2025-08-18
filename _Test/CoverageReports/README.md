# Coverage Reports

このディレクトリには、テストカバレッジに関するレポートと分析結果を格納します。

## ディレクトリ構成

```
CoverageReports/
├── README.md                       # このファイル
├── テストカバレッジ分析レポート.md    # 現在のカバレッジ分析
├── frontend/                       # フロントエンドのカバレッジレポート（自動生成）
│   └── lcov-report/               # HTMLカバレッジレポート
└── backend/                        # バックエンドのカバレッジレポート（自動生成）
    └── coverage/                   # HTMLカバレッジレポート
```

## カバレッジレポートの生成方法

### フロントエンド
```bash
cd frontend
npm run test:coverage
# レポートは frontend/coverage に生成されます
```

### バックエンド
```bash
cd backend
npm run test:coverage
# レポートは backend/coverage に生成されます
```

## カバレッジ目標

- **全体**: 80%以上
- **ビジネスロジック**: 90%以上
- **UIコンポーネント**: 70%以上
- **ユーティリティ**: 95%以上

## 関連ドキュメント

- [テストカバレッジ分析レポート](./テストカバレッジ分析レポート.md)
- [テスト設計書](../../_Documents/テスト設計書.md)