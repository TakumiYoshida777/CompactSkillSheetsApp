import { PrismaClient, Approach, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ApproachRepository extends BaseRepository<
  Approach,
  Prisma.ApproachCreateInput,
  Prisma.ApproachUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'approach');
  }

  /**
   * 送信済みアプローチを取得
   */
  async findSentApproaches(
    companyId: number,
    options?: any
  ): Promise<{ data: Approach[]; total: number }> {
    const where = {
      fromCompanyId: BigInt(companyId)
    };
    
    // フィルタ条件の追加
    if (options?.filters) {
      if (options.filters.status) {
        (where as any).status = options.filters.status;
      }
      if (options.filters.approachType) {
        (where as any).approachType = options.filters.approachType;
      }
      if (options.filters.fromDate) {
        (where as any).sentAt = {
          ...(where as any).sentAt,
          gte: new Date(options.filters.fromDate)
        };
      }
      if (options.filters.toDate) {
        (where as any).sentAt = {
          ...(where as any).sentAt,
          lte: new Date(options.filters.toDate)
        };
      }
    }
    
    const [data, total] = await Promise.all([
      this.prisma.approach.findMany({
        where,
        skip: options?.pagination?.offset,
        take: options?.pagination?.limit,
        orderBy: options?.sort 
          ? { [options.sort.field]: options.sort.order }
          : { sentAt: 'desc' },
        include: {
          toCompany: {
            select: {
              id: true,
              name: true,
              emailDomain: true
            }
          },
          toFreelancer: {
            include: {
              engineer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          emailTemplate: true,
          sentByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          emailLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      this.prisma.approach.count({ where })
    ]);
    
    return { data, total };
  }

  /**
   * 受信済みアプローチを取得
   */
  async findReceivedApproaches(
    companyId: number,
    options?: any
  ): Promise<{ data: Approach[]; total: number }> {
    const where = {
      toCompanyId: BigInt(companyId)
    };
    
    const [data, total] = await Promise.all([
      this.prisma.approach.findMany({
        where,
        skip: options?.pagination?.offset,
        take: options?.pagination?.limit,
        orderBy: options?.sort 
          ? { [options.sort.field]: options.sort.order }
          : { sentAt: 'desc' },
        include: {
          fromCompany: {
            select: {
              id: true,
              name: true,
              emailDomain: true
            }
          },
          sentByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      this.prisma.approach.count({ where })
    ]);
    
    return { data, total };
  }

  /**
   * アプローチを送信
   */
  async sendApproach(
    approachData: {
      fromCompanyId: bigint;
      toCompanyId?: bigint;
      toFreelancerId?: bigint;
      approachType: string;
      contactMethods?: any;
      targetEngineers?: any;
      projectDetails?: string;
      messageContent?: string;
      emailTemplateId?: bigint;
      sentBy: bigint;
    }
  ): Promise<Approach> {
    return await this.prisma.$transaction(async (tx) => {
      // アプローチを作成
      const approach = await tx.approach.create({
        data: {
          ...approachData,
          status: 'SENT',
          sentAt: new Date()
        },
        include: {
          toCompany: true,
          toFreelancer: true,
          emailTemplate: true
        }
      });
      
      // メール送信ログを作成（実際のメール送信は後で実装）
      if (approach.toCompany || approach.toFreelancer) {
        const recipientEmail = approach.toCompany?.contactEmail || 
          (approach.toFreelancer as any)?.engineer?.email;
        
        if (recipientEmail) {
          await tx.emailLog.create({
            data: {
              companyId: approach.fromCompanyId,
              approachId: approach.id,
              recipientEmail,
              subject: approach.emailTemplate?.subject || 'アプローチのご連絡',
              body: approach.messageContent || '',
              status: 'SENT',
              sentAt: new Date()
            }
          });
        }
      }
      
      return approach;
    });
  }

  /**
   * アプローチの統計を取得
   */
  async getApproachStats(companyId: number): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [total, sent, opened, replied] = await Promise.all([
      this.prisma.approach.count({
        where: { fromCompanyId: BigInt(companyId) }
      }),
      this.prisma.approach.count({
        where: {
          fromCompanyId: BigInt(companyId),
          sentAt: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.approach.count({
        where: {
          fromCompanyId: BigInt(companyId),
          status: 'OPENED'
        }
      }),
      this.prisma.approach.count({
        where: {
          fromCompanyId: BigInt(companyId),
          status: 'REPLIED'
        }
      })
    ]);
    
    return {
      total,
      last30Days: sent,
      opened,
      replied,
      openRate: total > 0 ? (opened / total * 100).toFixed(1) : 0,
      replyRate: total > 0 ? (replied / total * 100).toFixed(1) : 0
    };
  }
}