# エンジニア3 - 取引先・アプローチ管理API実装指示書

## 担当者: エンジニア3
## 優先度: 高（営業活動の中核機能のため）
## 実装期限: 3営業日以内
## 前提: エンジニア1のDay1完了後に着手

---

## 1. 担当範囲

### 1.1 取引先管理API
- 取引先企業のCRUD操作
- アクセス権限管理
- エンジニア公開設定
- アクセスURL管理

### 1.2 アプローチ管理API
- アプローチ履歴管理
- メールテンプレート管理
- 定期アプローチ設定
- フリーランスアプローチ

### 1.3 通知・メール配信API
- 通知管理
- メール送信管理
- 送信ログ管理

---

## 2. 実装タスク詳細

### 2.1 取引先管理API実装

#### 2.1.1 取引先ルート定義
```typescript
// backend/src/routes/v1/partner.routes.ts
import { Router } from 'express';
import { PartnerController } from '../../controllers/partner.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { partnerValidation } from '../../validations/partner.validation';

const router = Router();
const controller = new PartnerController();

// 基本CRUD
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(partnerValidation.create), controller.create);
router.put('/:id', validateRequest(partnerValidation.update), controller.update);
router.delete('/:id', controller.delete);

// 権限管理
router.get('/:id/permissions', controller.getPermissions);
router.put('/:id/permissions', validateRequest(partnerValidation.permissions), controller.updatePermissions);

// エンジニア公開設定
router.get('/:id/visible-engineers', controller.getVisibleEngineers);
router.post('/:id/visible-engineers', controller.setVisibleEngineers);
router.delete('/:id/visible-engineers/:engineerId', controller.removeVisibleEngineer);

// アクセスURL管理
router.get('/:id/access-urls', controller.getAccessUrls);
router.post('/:id/access-urls', controller.createAccessUrl);
router.delete('/:id/access-urls/:urlId', controller.deleteAccessUrl);

// ユーザー管理
router.get('/:id/users', controller.getUsers);
router.post('/:id/users', validateRequest(partnerValidation.user), controller.createUser);
router.put('/:id/users/:userId', controller.updateUser);
router.delete('/:id/users/:userId', controller.deleteUser);

// 統計
router.get('/:id/statistics', controller.getStatistics);

export default router;
```

#### 2.1.2 取引先コントローラー実装
```typescript
// backend/src/controllers/partner.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../services/partner.service';
import { ApiResponse } from '../utils/response.util';

export class PartnerController {
  private service: PartnerService;
  
  constructor() {
    this.service = new PartnerService();
  }
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, contractStatus } = req.query;
      const { page, limit, offset } = req.pagination;
      
      const partners = await this.service.findAll(
        req.companyId,
        { page, limit, offset },
        { status, contractStatus }
      );
      
      const total = await this.service.count(req.companyId, { status, contractStatus });
      
      res.json(ApiResponse.paginated(partners, {
        page,
        limit,
        total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const partner = await this.service.create(req.body, req.companyId);
      res.status(201).json(ApiResponse.success(partner));
    } catch (error) {
      next(error);
    }
  };
  
  updatePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await this.service.updatePermissions(
        parseInt(req.params.id),
        req.body,
        req.companyId
      );
      
      res.json(ApiResponse.success(permissions));
    } catch (error) {
      next(error);
    }
  };
  
  getVisibleEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineers = await this.service.getVisibleEngineers(
        parseInt(req.params.id),
        req.companyId
      );
      
      res.json(ApiResponse.success(engineers));
    } catch (error) {
      next(error);
    }
  };
  
  setVisibleEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { engineerIds, autoPublish } = req.body;
      
      const result = await this.service.setVisibleEngineers(
        parseInt(req.params.id),
        engineerIds,
        autoPublish,
        req.companyId
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
  
  createAccessUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expiresIn, maxUses } = req.body;
      
      const accessUrl = await this.service.createAccessUrl(
        parseInt(req.params.id),
        { expiresIn, maxUses },
        req.companyId
      );
      
      res.status(201).json(ApiResponse.success(accessUrl));
    } catch (error) {
      next(error);
    }
  };
  
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.createPartnerUser(
        parseInt(req.params.id),
        req.body,
        req.companyId
      );
      
      res.status(201).json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  };
  
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getPartnerStatistics(
        parseInt(req.params.id),
        req.companyId
      );
      
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  };
}
```

