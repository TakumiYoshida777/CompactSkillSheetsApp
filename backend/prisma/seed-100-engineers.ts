import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// スキルセットのパターン
const skillPatterns = {
  frontend: {
    languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
    frameworks: ['React', 'Vue.js', 'Angular', 'Next.js'],
    databases: ['MongoDB', 'Firebase'],
    tools: ['Webpack', 'Vite', 'npm', 'yarn'],
    cloudServices: ['Vercel', 'Netlify', 'AWS S3']
  },
  backend: {
    languages: ['Java', 'Python', 'Ruby', 'Go', 'PHP'],
    frameworks: ['Spring Boot', 'Django', 'Rails', 'Express', 'Laravel'],
    databases: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server'],
    tools: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI'],
    cloudServices: ['AWS EC2', 'GCP', 'Azure']
  },
  fullstack: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
    frameworks: ['React', 'Node.js', 'Spring Boot', 'Django'],
    databases: ['PostgreSQL', 'MongoDB', 'Redis'],
    tools: ['Docker', 'Git', 'CI/CD', 'Terraform'],
    cloudServices: ['AWS', 'GCP', 'Heroku']
  },
  mobile: {
    languages: ['Swift', 'Kotlin', 'Dart', 'JavaScript'],
    frameworks: ['React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose'],
    databases: ['SQLite', 'Realm', 'Firebase'],
    tools: ['Xcode', 'Android Studio', 'Fastlane'],
    cloudServices: ['Firebase', 'AWS Amplify']
  },
  data: {
    languages: ['Python', 'R', 'SQL', 'Scala'],
    frameworks: ['TensorFlow', 'PyTorch', 'Pandas', 'Spark'],
    databases: ['BigQuery', 'Redshift', 'Snowflake', 'Elasticsearch'],
    tools: ['Jupyter', 'Airflow', 'Databricks'],
    cloudServices: ['AWS SageMaker', 'GCP AI Platform', 'Azure ML']
  },
  infrastructure: {
    languages: ['Python', 'Go', 'Bash', 'PowerShell'],
    frameworks: ['Terraform', 'Ansible', 'Puppet', 'Chef'],
    databases: ['PostgreSQL', 'MySQL', 'Redis'],
    tools: ['Docker', 'Kubernetes', 'Prometheus', 'Grafana'],
    cloudServices: ['AWS', 'GCP', 'Azure', 'CloudFormation']
  }
};

// 業界パターン
const industries = [
  '金融', '保険', '製造', '小売', '物流', 
  '医療', '教育', 'IT', '通信', '不動産',
  'エンターテインメント', '広告', '人材', '旅行', '飲食'
];

// 開発手法
const methodologies = ['ウォーターフォール', 'アジャイル', 'スクラム', 'カンバン', 'ハイブリッド'];

// 役職パターン
const roles = [
  'ジュニアエンジニア', 'エンジニア', 'シニアエンジニア', 'リードエンジニア',
  'テックリード', 'アーキテクト', 'プロジェクトマネージャー', 'スクラムマスター',
  'プロダクトオーナー', 'QAエンジニア', 'SREエンジニア', 'セキュリティエンジニア'
];

// 資格パターン
const certifications = [
  '基本情報技術者', '応用情報技術者', 'データベーススペシャリスト',
  'ネットワークスペシャリスト', 'セキュリティスペシャリスト', 'プロジェクトマネージャ',
  'AWS認定ソリューションアーキテクト', 'Google Cloud認定', 'Azure認定',
  'PMP', 'スクラムマスター認定', 'LPIC', 'Oracle Master', 'Java認定'
];

// 最寄り駅パターン
const stations = [
  '東京駅', '新宿駅', '渋谷駅', '品川駅', '池袋駅',
  '横浜駅', '川崎駅', '大宮駅', '千葉駅', '立川駅',
  '秋葉原駅', '上野駅', '北千住駅', '錦糸町駅', '吉祥寺駅'
];

// ランダム選択ヘルパー
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 年齢に基づいた経験年数を計算
function calculateExperience(age: number): number {
  const minExperience = Math.max(0, age - 22); // 大卒を想定
  const maxExperience = age - 20;
  return randomInt(Math.max(0, minExperience - 5), maxExperience);
}

// ステータスの分布を設定
function getEngineerStatus(index: number): 'WORKING' | 'WAITING' | 'WAITING_SOON' {
  if (index < 40) return 'WORKING';        // 40%が稼働中
  if (index < 70) return 'WAITING';        // 30%が待機中
  return 'WAITING_SOON';                   // 30%が近日待機
}

