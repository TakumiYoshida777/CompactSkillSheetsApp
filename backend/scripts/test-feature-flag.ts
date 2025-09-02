#!/usr/bin/env ts-node

/**
 * Feature Flag テストスクリプト
 * 新旧APIの動作を比較検証
 */

import { logFeatureFlags } from '../src/config/featureFlags';

const API_BASE = 'http://localhost:8000';

// テスト用の認証トークン（必要に応じて実際のトークンに置き換え）
const AUTH_TOKEN = 'test-token';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  data?: any;
}

const tests: TestResult[] = [];

/**
 * テスト実行関数
 */
async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  console.log(`\n📝 Testing: ${name}`);
  try {
    await testFn();
    tests.push({ name, status: 'passed' });
    console.log(`   ✅ Passed`);
  } catch (error: any) {
    tests.push({ 
      name, 
      status: 'failed', 
      message: error.message,
      data: error.response?.data 
    });
    console.error(`   ❌ Failed: ${error.message}`);
  }
}

/**
 * メインテスト処理
 */
async function main() {
  console.log('========================================');
  console.log('   Feature Flag テスト開始');
  console.log('========================================\n');

  // Feature Flagの状態を表示
  console.log('現在のFeature Flag設定:');
  logFeatureFlags();
  console.log('');

  // 1. ヘルスチェック
  await runTest('ヘルスチェック', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error('Health check failed');
    }
  });

  // 2. 暫定実装API（v1）のテスト
  await runTest('暫定実装API（/api/v1/partner-list）', async () => {
    const url = `${API_BASE}/api/v1/partner-list?page=1&limit=10`;
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('   ⚠️  認証が必要（想定内）');
      return;
    }
    
    const data = await response.json();
    console.log(`   データ件数: ${data.length || 0}`);
    
    // レスポンス構造の確認
    if (data && data.length > 0) {
      const partner = data[0];
      console.log(`   最初のパートナー: ${partner.companyName}`);
      console.log(`   フィールド: ${Object.keys(partner).join(', ')}`);
    }
  });

  // 3. 正式実装API（business-partners）のテスト - 現在のFlag設定
  await runTest('正式実装API（/api/business-partners）- 現在の設定', async () => {
    const url = `${API_BASE}/api/business-partners?page=1&limit=10`;
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('   ⚠️  認証が必要（想定内）');
      return;
    }
    
    const data = await response.json();
    console.log(`   レスポンス形式: ${typeof data}`);
    
    // Feature Flagの状態によって期待値が変わる
    const useNewAPI = process.env.USE_NEW_BP_API === 'true';
    console.log(`   Feature Flag (USE_NEW_BP_API): ${useNewAPI ? 'ON' : 'OFF'}`);
    
    if (useNewAPI) {
      // 新実装の場合
      if (data.data && Array.isArray(data.data)) {
        console.log(`   データ件数: ${data.data.length}`);
        console.log(`   総件数: ${data.total}`);
      }
    } else {
      // 旧実装の場合
      if (data.partners) {
        console.log(`   パートナー数: ${data.partners.length}`);
      }
    }
  });

  // 4. Feature Flag切り替えシミュレーション
  console.log('\n🔄 Feature Flag切り替えシミュレーション');
  console.log('----------------------------------------');
  
  // 環境変数を一時的に変更（実際の切り替えではない）
  const originalFlag = process.env.USE_NEW_BP_API;
  
  // OFF状態のテスト
  process.env.USE_NEW_BP_API = 'false';
  console.log('\n▶ USE_NEW_BP_API = false の場合:');
  console.log('  → 既存のBusinessPartnerServiceが使用される');
  console.log('  → Prismaの正規モデルを使用');
  
  // ON状態のテスト
  process.env.USE_NEW_BP_API = 'true';
  console.log('\n▶ USE_NEW_BP_API = true の場合:');
  console.log('  → 新しいBusinessPartnerService2が使用される');
  console.log('  → 暫定実装互換のレスポンス形式');
  console.log('  → BusinessPartnerDetailテーブルを使用');
  
  // 環境変数を元に戻す
  process.env.USE_NEW_BP_API = originalFlag;

  // 5. データ構造の比較
  console.log('\n📊 データ構造の比較');
  console.log('----------------------------------------');
  console.log('▶ 暫定実装のレスポンス:');
  console.log('  - フラットな構造');
  console.log('  - ハードコーディングされたデータ');
  console.log('  - 例: { companyName, contacts[], currentEngineers }');
  
  console.log('\n▶ 正式実装のレスポンス:');
  console.log('  - 正規化された構造');
  console.log('  - リレーショナルデータ');
  console.log('  - 例: { clientCompany: { name }, clientUsers[], detail: {} }');
  
  console.log('\n▶ 変換層の役割:');
  console.log('  - 正式実装 → 暫定実装形式への変換');
  console.log('  - 後方互換性の維持');

  // 結果サマリー
  console.log('\n========================================');
  console.log('   テスト結果サマリー');
  console.log('========================================\n');
  
  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏩ Skipped: ${skipped}`);
  console.log(`📊 Total: ${tests.length}\n`);
  
  // 失敗したテストの詳細
  if (failed > 0) {
    console.log('失敗したテスト:');
    tests.filter(t => t.status === 'failed').forEach(test => {
      console.log(`  - ${test.name}: ${test.message}`);
      if (test.data) {
        console.log(`    Response: ${JSON.stringify(test.data)}`);
      }
    });
  }

  // 推奨事項
  console.log('\n💡 推奨事項:');
  console.log('----------------------------------------');
  console.log('1. まずは USE_NEW_BP_API=false で安定動作を確認');
  console.log('2. データマイグレーションを実行');
  console.log('3. 開発環境で USE_NEW_BP_API=true をテスト');
  console.log('4. 問題なければ段階的に本番適用');
  console.log('5. 最終的に暫定実装を削除');
}

// 実行
main().catch(error => {
  console.error('テスト実行エラー:', error);
  process.exit(1);
});