#### 2.1.3 取引先サービス実装
```typescript
// backend/src/services/partner.service.ts
import { PartnerRepository } from '../repositories/partner.repository';
import { PartnerPermissionRepository } from '../repositories/partnerPermission.repository';
import { AccessUrlRepository } from '../repositories/accessUrl.repository';
import { Database } from '../database';
import crypto from 'crypto';

export class PartnerService {
  private partnerRepo: PartnerRepository;
  private permissionRepo: PartnerPermissionRepository;
  private accessUrlRepo: AccessUrlRepository;
  private db: Database;
  
  constructor() {
    this.db = Database.getInstance();
    this.partnerRepo = new PartnerRepository(this.db);
    this.permissionRepo = new PartnerPermissionRepository(this.db);
    this.accessUrlRepo = new AccessUrlRepository(this.db);
  }
  
  async create(data: any, companyId: number) {
    return this.db.transaction(async (trx) => {
      // 取引先企業作成
      const partner = await this.partnerRepo.create({
        ...data,
        company_id: companyId,
        contract_status: 'active'
      }, trx);
      
      // デフォルト権限設定
      await this.permissionRepo.create({
        partner_id: partner.id,
        can_view_engineers: true,
        can_send_offers: true,
        max_viewable_engineers: data.max_viewable_engineers || 100,
        auto_publish_waiting: false,
        ng_engineer_ids: []
      }, trx);
      
      return partner;
    });
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
    const engineers = await this.db('engineers')
      .where({ company_id: companyId })
      .where(function() {
        // 個別公開設定
        if (permissions.visible_engineer_ids?.length > 0) {
          this.whereIn('id', permissions.visible_engineer_ids);
        }
        // 自動公開（待機中）
        if (permissions.auto_publish_waiting) {
          this.orWhere('status', 'waiting');
        }
      })
      .whereNotIn('id', permissions.ng_engineer_ids || [])
      .limit(permissions.max_viewable_engineers)
      .orderBy('updated_at', 'desc');
    
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
    const validEngineers = await this.db('engineers')
      .whereIn('id', engineerIds)
      .where({ company_id: companyId })
      .pluck('id');
    
    if (validEngineers.length !== engineerIds.length) {
      throw new Error('無効なエンジニアIDが含まれています');
    }
    
    // 権限更新
    return this.permissionRepo.update(partnerId, {
      visible_engineer_ids: engineerIds,
      auto_publish_waiting: autoPublish
    });
  }
  
  async createAccessUrl(partnerId: number, options: any, companyId: number) {
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
      is_active: true
    });
    
    // フルURLを構築
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    accessUrl.full_url = `${baseUrl}/partner/access/${token}`;
    
    return accessUrl;
  }
  
  async createPartnerUser(partnerId: number, userData: any, companyId: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    // メールの重複チェック
    const existing = await this.db('partner_users')
      .where({ email: userData.email })
      .first();
    
    if (existing) {
      throw new Error('このメールアドレスは既に使用されています');
    }
    
    // パスワードハッシュ化（実際の実装では bcrypt を使用）
    const hashedPassword = await this.hashPassword(userData.password);
    
    // ユーザー作成
    return this.db('partner_users').insert({
      partner_id: partnerId,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'viewer',
      is_active: true
    }).returning('*');
  }
  
  async getPartnerStatistics(partnerId: number, companyId: number) {
    // 取引先の存在確認
    const partner = await this.partnerRepo.findById(partnerId, companyId);
    if (!partner) {
      throw new Error('取引先企業が見つかりません');
    }
    
    // 統計データ取得
    const [offers, views, engineers] = await Promise.all([
      // オファー数
      this.db('offers')
        .where({ partner_id: partnerId })
        .count('* as count')
        .first(),
      
      // 閲覧数
      this.db('view_logs')
        .where({ partner_id: partnerId })
        .count('* as count')
        .first(),
      
      // 公開エンジニア数
      this.getVisibleEngineers(partnerId, companyId)
    ]);
    
    return {
      totalOffers: parseInt(offers?.count || 0),
      totalViews: parseInt(views?.count || 0),
      visibleEngineers: engineers.length,
      contractStatus: partner.contract_status,
      contractEndDate: partner.contract_end_date
    };
  }
  
  private async hashPassword(password: string): Promise<string> {
    // 実際の実装では bcrypt を使用
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 10);
  }
}
```

