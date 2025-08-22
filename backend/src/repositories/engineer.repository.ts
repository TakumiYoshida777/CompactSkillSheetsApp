import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EngineerRepository {
  async findAllWithFilters(companyId: number, pagination: any, filters: any) {
    const where: any = {
      companyId: BigInt(companyId)
    };
    
    // フィルター適用
    if (filters?.currentStatus) {
      where.currentStatus = filters.currentStatus;
    }
    if (filters?.engineerType) {
      where.engineerType = filters.engineerType;
    }
    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }
    if (filters?.availableFrom) {
      where.availableDate = { lte: new Date(filters.availableFrom) };
    }
    
    const [engineers, total] = await Promise.all([
      prisma.engineer.findMany({
        where,
        skip: pagination?.offset,
        take: pagination?.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          skills: true,
          engineerProjects: {
            where: { isCurrent: true },
            include: {
              project: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.engineer.count({ where })
    ]);
    
    return { data: engineers, total };
  }
  
  async countWithFilters(companyId: number, filters: any) {
    const where: any = {
      companyId: BigInt(companyId)
    };
    
    if (filters?.currentStatus) {
      where.currentStatus = filters.currentStatus;
    }
    if (filters?.engineerType) {
      where.engineerType = filters.engineerType;
    }
    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }
    
    return prisma.engineer.count({ where });
  }
  
  async findById(id: number, companyId: number) {
    return prisma.engineer.findFirst({
      where: {
        id: BigInt(id),
        companyId: BigInt(companyId)
      },
      include: {
        user: true,
        skills: true,
        engineerProjects: {
          include: {
            project: true
          },
          orderBy: { startDate: 'desc' }
        }
      }
    });
  }
  
  async create(data: any) {
    return prisma.engineer.create({
      data: {
        companyId: BigInt(data.companyId),
        userId: data.userId ? BigInt(data.userId) : undefined,
        employeeNumber: data.employeeNumber,
        name: data.name,
        nameKana: data.nameKana,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        gender: data.gender,
        address: data.address,
        nearestStation: data.nearestStation,
        educationBackground: data.educationBackground,
        department: data.department,
        position: data.position,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
        yearsOfExperience: data.yearsOfExperience,
        previousExperience: data.previousExperience,
        certifications: data.certifications,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        desiredSalary: data.desiredSalary,
        currentStatus: data.currentStatus || 'WAITING',
        engineerType: data.engineerType || 'EMPLOYEE',
        availableDate: data.availableDate ? new Date(data.availableDate) : undefined,
        isPublic: data.isPublic ?? false
      },
      include: {
        user: true,
        skills: true
      }
    });
  }
  
  async update(id: number, data: any, companyId: number) {
    // 存在確認
    const existing = await this.findById(id, companyId);
    if (!existing) {
      return null;
    }
    
    const updateData: any = {};
    
    // 更新可能なフィールドのみ設定
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nameKana !== undefined) updateData.nameKana = data.nameKana;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.birthDate !== undefined) updateData.birthDate = new Date(data.birthDate);
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.nearestStation !== undefined) updateData.nearestStation = data.nearestStation;
    if (data.educationBackground !== undefined) updateData.educationBackground = data.educationBackground;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.joinDate !== undefined) updateData.joinDate = new Date(data.joinDate);
    if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience;
    if (data.previousExperience !== undefined) updateData.previousExperience = data.previousExperience;
    if (data.certifications !== undefined) updateData.certifications = data.certifications;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
    if (data.portfolioUrl !== undefined) updateData.portfolioUrl = data.portfolioUrl;
    if (data.desiredSalary !== undefined) updateData.desiredSalary = data.desiredSalary;
    if (data.currentStatus !== undefined) updateData.currentStatus = data.currentStatus;
    if (data.engineerType !== undefined) updateData.engineerType = data.engineerType;
    if (data.availableDate !== undefined) updateData.availableDate = new Date(data.availableDate);
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    
    return prisma.engineer.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        user: true,
        skills: true
      }
    });
  }
  
  async delete(id: number, companyId: number) {
    // 存在確認
    const existing = await this.findById(id, companyId);
    if (!existing) {
      return false;
    }
    
    await prisma.$transaction(async (tx) => {
      // 関連データの削除
      await tx.engineerProject.deleteMany({
        where: { engineerId: BigInt(id) }
      });
      
      await tx.engineerSkill.deleteMany({
        where: { engineerId: BigInt(id) }
      });
      
      // エンジニアの削除
      await tx.engineer.delete({
        where: { id: BigInt(id) }
      });
    });
    
    return true;
  }
  
  async search(companyId: number, criteria: any, pagination: any) {
    const where: any = {
      companyId: BigInt(companyId)
    };
    
    // キーワード検索
    if (criteria.query) {
      where.OR = [
        { name: { contains: criteria.query, mode: 'insensitive' } },
        { email: { contains: criteria.query, mode: 'insensitive' } },
        { nameKana: { contains: criteria.query, mode: 'insensitive' } }
      ];
    }
    
    // スキル検索
    if (criteria.skills && criteria.skills.length > 0) {
      where.skills = {
        some: {
          skill: {
            name: { in: criteria.skills }
          }
        }
      };
    }
    
    // ステータス検索
    if (criteria.currentStatus) {
      where.currentStatus = criteria.currentStatus;
    }
    
    // 経験年数検索
    if (criteria.yearsOfExperience) {
      where.yearsOfExperience = { gte: criteria.yearsOfExperience };
    }
    
    const [data, total] = await Promise.all([
      prisma.engineer.findMany({
        where,
        skip: pagination?.offset,
        take: pagination?.limit,
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          engineerProjects: {
            where: { isCurrent: true },
            include: {
              project: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.engineer.count({ where })
    ]);
    
    return { data, total };
  }
  
  async findByStatus(companyId: number, status: string, pagination: any) {
    const where = {
      companyId: BigInt(companyId),
      currentStatus: status
    };
    
    const [engineers, total] = await Promise.all([
      prisma.engineer.findMany({
        where,
        skip: pagination?.offset,
        take: pagination?.limit,
        include: {
          user: true,
          engineerProjects: {
            where: { isCurrent: true },
            include: {
              project: true
            }
          }
        },
        orderBy: { availableDate: 'asc' }
      }),
      prisma.engineer.count({ where })
    ]);
    
    return { data: engineers, total };
  }
  
  async findAvailable(companyId: number, date: string, pagination: any) {
    const targetDate = new Date(date);
    const where = {
      companyId: BigInt(companyId),
      OR: [
        { currentStatus: 'WAITING' },
        {
          currentStatus: 'UPCOMING',
          availableDate: { lte: targetDate }
        }
      ]
    };
    
    const [engineers, total] = await Promise.all([
      prisma.engineer.findMany({
        where,
        skip: pagination?.offset,
        take: pagination?.limit,
        include: {
          user: true,
          skills: true
        },
        orderBy: { availableDate: 'asc' }
      }),
      prisma.engineer.count({ where })
    ]);
    
    return { data: engineers, total };
  }
  
  async countByStatus(companyId: number, status: string) {
    return prisma.engineer.count({
      where: {
        companyId: BigInt(companyId),
        currentStatus: status
      }
    });
  }
  
  async count(companyId: number) {
    return prisma.engineer.count({
      where: {
        companyId: BigInt(companyId)
      }
    });
  }
}