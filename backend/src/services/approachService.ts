import { PrismaClient } from '@prisma/client';
import { ApproachRepository } from '../repositories/approachRepository';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/error.middleware';

export class ApproachService {
  private approachRepository: ApproachRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.approachRepository = new ApproachRepository(prisma);
  }

  /**
   * 送信済みアプローチ一覧を取得
   */
  async getSentApproaches(companyId: number, options?: any) {
    return await this.approachRepository.findSentApproaches(companyId, options);
  }

  /**
   * 受信済みアプローチ一覧を取得
   */
  async getReceivedApproaches(companyId: number, options?: any) {
    return await this.approachRepository.findReceivedApproaches(companyId, options);
  }

  /**
   * アプローチ詳細を取得
   */
  async getApproachById(approachId: number, companyId: number) {
    const approach = await this.prisma.approach.findFirst({
      where: {
        id: BigInt(approachId),
        OR: [
          { fromCompanyId: BigInt(companyId) },
          { toCompanyId: BigInt(companyId) }
        ]
      },
      include: {
        fromCompany: true,
        toCompany: true,
        toFreelancer: {
          include: {
            engineer: true
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
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!approach) {
      throw new NotFoundError('アプローチ');
    }

    return approach;
  }

  /**
   * アプローチを送信
   */
  async sendApproach(companyId: number, userId: number, data: any) {
    // バリデーション
    if (!data.approachType) {
      throw new ValidationError('アプローチタイプは必須です');
    }

    if (data.approachType === 'COMPANY' && !data.toCompanyId) {
      throw new ValidationError('送信先企業IDは必須です');
    }

    if (data.approachType === 'FREELANCE' && !data.toFreelancerId) {
      throw new ValidationError('送信先フリーランスIDは必須です');
    }

    // 送信先の存在確認
    if (data.toCompanyId) {
      const toCompany = await this.prisma.company.findUnique({
        where: { id: BigInt(data.toCompanyId) }
      });
      if (!toCompany) {
        throw new NotFoundError('送信先企業');
      }
    }

    if (data.toFreelancerId) {
      const toFreelancer = await this.prisma.freelancer.findUnique({
        where: { id: BigInt(data.toFreelancerId) }
      });
      if (!toFreelancer) {
        throw new NotFoundError('送信先フリーランス');
      }
    }

    // メールテンプレートの確認（指定された場合）
    if (data.emailTemplateId) {
      const template = await this.prisma.emailTemplate.findFirst({
        where: {
          id: BigInt(data.emailTemplateId),
          companyId: BigInt(companyId)
        }
      });
      if (!template) {
        throw new NotFoundError('メールテンプレート');
      }
    }

    // アプローチデータの準備
    const approachData = {
      fromCompanyId: BigInt(companyId),
      toCompanyId: data.toCompanyId ? BigInt(data.toCompanyId) : undefined,
      toFreelancerId: data.toFreelancerId ? BigInt(data.toFreelancerId) : undefined,
      approachType: data.approachType,
      contactMethods: data.contactMethods,
      targetEngineers: data.targetEngineers,
      projectDetails: data.projectDetails,
      messageContent: data.messageContent,
      emailTemplateId: data.emailTemplateId ? BigInt(data.emailTemplateId) : undefined,
      sentBy: BigInt(userId)
    };

    return await this.approachRepository.sendApproach(approachData);
  }

  /**
   * アプローチステータスを更新
   */
  async updateApproachStatus(approachId: number, companyId: number, status: string) {
    const approach = await this.getApproachById(approachId, companyId);

    // 権限確認（送信元企業のみ更新可能）
    if (approach.fromCompanyId !== BigInt(companyId)) {
      throw new ForbiddenError('このアプローチを更新する権限がありません');
    }

    return await this.prisma.approach.update({
      where: { id: BigInt(approachId) },
      data: { status },
      include: {
        toCompany: true,
        toFreelancer: true
      }
    });
  }

  /**
   * アプローチを削除
   */
  async deleteApproach(approachId: number, companyId: number) {
    const approach = await this.getApproachById(approachId, companyId);

    // 権限確認（送信元企業のみ削除可能）
    if (approach.fromCompanyId !== BigInt(companyId)) {
      throw new ForbiddenError('このアプローチを削除する権限がありません');
    }

    await this.prisma.approach.delete({
      where: { id: BigInt(approachId) }
    });

    return { success: true };
  }

  /**
   * アプローチ統計を取得
   */
  async getApproachStats(companyId: number) {
    return await this.approachRepository.getApproachStats(companyId);
  }

  /**
   * メールテンプレート一覧を取得
   */
  async getEmailTemplates(companyId: number) {
    return await this.prisma.emailTemplate.findMany({
      where: {
        companyId: BigInt(companyId),
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * メールテンプレートを作成
   */
  async createEmailTemplate(companyId: number, data: any) {
    if (!data.name) {
      throw new ValidationError('テンプレート名は必須です');
    }
    if (!data.subject) {
      throw new ValidationError('件名は必須です');
    }
    if (!data.body) {
      throw new ValidationError('本文は必須です');
    }

    return await this.prisma.emailTemplate.create({
      data: {
        companyId: BigInt(companyId),
        name: data.name,
        category: data.category,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        isActive: true
      }
    });
  }

  /**
   * メールテンプレートを更新
   */
  async updateEmailTemplate(templateId: number, companyId: number, data: any) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: BigInt(templateId),
        companyId: BigInt(companyId)
      }
    });

    if (!template) {
      throw new NotFoundError('メールテンプレート');
    }

    return await this.prisma.emailTemplate.update({
      where: { id: BigInt(templateId) },
      data: {
        name: data.name,
        category: data.category,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        isActive: data.isActive
      }
    });
  }

  /**
   * メールテンプレートを削除
   */
  async deleteEmailTemplate(templateId: number, companyId: number) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: BigInt(templateId),
        companyId: BigInt(companyId)
      }
    });

    if (!template) {
      throw new NotFoundError('メールテンプレート');
    }

    // 論理削除
    await this.prisma.emailTemplate.update({
      where: { id: BigInt(templateId) },
      data: { isActive: false }
    });

    return { success: true };
  }
}