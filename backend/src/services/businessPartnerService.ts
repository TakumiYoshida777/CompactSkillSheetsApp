import { PrismaClient } from '@prisma/client';
import { BusinessPartnerRepository } from '../repositories/businessPartnerRepository';
import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';
import { config } from '../config/environment';

export class BusinessPartnerService {
  private partnerRepository: BusinessPartnerRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.partnerRepository = new BusinessPartnerRepository(prisma);
  }

  /**
   * 取引先一覧を取得
   */
  async getPartners(companyId: number, options?: any) {
    return await this.partnerRepository.findBySESCompany(companyId, options);
  }

  /**
   * 取引先詳細を取得
   */
  async getPartnerById(partnerId: number, companyId: number) {
    const partner = await this.prisma.businessPartner.findFirst({
      where: {
        id: BigInt(partnerId),
        sesCompanyId: BigInt(companyId)
      },
      include: {
        clientCompany: true,
        clientUsers: {
          where: { isActive: true }
        },
        accessPermissions: {
          where: { isActive: true },
          include: {
            engineer: {
              select: {
                id: true,
                name: true,
                email: true,
                currentStatus: true
              }
            }
          }
        }
      }
    });

    if (!partner) {
      throw new NotFoundError('取引先');
    }

    return partner;
  }

  /**
   * 取引先を新規作成
   */
  async createPartner(companyId: number, userId: number, data: any) {
    // バリデーション
    if (!data.clientCompanyId && !data.clientCompanyName) {
      throw new ValidationError('取引先企業の指定が必要です');
    }

    let clientCompanyId = data.clientCompanyId;

    // 新規企業作成が必要な場合
    if (!clientCompanyId && data.clientCompanyName) {
      const existingCompany = await this.prisma.company.findFirst({
        where: { name: data.clientCompanyName }
      });

      if (existingCompany) {
        clientCompanyId = existingCompany.id;
      } else {
        const newCompany = await this.prisma.company.create({
          data: {
            companyType: 'CLIENT',
            name: data.clientCompanyName,
            emailDomain: data.emailDomain,
            contactEmail: data.contactEmail,
            address: data.address,
            phone: data.phone,
            websiteUrl: data.websiteUrl,
            isActive: true
          }
        });
        clientCompanyId = newCompany.id;
      }
    }

    // 既存の取引関係をチェック
    const existingPartner = await this.prisma.businessPartner.findFirst({
      where: {
        sesCompanyId: BigInt(companyId),
        clientCompanyId: BigInt(clientCompanyId),
        isActive: true
      }
    });

    if (existingPartner) {
      throw new ConflictError('この企業とは既に取引関係があります');
    }

    // エンジニアIDの検証
    const engineerIds = data.engineerIds || [];
    if (engineerIds.length > 0) {
      const engineers = await this.prisma.engineer.findMany({
        where: {
          id: { in: engineerIds.map((id: number) => BigInt(id)) },
          companyId: BigInt(companyId)
        }
      });

      if (engineers.length !== engineerIds.length) {
        throw new ValidationError('指定されたエンジニアが見つかりません');
      }
    }

    return await this.partnerRepository.createPartnership({
      sesCompanyId: BigInt(companyId),
      clientCompanyId: BigInt(clientCompanyId),
      createdBy: BigInt(userId),
      engineerIds: engineerIds.map((id: number) => BigInt(id))
    });
  }

  /**
   * 取引先情報を更新
   */
  async updatePartner(partnerId: number, companyId: number, data: any) {
    const partner = await this.getPartnerById(partnerId, companyId);

    const updateData: any = {};
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedPartner = await this.prisma.businessPartner.update({
      where: { id: BigInt(partnerId) },
      data: updateData,
      include: {
        clientCompany: true,
        accessPermissions: true
      }
    });

    // アクセス権限の更新
    if (data.engineerIds) {
      await this.updateAccessPermissions(partnerId, companyId, data.engineerIds, data.updatedBy);
    }

    return updatedPartner;
  }

  /**
   * アクセス権限を更新
   */
  async updateAccessPermissions(
    partnerId: number, 
    companyId: number, 
    engineerIds: number[], 
    userId: number
  ) {
    // 権限確認
    await this.getPartnerById(partnerId, companyId);

    // エンジニアIDの検証
    if (engineerIds.length > 0) {
      const engineers = await this.prisma.engineer.findMany({
        where: {
          id: { in: engineerIds.map(id => BigInt(id)) },
          companyId: BigInt(companyId)
        }
      });

      if (engineers.length !== engineerIds.length) {
        throw new ValidationError('指定されたエンジニアが見つかりません');
      }
    }

    await this.partnerRepository.updateAccessPermissions(
      BigInt(partnerId),
      engineerIds.map(id => BigInt(id)),
      BigInt(userId)
    );

    return { success: true };
  }

  /**
   * 取引先ユーザーを作成
   */
  async createClientUser(partnerId: number, companyId: number, data: any) {
    // 権限確認
    const partner = await this.getPartnerById(partnerId, companyId);

    // バリデーション
    if (!data.email) {
      throw new ValidationError('メールアドレスは必須です');
    }
    if (!data.name) {
      throw new ValidationError('氏名は必須です');
    }
    if (!data.password) {
      throw new ValidationError('パスワードは必須です');
    }

    // 既存ユーザーチェック
    const existingUser = await this.prisma.clientUser.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError('このメールアドレスは既に登録されています');
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(data.password, config.security.bcryptRounds);

    return await this.prisma.clientUser.create({
      data: {
        businessPartnerId: BigInt(partnerId),
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        department: data.department,
        position: data.position,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true
      }
    });
  }

  /**
   * 取引先ユーザーを更新
   */
  async updateClientUser(userId: number, partnerId: number, companyId: number, data: any) {
    // 権限確認
    await this.getPartnerById(partnerId, companyId);

    const user = await this.prisma.clientUser.findFirst({
      where: {
        id: BigInt(userId),
        businessPartnerId: BigInt(partnerId)
      }
    });

    if (!user) {
      throw new NotFoundError('ユーザー');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // パスワード変更
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, config.security.bcryptRounds);
    }

    return await this.prisma.clientUser.update({
      where: { id: BigInt(userId) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        position: true,
        isActive: true,
        lastLoginAt: true
      }
    });
  }

  /**
   * 取引先ユーザーを削除（論理削除）
   */
  async deleteClientUser(userId: number, partnerId: number, companyId: number) {
    // 権限確認
    await this.getPartnerById(partnerId, companyId);

    const user = await this.prisma.clientUser.findFirst({
      where: {
        id: BigInt(userId),
        businessPartnerId: BigInt(partnerId)
      }
    });

    if (!user) {
      throw new NotFoundError('ユーザー');
    }

    await this.prisma.clientUser.update({
      where: { id: BigInt(userId) },
      data: { isActive: false }
    });

    return { success: true };
  }

  /**
   * アクセスURLを再生成
   */
  async regenerateAccessUrl(partnerId: number, companyId: number) {
    const partner = await this.getPartnerById(partnerId, companyId);

    // 新しいトークンを生成
    const timestamp = Date.now().toString(36);
    const randomBytes = require('crypto').randomBytes(16).toString('hex');
    const newToken = `${timestamp}-${randomBytes}`;
    const newUrl = `${config.frontendUrl}/client/access/${newToken}`;

    return await this.prisma.businessPartner.update({
      where: { id: BigInt(partnerId) },
      data: {
        urlToken: newToken,
        accessUrl: newUrl
      }
    });
  }

  /**
   * 取引先統計を取得
   */
  async getPartnerStats(companyId: number) {
    return await this.partnerRepository.getPartnerStats(companyId);
  }

  /**
   * URLトークンから取引先情報を取得（クライアント用）
   */
  async getPartnerByUrlToken(urlToken: string) {
    const partner = await this.partnerRepository.findByUrlToken(urlToken);
    
    if (!partner || !partner.isActive) {
      throw new NotFoundError('アクセスURL');
    }

    return partner;
  }
}