### 2.2 アプローチ管理API実装

#### 2.2.1 アプローチルート定義
```typescript
// backend/src/routes/v1/approach.routes.ts
import { Router } from 'express';
import { ApproachController } from '../../controllers/approach.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { approachValidation } from '../../validations/approach.validation';

const router = Router();
const controller = new ApproachController();

// 基本CRUD
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(approachValidation.create), controller.create);
router.delete('/:id', controller.delete);

// 送信管理
router.post('/send', validateRequest(approachValidation.send), controller.send);
router.post('/bulk', validateRequest(approachValidation.bulk), controller.bulkSend);
router.post('/:id/resend', controller.resend);

// テンプレート管理
router.get('/templates', controller.getTemplates);
router.get('/templates/:id', controller.getTemplateById);
router.post('/templates', validateRequest(approachValidation.template), controller.createTemplate);
router.put('/templates/:id', controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);

// 定期アプローチ
router.get('/periodic', controller.getPeriodicApproaches);
router.post('/periodic', validateRequest(approachValidation.periodic), controller.createPeriodicApproach);
router.put('/periodic/:id', controller.updatePeriodicApproach);
router.post('/periodic/:id/pause', controller.pausePeriodicApproach);
router.post('/periodic/:id/resume', controller.resumePeriodicApproach);
router.delete('/periodic/:id', controller.deletePeriodicApproach);

// フリーランスアプローチ
router.get('/freelance', controller.getFreelancers);
router.post('/freelance', validateRequest(approachValidation.freelance), controller.approachFreelance);
router.get('/freelance/history', controller.getFreelanceHistory);

// 統計
router.get('/statistics', controller.getStatistics);
router.get('/statistics/monthly', controller.getMonthlyStatistics);

export default router;
```

#### 2.2.2 アプローチコントローラー実装
```typescript
// backend/src/controllers/approach.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ApproachService } from '../services/approach.service';
import { ApiResponse } from '../utils/response.util';

export class ApproachController {
  private service: ApproachService;
  
  constructor() {
    this.service = new ApproachService();
  }
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, targetType, dateFrom, dateTo } = req.query;
      const { page, limit, offset } = req.pagination;
      
      const approaches = await this.service.findAll(
        req.companyId,
        { page, limit, offset },
        { status, targetType, dateFrom, dateTo }
      );
      
      const total = await this.service.count(req.companyId, { status, targetType });
      
      res.json(ApiResponse.paginated(approaches, {
        page,
        limit,
        total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approach = await this.service.create(req.body, req.companyId);
      res.status(201).json(ApiResponse.success(approach));
    } catch (error) {
      next(error);
    }
  };
  
  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.sendApproach(req.body, req.companyId);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
  
  bulkSend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetIds, engineerIds, templateId, customMessage } = req.body;
      
      const results = await this.service.bulkSendApproaches(
        {
          targetIds,
          engineerIds,
          templateId,
          customMessage
        },
        req.companyId
      );
      
      res.json(ApiResponse.success({
        sent: results.successful.length,
        failed: results.failed.length,
        details: results
      }));
    } catch (error) {
      next(error);
    }
  };
  
  getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await this.service.getTemplates(req.companyId);
      res.json(ApiResponse.success(templates));
    } catch (error) {
      next(error);
    }
  };
  
  createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await this.service.createTemplate(req.body, req.companyId);
      res.status(201).json(ApiResponse.success(template));
    } catch (error) {
      next(error);
    }
  };
  
  createPeriodicApproach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const periodicApproach = await this.service.createPeriodicApproach(
        req.body,
        req.companyId
      );
      res.status(201).json(ApiResponse.success(periodicApproach));
    } catch (error) {
      next(error);
    }
  };
  
  approachFreelance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { freelanceId, projectDetails, message } = req.body;
      
      const result = await this.service.approachFreelance(
        {
          freelanceId,
          projectDetails,
          message
        },
        req.companyId
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
  
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const stats = await this.service.getStatistics(
        req.companyId,
        dateFrom as string,
        dateTo as string
      );
      
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  };
  
  getMonthlyStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.query;
      
      const stats = await this.service.getMonthlyStatistics(
        req.companyId,
        parseInt(year as string),
        parseInt(month as string)
      );
      
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  };
}
```

