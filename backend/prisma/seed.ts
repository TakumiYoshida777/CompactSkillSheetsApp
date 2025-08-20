import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータの投入を開始します...');

  // 1. SES企業を作成
  const sesCompany = await prisma.company.create({
    data: {
      name: 'テックソリューション株式会社',
      nameKana: 'テックソリューションカブシキガイシャ',
      companyType: 'SES',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      fax: '03-1234-5679',
      email: 'info@tech-solution.co.jp',
      website: 'https://tech-solution.co.jp',
      representative: '山田太郎',
      established: new Date('2010-04-01'),
      capital: 50000000,
      employees: 150,
      description: 'ITソリューションを提供するSES企業です'
    }
  });

  console.log(`✅ SES企業作成: ${sesCompany.name}`);

  // 2. 管理者ユーザーを作成
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tech-solution.co.jp',
      passwordHash: adminPassword,
      name: '管理者',
      nameKana: 'カンリシャ',
      role: 'ADMIN',
      companyId: sesCompany.id,
      isActive: true
    }
  });

  console.log(`✅ 管理者ユーザー作成: ${adminUser.email}`);

  // 3. 一般ユーザーを作成
  const userPassword = await bcrypt.hash('user123', 10);
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@tech-solution.co.jp',
      passwordHash: userPassword,
      name: '佐藤花子',
      nameKana: 'サトウハナコ',
      role: 'USER',
      companyId: sesCompany.id,
      isActive: true
    }
  });

  console.log(`✅ 一般ユーザー作成: ${normalUser.email}`);

  // 4. スキルマスタを作成
  const skills = await prisma.skill.createMany({
    data: [
      { name: 'JavaScript', category: 'Programming' },
      { name: 'TypeScript', category: 'Programming' },
      { name: 'React', category: 'Framework' },
      { name: 'Vue.js', category: 'Framework' },
      { name: 'Node.js', category: 'Runtime' },
      { name: 'Python', category: 'Programming' },
      { name: 'Java', category: 'Programming' },
      { name: 'Spring Boot', category: 'Framework' },
      { name: 'AWS', category: 'Cloud' },
      { name: 'Docker', category: 'DevOps' },
      { name: 'Kubernetes', category: 'DevOps' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'MySQL', category: 'Database' },
      { name: 'MongoDB', category: 'Database' },
      { name: 'Redis', category: 'Database' }
    ]
  });

  console.log(`✅ スキルマスタ作成: ${skills.count}件`);

  // 5. エンジニアを作成
  const engineers = [];
  const engineerData = [
    {
      lastName: '田中',
      firstName: '太郎',
      lastNameKana: 'タナカ',
      firstNameKana: 'タロウ',
      email: 'tanaka@tech-solution.co.jp',
      phone: '090-1111-1111',
      engineerType: 'EMPLOYEE',
      currentStatus: 'AVAILABLE',
      availability: 'immediate'
    },
    {
      lastName: '鈴木',
      firstName: '一郎',
      lastNameKana: 'スズキ',
      firstNameKana: 'イチロウ',
      email: 'suzuki@tech-solution.co.jp',
      phone: '090-2222-2222',
      engineerType: 'FREELANCE',
      currentStatus: 'IN_PROJECT',
      availability: 'within_month'
    },
    {
      lastName: '高橋',
      firstName: '花子',
      lastNameKana: 'タカハシ',
      firstNameKana: 'ハナコ',
      email: 'takahashi@tech-solution.co.jp',
      phone: '090-3333-3333',
      engineerType: 'EMPLOYEE',
      currentStatus: 'AVAILABLE',
      availability: 'within_3months'
    },
    {
      lastName: '伊藤',
      firstName: '次郎',
      lastNameKana: 'イトウ',
      firstNameKana: 'ジロウ',
      email: 'ito@tech-solution.co.jp',
      phone: '090-4444-4444',
      engineerType: 'PARTNER',
      currentStatus: 'IN_PROJECT',
      availability: 'unavailable'
    },
    {
      lastName: '渡辺',
      firstName: '美咲',
      lastNameKana: 'ワタナベ',
      firstNameKana: 'ミサキ',
      email: 'watanabe@tech-solution.co.jp',
      phone: '090-5555-5555',
      engineerType: 'EMPLOYEE',
      currentStatus: 'AVAILABLE',
      availability: 'immediate'
    }
  ];

  for (const data of engineerData) {
    const engineer = await prisma.engineer.create({
      data: {
        ...data,
        companyId: sesCompany.id,
        isActive: true,
        isPublic: true,
        name: `${data.lastName} ${data.firstName}`,
        nameKana: `${data.lastNameKana} ${data.firstNameKana}`
      }
    });
    engineers.push(engineer);
    console.log(`✅ エンジニア作成: ${engineer.name}`);
  }

  // 6. エンジニアスキルを設定
  const allSkills = await prisma.skill.findMany();
  
  for (const engineer of engineers) {
    // 各エンジニアにランダムに3-5個のスキルを割り当て
    const skillCount = Math.floor(Math.random() * 3) + 3;
    const selectedSkills = allSkills
      .sort(() => Math.random() - 0.5)
      .slice(0, skillCount);

    for (const skill of selectedSkills) {
      await prisma.engineerSkill.create({
        data: {
          engineerId: engineer.id,
          skillId: skill.id,
          level: Math.floor(Math.random() * 5) + 1,
          years: Math.floor(Math.random() * 10) + 1
        }
      });
    }
  }

  console.log('✅ エンジニアスキル設定完了');

  // 7. クライアント企業を作成
  const clientCompanies = [];
  const clientData = [
    {
      name: '株式会社ABCコーポレーション',
      nameKana: 'カブシキガイシャエービーシーコーポレーション',
      postalCode: '100-0002',
      address: '東京都千代田区千代田2-2-2',
      phone: '03-9876-5432',
      email: 'contact@abc-corp.co.jp',
      representative: '山本一郎'
    },
    {
      name: 'XYZシステムズ株式会社',
      nameKana: 'エックスワイゼットシステムズカブシキガイシャ',
      postalCode: '150-0001',
      address: '東京都渋谷区渋谷1-1-1',
      phone: '03-5555-5555',
      email: 'info@xyz-systems.co.jp',
      representative: '佐々木二郎'
    },
    {
      name: 'グローバルテック株式会社',
      nameKana: 'グローバルテックカブシキガイシャ',
      postalCode: '105-0001',
      address: '東京都港区虎ノ門1-1-1',
      phone: '03-7777-7777',
      email: 'contact@global-tech.co.jp',
      representative: '中村三郎'
    }
  ];

  for (const data of clientData) {
    const company = await prisma.company.create({
      data: {
        ...data,
        companyType: 'CLIENT'
      }
    });
    clientCompanies.push(company);
    console.log(`✅ クライアント企業作成: ${company.name}`);
  }

  // 8. 取引先関係を作成
  for (const clientCompany of clientCompanies) {
    const businessPartner = await prisma.businessPartner.create({
      data: {
        sesCompanyId: sesCompany.id,
        clientCompanyId: clientCompany.id,
        contractType: 'SES',
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: new Date('2024-12-31'),
        monthlyFee: Math.floor(Math.random() * 500000) + 500000,
        isActive: true,
        accessUrl: clientCompany.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        urlToken: Buffer.from(clientCompany.name).toString('base64'),
        createdBy: adminUser.id
      }
    });

    // 取引先設定を作成
    await prisma.businessPartnerSetting.create({
      data: {
        businessPartnerId: businessPartner.id,
        viewType: 'waiting',
        showWaitingOnly: true,
        autoApprove: false
      }
    });

    // 取引先ユーザーを作成
    const clientUserPassword = await bcrypt.hash('client123', 10);
    await prisma.clientUser.create({
      data: {
        businessPartnerId: businessPartner.id,
        email: `user@${clientCompany.email.split('@')[1]}`,
        passwordHash: clientUserPassword,
        name: '取引先担当者',
        department: '情報システム部',
        position: '課長',
        phone: clientCompany.phone,
        isActive: true,
        receiveNotifications: true
      }
    });

    console.log(`✅ 取引先関係作成: ${sesCompany.name} - ${clientCompany.name}`);
  }

  // 9. サンプルプロジェクトを作成
  const projects = await prisma.project.createMany({
    data: [
      {
        name: 'ECサイトリニューアルプロジェクト',
        description: 'ECサイトの全面リニューアル',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        status: 'ACTIVE',
        companyId: clientCompanies[0].id
      },
      {
        name: '基幹システム改修プロジェクト',
        description: '基幹システムのモダナイゼーション',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        companyId: clientCompanies[1].id
      },
      {
        name: 'モバイルアプリ開発プロジェクト',
        description: 'iOS/Androidアプリの新規開発',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        status: 'ACTIVE',
        companyId: clientCompanies[2].id
      }
    ]
  });

  console.log(`✅ プロジェクト作成: ${projects.count}件`);

  // 10. エンジニアをプロジェクトに割り当て
  const allProjects = await prisma.project.findMany();
  
  for (let i = 0; i < engineers.length; i++) {
    if (engineers[i].currentStatus === 'IN_PROJECT' && i < allProjects.length) {
      await prisma.engineerProject.create({
        data: {
          engineerId: engineers[i].id,
          projectId: allProjects[i % allProjects.length].id,
          role: ['リードエンジニア', 'バックエンドエンジニア', 'フロントエンドエンジニア'][i % 3],
          startDate: new Date('2024-01-01'),
          isActive: true
        }
      });
    }
  }

  console.log('✅ エンジニアのプロジェクト割り当て完了');

  // 11. スキルシートを作成
  for (const engineer of engineers) {
    await prisma.skillSheet.create({
      data: {
        engineerId: engineer.id,
        summary: `${engineer.name}の職務経歴書です。豊富な開発経験を持ち、様々なプロジェクトで活躍しています。`,
        specialization: 'フルスタック開発',
        qualification: '応用情報技術者',
        appeal: '高いコミュニケーション能力と技術力を兼ね備えています',
        totalExperienceYears: Math.floor(Math.random() * 15) + 3,
        lastUpdated: new Date()
      }
    });
  }

  console.log('✅ スキルシート作成完了');

  // 12. 監査ログを作成（サンプル）
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SEED_DATA_CREATED',
      tableName: 'multiple',
      metadata: JSON.stringify({
        message: 'シードデータの初期投入を実行',
        timestamp: new Date().toISOString()
      })
    }
  });

  console.log('✅ 監査ログ作成完了');

  console.log('\n🎉 シードデータの投入が完了しました！');
  console.log('\n📝 ログイン情報:');
  console.log('  管理者: admin@tech-solution.co.jp / admin123');
  console.log('  一般ユーザー: user@tech-solution.co.jp / user123');
  console.log('  取引先ユーザー: user@[各企業ドメイン] / client123');
}

main()
  .catch((e) => {
    console.error('❌ シードデータ投入エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });