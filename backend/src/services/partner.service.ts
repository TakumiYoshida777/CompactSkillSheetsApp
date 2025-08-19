import { PartnerRepository } from '../repositories/partner.repository';
import { PartnerPermissionRepository } from '../repositories/partnerPermission.repository';
import { AccessUrlRepository } from '../repositories/accessUrl.repository';
import { PartnerUserRepository } from '../repositories/partnerUser.repository';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { config } from '../config/environment';
import logger from '../config/logger';

export class PartnerService {
  private partnerRepo: PartnerRepository;
  private permissionRepo: PartnerPermissionRepository;
  private accessUrlRepo: AccessUrlRepository;
  private userRepo: PartnerUserRepository;
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.partnerRepo = new PartnerRepository(this.prisma);
    this.permissionRepo = new PartnerPermissionRepository(this.prisma);
    this.accessUrlRepo = new AccessUrlRepository(this.prisma);
    this.userRepo = new PartnerUserRepository(this.prisma);
  }

  async findAll(companyId: number, pagination: any, filters: any) {
    return this.partnerRepo.findAll(companyId, pagination, filters);
  }

  async count(companyId: number, filters: any) {
    return this.partnerRepo.count(companyId, filters);
  }

  async findById(id: number, companyId: number) {
    return this.partnerRepo.findById(id, companyId);
  }
  
  async create(data: any, companyId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 取引先企業作成
      const partner = await tx.$executeRawUnsafe(`
        INSERT INTO business_partners 
        (company_id, name, email, phone, address, contract_status, 
         contract_start_date, contract_end_date, max_viewable_engineers,
         contact_person_name, contact_person_email, contact_person_phone, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
        companyId,
        data.name,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.contract_status || 'active',
        data.contract_start_date || null,
        data.contract_end_date || null,
        data.max_viewable_engineers || 100,
        data.contact_person_name || null,
        data.contact_person_email || null,
        data.contact_person_phone || null,
        data.notes || null
      );
      
      // 取得したpartnerのIDを使用
      const partnerId = await tx.$queryRaw`
        SELECT id FROM business_partners 
        WHERE company_id = ${companyId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `.then((result: any) => result[0]?.id);

      // デフォルト権限設定
      await tx.$executeRawUnsafe(`
        INSERT INTO partner_permissions 
        (partner_id, can_view_engineers, can_send_offers, 
         max_viewable_engineers, auto_publish_waiting)
        VALUES ($1, $2, $3, $4, $5)
      `,
        partnerId,
        true,
        true,
        data.max_viewable_engineers || 100,
        false
      );
      
      return this.partnerRepo.findById(partnerId, companyId);
    });
  }

  async update(id: number, data: any, companyId: number) {
    const partner = await this.partnerRepo.findById(id, companyId);
    if (!partner) {
      return null;
    }
    
    return this.partnerRepo.update(id, data, companyId);
  }

  async delete(id: number, companyId: number) {
    const partner = await this.partnerRepo.findById(id, companyId);
    if (!partner) {
      return false;
    }
    
    return this.partnerRepo.delete(id, companyId);
  }

  async getPermissions(partnerId: number, companyId: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    return this.permissionRepo.findByPartnerId(partnerId);
  }
  
  async updatePermissions(partnerId: number, permissions: any, companyId: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    return this.permissionRepo.update(partnerId, permissions);
  }
  
  async getVisibleEngineers(partnerId: number, companyId: number) {
    // 権限取得
    const permissions = await this.permissionRepo.findByPartnerId(partnerId);
    if (!permissions) {
      return [];
    }
    
    // 公開設定に基づいてエンジニアを取得
    const query = `
      SELECT e.* FROM engineers e
      WHERE e.company_id = $1
      AND (
        -- 個別公開設定
        ($2::jsonb @> to_jsonb(e.id))
        -- 自動公開（待機中）
        OR ($3 = true AND e.status = 'waiting')
      )
      AND NOT ($4::jsonb @> to_jsonb(e.id))
      ORDER BY e.updated_at DESC
      LIMIT $5
    `;
    
    const engineers = await this.prisma.$queryRawUnsafe(query,
      companyId,
      JSON.stringify(permissions.visible_engineer_ids || []),
      permissions.auto_publish_waiting || false,
      JSON.stringify(permissions.ng_engineer_ids || []),
      permissions.max_viewable_engineers || 100
    );
    
    return engineers;
  }
  
  async setVisibleEngineers(
    partnerId: number,
    engineerIds: number[],
    autoPublish: boolean,
    companyId: number
  ) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    // エンジニアの存在確認
    const validEngineers = await this.prisma.$queryRaw`
      SELECT id FROM engineers 
      WHERE id = ANY(${engineerIds}::int[])
      AND company_id = ${companyId}
    `;
    
    if ((validEngineers as any[]).length !== engineerIds.length) {
      throw new Error('無効なエンジニアIDが含まれています');
    }
    
    // 権限更新
    return this.permissionRepo.update(partnerId, {
      visible_engineer_ids: JSON.stringify(engineerIds),
      auto_publish_waiting: autoPublish
    });
  }

  async removeVisibleEngineer(partnerId: number, engineerId: number, companyId: number) {
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }

    const permissions = await this.permissionRepo.findByPartnerId(partnerId);
    if (!permissions) {
      throw new Error('権限設定が見つかりません');
    }

    const visibleEngineers = (permissions.visible_engineer_ids as number[]) || [];
    const updatedEngineers = visibleEngineers.filter(id => id !== engineerId);

    return this.permissionRepo.update(partnerId, {
      visible_engineer_ids: JSON.stringify(updatedEngineers)
    });
  }

  async getAccessUrls(partnerId: number, companyId: number) {
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }

    return this.accessUrlRepo.findByPartnerId(partnerId);
  }
  
  async createAccessUrl(partnerId: number, options: any, companyId: number, createdBy?: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    // ユニークなトークン生成
    const token = crypto.randomBytes(32).toString('hex');
    
    // 有効期限設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiresIn || 30));
    
    // アクセスURL作成
    const accessUrl = await this.accessUrlRepo.create({
      partner_id: partnerId,
      token,
      expires_at: expiresAt,
      max_uses: options.maxUses || null,
      used_count: 0,
      is_active: true,
      created_by: createdBy || null
    });
    
    // フルURLを構築
    const fullUrl = `${config.frontendUrl}/partner/access/${token}`;
    
    return {
      ...accessUrl,
      full_url: fullUrl
    };
  }

  async deleteAccessUrl(partnerId: number, urlId: number, companyId: number) {
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }

    return this.accessUrlRepo.delete(urlId, partnerId);
  }

  async getPartnerUsers(partnerId: number, companyId: number) {
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }

    return this.userRepo.findByPartnerId(partnerId);
  }
  
  async createPartnerUser(partnerId: number, userData: any, companyId: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    // メールの重複チェック
    const existing = await this.userRepo.findByEmail(userData.email);
    if (existing) {
      throw new Error('このメールアドレスは既に使用されています');
    }
    
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);
    
    // ユーザー作成
    return this.userRepo.create({
      partner_id: partnerId,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'viewer',
      is_active: true
    });
  }

  async updatePartnerUser(partnerId: number, userId: number, userData: any, companyId: number) {
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }

    const user = await this.userRepo.findById(userId, partnerId);
    if (!user) {
      return null;
    }

    // パスワード変更時はハッシュ化
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, config.security.bcryptRounds);
    }

    return this.userRepo.update(userId, userData, partnerId);
  }

  async deletePartnerUser(partnerId: number, userId: number, companyId: number) {
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }

    const user = await this.userRepo.findById(userId, partnerId);
    if (!user) {
      return false;
    }

    return this.userRepo.delete(userId, partnerId);
  }
  
  async getPartnerStatistics(partnerId: number, companyId: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    // 統計データ取得
    const [offers, views, engineers, users] = await Promise.all([
      // オファー数
      this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM offers 
        WHERE partner_id = ${partnerId}
      `.then((result: any) => parseInt(result[0]?.count || 0)),
      
      // 閲覧数
      this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM view_logs 
        WHERE partner_id = ${partnerId}
      `.then((result: any) => parseInt(result[0]?.count || 0)),
      
      // 公開エンジニア数
      this.getVisibleEngineers(partnerId, companyId).then(engineers => engineers.length),

      // アクティブユーザー数
      this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM partner_users 
        WHERE partner_id = ${partnerId} AND is_active = true
      `.then((result: any) => parseInt(result[0]?.count || 0))
    ]);
    
    return {
      totalOffers: offers,
      totalViews: views,
      visibleEngineers: engineers,
      activeUsers: users,
      contractStatus: partner.contract_status,
      contractEndDate: partner.contract_end_date
    };
  }
}