#### 2.2.3 アプローチサービス実装
```typescript
// backend/src/services/approach.service.ts
import { ApproachRepository } from '../repositories/approach.repository';
import { EmailTemplateRepository } from '../repositories/emailTemplate.repository';
import { EmailService } from './email.service';
import { Database } from '../database';

export class ApproachService {
  private approachRepo: ApproachRepository;
  private templateRepo: EmailTemplateRepository;
  private emailService: EmailService;
  private db: Database;
  
  constructor() {
    this.db = Database.getInstance();
    this.approachRepo = new ApproachRepository(this.db);
    this.templateRepo = new EmailTemplateRepository(this.db);
    this.emailService = new EmailService();
  }
  
  async create(data: any, companyId: number) {
    return this.approachRepo.create({
      ...data,
      company_id: companyId,
      status: 'draft'
    });
  }
  
  async sendApproach(data: any, companyId: number) {
    return this.db.transaction(async (trx) => {
      // アプローチ作成
      const approach = await this.approachRepo.create({
        company_id: companyId,
        target_type: data.targetType,
        target_id: data.targetId,
        engineer_ids: data.engineerIds,
        template_id: data.templateId,
        subject: data.subject,
        body: data.body,
        status: 'sending'
      }, trx);
      
      // メールテンプレート取得
      let emailContent = data.body;
      if (data.templateId) {
        const template = await this.templateRepo.findById(data.templateId, companyId);
        if (template) {
          emailContent = this.applyTemplate(template, data);
        }
      }
      
      // メール送信
      try {
        await this.emailService.send({
          to: data.recipientEmail,
          subject: data.subject,
          body: emailContent,
          companyId,
          approachId: approach.id
        });
        
        // ステータス更新
        await this.approachRepo.update(approach.id, {
          status: 'sent',
          sent_at: new Date()
        }, companyId, trx);
        
        return { success: true, approachId: approach.id };
      } catch (error) {
        // エラー時のステータス更新
        await this.approachRepo.update(approach.id, {
          status: 'failed',
          error_message: error.message
        }, companyId, trx);
        
        throw error;
      }
    });
  }
  
  async bulkSendApproaches(data: any, companyId: number) {
    const results = {
      successful: [],
      failed: []
    };
    
    for (const targetId of data.targetIds) {
      try {
        const result = await this.sendApproach({
          targetType: 'company',
          targetId,
          engineerIds: data.engineerIds,
          templateId: data.templateId,
          subject: data.subject || 'エンジニアのご紹介',
          body: data.customMessage,
          recipientEmail: await this.getTargetEmail(targetId)
        }, companyId);
        
        results.successful.push({ targetId, ...result });
      } catch (error) {
        results.failed.push({ targetId, error: error.message });
      }
    }
    
    return results;
  }
  
  async createTemplate(data: any, companyId: number) {
    return this.templateRepo.create({
      ...data,
      company_id: companyId,
      is_active: true
    });
  }
  
  async getTemplates(companyId: number) {
    return this.templateRepo.findAll(companyId);
  }
  
  async createPeriodicApproach(data: any, companyId: number) {
    // 定期アプローチ設定を保存
    const periodicApproach = await this.db('periodic_approaches').insert({
      company_id: companyId,
      name: data.name,
      target_companies: data.targetCompanies,
      engineer_conditions: data.engineerConditions,
      template_id: data.templateId,
      schedule: data.schedule, // cron形式
      is_active: true,
      next_run_at: this.calculateNextRun(data.schedule)
    }).returning('*');
    
    return periodicApproach[0];
  }
  
  async approachFreelance(data: any, companyId: number) {
    // フリーランスへのアプローチ履歴確認（3ヶ月ルール）
    const lastApproach = await this.db('approaches')
      .where({
        company_id: companyId,
        target_type: 'freelance',
        target_id: data.freelanceId
      })
      .orderBy('created_at', 'desc')
      .first();
    
    if (lastApproach) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      if (new Date(lastApproach.created_at) > threeMonthsAgo) {
        throw new Error('このフリーランスには3ヶ月以内にアプローチ済みです');
      }
    }
    
    // アプローチ送信
    return this.sendApproach({
      targetType: 'freelance',
      targetId: data.freelanceId,
      projectDetails: data.projectDetails,
      subject: `プロジェクトのご相談: ${data.projectDetails.name}`,
      body: data.message,
      recipientEmail: await this.getFreelanceEmail(data.freelanceId)
    }, companyId);
  }
  
  async getStatistics(companyId: number, dateFrom: string, dateTo: string) {
    const stats = await this.db('approaches')
      .where({ company_id: companyId })
      .whereBetween('created_at', [dateFrom, dateTo])
      .select(
        this.db.raw('COUNT(*) as total'),
        this.db.raw("COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent"),
        this.db.raw("COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened"),
        this.db.raw("COUNT(CASE WHEN replied_at IS NOT NULL THEN 1 END) as replied")
      )
      .first();
    
    return {
      total: parseInt(stats.total),
      sent: parseInt(stats.sent),
      opened: parseInt(stats.opened),
      replied: parseInt(stats.replied),
      openRate: stats.sent > 0 ? (stats.opened / stats.sent * 100).toFixed(2) : 0,
      replyRate: stats.sent > 0 ? (stats.replied / stats.sent * 100).toFixed(2) : 0
    };
  }
  
  async getMonthlyStatistics(companyId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const dailyStats = await this.db('approaches')
      .where({ company_id: companyId })
      .whereBetween('created_at', [startDate, endDate])
      .select(
        this.db.raw('DATE(created_at) as date'),
        this.db.raw('COUNT(*) as count'),
        this.db.raw("COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent")
      )
      .groupBy('date')
      .orderBy('date');
    
    return {
      year,
      month,
      dailyStats,
      total: dailyStats.reduce((sum, day) => sum + parseInt(day.count), 0)
    };
  }
  
  private applyTemplate(template: any, data: any): string {
    let content = template.body;
    
    // 変数置換
    if (template.variables && data.variables) {
      Object.entries(data.variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      });
    }
    
    return content;
  }
  
  private calculateNextRun(schedule: string): Date {
    // cron形式からnext run timeを計算（実際の実装では node-cron などを使用）
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 1);
    return nextRun;
  }
  
  private async getTargetEmail(targetId: number): Promise<string> {
    const target = await this.db('business_partners')
      .where({ id: targetId })
      .first();
    return target?.email || 'default@example.com';
  }
  
  private async getFreelanceEmail(freelanceId: number): Promise<string> {
    const freelance = await this.db('freelancers')
      .where({ id: freelanceId })
      .first();
    return freelance?.email || 'freelance@example.com';
  }
}
```

