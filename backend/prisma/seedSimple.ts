import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シンプルなシードデータ投入開始...');

  // 1. SES企業を作成
  const sesCompany = await prisma.company.create({
    data: {
      name: 'テックソリューション株式会社',
      companyType: 'SES',
      emailDomain: 'tech-solution.co.jp',
      address: '東京都千代田区',
      phone: '03-1234-5678',
      contactEmail: 'info@tech-solution.co.jp'
    }
  });
  console.log(`✅ SES企業作成: ${sesCompany.name}`);

  // 2. クライアント企業を作成
  const clientCompany = await prisma.company.create({
    data: {
      name: 'ABCコーポレーション',
      companyType: 'CLIENT',
      emailDomain: 'abc-corp.co.jp',
      address: '東京都港区',
      phone: '03-9876-5432',
      contactEmail: 'contact@abc-corp.co.jp'
    }
  });
  console.log(`✅ クライアント企業作成: ${clientCompany.name}`);

  // 3. 取引先関係を作成
  const businessPartner = await prisma.businessPartner.create({
    data: {
      sesCompanyId: sesCompany.id,
      clientCompanyId: clientCompany.id,
      isActive: true,
      accessUrl: 'abc-corporation',
      urlToken: Buffer.from('abc-token').toString('base64'),
      createdBy: BigInt(1) // 仮のユーザーID
    }
  });
  console.log(`✅ 取引先関係作成`);

  // 4. 取引先企業ユーザーを作成
  const passwordHash = await bcrypt.hash('test123', 10);
  const clientUser = await prisma.clientUser.create({
    data: {
      businessPartnerId: businessPartner.id,
      email: 'test@abc-corp.co.jp',
      passwordHash,
      name: 'テストユーザー',
      isActive: true
    }
  });
  console.log(`✅ クライアントユーザー作成: ${clientUser.email} / test123`);

  // 5. エンジニアを作成
  const engineer = await prisma.engineer.create({
    data: {
      companyId: sesCompany.id,
      name: '田中太郎',
      lastName: '田中',
      firstName: '太郎',
      lastNameKana: 'タナカ',
      firstNameKana: 'タロウ',
      email: 'tanaka@tech-solution.co.jp',
      phone: '090-1111-1111',
      engineerType: 'EMPLOYEE',
      currentStatus: 'WAITING',
      isActive: true,
      isPublic: true
    }
  });
  console.log(`✅ エンジニア作成: ${engineer.lastName} ${engineer.firstName}`);

  console.log('\n🎉 シードデータ投入完了！');
  console.log('\n📝 ログイン情報:');
  console.log('  クライアントユーザー: test@abc-corp.co.jp / test123');
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });