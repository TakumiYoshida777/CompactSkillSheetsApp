import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 取引先サンプルデータの投入を開始します...');

  // 既存のテストデータを削除（依存関係を考慮）
  const targetCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: 'テスト企業' } },
        { name: { in: ['株式会社ABC商事', 'XYZ株式会社', 'テックコーポレーション', 'グローバルシステムズ'] } }
      ]
    }
  });

  const companyIds = targetCompanies.map(c => c.id);
  
  if (companyIds.length > 0) {
    // business_partnersに紐づくレコードを削除
    const businessPartners = await prisma.businessPartner.findMany({
      where: { clientCompanyId: { in: companyIds } }
    });
    
    const partnerIds = businessPartners.map(p => p.id);
    
    if (partnerIds.length > 0) {
      // 依存関係を削除
      await prisma.clientUser.deleteMany({
        where: { businessPartnerId: { in: partnerIds } }
      });
      await prisma.clientAccessPermission.deleteMany({
        where: { businessPartnerId: { in: partnerIds } }
      });
    }
    
    // business_partnersレコードを削除
    await prisma.businessPartner.deleteMany({
      where: { clientCompanyId: { in: companyIds } }
    });
    
    // アプローチ履歴を削除
    await prisma.approach.deleteMany({
      where: { 
        OR: [
          { fromCompanyId: { in: companyIds } },
          { toCompanyId: { in: companyIds } }
        ]
      }
    });
    
    // 会社を削除
    await prisma.company.deleteMany({
      where: { id: { in: companyIds } }
    });
  }

  // クライアント企業を作成
  const clients = await Promise.all([
    prisma.company.create({
      data: {
        companyType: 'CLIENT',
        name: '株式会社ABC商事',
        emailDomain: 'abc-shoji.co.jp',
        address: '東京都千代田区丸の内1-1-1',
        phone: '03-1234-5678',
        websiteUrl: 'https://abc-shoji.co.jp',
        contactEmail: 'info@abc-shoji.co.jp',
        isActive: true
      }
    }),
    prisma.company.create({
      data: {
        companyType: 'CLIENT',
        name: 'XYZ株式会社',
        emailDomain: 'xyz.co.jp',
        address: '大阪府大阪市北区梅田2-2-2',
        phone: '06-9876-5432',
        websiteUrl: 'https://xyz.co.jp',
        contactEmail: 'info@xyz.co.jp',
        isActive: true
      }
    }),
    prisma.company.create({
      data: {
        companyType: 'CLIENT',
        name: 'テックコーポレーション',
        emailDomain: 'tech-corp.jp',
        address: '愛知県名古屋市中区栄3-3-3',
        phone: '052-1111-2222',
        websiteUrl: 'https://tech-corp.jp',
        contactEmail: 'info@tech-corp.jp',
        isActive: true
      }
    }),
    prisma.company.create({
      data: {
        companyType: 'CLIENT',
        name: 'グローバルシステムズ',
        emailDomain: 'global-sys.com',
        address: '福岡県福岡市博多区博多駅前4-4-4',
        phone: '092-3333-4444',
        contactEmail: 'info@global-sys.com',
        isActive: false
      }
    })
  ]);

  console.log(`✅ ${clients.length}件のクライアント企業を作成しました`);

  // SES企業を取得（既存のものを使用）
  const sesCompany = await prisma.company.findFirst({
    where: {
      companyType: 'SES',
      isActive: true
    }
  });

  if (!sesCompany) {
    // SES企業が存在しない場合は作成
    const newSesCompany = await prisma.company.create({
      data: {
        companyType: 'SES',
        name: 'テストSES株式会社',
        emailDomain: 'test-ses.co.jp',
        isActive: true
      }
    });
    console.log('✅ SES企業を作成しました');
  }

  const finalSesCompany = sesCompany || await prisma.company.findFirst({
    where: {
      companyType: 'SES',
      isActive: true
    }
  });

  if (!finalSesCompany) {
    throw new Error('SES企業が見つかりません');
  }

  // 管理者ユーザーを取得または作成
  let adminUser = await prisma.user.findFirst({
    where: {
      companyId: finalSesCompany.id
    }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        companyId: finalSesCompany.id,
        email: 'admin@test-ses.co.jp',
        passwordHash: '$2a$10$DUMMY_HASH', // ダミーハッシュ
        name: '管理者',
        isActive: true
      }
    });
    console.log('✅ 管理者ユーザーを作成しました');
  }

  // BusinessPartnerレコードを作成
  const businessPartners = await Promise.all(
    clients.map((client, index) => 
      prisma.businessPartner.create({
        data: {
          sesCompanyId: finalSesCompany.id,
          clientCompanyId: client.id,
          accessUrl: `https://skillsheet.test-ses.co.jp/partner/${client.name.toLowerCase().replace(/[株式会社\s]/g, '')}`,
          urlToken: `token_${client.name.toLowerCase().replace(/[株式会社\s]/g, '')}_${Date.now()}_${index}`,
          isActive: client.isActive,
          createdBy: adminUser.id
        }
      })
    )
  );

  console.log(`✅ ${businessPartners.length}件の取引先関係を作成しました`);

  // 各取引先にクライアントユーザーを作成
  for (const [index, partner] of businessPartners.entries()) {
    const client = clients[index];
    
    // 主担当者を作成
    await prisma.clientUser.create({
      data: {
        businessPartnerId: partner.id,
        email: `primary@${client.emailDomain || 'example.com'}`,
        passwordHash: '$2a$10$DUMMY_HASH',
        name: ['山田太郎', '鈴木一郎', '田中次郎', '伊藤三郎'][index],
        phone: client.phone,
        department: ['人事部', 'IT戦略部', 'DX推進室', '採用部'][index],
        position: ['部長', '部長', '室長', 'マネージャー'][index],
        isActive: true
      }
    });

    // ABC商事には追加の担当者を作成
    if (index === 0) {
      await prisma.clientUser.create({
        data: {
          businessPartnerId: partner.id,
          email: `secondary@${client.emailDomain || 'example.com'}`,
          passwordHash: '$2a$10$DUMMY_HASH',
          name: '佐藤花子',
          phone: '03-1234-5679',
          department: '開発部',
          position: '課長',
          isActive: true
        }
      });
    }
  }

  console.log('✅ クライアントユーザーを作成しました');

  // アプローチ履歴を作成（ABC商事向け）
  const abcPartner = businessPartners[0];
  const abcClient = clients[0];
  
  await prisma.approach.create({
    data: {
      fromCompanyId: finalSesCompany.id,
      toCompanyId: abcClient.id,
      userId: adminUser.id,
      approachDate: new Date('2024-11-28'),
      approachType: 'email',
      subject: 'Reactエンジニア3名のご提案',
      message: 'React/TypeScript経験豊富なエンジニア3名をご提案させていただきます。',
      engineerCount: 3,
      status: 'sent',
      sentAt: new Date('2024-11-28')
    }
  });

  await prisma.approach.create({
    data: {
      fromCompanyId: finalSesCompany.id,
      toCompanyId: abcClient.id,
      userId: adminUser.id,
      approachDate: new Date('2024-11-20'),
      approachType: 'meeting',
      subject: '定例ミーティング',
      message: '月次定例ミーティングを実施しました。',
      status: 'accepted',
      sentAt: new Date('2024-11-20')
    }
  });

  console.log('✅ アプローチ履歴を作成しました');

  console.log('🎉 取引先サンプルデータの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error('エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });