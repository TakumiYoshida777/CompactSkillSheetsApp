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
  status: 'active' | 'inactive' | 'prospective';
  registeredDate: string;
  lastContactDate?: string;
  totalProposals: number;
  acceptedProposals: number;
  currentEngineers: number;
  monthlyRevenue?: number;
  rating?: number;
  tags?: string[];
  approaches?: any[];
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

    return {
      id: company.id.toString(),
      companyName: company.name,
      companyNameKana: company.name,
      industry: 'IT・通信',
      employeeSize: '501-1000名',
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
      tags: ['優良顧客'],
      approaches: approaches.map((approach: any) => ({
        id: approach.id.toString(),
        date: approach.approachDate.toISOString(),
        type: approach.approachType,
        subject: approach.subject,
        engineerCount: approach.engineerCount,
        status: approach.status,
      })),
    };
  }
}

export const partnerListService = new PartnerListService();