async function main() {
  console.log('🌱 Seeding database with 100 engineers...');

  // 既存データのクリーンアップ
  await prisma.skillSheet.deleteMany();
  await prisma.engineerProject.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.engineer.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.company.deleteMany();

  // 会社作成
  const company = await prisma.company.create({
    data: {
      companyType: 'SES',
      name: 'テスト株式会社',
      emailDomain: 'test.co.jp',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      websiteUrl: 'https://test.co.jp',
      contactEmail: 'contact@test.co.jp',
      maxEngineers: 6000,
      isActive: true
    }
  });

  console.log(`✅ Company created: ${company.name}`);

  // ロール作成
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      displayName: '管理者',
      description: 'システム管理者',
      isSystem: true
    }
  });

  await prisma.role.create({
    data: {
      name: 'user',
      displayName: '一般ユーザー',
      description: '一般ユーザー',
      isSystem: false
    }
  });

  // 管理ユーザー作成
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@test.co.jp',
      passwordHash,
      name: '管理者',
      phone: '090-1234-5678',
      isActive: true
    }
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
      grantedBy: adminUser.id
    }
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // プロジェクト作成（検索テスト用）
  const projects = [];
  for (let i = 1; i <= 20; i++) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - randomInt(0, 12));
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + randomInt(3, 24));

    const project = await prisma.project.create({
      data: {
        companyId: company.id,
        name: `プロジェクト${i}`,
        clientCompany: `${randomChoice(industries)}クライアント株式会社`,
        status: randomChoice(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']),
        startDate,
        endDate: i % 3 === 0 ? endDate : null,
        plannedEndDate: endDate,
        contractType: randomChoice(['SES', '請負', '派遣', '準委任']),
        monthlyRate: randomInt(50, 120) * 10000,
        requiredEngineers: randomInt(1, 10),
        projectScale: randomChoice(['SMALL', 'MEDIUM', 'LARGE']),
        industry: randomChoice(industries),
        businessType: randomChoice(['新規開発', '保守運用', 'リプレイス', '機能追加']),
        developmentMethodology: randomChoice(methodologies),
        teamSize: randomInt(3, 30),
        description: `${randomChoice(industries)}業界向けのプロジェクト`,
        requiredSkills: JSON.stringify(randomChoices([
          ...skillPatterns.fullstack.languages,
          ...skillPatterns.fullstack.frameworks
        ], 5))
      }
    });
    projects.push(project);
  }

  console.log(`✅ ${projects.length} projects created`);

  // 100人のエンジニアを作成
  const engineers = [];
  const lastNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'];
  const firstNamesMale = ['太郎', '次郎', '三郎', '健太', '翔太', '大輝', '拓海', '陸', '蓮', '悠斗'];
  const firstNamesFemale = ['花子', '美咲', 'さくら', '葵', '結衣', '陽菜', '凛', '美月', '楓', '心愛'];

  for (let i = 1; i <= 100; i++) {
    const isMale = i % 3 !== 0; // 約66%が男性
    const lastName = randomChoice(lastNames);
    const firstName = isMale ? randomChoice(firstNamesMale) : randomChoice(firstNamesFemale);
    const fullName = `${lastName} ${firstName}`;
    const fullNameKana = `${lastName} ${firstName}`;
    const age = randomInt(22, 55);
    const yearsOfExperience = calculateExperience(age);
    const status = getEngineerStatus(i);
    
    // スキルタイプを決定（経験年数に応じて）
    let skillType: keyof typeof skillPatterns;
    if (yearsOfExperience < 3) {
      skillType = randomChoice(['frontend', 'backend', 'mobile']);
    } else if (yearsOfExperience < 7) {
      skillType = randomChoice(['frontend', 'backend', 'fullstack', 'mobile']);
    } else {
      skillType = randomChoice(['fullstack', 'backend', 'infrastructure', 'data']);
    }
    
    const skills = skillPatterns[skillType];

    const engineer = await prisma.engineer.create({
      data: {
        companyId: company.id,
        employeeNumber: `EMP${String(i).padStart(5, '0')}`,
        name: fullName,
        nameKana: fullNameKana,
        email: `engineer${i}@test.co.jp`,
        phone: `090-${String(1000 + i).padStart(4, '0')}-${String(5000 + i).padStart(4, '0')}`,
        gender: isMale ? 'MALE' : 'FEMALE',
        birthDate: new Date(new Date().getFullYear() - age, randomInt(0, 11), randomInt(1, 28)),
        nearestStation: randomChoice(stations),
        githubUrl: Math.random() > 0.5 ? `https://github.com/engineer${i}` : null,
        engineerType: Math.random() > 0.8 ? 'FREELANCE' : 'EMPLOYEE',
        currentStatus: status,
        availableDate: status === 'WAITING_SOON' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        isPublic: true
      }
    });
    engineers.push(engineer);

    // スキルシート作成
    await prisma.skillSheet.create({
      data: {
        engineerId: engineer.id,
        summary: `${yearsOfExperience}年の開発経験があります。${skillType}開発を得意としています。`,
        totalExperienceYears: yearsOfExperience,
        programmingLanguages: skills.languages,
        frameworks: skills.frameworks,
        databases: skills.databases,
        tools: skills.tools,
        cloudServices: skills.cloudServices,
        certifications: yearsOfExperience > 5 ? randomChoices(certifications, randomInt(1, 3)) : 
                       yearsOfExperience > 2 ? [randomChoice(certifications)] : [],
        possibleRoles: [randomChoice(roles)],
        possiblePhases: ['要件定義', '設計', '実装', 'テスト', '運用'],
        educationBackground: {
          school: `${randomChoice(['東京', '京都', '早稲田', '慶応', '明治'])}大学`,
          major: randomChoice(['情報工学', 'コンピュータサイエンス', '電気電子工学', '数学', '物理学'])
        },
        careerSummary: `大学卒業後、${randomChoice(industries)}業界を中心に${yearsOfExperience}年の開発経験を積む`,
        specialSkills: randomChoices([
          'アーキテクチャ設計', 'パフォーマンス改善', 'セキュリティ対策',
          'CI/CD構築', 'コードレビュー', 'テスト自動化', 'アジャイル開発'
        ], randomInt(1, 3)).join(', '),
        isCompleted: true
      }
    });

    // プロジェクト経験を作成（稼働中・稼働済みのエンジニアのみ）
    if (['WORKING', 'WAITING'].includes(status)) {
      const numProjects = randomInt(1, 5);
      for (let j = 0; j < numProjects; j++) {
        const project = randomChoice(projects);
        const projectStartDate = new Date();
        projectStartDate.setMonth(projectStartDate.getMonth() - randomInt(1, 24));
        
        await prisma.engineerProject.create({
          data: {
            engineerId: engineer.id,
            projectId: project.id,
            role: randomChoice(roles),
            responsibilities: `${skillType}開発担当`,
            phases: ['要件定義', '設計', '実装', 'テスト', '運用'],
            technologies: [...skills.languages.slice(0, 2), ...skills.frameworks.slice(0, 2)],
            startDate: projectStartDate,
            endDate: j === 0 && status === 'WORKING' ? null : new Date(),
            isCurrent: j === 0 && status === 'WORKING',
            achievements: `${randomChoice(['機能実装', 'パフォーマンス改善', 'バグ修正', 'リファクタリング'])}を担当`
          }
        });

        // 現在のプロジェクトにはアサインメントも作成
        if (j === 0 && status === 'WORKING') {
          await prisma.projectAssignment.create({
            data: {
              projectId: project.id,
              engineerId: engineer.id,
              role: randomChoice(roles),
              startDate: projectStartDate,
              allocationPercentage: 100,
              status: 'ASSIGNED'
            }
          });
        }
      }
    }

    if (i % 10 === 0) {
      console.log(`  Created ${i} engineers...`);
    }
  }

  console.log(`✅ ${engineers.length} engineers created with skill sheets and project experiences`);

  // サマリー表示
  const allEngineers = await prisma.engineer.findMany({
    where: { companyId: company.id }
  });

  const statusCounts = allEngineers.reduce((acc, eng) => {
    acc[eng.currentStatus] = (acc[eng.currentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Engineer Status Distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} engineers`);
  });

  // 経験年数の分布
  const skillSheets = await prisma.skillSheet.findMany({
    select: { totalExperienceYears: true }
  });

  const experienceGroups = skillSheets.reduce((acc, sheet) => {
    const years = sheet.totalExperienceYears || 0;
    let range: string;
    if (years < 3) range = '0-2年';
    else if (years < 5) range = '3-4年';
    else if (years < 10) range = '5-9年';
    else if (years < 15) range = '10-14年';
    else range = '15年以上';
    
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Experience Distribution:');
  Object.entries(experienceGroups).forEach(([range, count]) => {
    console.log(`  ${range}: ${count} engineers`);
  });

  console.log('\n✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });