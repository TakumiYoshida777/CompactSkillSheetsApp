# SESエンジニアスキルシート管理システム

## プロジェクト概要
SES企業向けの企業間エンジニア情報共有プラットフォーム。エンジニアのスキルシート管理、案件マッチング、アプローチ履歴管理を行うWebアプリケーション。

## 技術スタック

### フロントエンド
- **フレームワーク**: React.js + TypeScript (Vite)
- **UIライブラリ**: Ant Design 5.x
- **状態管理**: Zustand
- **ルーティング**: React Router v6
- **HTTPクライアント**: TanStack Query + Axios
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest + React Testing Library

### バックエンド
- **実行環境**: Node.js + TypeScript
- **フレームワーク**: Express.js
- **ORM**: Prisma
- **認証**: JWT + Passport.js
- **バリデーション**: Yup
- **ロギング**: Winston
- **テスト**: Jest + Supertest

### データベース・インフラ
- **データベース**: PostgreSQL 15
- **キャッシュ**: Redis 7
- **検索エンジン**: Elasticsearch 8
- **コンテナ**: Docker + Docker Compose

## プロジェクト構造
```
CompactSkillSheetsApp/
├── frontend/          # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/  # 共通コンポーネント
│   │   ├── hooks/       # カスタムフック
│   │   ├── layouts/     # レイアウトコンポーネント
│   │   ├── pages/       # ページコンポーネント
│   │   ├── stores/      # Zustand ストア
│   │   └── test/        # テスト設定
│   └── package.json
├── backend/           # バックエンドアプリケーション
│   ├── src/
│   │   ├── controllers/ # コントローラー
│   │   ├── models/      # データモデル
│   │   ├── routes/      # APIルート
│   │   ├── services/    # ビジネスロジック
│   │   └── utils/       # ユーティリティ
│   └── package.json
├── _Documents/        # プロジェクトドキュメント
├── _Features/         # 機能仕様
├── _Knowledge/        # ナレッジベース
├── _Test/            # テスト結果・レポート
├── docker-compose.yml # Docker設定
└── CLAUDE.md         # AI開発ガイドライン
```

## 主要機能
1. **エンジニア管理**: プロフィール、スキル、経歴管理
2. **スキルシート管理**: 自動生成、編集、バージョン管理
3. **案件管理**: プロジェクト情報、要件管理
4. **マッチング機能**: スキルと案件の自動マッチング
5. **アプローチ管理**: 営業活動履歴、成果管理
6. **取引先管理**: 企業情報、担当者管理
7. **レポート機能**: 稼働状況、売上分析

## 環境情報
- **開発環境**: http://localhost:5173 (フロント) / http://localhost:8000 (バック)
- **データベース**: PostgreSQL (localhost:5432)
- **Redis**: localhost:6379
- **Elasticsearch**: localhost:9200