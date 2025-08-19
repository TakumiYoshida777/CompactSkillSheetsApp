import { PrismaClient, CompanyType, EngineerType, EngineerStatus, ApproachType, TemplateType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 会社データ作成
  const company1 = await prisma.company.create({
    data: {
      companyType: CompanyType.SES,
      name: 'テックソリューション株式会社',
      emailDomain: 'techsolution.co.jp',
      contactEmail: 'info@techsolution.co.jp',
      phone: '03-1234-5678',
      address: '東京都千代田区大手町1-1-1',
      websiteUrl: 'https://techsolution.co.jp',
      maxEngineers: 150,
      isActive: true
    }
  });

  const company2 = await prisma.company.create({
    data: {
      companyType: CompanyType.CLIENT,
      name: 'デジタルイノベーション株式会社',
      emailDomain: 'digitalinnovation.jp',
      contactEmail: 'contact@digitalinnovation.jp',
      phone: '06-9876-5432',
      address: '大阪府大阪市北区梅田2-2-2',
      websiteUrl: 'https://digitalinnovation.jp',
      maxEngineers: 80,
      isActive: true
    }
  });

  // ユーザーデータ作成
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@techsolution.co.jp',
      passwordHash: hashedPassword,
      name: '管理者',
      companyId: company1.id,
      isActive: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'manager@techsolution.co.jp',
      passwordHash: hashedPassword,
      name: '営業太郎',
      companyId: company1.id,
      isActive: true
    }
  });

  // エンジニアデータ作成
  const engineer1 = await prisma.engineer.create({
    data: {
      companyId: company1.id,
      userId: user1.id,
      name: '山田太郎',
      nameKana: 'ヤマダタロウ',
      email: 'yamada@techsolution.co.jp',
      phone: '090-1111-2222',
      birthDate: new Date('1990-05-15'),
      gender: 'MALE',
      nearestStation: '東京駅',
      githubUrl: 'https://github.com/yamada',
      engineerType: EngineerType.EMPLOYEE,
      currentStatus: EngineerStatus.WAITING,
      availableDate: new Date('2025-09-01'),
      isPublic: true
    }
  });

  const engineer2 = await prisma.engineer.create({
    data: {
      companyId: company1.id,
      name: '鈴木花子',
      nameKana: 'スズキハナコ',
      email: 'suzuki@techsolution.co.jp',
      phone: '090-3333-4444',
      birthDate: new Date('1988-08-20'),
      gender: 'FEMALE',
      nearestStation: '品川駅',
      githubUrl: 'https://github.com/suzuki',
      engineerType: EngineerType.EMPLOYEE,
      currentStatus: EngineerStatus.WAITING,
      availableDate: new Date('2025-10-01'),
      isPublic: true
    }
  });

  await prisma.engineer.create({
    data: {
      companyId: company1.id,
      name: '田中一郎',
      nameKana: 'タナカイチロウ',
      email: 'tanaka@techsolution.co.jp',
      phone: '090-5555-6666',
      birthDate: new Date('1995-03-10'),
      gender: 'MALE',
      nearestStation: '新宿駅',
      engineerType: EngineerType.FREELANCE,
      currentStatus: EngineerStatus.WAITING,
      availableDate: new Date('2025-08-25'),
      isPublic: true
    }
  });

  // スキルシートデータ作成
  await prisma.skillSheet.create({
    data: {
      engineerId: engineer1.id,
      summary: 'フルスタックエンジニアとして10年以上の経験があります。',
      totalExperienceYears: 10,
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
      frameworks: ['React', 'Vue.js', 'Node.js', 'Spring Boot'],
      databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
      cloudServices: ['AWS', 'GCP', 'Azure'],
      tools: ['Docker', 'Kubernetes', 'Git', 'Jenkins'],
      certifications: ['AWS Solutions Architect', '基本情報技術者'],
      possibleRoles: ['フロントエンド', 'バックエンド', 'インフラ'],
      possiblePhases: ['要件定義', '設計', '開発', 'テスト', '運用'],
      educationBackground: '東京大学 工学部 情報工学科卒',
      careerSummary: '大手IT企業で5年、スタートアップで5年の経験',
      specialSkills: 'アーキテクチャ設計、パフォーマンスチューニング',
      isCompleted: true
    }
  });

  await prisma.skillSheet.create({
    data: {
      engineerId: engineer2.id,
      summary: 'フロントエンド開発を中心に7年の経験があります。',
      totalExperienceYears: 7,
      programmingLanguages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
      frameworks: ['React', 'Next.js', 'Vue.js', 'Angular'],
      databases: ['PostgreSQL', 'Firebase'],
      cloudServices: ['AWS', 'Vercel'],
      tools: ['Git', 'Webpack', 'Figma'],
      certifications: ['応用情報技術者'],
      possibleRoles: ['フロントエンド', 'UI/UXデザイン'],
      possiblePhases: ['設計', '開発', 'テスト'],
      educationBackground: '慶應義塾大学 理工学部卒',
      careerSummary: 'Web制作会社で3年、SaaS企業で4年の経験',
      specialSkills: 'レスポンシブデザイン、アクセシビリティ対応',
      isCompleted: true
    }
  });

  // プロジェクトデータ作成
  const project1 = await prisma.project.create({
    data: {
      name: 'ECサイトリニューアルプロジェクト',
      clientCompany: '株式会社ABCマート',
      projectScale: 'LARGE',
      industry: '小売業',
      businessType: 'ECサイト',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-03-31'),
      plannedEndDate: new Date('2026-03-31'),
      teamSize: 10,
      description: 'ECサイトのフルリニューアルプロジェクト'
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: '在庫管理システム開発',
      clientCompany: '物流サービス株式会社',
      projectScale: 'MEDIUM',
      industry: '物流業',
      businessType: '業務システム',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-12-31'),
      plannedEndDate: new Date('2025-12-31'),
      teamSize: 5,
      description: '在庫管理システムの新規開発'
    }
  });

  // エンジニアプロジェクト割り当て
  await prisma.engineerProject.create({
    data: {
      engineerId: engineer2.id,
      projectId: project1.id,
      role: 'フロントエンドリーダー',
      responsibilities: 'UI/UX設計、フロントエンド開発全般',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true
    }
  });

  await prisma.engineerProject.create({
    data: {
      engineerId: engineer1.id,
      projectId: project2.id,
      role: 'テックリード',
      responsibilities: 'アーキテクチャ設計、技術選定、開発',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-12-31'),
      isCurrent: false
    }
  });

  // ビジネスパートナーデータ作成
  await prisma.businessPartner.create({
    data: {
      sesCompanyId: company1.id,
      clientCompanyId: company2.id,
      accessUrl: 'https://partner.techsolution.co.jp/access/abc123',
      urlToken: 'abc123def456',
      createdBy: user1.id,
      isActive: true
    }
  });

  // アプローチデータ作成
  await prisma.approach.create({
    data: {
      fromCompanyId: company1.id,
      toCompanyId: company2.id,
      approachType: ApproachType.MANUAL,
      messageContent: '弊社のエンジニアをご紹介させていただきたく、ご連絡いたしました。',
      targetEngineers: [Number(engineer1.id), Number(engineer2.id)],
      sentBy: user2.id,
      sentAt: new Date('2025-08-01')
    }
  });

  // メールテンプレート作成
  await prisma.emailTemplate.create({
    data: {
      companyId: company1.id,
      name: '標準紹介テンプレート',
      subject: 'エンジニアのご紹介',
      body: 'お世話になっております。\n\n弊社のエンジニアをご紹介させていただきたく、ご連絡いたしました。\n\nご検討のほど、よろしくお願いいたします。',
      templateType: TemplateType.APPROACH,
      createdBy: user1.id,
      isActive: true
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });