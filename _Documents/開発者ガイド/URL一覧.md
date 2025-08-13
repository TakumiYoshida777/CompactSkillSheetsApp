# 📋 URL一覧

作成日: 2025年8月13日  
更新者: AI システム整理  
バージョン: 1.1

---

## 📌 概要

エンジニアスキルシート管理システムで使用されるすべてのURLを体系的に整理した一覧です。

---

## 🏗️ URL体系

### 基本構成
```
https://[domain]/[user-type]/[feature]/[action]
```

### ユーザータイプ別プレフィックス

| プレフィックス | 対象ユーザー | 用途 |
|:-------------|:-----------|:-----|
| `/auth` | 全ユーザー共通 | 認証関連 |
| `/company` | SES企業 | 企業向け機能 |
| `/client` | 取引先企業 | 取引先向け機能 |
| `/engineer` | フリーランス | エンジニア向け機能 |
| `/admin` | システム管理者 | 管理機能 |
| `/api` | システム | APIエンドポイント |

---

## 🔐 認証系画面

| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **AUTH001** | ログイン | `/login` |
| **AUTH002** | ユーザー登録 | `/register` |
| **AUTH003** | パスワードリセット | `/password-reset` |
| **AUTH004** | MFA設定 | `/mfa-setup` |

---

## 🏢 SES企業向け画面

### ダッシュボード・メイン機能
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **DASH001** | ダッシュボード | `/company/dashboard` |
| **SRC001** | エンジニア検索 | `/company/search` |
| **SET001** | 設定画面 | `/company/settings` |

### エンジニア管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **ENG001** | エンジニア一覧 | `/company/engineers` |
| **ENG002** | エンジニア詳細 | `/company/engineers/:id` |
| **ENG003** | エンジニア新規登録 | `/company/engineers/new` |
| **ENG003** | エンジニア編集 | `/company/engineers/:id/edit` |

### スキルシート管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **SKL001** | スキルシート一覧 | `/company/skill-sheets` |
| **SKL002** | スキルシート詳細 | `/company/skill-sheets/:id` |
| **SKL002** | スキルシート編集 | `/company/skill-sheets/:id/edit` |

### プロジェクト管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **PRJ001** | プロジェクト一覧 | `/company/projects` |
| **PRJ002** | プロジェクト詳細 | `/company/projects/:id` |
| **PRJ003** | プロジェクト新規登録 | `/company/projects/new` |
| **PRJ003** | プロジェクト編集 | `/company/projects/:id/edit` |

### アプローチ・取引先管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **APP001** | アプローチ履歴 | `/company/approaches` |
| **APP002** | アプローチ作成 | `/company/approaches/new` |
| **BIZ001** | 取引先一覧 | `/company/clients` |
| **BIZ002** | 取引先詳細 | `/company/clients/:id` |

---

## 🤝 取引先向け画面

| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **CLI001** | ダッシュボード | `/client/dashboard` |
| **CLI002** | エンジニア検索 | `/client/search` |
| **CLI003** | エンジニア詳細 | `/client/engineers/:id` |
| **CLI004** | アサイン依頼 | `/client/assign-request` |

---

## 👨‍💻 フリーランス・エンジニア向け画面

| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **FRL001** | ダッシュボード | `/engineer/dashboard` |
| **FRL002** | プロフィール編集 | `/engineer/profile` |
| **FRL003** | スキルシート編集 | `/engineer/skill-sheet` |
| **FRL004** | アプローチ履歴 | `/engineer/approach-history` |

---

## ⚙️ 管理者向け画面

### メイン機能
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **ADM001** | 管理者ダッシュボード | `/admin/dashboard` |
| **ADM007** | システム設定 | `/admin/system-settings` |

### 企業・契約管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **ADM002** | 企業一覧 | `/admin/companies` |
| | 企業詳細 | `/admin/companies/:id` |
| | 企業編集 | `/admin/companies/:id/edit` |
| **ADM003** | 契約一覧 | `/admin/contracts` |
| | 契約詳細 | `/admin/contracts/:id` |

### 請求・売上管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **ADM004** | 請求書一覧 | `/admin/invoices` |
| | 請求書詳細 | `/admin/invoices/:id` |
| **ADM005** | 売上分析 | `/admin/analytics/revenue` |
| **ADM015** | 利用統計 | `/admin/analytics/usage` |

### ユーザー・セキュリティ管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **ADM006** | ユーザー一覧 | `/admin/users` |
| | ユーザー詳細 | `/admin/users/:id` |
| | ユーザー編集 | `/admin/users/:id/edit` |
| **ADM008** | 監査ログ | `/admin/audit-logs` |
| **ADM013** | セキュリティ管理 | `/admin/security` |

### システム運用管理
| 画面ID | 画面名 | URL |
|:-------|:-------|:----|
| **ADM009** | サポート管理 | `/admin/support` |
| | チケット詳細 | `/admin/support/:id` |
| **ADM010** | メンテナンス管理 | `/admin/maintenance` |
| **ADM011** | お知らせ一覧 | `/admin/announcements` |
| | お知らせ作成 | `/admin/announcements/new` |
| | お知らせ編集 | `/admin/announcements/:id/edit` |
| **ADM012** | バックアップ管理 | `/admin/backups` |
| **ADM014** | 機能制御管理 | `/admin/feature-flags` |

