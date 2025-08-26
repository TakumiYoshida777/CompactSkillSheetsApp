import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingDetails() {
  console.log('BusinessPartnerDetailの追加処理開始...\n');
  
  // すべてのBusinessPartnerを取得
  const allPartners = await prisma.businessPartner.findMany({});
  
  // 既存のBusinessPartnerDetailを取得
  const existingDetails = await prisma.businessPartnerDetail.findMany({});
  const existingDetailIds = new Set(existingDetails.map(d => d.businessPartnerId));
  
  // DetailがないPartnerをフィルタリング
  const partnersWithoutDetails = allPartners.filter(p => !existingDetailIds.has(p.id));
  
  console.log(`${partnersWithoutDetails.length}件の詳細データが不足しています\n`);
  
  for (const partner of partnersWithoutDetails) {
    try {
      // CLIENT企業情報を取得
      const company = await prisma.company.findUnique({
        where: { id: partner.clientCompanyId }
      });
      
      console.log(`処理中: ${company?.name || 'Unknown'}`);
      
      await prisma.businessPartnerDetail.create({
        data: {
          businessPartnerId: partner.id,
          companyNameKana: '',
          industry: '未分類',
          contractTypes: ['準委任契約'],
          currentEngineers: 0,
          monthlyRevenue: 0,
          totalProposals: 0,
          acceptedProposals: 0
        }
      });
      
      console.log('  ✅ 詳細データを作成しました');
    } catch (error) {
      console.error(`  ❌ エラー:`, error);
    }
  }
  
  console.log('\n処理完了');
}

addMissingDetails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());