/**
 * 取引先企業データマイグレーションスクリプト
 * 
 * 目的：
 * - Companyテーブル（CLIENT）からBusinessPartnerテーブルへの移行
 * - ハードコーディングされたデータの実データ化
 * - 統計情報の集計と保存
 * 
 * 実行方法:
 * npx ts-node scripts/migrate-business-partners.ts
 */

import { PrismaClient, CompanyType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// 定数
const SYSTEM_USER_ID = 1n; // システムユーザーID

/**
 * アクセスURL生成
 */
function generateAccessUrl(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `partner-${timestamp}-${random}`;
}

/**
 * URLトークン生成
 */
function generateUrlToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 現在稼働中のエンジニア数を集計
 */
async function countCurrentEngineers(clientCompanyId: bigint): Promise<number> {
  const result = await prisma.projectAssignment.count({
    where: {
      project: {
        clientCompany: clientCompanyId.toString(),
      },
      endDate: null, // 現在稼働中
      status: 'ASSIGNED'
    }
  });
  return result;
}

/**
 * 月間売上を計算
 */
async function calculateMonthlyRevenue(clientCompanyId: bigint): Promise<number> {
  const assignments = await prisma.projectAssignment.findMany({
    where: {
      project: {
        clientCompany: clientCompanyId.toString(),
      },
      endDate: null,
      status: 'ASSIGNED'
    },
    include: {
      project: true
    }
  });

  let totalRevenue = 0;
  assignments.forEach(assignment => {
    if (assignment.project.monthlyRate) {
      totalRevenue += assignment.project.monthlyRate * (assignment.allocationPercentage / 100);
    }
  });

  return totalRevenue;
}

/**
 * 提案数を集計
 */
async function countProposals(clientCompanyId: bigint): Promise<{ total: number; accepted: number }> {
  const approaches = await prisma.approach.findMany({
    where: {
      toCompanyId: clientCompanyId
    }
  });

  const total = approaches.length;
  const accepted = approaches.filter(a => a.status === 'ACCEPTED' as any).length;

  return { total, accepted };
}

/**
 * 業界マッピング（暫定実装から移行）
 */
function getIndustry(companyName: string): string {
  const industryMap: { [key: string]: string } = {
    '株式会社ABC商事': 'IT・通信',
    'XYZ株式会社': '金融・保険',
    '株式会社テックコーポレーション': 'IT・通信',
    'グローバルソリューションズ株式会社': 'コンサルティング',
    '株式会社イノベーションラボ': 'IT・通信',
  };
  return industryMap[companyName] || '未分類';
}

/**
 * 契約形態マッピング
 */
function getContractTypes(companyName: string): string[] {
  const contractMap: { [key: string]: string[] } = {
    '株式会社ABC商事': ['準委任契約', '派遣契約'],
    'XYZ株式会社': ['請負契約', '準委任契約'],
    '株式会社テックコーポレーション': ['準委任契約'],
    'グローバルソリューションズ株式会社': ['派遣契約', '準委任契約'],
    '株式会社イノベーションラボ': ['準委任契約', '請負契約'],
  };
  return contractMap[companyName] || ['準委任契約'];
}

// /**
//  * 求めるスキルマッピング
//  */
// function getPreferredSkills(companyName: string): string[] {
//   const skillsMap: { [key: string]: string[] } = {
//     '株式会社ABC商事': ['React', 'TypeScript', 'AWS'],
//     'XYZ株式会社': ['Java', 'Spring', 'Oracle'],
//     '株式会社テックコーポレーション': ['Python', 'Django', 'PostgreSQL'],
//     'グローバルソリューションズ株式会社': ['C#', '.NET', 'Azure'],
//     '株式会社イノベーションラボ': ['Go', 'Kubernetes', 'GCP'],
//   };
//   return skillsMap[companyName] || ['JavaScript', 'SQL'];
// }

/**
 * メインマイグレーション処理
 */
async function migrateBusinessPartners() {
  console.log('🚀 取引先企業データマイグレーション開始...\n');

  try {
    // 0. SES企業の確認と作成
    let sesCompany = await prisma.company.findFirst({
      where: { companyType: CompanyType.SES }
    });
    
    if (!sesCompany) {
      console.log('⚠️  SES企業が存在しません。デフォルトSES企業を作成します...');
      sesCompany = await prisma.company.create({
        data: {
          name: 'デフォルトSES企業',
          companyType: CompanyType.SES
        }
      });
      console.log(`✅ デフォルトSES企業を作成しました (ID: ${sesCompany.id})\n`);
    } else {
      console.log(`✅ 既存のSES企業を使用します (ID: ${sesCompany.id}, Name: ${sesCompany.name})\n`);
    }
    
    const SES_COMPANY_ID = sesCompany.id;

    // 1. CLIENT企業を取得
    const clientCompanies = await prisma.company.findMany({
      where: { 
        companyType: CompanyType.CLIENT,
      }
    });

    console.log(`✅ ${clientCompanies.length}件のCLIENT企業を検出\n`);

    let successCount = 0;
    let errorCount = 0;

    // 2. 各企業をBusinessPartnerに移行
    for (const company of clientCompanies) {
      try {
        console.log(`処理中: ${company.name}`);

        // 既存のBusinessPartnerをチェック
        const existing = await prisma.businessPartner.findFirst({
          where: {
            clientCompanyId: company.id,
            sesCompanyId: SES_COMPANY_ID
          }
        });

        if (existing) {
          console.log(`  ⏩ スキップ: 既に存在します (ID: ${existing.id})`);
          continue;
        }

        // BusinessPartnerレコード作成
        const businessPartner = await prisma.businessPartner.create({
          data: {
            sesCompanyId: SES_COMPANY_ID,
            clientCompanyId: company.id,
            accessUrl: generateAccessUrl(),
            urlToken: generateUrlToken(),
            isActive: true,
            createdBy: SYSTEM_USER_ID
          }
        });

        // 統計情報を集計
        const currentEngineers = await countCurrentEngineers(company.id);
        const monthlyRevenue = await calculateMonthlyRevenue(company.id);
        const proposals = await countProposals(company.id);

        // BusinessPartnerSetting作成
        await prisma.businessPartnerSetting.create({
          data: {
            businessPartnerId: businessPartner.id,
            viewType: 'all',
            showWaitingOnly: false,
            autoApprove: false
          }
        });

        // BusinessPartnerDetail作成（暫定実装互換用）
        await prisma.businessPartnerDetail.create({
          data: {
            businessPartnerId: businessPartner.id,
            companyNameKana: '', // 後で更新可能
            industry: getIndustry(company.name),
            contractTypes: getContractTypes(company.name),
            currentEngineers,
            monthlyRevenue,
            totalProposals: proposals.total,
            acceptedProposals: proposals.accepted
          }
        });

        console.log(`  ✅ BusinessPartner作成完了 (ID: ${businessPartner.id})`);
        console.log(`     - 稼働エンジニア: ${currentEngineers}名`);
        console.log(`     - 月間売上: ¥${monthlyRevenue.toLocaleString()}`);
        console.log(`     - 提案実績: ${proposals.accepted}/${proposals.total}`);
        
        successCount++;
      } catch (error) {
        console.error(`  ❌ エラー: ${company.name}`, error);
        errorCount++;
      }
    }

    // 3. 結果サマリー
    console.log('\n' + '='.repeat(50));
    console.log('マイグレーション完了');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${errorCount}件`);
    console.log(`📊 合計: ${clientCompanies.length}件`);

  } catch (error) {
    console.error('\n❌ マイグレーション失敗:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * ロールバック処理
 */
async function rollback() {
  console.log('⚠️  ロールバック開始...\n');
  
  try {
    // システムユーザーが作成したBusinessPartnerを削除
    const result = await prisma.businessPartner.deleteMany({
      where: {
        createdBy: SYSTEM_USER_ID,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間以内
        }
      }
    });

    console.log(`✅ ${result.count}件のレコードを削除しました`);
  } catch (error) {
    console.error('❌ ロールバック失敗:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * ドライラン（実際の変更を行わない）
 */
async function dryRun() {
  console.log('🔍 ドライラン実行中...\n');

  try {
    // SES企業の確認
    let sesCompany = await prisma.company.findFirst({
      where: { companyType: CompanyType.SES }
    });
    
    if (!sesCompany) {
      console.log('⚠️  SES企業が存在しません。実行時に作成されます。\n');
      // ドライランなので実際には作成しない
      sesCompany = { id: 1n } as any; // 仮のID
    }
    
    const SES_COMPANY_ID = sesCompany!.id;

    const clientCompanies = await prisma.company.findMany({
      where: { 
        companyType: CompanyType.CLIENT,
      }
    });

    console.log(`📊 移行対象: ${clientCompanies.length}件\n`);

    for (const company of clientCompanies) {
      const existing = await prisma.businessPartner.findFirst({
        where: {
          clientCompanyId: company.id,
          sesCompanyId: SES_COMPANY_ID
        }
      });

      const status = existing ? '既存' : '新規';
      const currentEngineers = await countCurrentEngineers(company.id);
      const monthlyRevenue = await calculateMonthlyRevenue(company.id);

      console.log(`[${status}] ${company.name}`);
      console.log(`  - ID: ${company.id}`);
      console.log(`  - 業界: ${getIndustry(company.name)}`);
      console.log(`  - 契約形態: ${getContractTypes(company.name).join(', ')}`);
      console.log(`  - 稼働エンジニア: ${currentEngineers}名`);
      console.log(`  - 月間売上: ¥${monthlyRevenue.toLocaleString()}\n`);
    }

  } catch (error) {
    console.error('❌ ドライラン失敗:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// コマンドライン引数処理
const command = process.argv[2];

switch (command) {
  case 'migrate':
    migrateBusinessPartners();
    break;
  case 'rollback':
    rollback();
    break;
  case 'dry-run':
    dryRun();
    break;
  default:
    console.log('使用方法:');
    console.log('  npx ts-node scripts/migrate-business-partners.ts migrate   # 実行');
    console.log('  npx ts-node scripts/migrate-business-partners.ts dry-run   # ドライラン');
    console.log('  npx ts-node scripts/migrate-business-partners.ts rollback  # ロールバック');
    process.exit(1);
}