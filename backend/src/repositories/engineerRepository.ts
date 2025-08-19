/**
 * エンジニアリポジトリ（モック実装）
 * TODO: 実際のデータベース接続実装に置き換える
 */

export interface Engineer {
  id: string;
  name: string;
  email: string;
  companyId: string;
  skills: string[];
  experienceYears: number;
  hourlyRate: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

class EngineerRepository {
  private engineers: Map<string, Engineer> = new Map();

  constructor() {
    // サンプルデータを追加
    this.engineers.set('1', {
      id: '1',
      name: '山田太郎',
      email: 'yamada@example.com',
      companyId: '100',
      skills: ['React', 'TypeScript', 'Node.js'],
      experienceYears: 5,
      hourlyRate: 5000,
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.engineers.set('2', {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      companyId: '100',
      skills: ['Python', 'Django', 'AWS'],
      experienceYears: 3,
      hourlyRate: 4500,
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async findById(id: string): Promise<Engineer | null> {
    return this.engineers.get(id) || null;
  }

  async findByIds(ids: string[]): Promise<Engineer[]> {
    return ids.map(id => this.engineers.get(id)).filter(Boolean) as Engineer[];
  }

  async findByCompanyId(companyId: string): Promise<Engineer[]> {
    return Array.from(this.engineers.values())
      .filter(e => e.companyId === companyId);
  }

  async findAvailable(companyId: string): Promise<Engineer[]> {
    return Array.from(this.engineers.values())
      .filter(e => e.companyId === companyId && e.status === 'AVAILABLE');
  }

  async create(data: Partial<Engineer>): Promise<Engineer> {
    const id = String(Date.now());
    const engineer: Engineer = {
      id,
      name: data.name || '',
      email: data.email || '',
      companyId: data.companyId || '',
      skills: data.skills || [],
      experienceYears: data.experienceYears || 0,
      hourlyRate: data.hourlyRate || 0,
      status: data.status || 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    this.engineers.set(id, engineer);
    return engineer;
  }

  async update(id: string, data: Partial<Engineer>): Promise<Engineer | null> {
    const engineer = this.engineers.get(id);
    if (!engineer) return null;

    const updated = {
      ...engineer,
      ...data,
      updatedAt: new Date()
    };
    this.engineers.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.engineers.delete(id);
  }

  async count(companyId?: string): Promise<number> {
    if (companyId) {
      return Array.from(this.engineers.values())
        .filter(e => e.companyId === companyId).length;
    }
    return this.engineers.size;
  }

  async countAvailableEngineers(companyId: string): Promise<number> {
    return Array.from(this.engineers.values())
      .filter(e => e.companyId === companyId && e.status === 'AVAILABLE').length;
  }

  async findAvailableWithOfferStatus(companyId: string): Promise<any[]> {
    const engineers = Array.from(this.engineers.values())
      .filter(e => e.companyId === companyId && e.status === 'AVAILABLE');
    
    return engineers.map(e => ({
      ...e,
      lastOfferDate: null,
      offerCount: 0,
      offerStatus: null
    }));
  }
}

export const engineerRepository = new EngineerRepository();