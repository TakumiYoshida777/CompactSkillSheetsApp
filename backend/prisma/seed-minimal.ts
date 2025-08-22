import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('シード処理を開始します...');

  // 会社作成
  const company = await prisma.company.create({
    data: {
      companyType: 'SES',
      name: 'テストSES会社',
      emailDomain: 'ses.co.jp',
      address: '東京都渋谷区',
      phone: '03-1234-5678',
      websiteUrl: 'https://ses.co.jp',
      contactEmail: 'contact@ses.co.jp',
      maxEngineers: 6000,
      isActive: true,
    },
  });
  console.log('会社を作成しました:', company.name);

  // ロール作成
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      displayName: '管理者',
      description: 'システム管理者',
      isSystem: true,
    },
  });

  await prisma.role.create({
    data: {
      name: 'user',
      displayName: '一般ユーザー',
      description: '一般ユーザー',
      isSystem: false,
    },
  });
  console.log('ロールを作成しました');

  // 管理者ユーザー作成
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@ses.co.jp',
      passwordHash,
      name: '管理者',
      phone: '090-1234-5678',
      isActive: true,
    },
  });

  // ユーザーロール紐付け
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
      grantedBy: adminUser.id,
    },
  });
  console.log('管理者ユーザーを作成しました:', adminUser.email);

  // エンジニア作成（複数）
  const engineers = [
    {
      name: '山田太郎',
      nameKana: 'ヤマダタロウ',
      email: 'yamada@ses.co.jp',
      phone: '090-1111-1111',
    },
    {
      name: '鈴木花子',
      nameKana: 'スズキハナコ',
      email: 'suzuki@ses.co.jp',
      phone: '090-2222-2222',
    },
    {
      name: '佐藤次郎',
      nameKana: 'サトウジロウ',
      email: 'sato@ses.co.jp',
      phone: '090-3333-3333',
    },
  ];

  for (const engineerData of engineers) {
    const engineer = await prisma.engineer.create({
      data: {
        companyId: company.id,
        ...engineerData,
        engineerType: 'EMPLOYEE',
        currentStatus: 'WAITING',
        isPublic: true,
      },
    });

    // スキルシート作成
    await prisma.skillSheet.create({
      data: {
        engineerId: engineer.id,
        summary: `${engineerData.name}のスキルシート`,
        totalExperienceYears: Math.floor(Math.random() * 10) + 1,
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
        frameworks: ['React', 'Node.js', 'Express'],
        databases: ['PostgreSQL', 'MySQL', 'MongoDB'],
        isCompleted: false,
      },
    });
    console.log('エンジニアを作成しました:', engineer.name);
  }

  console.log('シード処理が完了しました');
}

main()
  .catch((e) => {
    console.error('シード処理でエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });