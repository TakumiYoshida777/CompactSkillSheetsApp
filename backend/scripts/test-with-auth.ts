#!/usr/bin/env ts-node

/**
 * 認証付きAPIテストスクリプト
 * Feature Flag切り替えによる新旧API動作確認
 */

import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:8000';
const JWT_SECRET = 'dev-jwt-secret-change-in-production';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

/**
 * テスト用JWTトークン生成
 */
async function generateTestToken() {
  // SES企業のユーザーを取得または作成
  let testUser = await prisma.user.findFirst({
    where: {
      email: 'test@ses.example.com',
      companyId: 5n // SES企業ID
    }
  });

  if (!testUser) {
    console.log('テストユーザーを作成しています...');
    testUser = await prisma.user.create({
      data: {
        email: 'test@ses.example.com',
        passwordHash: '$2b$10$dummyhashedpassword', // ダミーハッシュ
        name: 'テストユーザー',
        companyId: 5n
      }
    });
    
    // ロールを割り当て
    await prisma.userRole.create({
      data: {
        userId: testUser.id,
        roleId: 1n, // 管理者ロール
        grantedBy: 1n // システムユーザー
      }
    });
  }

  // JWTトークン生成
  const token = jwt.sign(
    {
      id: testUser.id.toString(),
      email: testUser.email,
      companyId: testUser.companyId?.toString(),
      name: testUser.name
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, user: testUser };
}

/**
 * APIテスト実行
 */
async function testAPI(endpoint: string, token: string): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return {
        endpoint,
        status: 'success',
        message: `Status: ${response.status}`,
        data
      };
    } else {
      return {
        endpoint,
        status: 'error',
        message: `Status: ${response.status}`,
        data
      };
    }
  } catch (error: any) {
    return {
      endpoint,
      status: 'error',
      message: error.message,
      data: null
    };
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('========================================');
  console.log('   認証付きAPIテスト開始');
  console.log('========================================\n');

  try {
    // トークン生成
    console.log('🔑 認証トークンを生成中...');
    const { token, user } = await generateTestToken();
    console.log(`✅ トークン生成完了 (User: ${user.email})\n`);

    // Feature Flag状態確認（コンテナ内の環境変数をチェック）
    const { isFeatureEnabled } = await import('../src/config/featureFlags');
    const useNewAPI = isFeatureEnabled('useNewBusinessPartnerAPI');
    console.log(`🚦 Feature Flag (USE_NEW_BP_API): ${useNewAPI ? 'ON 🟢' : 'OFF 🔴'}\n`);

    // テスト対象エンドポイント
    const endpoints = [
      '/api/health',
      '/api/v1/partner-list?page=1&limit=5',
      '/api/business-partners?page=1&limit=5',
    ];

    console.log('📝 APIエンドポイントテスト\n');
    const results: TestResult[] = [];

    for (const endpoint of endpoints) {
      console.log(`Testing: ${endpoint}`);
      const result = await testAPI(endpoint, token);
      results.push(result);
      
      console.log(`  ${result.status === 'success' ? '✅' : '❌'} ${result.message}`);
      
      if (result.data) {
        // データの概要を表示
        if (Array.isArray(result.data)) {
          console.log(`  データ件数: ${result.data.length}`);
          if (result.data.length > 0) {
            console.log(`  最初のデータ: ${JSON.stringify(result.data[0].companyName || result.data[0].name || 'N/A')}`);
          }
        } else if (result.data.data) {
          console.log(`  データ件数: ${result.data.data.length}`);
          if (result.data.data.length > 0) {
            console.log(`  最初のデータ: ${JSON.stringify(result.data.data[0].companyName || 'N/A')}`);
          }
        } else if (result.data.error) {
          console.log(`  エラー: ${result.data.error.message}`);
        }
      }
      console.log('');
    }

    // データ比較（Feature FlagがONの場合）
    if (useNewAPI) {
      console.log('📊 新旧API比較\n');
      
      const oldAPIResult = results.find(r => r.endpoint.includes('partner-list'));
      const newAPIResult = results.find(r => r.endpoint.includes('business-partners'));
      
      if (oldAPIResult?.status === 'success' && newAPIResult?.status === 'success') {
        console.log('✅ 両方のAPIが正常に動作しています');
        
        // データ構造の比較
        const oldData = Array.isArray(oldAPIResult.data) ? oldAPIResult.data : oldAPIResult.data?.data || [];
        const newData = Array.isArray(newAPIResult.data) ? newAPIResult.data : newAPIResult.data?.data || [];
        
        console.log(`  旧API: ${oldData.length}件のデータ`);
        console.log(`  新API: ${newData.length}件のデータ`);
        
        if (oldData.length > 0 && newData.length > 0) {
          console.log('\n  データ構造比較:');
          console.log(`  旧API キー: ${Object.keys(oldData[0]).slice(0, 5).join(', ')}...`);
          console.log(`  新API キー: ${Object.keys(newData[0]).slice(0, 5).join(', ')}...`);
          
          // 同じ構造か確認
          const keysMatch = JSON.stringify(Object.keys(oldData[0]).sort()) === 
                           JSON.stringify(Object.keys(newData[0]).sort());
          console.log(`  構造一致: ${keysMatch ? '✅' : '❌'}`);
        }
      }
    }

    // テスト結果サマリー
    console.log('\n========================================');
    console.log('   テスト結果サマリー');
    console.log('========================================\n');
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失敗: ${errorCount}`);
    console.log(`📊 合計: ${results.length}\n`);

    if (errorCount > 0) {
      console.log('失敗したエンドポイント:');
      results.filter(r => r.status === 'error').forEach(r => {
        console.log(`  - ${r.endpoint}: ${r.message}`);
      });
    }

    // 推奨事項
    console.log('\n💡 次のステップ:');
    if (useNewAPI) {
      console.log('1. ✅ Feature FlagがONです。新実装のテストを継続してください');
      console.log('2. フロントエンドで実際の動作を確認');
      console.log('3. パフォーマンスモニタリングを実施');
    } else {
      console.log('1. ⚠️ Feature FlagがOFFです。新実装をテストするには:');
      console.log('   USE_NEW_BP_API=true に設定してください');
      console.log('2. docker-compose restart backend でコンテナを再起動');
    }

  } catch (error) {
    console.error('テスト実行エラー:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
main().catch(console.error);