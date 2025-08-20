import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PartnerListItem {
  id: string;
  companyName: string;
  companyNameKana?: string;
  industry?: string;
  employeeSize?: string;
  website?: string;
  phone?: string;
  address?: string;
  businessDescription?: string;
  contacts: any[];
  contractTypes?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredSkills?: string[];
  preferredIndustries?: string[];
  requirements?: string;
  status: 'active' | 'inactive' | 'prospective';
  registeredDate: string;
  lastContactDate?: string;
  totalProposals: number;
  acceptedProposals: number;
  currentEngineers: number;
  monthlyRevenue?: number;
  totalRevenue?: number;
  rating?: number;
  tags?: string[];
  paymentTerms?: string;
  autoEmailEnabled?: boolean;
  followUpEnabled?: boolean;
  notes?: string;
  approaches?: any[];
  proposedEngineers?: any[];
  projects?: any[];
}

export class PartnerListService {
  async getList(params: {
    status?: string;
    industry?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: PartnerListItem[]; total: number }> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    // クライアント企業を取得
    const companies = await prisma.company.findMany({
      where: {
        companyType: 'CLIENT',
        ...(params.search ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { address: { contains: params.search, mode: 'insensitive' } },
          ]
        } : {})
      },
      include: {
        clientPartners: {
          include: {
            clientUsers: true,
          }
        },
        receivedApproaches: {
          orderBy: { approachDate: 'desc' },
          take: 5,
        }
      },
      skip,
      take: limit,
    });

    const total = await prisma.company.count({
      where: {
        companyType: 'CLIENT',
      }
    });

    // データを変換
    const data: PartnerListItem[] = companies.map(company => {
      const businessPartner = company.clientPartners[0];
      const clientUsers = businessPartner?.clientUsers || [];
      const approaches = company.receivedApproaches || [];

      // ダミーデータを追加（実際のプロジェクトでは実データから計算）
      const industryMap: { [key: string]: string } = {
        '株式会社ABC商事': 'IT・通信',
        'XYZ株式会社': '金融・保険',
        'テックコーポレーション': '製造業',
        'グローバルシステムズ': 'コンサルティング',
      };

      const employeeSizeMap: { [key: string]: string } = {
        '株式会社ABC商事': '501-1000名',
        'XYZ株式会社': '1001-5000名',
        'テックコーポレーション': '301-500名',
        'グローバルシステムズ': '101-300名',
      };

      return {
        id: company.id.toString(),
        companyName: company.name,
        companyNameKana: company.name,
        industry: industryMap[company.name] || 'その他',
        employeeSize: employeeSizeMap[company.name] || '不明',
        website: company.websiteUrl || undefined,
        phone: company.phone || undefined,
        address: company.address || undefined,
        businessDescription: 'システム開発、ITコンサルティング',
        contacts: clientUsers.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          department: user.department || '',
          position: user.position || '',
          email: user.email,
          phone: user.phone || '',
          isPrimary: true,
        })),
        contractTypes: ['準委任契約', '派遣契約'],
        budgetMin: 500000,
        budgetMax: 1000000,
        preferredSkills: ['React', 'TypeScript', 'AWS'],
        status: company.isActive ? 'active' : 'inactive',
        registeredDate: company.createdAt.toISOString(),
        lastContactDate: approaches[0]?.approachDate?.toISOString(),
        totalProposals: approaches.length,
        acceptedProposals: approaches.filter((a: any) => a.status === 'accepted').length,
        currentEngineers: Math.floor(Math.random() * 10),
        monthlyRevenue: Math.floor(Math.random() * 10000000),
        rating: 3 + Math.random() * 2,
        tags: company.name === 'XYZ株式会社' ? ['最重要顧客', '大型案件'] : 
              company.name === '株式会社ABC商事' ? ['優良顧客', '長期取引'] : [],
        approaches: approaches.map((approach: any) => ({
          id: approach.id.toString(),
          date: approach.approachDate.toISOString(),
          type: approach.approachType,
          subject: approach.subject,
          engineerCount: approach.engineerCount,
          status: approach.status,
        })),
      };
    });

    return { data, total };
  }

  async getById(id: string): Promise<PartnerListItem | null> {
    const company = await prisma.company.findUnique({
      where: { id: BigInt(id) },
      include: {
        clientPartners: {
          include: {
            clientUsers: true,
          }
        },
        receivedApproaches: {
          orderBy: { approachDate: 'desc' },
        }
      }
    });

    if (!company) return null;

    const businessPartner = company.clientPartners[0];
    const clientUsers = businessPartner?.clientUsers || [];
    const approaches = company.receivedApproaches || [];

    // 詳細データを生成
    const industryMap: { [key: string]: string } = {
      '株式会社ABC商事': 'IT・通信',
      'XYZ株式会社': '金融・保険',
      'テックコーポレーション': '製造業',
      'グローバルシステムズ': 'コンサルティング',
    };

    const employeeSizeMap: { [key: string]: string } = {
      '株式会社ABC商事': '501-1000名',
      'XYZ株式会社': '1001-5000名',
      'テックコーポレーション': '301-500名',
      'グローバルシステムズ': '101-300名',
    };

    const skillsMap: { [key: string]: string[] } = {
      '株式会社ABC商事': ['React', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
      'XYZ株式会社': ['Java', 'Spring Boot', 'Oracle', 'AWS', 'Kubernetes'],
      'テックコーポレーション': ['Python', 'IoT', 'AI', 'TensorFlow', 'AWS'],
      'グローバルシステムズ': ['PHP', 'Laravel', 'MySQL'],
    };

    return {
      id: company.id.toString(),
      companyName: company.name,
      companyNameKana: company.name,
      industry: industryMap[company.name] || 'その他',
      employeeSize: employeeSizeMap[company.name] || '不明',
      website: company.websiteUrl || undefined,
      phone: company.phone || undefined,
      address: company.address || undefined,
      businessDescription: 'システム開発、ITコンサルティング、クラウドソリューション提供',
      contacts: clientUsers.length > 0 ? clientUsers.map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        department: user.department || '',
        position: user.position || '',
        email: user.email,
        phone: user.phone || '',
        isPrimary: true,
      })) : [
        // ダミーの連絡先を生成
        {
          id: '1',
          name: '山田太郎',
          department: '人事部',
          position: '部長',
          email: `contact@${company.emailDomain || 'example.com'}`,
          phone: company.phone || '03-0000-0000',
          isPrimary: true,
        },
        {
          id: '2',
          name: '佐藤花子',
          department: '開発部',
          position: '課長',
          email: `dev@${company.emailDomain || 'example.com'}`,
          phone: company.phone || '03-0000-0001',
          isPrimary: false,
        },
      ],
      contractTypes: ['準委任契約', '派遣契約'],
      budgetMin: 500000,
      budgetMax: 1000000,
      preferredSkills: skillsMap[company.name] || ['React', 'TypeScript', 'AWS'],
      preferredIndustries: ['金融', 'IT'],
      requirements: 'フロントエンド開発経験3年以上、チーム開発経験必須',
      status: company.isActive ? 'active' : 'inactive',
      registeredDate: company.createdAt.toISOString(),
      lastContactDate: approaches[0]?.approachDate?.toISOString(),
      totalProposals: 15 + Math.floor(Math.random() * 10),
      acceptedProposals: 8 + Math.floor(Math.random() * 5),
      currentEngineers: 5 + Math.floor(Math.random() * 5),
      monthlyRevenue: 3000000 + Math.floor(Math.random() * 5000000),
      totalRevenue: 30000000 + Math.floor(Math.random() * 50000000),
      rating: 3.5 + Math.random() * 1.5,
      tags: company.name === 'XYZ株式会社' ? ['最重要顧客', '大型案件', 'リピート多'] : 
            company.name === '株式会社ABC商事' ? ['優良顧客', '長期取引', 'リピート多'] : ['優良顧客'],
      paymentTerms: '月末締め翌月末払い',
      autoEmailEnabled: true,
      followUpEnabled: true,
      notes: '主にフロントエンド開発案件が多い。React経験者を優先的に提案。',
      approaches: approaches.map((approach: any) => ({
        id: approach.id.toString(),
        date: approach.approachDate.toISOString(),
        type: approach.approachType,
        subject: approach.subject,
        engineerCount: approach.engineerCount,
        status: approach.status,
        note: approach.message,
      })),
      proposedEngineers: [],
      projects: [],
    };
  }
}

export const partnerListService = new PartnerListService();