### 2.3 メール配信サービス実装

```typescript
// backend/src/services/email.service.ts
import nodemailer from 'nodemailer';
import { EmailLogRepository } from '../repositories/emailLog.repository';
import { Database } from '../database';

export class EmailService {
  private transporter: any;
  private emailLogRepo: EmailLogRepository;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    const db = Database.getInstance();
    this.emailLogRepo = new EmailLogRepository(db);
  }
  
  async send(options: {
    to: string;
    subject: string;
    body: string;
    companyId: number;
    approachId?: number;
  }) {
    try {
      // メール送信
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.body
      });
      
      // ログ記録
      await this.emailLogRepo.create({
        company_id: options.companyId,
        approach_id: options.approachId,
        recipient_email: options.to,
        subject: options.subject,
        body: options.body,
        status: 'sent',
        sent_at: new Date(),
        message_id: info.messageId
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      // エラーログ記録
      await this.emailLogRepo.create({
        company_id: options.companyId,
        approach_id: options.approachId,
        recipient_email: options.to,
        subject: options.subject,
        body: options.body,
        status: 'failed',
        error_message: error.message
      });
      
      throw error;
    }
  }
  
  async trackOpen(messageId: string) {
    // メール開封トラッキング
    await this.emailLogRepo.updateByMessageId(messageId, {
      opened_at: new Date()
    });
  }
  
  async trackClick(messageId: string) {
    // リンククリックトラッキング
    await this.emailLogRepo.updateByMessageId(messageId, {
      clicked_at: new Date()
    });
  }
}
```

### 2.4 リポジトリ実装

