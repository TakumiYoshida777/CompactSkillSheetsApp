# タスク完了時チェックリスト

## 必須実行項目

### 1. コード品質チェック
```bash
# フロントエンド
cd frontend
npm run lint          # ESLintエラーがないこと
npm run type-check    # TypeScriptエラーがないこと

# バックエンド
cd backend
npm run lint          # ESLintエラーがないこと
npm run type-check    # TypeScriptエラーがないこと
```

### 2. テスト実行
```bash
# フロントエンド
cd frontend
npm test -- --run     # 全テストがパスすること

# カバレッジ確認（80%以上）
npm test -- --coverage --run

# バックエンド
cd backend
npm test             # 全テストがパスすること
npm run test:coverage # カバレッジ80%以上
```

### 3. 動作確認
- [ ] Docker環境で動作確認
- [ ] 機能が正しく動作することを確認
- [ ] レスポンシブデザインの確認（モバイル・タブレット・デスクトップ）
- [ ] エラーハンドリングの確認
- [ ] コンソールエラーがないことを確認

### 4. セルフレビュー項目
- [ ] 要件を満たしているか
- [ ] 不要なコメント・console.logが残っていないか
- [ ] セキュリティホールがないか
- [ ] パフォーマンスの問題がないか
- [ ] エラーハンドリングが適切か
- [ ] テストが十分に書かれているか

### 5. ドキュメント更新
- [ ] 必要に応じてREADME.mdを更新
- [ ] APIドキュメントの更新（新規エンドポイントの場合）
- [ ] 複雑な実装には適切なコメントを追加

### 6. Git操作
```bash
# 変更確認
git status
git diff

# ステージング前の最終確認
git add .
git status

# コミット（日本語メッセージ）
git commit -m "feat: 実装内容の説明

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 7. テスト結果の記録
```bash
# _Testディレクトリにテスト結果を保存
# ファイル名: PR番号_PRタイトル.md
```

## 重要な注意事項

### 絶対にやってはいけないこと
- ❌ UUIDの使用
- ❌ 暫定対応・一時的な修正
- ❌ テストなしでのコミット
- ❌ console.logを残したままコミット
- ❌ セキュリティ情報（パスワード、APIキーなど）のハードコーディング

### 推奨事項
- ✅ Kent Beck氏のTDD実践
- ✅ DRY原則の遵守
- ✅ 日本語でのコメント・コミットメッセージ
- ✅ レスポンシブデザインの考慮
- ✅ アクセシビリティの確保（WCAG 2.1 AA準拠）

## トラブルシューティング

### テストが失敗する場合
1. `node_modules`の再インストール
```bash
rm -rf node_modules package-lock.json
npm install
```

2. キャッシュクリア
```bash
npm cache clean --force
```

3. Dockerコンテナの再起動
```bash
docker-compose restart
```

### ポート競合の場合
```bash
# 使用中のポート確認
lsof -i :5173  # フロントエンド
lsof -i :8000  # バックエンド

# プロセスの終了
kill -9 <PID>
```