---

## 🔧 共通画面・コンポーネント

| 画面ID | コンポーネント名 | パス/URL |
|:-------|:--------------|:--------|
| **CMN001** | ヘッダー | `<Header />` |
| **CMN002** | サイドメニュー | `<Sidebar />` |
| **CMN003** | 通知センター | `/notifications` |
| **CMN004** | プロフィール設定 | `/profile/settings` |
| **CMN005** | ヘルプ・サポート | `/help` |

---

## 🚀 API エンドポイント

### 認証API

| メソッド | エンドポイント | 説明 |
|:--------|:-------------|:-----|
| `POST` | `/api/auth/login` | ログイン |
| `POST` | `/api/auth/logout` | ログアウト |
| `POST` | `/api/auth/register` | ユーザー登録 |
| `POST` | `/api/auth/password-reset` | パスワードリセット |
| `POST` | `/api/auth/refresh` | トークンリフレッシュ |

### エンジニアAPI

| メソッド | エンドポイント | 説明 |
|:--------|:-------------|:-----|
| `GET` | `/api/engineers` | 一覧取得 |
| `GET` | `/api/engineers/:id` | 詳細取得 |
| `POST` | `/api/engineers` | 新規登録 |
| `PUT` | `/api/engineers/:id` | 更新 |
| `DELETE` | `/api/engineers/:id` | 削除 |

### スキルシートAPI

| メソッド | エンドポイント | 説明 |
|:--------|:-------------|:-----|
| `GET` | `/api/skill-sheets` | 一覧取得 |
| `GET` | `/api/skill-sheets/:id` | 詳細取得 |
| `POST` | `/api/skill-sheets` | 新規作成 |
| `PUT` | `/api/skill-sheets/:id` | 更新 |
| `DELETE` | `/api/skill-sheets/:id` | 削除 |

### プロジェクトAPI

| メソッド | エンドポイント | 説明 |
|:--------|:-------------|:-----|
| `GET` | `/api/projects` | 一覧取得 |
| `GET` | `/api/projects/:id` | 詳細取得 |
| `POST` | `/api/projects` | 新規作成 |
| `PUT` | `/api/projects/:id` | 更新 |
| `DELETE` | `/api/projects/:id` | 削除 |

---

## 🛡️ アクセス制御

### ルートタイプ

| タイプ | 説明 | 例 |
|:------|:-----|:---|
| **PublicRoute** | 認証不要 | `/login`, `/register` |
| **ProtectedRoute** | 認証必須 | `/company/*`, `/engineer/*` |
| **AdminRoute** | 管理者のみ | `/admin/*` |

### ロールベースアクセス

| ユーザータイプ | アクセス可能ルート |
|:-------------|:-----------------|
| 🏢 **SES企業** | `/company/*` |
| 🤝 **取引先** | `/client/*` |
| 👨‍💻 **フリーランス** | `/engineer/*` |
| ⚙️ **管理者** | `/admin/*` + すべてのルート |

---

## 📝 URL命名規則

### 基本ルール

✅ **DO**
- 小文字のみ使用
- 単語区切りはハイフン（`-`）
- リソース名は複数形（`engineers`, `projects`）
- RESTfulな設計

❌ **DON'T**
- 大文字・アンダースコア使用
- 動詞の使用（例外: `search`, `export`）
- 不必要に深いネスト

### CRUD操作パターン

| 操作 | URLパターン | 例 |
|:-----|:----------|:---|
| **一覧** | `/[resources]` | `/engineers` |
| **詳細** | `/[resources]/:id` | `/engineers/123` |
| **新規** | `/[resources]/new` | `/engineers/new` |
| **編集** | `/[resources]/:id/edit` | `/engineers/123/edit` |

### 特殊操作パターン

| 操作 | URLパターン | 例 |
|:-----|:----------|:---|
| **検索** | `/[resources]/search` | `/engineers/search` |
| **エクスポート** | `/[resources]/export` | `/skill-sheets/export` |
| **インポート** | `/[resources]/import` | `/engineers/import` |
| **分析** | `/[resources]/analytics` | `/projects/analytics` |

---

## ⚠️ 重要事項

### セキュリティ
- 🔒 すべてのAPIに適切な認証・認可を実装
- 🛡️ HTTPS必須（本番環境）
- 🚫 適切なCORS設定
- ⏱️ APIレート制限の実装

### ベストプラクティス
- 📊 APIバージョニング検討（`/api/v1/`）
- 📝 適切なHTTPステータスコード使用
- 🔄 冪等性の保証（PUT, DELETE）
- 📦 ページネーション実装（大量データ）

---

## 📅 更新履歴

| 日付 | Ver | 更新内容 | 更新者 |
|:-----|:----|:--------|:------|
| 2025/08/13 | 1.1 | 見やすさ改善・整理 | AI システム整理 |
| 2025/08/13 | 1.0 | 初版作成 | AI システム整理 |