```typescript
// backend/src/repositories/partner.repository.ts
import { BaseRepository } from './base.repository';

export class PartnerRepository extends BaseRepository<Partner> {
  constructor(db: Database) {
    super('business_partners', db);
  }
  
  async findActive(companyId: number) {
    return this.db(this.tableName)
      .where({ 
        company_id: companyId,
        contract_status: 'active'
      })
      .orderBy('name', 'asc');
  }
  
  async findExpiring(companyId: number, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.db(this.tableName)
      .where({ company_id: companyId })
      .where('contract_end_date', '<=', futureDate)
      .where('contract_status', 'active')
      .orderBy('contract_end_date', 'asc');
  }
}

// backend/src/repositories/approach.repository.ts
import { BaseRepository } from './base.repository';

export class ApproachRepository extends BaseRepository<Approach> {
  constructor(db: Database) {
    super('approaches', db);
  }
  
  async findByTargetType(companyId: number, targetType: string) {
    return this.db(this.tableName)
      .where({ 
        company_id: companyId,
        target_type: targetType
      })
      .orderBy('created_at', 'desc');
  }
  
  async updateTracking(approachId: number, field: string) {
    return this.db(this.tableName)
      .where({ id: approachId })
      .update({ [field]: new Date() });
  }
}

// backend/src/repositories/emailTemplate.repository.ts
import { BaseRepository } from './base.repository';

export class EmailTemplateRepository extends BaseRepository<EmailTemplate> {
  constructor(db: Database) {
    super('email_templates', db);
  }
  
  async findByCategory(companyId: number, category: string) {
    return this.db(this.tableName)
      .where({ 
        company_id: companyId,
        category,
        is_active: true
      })
      .orderBy('name', 'asc');
  }
}
```

---

## 3. テスト実装

```typescript
// backend/src/test/partner.test.ts
import request from 'supertest';
import app from '../app';

describe('Partner API', () => {
  describe('POST /api/v1/business-partners', () => {
    it('取引先企業を作成できる', async () => {
      const partnerData = {
        name: 'テスト企業',
        email: 'test@partner.com',
        contract_start_date: '2024-01-01',
        contract_end_date: '2024-12-31',
        max_viewable_engineers: 50
      };
      
      const response = await request(app)
        .post('/api/v1/business-partners')
        .set('X-Company-ID', '1')
        .send(partnerData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(partnerData.name);
    });
  });
  
  describe('POST /api/v1/business-partners/:id/access-urls', () => {
    it('アクセスURLを生成できる', async () => {
      const response = await request(app)
        .post('/api/v1/business-partners/1/access-urls')
        .set('X-Company-ID', '1')
        .send({ expiresIn: 30, maxUses: 10 })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.full_url).toMatch(/\/partner\/access\//);
    });
  });
});
```

---

## 4. 実装優先順位

### Day 1（エンジニア1のDay1完了後）
1. 取引先APIルート実装
2. 取引先コントローラー実装
3. 取引先サービス実装
4. 権限管理機能実装

### Day 2
1. アプローチAPIルート実装
2. アプローチコントローラー実装
3. アプローチサービス実装
4. メールテンプレート管理実装

### Day 3
1. メール配信サービス実装
2. 定期アプローチ機能実装
3. フリーランスアプローチ実装
4. テスト作成

---

## 5. 完了条件

### 必須要件
- [ ] 取引先CRUD APIが動作する
- [ ] エンジニア公開設定が機能する
- [ ] アクセスURL生成が動作する
- [ ] アプローチ送信が機能する
- [ ] メールテンプレート管理が動作する
- [ ] 定期アプローチ設定が機能する
- [ ] 統計データが取得できる

### テスト要件
- [ ] 各エンドポイントの単体テスト作成
- [ ] メール送信のモックテスト
- [ ] 権限管理のテスト

---

## 6. 注意事項

- エンジニア1が作成した基盤を必ず使用すること
- 取引先企業間のデータ分離を厳守
- メール送信のレート制限に注意
- 個人情報の取り扱いに十分配慮
- フリーランスへの3ヶ月ルールを厳守

---

## 7. 連携事項

### エンジニア1との連携
- API基盤構造を使用
- ベースリポジトリを継承
- 共通ミドルウェアを活用

### エンジニア2との連携
- エンジニアデータへのアクセス
- プロジェクトデータとの連携

---

## 8. 環境変数設定

```env
# メール送信設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="SES企業管理システム <noreply@example.com>"

# フロントエンドURL（アクセスURL生成用）
FRONTEND_URL=http://localhost:5173
```

---

## 9. 質問・相談先

- 技術的な相談: Slackの#backend-apiチャンネル
- 仕様確認: プロダクトオーナー
- エンジニア1・2との連携: Slack DM