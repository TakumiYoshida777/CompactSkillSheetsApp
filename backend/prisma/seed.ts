import { PrismaClient, CompanyType, EngineerType, EngineerStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータの投入を開始します...');

  // 既存のデータをクリア（外部キー制約の順番に注意）
  await prisma.engineer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.businessPartner.deleteMany();
  await prisma.company.deleteMany();

  // 1. SES企業を作成
  const sesCompany = await prisma.company.create({
    data: {
      name: 'テックソリューション株式会社',
      companyType: CompanyType.SES,
      emailDomain: 'example-ses.local',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      websiteUrl: 'https://example-ses.local',
      contactEmail: 'info@example-ses.local',
      maxEngineers: 150,
      isActive: true
    }
  });

  console.log(`✅ SES企業作成: ${sesCompany.name}`);

  // 2. 管理者ユーザーを作成
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example-ses.local',
      passwordHash: adminPassword,
      name: '管理者',
      companyId: sesCompany.id,
      isActive: true
    }
  });

  console.log(`✅ 管理者ユーザー作成: ${adminUser.email}`);

  // 3. 一般ユーザーを作成
  const userPassword = await bcrypt.hash('User123!', 10);
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example-ses.local',
      passwordHash: userPassword,
      name: '佐藤花子',
      companyId: sesCompany.id,
      isActive: true
    }
  });

  console.log(`✅ 一般ユーザー作成: ${normalUser.email}`);

  // 4. エンジニアを作成
  const engineers = [];
  const engineerData = [
    {
      lastName: '田中',
      firstName: '太郎',
      lastNameKana: 'タナカ',
      firstNameKana: 'タロウ',
      email: 'tanaka@example-ses.local',
      phone: '090-1111-1111',
      engineerType: EngineerType.EMPLOYEE,
      currentStatus: EngineerStatus.WAITING,
      availability: '即日'
    },
    {
      lastName: '鈴木',
      firstName: '一郎',
      lastNameKana: 'スズキ',
      firstNameKana: 'イチロウ',
      email: 'suzuki@example-ses.local',
      phone: '090-2222-2222',
      engineerType: EngineerType.FREELANCE,
      currentStatus: EngineerStatus.WORKING,
      availability: '1ヶ月以内'
    },
    {
      lastName: '高橋',
      firstName: '花子',
      lastNameKana: 'タカハシ',
      firstNameKana: 'ハナコ',
      email: 'takahashi@example-ses.local',
      phone: '090-3333-3333',
      engineerType: EngineerType.EMPLOYEE,
      currentStatus: EngineerStatus.WAITING_SOON,
      availability: '3ヶ月以内'
    }
  ];

  for (const data of engineerData) {
    const engineer = await prisma.engineer.create({
      data: {
        ...data,
        companyId: sesCompany.id,
        isActive: true,
        isPublic: true,
        name: `${data.lastName} ${data.firstName}`
      }
    });
    engineers.push(engineer);
    console.log(`✅ エンジニア作成: ${engineer.name}`);
  }

  // 5. クライアント企業を作成
  const clientCompany = await prisma.company.create({
    data: {
      name: '株式会社ABCコーポレーション',
      companyType: CompanyType.CLIENT,
      emailDomain: 'example-client.local',
      address: '東京都千代田区千代田2-2-2',
      phone: '03-9876-5432',
      websiteUrl: 'https://example-client.local',
      contactEmail: 'contact@example-client.local',
      maxEngineers: 50,
      isActive: true
    }
  });

  console.log(`✅ クライアント企業作成: ${clientCompany.name}`);

  // 6. クライアント企業の管理者ユーザーを作成
  const clientAdminUser = await prisma.user.create({
    data: {
      email: 'admin@example-client.local',
      passwordHash: adminPassword,
      name: 'クライアント管理者',
      companyId: clientCompany.id,
      isActive: true
    }
  });

  console.log(`✅ クライアント管理者ユーザー作成: ${clientAdminUser.email}`);

  console.log('\n🎉 シードデータの投入が完了しました！');
  console.log('\n📝 ログイン情報:');
  console.log('  SES企業管理者: admin@example-ses.local / Admin123!');
  console.log('  SES企業一般ユーザー: user@example-ses.local / User123!');
  console.log('  クライアント企業管理者: admin@example-client.local / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ シードデータ投入エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });