import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

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

export interface EngineerWithOfferStatus extends Engineer {
  lastOfferDate: Date | null;
  offerCount: number;
  offerStatus: string | null;
}

class EngineerRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Engineer | null> {
    const engineer = await this.prisma.engineer.findUnique({
      where: { id: BigInt(id) },
      include: {
        skillSheet: {
          include: {
            skills: true
          }
        }
      }
    });

    if (!engineer) return null;

    return {
      id: engineer.id.toString(),
      name: engineer.name,
      email: engineer.email,
      companyId: engineer.companyId.toString(),
      skills: engineer.skillSheet?.skills.map(s => s.name) || [],
      experienceYears: engineer.experienceYears || 0,
      hourlyRate: engineer.unitPrice || 0,
      status: engineer.engineerStatus,
      createdAt: engineer.createdAt,
      updatedAt: engineer.updatedAt
    };
  }

  async findByIds(ids: string[]): Promise<Engineer[]> {
    const engineers = await this.prisma.engineer.findMany({
      where: {
        id: { in: ids.map(id => BigInt(id)) }
      },
      include: {
        skillSheet: {
          include: {
            skills: true
          }
        }
      }
    });

    return engineers.map(e => ({
      id: e.id.toString(),
      name: e.name,
      email: e.email,
      companyId: e.companyId.toString(),
      skills: e.skillSheet?.skills.map(s => s.name) || [],
      experienceYears: e.experienceYears || 0,
      hourlyRate: e.unitPrice || 0,
      status: e.engineerStatus,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));
  }

  async findByCompanyId(companyId: string): Promise<Engineer[]> {
    const engineers = await this.prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      include: {
        skillSheet: {
          include: {
            skills: true
          }
        }
      }
    });

    return engineers.map(e => ({
      id: e.id.toString(),
      name: e.name,
      email: e.email,
      companyId: e.companyId.toString(),
      skills: e.skillSheet?.skills.map(s => s.name) || [],
      experienceYears: e.experienceYears || 0,
      hourlyRate: e.unitPrice || 0,
      status: e.engineerStatus,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));
  }

  async findAvailable(companyId: string): Promise<Engineer[]> {
    const engineers = await this.prisma.engineer.findMany({
      where: {
        companyId: BigInt(companyId),
        engineerStatus: 'AVAILABLE'
      },
      include: {
        skillSheet: {
          include: {
            skills: true
          }
        }
      }
    });

    return engineers.map(e => ({
      id: e.id.toString(),
      name: e.name,
      email: e.email,
      companyId: e.companyId.toString(),
      skills: e.skillSheet?.skills.map(s => s.name) || [],
      experienceYears: e.experienceYears || 0,
      hourlyRate: e.unitPrice || 0,
      status: e.engineerStatus,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));
  }

  async create(data: Partial<Engineer>): Promise<Engineer> {
    const engineer = await this.prisma.engineer.create({
      data: {
        name: data.name || '',
        email: data.email || '',
        companyId: BigInt(data.companyId || '1'),
        engineerStatus: data.status || 'AVAILABLE',
        unitPrice: data.hourlyRate,
        experienceYears: data.experienceYears,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        skillSheet: {
          include: {
            skills: true
          }
        }
      }
    });

    return {
      id: engineer.id.toString(),
      name: engineer.name,
      email: engineer.email,
      companyId: engineer.companyId.toString(),
      skills: engineer.skillSheet?.skills.map(s => s.name) || [],
      experienceYears: engineer.experienceYears || 0,
      hourlyRate: engineer.unitPrice || 0,
      status: engineer.engineerStatus,
      createdAt: engineer.createdAt,
      updatedAt: engineer.updatedAt
    };
  }

  async update(id: string, data: Partial<Engineer>): Promise<Engineer | null> {
    try {
      const engineer = await this.prisma.engineer.update({
        where: { id: BigInt(id) },
        data: {
          name: data.name,
          email: data.email,
          engineerStatus: data.status,
          unitPrice: data.hourlyRate,
          experienceYears: data.experienceYears,
          updatedAt: new Date()
        },
        include: {
          skillSheet: {
            include: {
              skills: true
            }
          }
        }
      });

      return {
        id: engineer.id.toString(),
        name: engineer.name,
        email: engineer.email,
        companyId: engineer.companyId.toString(),
        skills: engineer.skillSheet?.skills.map(s => s.name) || [],
        experienceYears: engineer.experienceYears || 0,
        hourlyRate: engineer.unitPrice || 0,
        status: engineer.engineerStatus,
        createdAt: engineer.createdAt,
        updatedAt: engineer.updatedAt
      };
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.engineer.delete({
        where: { id: BigInt(id) }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(companyId?: string): Promise<number> {
    const where = companyId ? { companyId: BigInt(companyId) } : {};
    return this.prisma.engineer.count({ where });
  }

  async countAvailableEngineers(companyId: string): Promise<number> {
    return this.prisma.engineer.count({
      where: {
        companyId: BigInt(companyId),
        engineerStatus: 'AVAILABLE'
      }
    });
  }

  async findAvailableWithOfferStatus(companyId: string): Promise<EngineerWithOfferStatus[]> {
    const engineers = await this.prisma.engineer.findMany({
      where: {
        companyId: BigInt(companyId),
        engineerStatus: 'AVAILABLE'
      },
      include: {
        skillSheet: {
          include: {
            skills: true
          }
        },
        offerEngineers: {
          include: {
            offer: {
              select: {
                id: true,
                status: true,
                sentAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return engineers.map(e => {
      const latestOffer = e.offerEngineers[0]?.offer;
      const offerCount = e.offerEngineers.length;

      return {
        id: e.id.toString(),
        name: e.name,
        email: e.email,
        companyId: e.companyId.toString(),
        skills: e.skillSheet?.skills.map(s => s.name) || [],
        experienceYears: e.experienceYears || 0,
        hourlyRate: e.unitPrice || 0,
        status: e.engineerStatus,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        lastOfferDate: latestOffer?.sentAt || null,
        offerCount,
        offerStatus: latestOffer?.status || null
      };
    });
  }
}

export const engineerRepository = new EngineerRepository(prisma);