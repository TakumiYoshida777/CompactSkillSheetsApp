import { PrismaClient } from '@prisma/client';
import { ApproachRepository } from '../repositories/approach.repository';
import { EmailTemplateRepository } from '../repositories/emailTemplate.repository';
import { EmailService } from './email.service';
import { SkillSheetUrlUtil } from '../utils/skillsheet-url.util';
import logger from '../config/logger';

export class ApproachService {
  private approachRepo: ApproachRepository;
  private templateRepo: EmailTemplateRepository;
  private emailService: EmailService;
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.approachRepo = new ApproachRepository(this.prisma);
    this.templateRepo = new EmailTemplateRepository(this.prisma);
    this.emailService = new EmailService();
  }

  async findAll(companyId: number, pagination: any, filters: any) {
    return this.approachRepo.findAll(companyId, { pagination, filters });
  }

  async findById(id: number, companyId: number) {
    return this.approachRepo.findById(id, companyId);
  }
  
  async create(data: any, companyId: number, createdBy?: number) {
    return this.approachRepo.create({
      ...data,
      status: 'draft',
      createdBy
    }, companyId);
  }

  async update(id: number, data: any, companyId: number) {
    return this.approachRepo.update(id, data, companyId);
  }

  async delete(id: number, companyId: number) {
    return this.approachRepo.delete(id, companyId);
  }
  
  async sendApproach(data: any, companyId: number) {
    return this.prisma.$transaction(async (tx) => {
      // アプローチ作成
      const approach = await this.prisma.$queryRawUnsafe(`
        INSERT INTO approaches 
        (company_id, target_type, target_id, target_name, engineer_ids, 
         template_id, subject, body, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sending', NOW())
        RETURNING *
      `,
        companyId,
        data.targetType,
        data.targetId || null,
        data.targetName || null,
        JSON.stringify(data.engineerIds || []),
        data.templateId || null,
        data.subject,
        data.body
      ).then((result: any) => result[0]);
      
      // メールテンプレート取得と適用
      let emailContent = data.body;
      if (data.templateId) {
        const template = await this.templateRepo.findById(data.templateId, companyId);
        if (template) {
          emailContent = this.applyTemplate(template, data);
        }
      }
      
      // エンジニアIDリストからスキルシート閲覧URLを生成
      let skillSheetUrls: string[] = [];
      if (data.engineerIds && data.engineerIds.length > 0) {
        // 各エンジニアの個別URLを生成
        skillSheetUrls = data.engineerIds.map((engineerId: number) => {
          const url = SkillSheetUrlUtil.generateIndividualSkillSheetUrl(
            engineerId,
            data.targetId || companyId,
            30 * 24 * 60 * 60 // 30日間有効
          );
          return url;
        });
        
        // メール本文にURLを埋め込み
        const urlSection = this.createSkillSheetUrlSection(data.engineerIds, skillSheetUrls);
        emailContent = this.embedUrlsInEmailContent(emailContent, urlSection);
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
        await this.prisma.$executeRawUnsafe(`
          UPDATE approaches 
          SET status = 'sent', sent_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, approach.id);
        
        return { success: true, approachId: approach.id, skillSheetUrls };
      } catch (error: any) {
        // エラー時のステータス更新
        await this.prisma.$executeRawUnsafe(`
          UPDATE approaches 
          SET status = 'failed', error_message = $2, updated_at = NOW()
          WHERE id = $1
        `, approach.id, error.message);
        
        throw error;
      }
    });
  }

  async resendApproach(id: number, companyId: number) {
    const approach = await this.findById(id, companyId);
    if (!approach) {
      throw new Error('アプローチが見つかりません');
    }

    return this.sendApproach({
      targetType: approach.targetType,
      targetId: approach.targetId,
      targetName: approach.targetName,
      engineerIds: approach.engineerIds,
      templateId: approach.templateId,
      subject: approach.subject,
      body: approach.body,
      recipientEmail: await this.getTargetEmail(approach.targetId)
    }, companyId);
  }
  
  async bulkSendApproaches(data: any, companyId: number) {
    const results = {
      successful: [] as any[],
      failed: [] as any[]
    };
    
    for (const targetId of data.targetIds) {
      try {
        const result = await this.sendApproach({
          targetType: 'company',
          targetId,
          engineerIds: data.engineerIds,
          templateId: data.templateId,
          subject: data.subject || 'エンジニアのご紹介',
          body: data.customMessage || data.body,
          recipientEmail: await this.getTargetEmail(targetId)
        }, companyId);
        
        results.successful.push({ targetId, ...result });
      } catch (error: any) {
        results.failed.push({ targetId, error: error.message });
      }
    }
    
    return results;
  }

  async getTemplates(companyId: number) {
    return this.templateRepo.findAll(companyId);
  }

  async getTemplateById(id: number, companyId: number) {
    return this.templateRepo.findById(id, companyId);
  }
  
  async createTemplate(data: any, companyId: number, createdBy?: number) {
    return this.templateRepo.create({
      ...data,
      isActive: true,
      useCount: 0,
      createdBy
    }, companyId);
  }

  async updateTemplate(id: number, data: any, companyId: number) {
    return this.templateRepo.update(id, data, companyId);
  }

  async deleteTemplate(id: number, companyId: number) {
    return this.templateRepo.delete(id, companyId);
  }

  async getPeriodicApproaches(companyId: number) {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM periodic_approaches
      WHERE company_id = $1
      ORDER BY created_at DESC
    `, companyId);
  }
  
  async createPeriodicApproach(data: any, companyId: number, createdBy?: number) {
    // 定期アプローチ設定を保存
    const result = await this.prisma.$queryRawUnsafe(`
      INSERT INTO periodic_approaches 
      (company_id, name, target_companies, engineer_conditions, 
       template_id, schedule, is_active, next_run_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      companyId,
      data.name,
      JSON.stringify(data.targetCompanies || []),
      JSON.stringify(data.engineerConditions || {}),
      data.templateId || null,
      data.schedule,
      true,
      this.calculateNextRun(data.schedule),
      createdBy || null
    );
    
    return result[0];
  }

  async updatePeriodicApproach(id: number, data: any, companyId: number) {
    const exists = await this.prisma.$queryRawUnsafe(`
      SELECT id FROM periodic_approaches
      WHERE id = $1 AND company_id = $2
    `, id, companyId).then((result: any) => result[0]);

    if (!exists) {
      return null;
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'targetCompanies' || key === 'engineerConditions') {
          fields.push(`${this.toSnakeCase(key)} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${this.toSnakeCase(key)} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return exists;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, companyId);

    const query = `
      UPDATE periodic_approaches
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.prisma.$queryRawUnsafe(query, ...values);
    return result[0];
  }

  async pausePeriodicApproach(id: number, companyId: number) {
    return this.updatePeriodicApproach(id, { isPaused: true }, companyId);
  }

  async resumePeriodicApproach(id: number, companyId: number) {
    return this.updatePeriodicApproach(id, { 
      isPaused: false,
      nextRunAt: this.calculateNextRun('0 9 * * 1') // デフォルト: 毎週月曜9時
    }, companyId);
  }

  async deletePeriodicApproach(id: number, companyId: number) {
    const result = await this.prisma.$executeRawUnsafe(`
      DELETE FROM periodic_approaches
      WHERE id = $1 AND company_id = $2
    `, id, companyId);
    
    return result > 0;
  }

  async getFreelancers() {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM freelancers
      ORDER BY created_at DESC
    `);
  }
  
  async approachFreelance(data: any, companyId: number) {
    // フリーランスへのアプローチ履歴確認（3ヶ月ルール）
    const lastApproach = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM approaches
      WHERE company_id = $1
      AND target_type = 'freelance'
      AND target_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, companyId, data.freelanceId).then((result: any) => result[0]);
    
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

  async getFreelanceHistory(companyId: number) {
    return this.prisma.$queryRawUnsafe(`
      SELECT a.*, f.name as freelance_name, f.email as freelance_email
      FROM approaches a
      LEFT JOIN freelancers f ON a.target_id = f.id
      WHERE a.company_id = $1 AND a.target_type = 'freelance'
      ORDER BY a.created_at DESC
    `, companyId);
  }
  
  async getStatistics(companyId: number, dateFrom?: string, dateTo?: string) {
    const from = dateFrom || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
    const to = dateTo || new Date().toISOString();

    const stats = await this.prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
        COUNT(CASE WHEN replied_at IS NOT NULL THEN 1 END) as replied
      FROM approaches
      WHERE company_id = $1
      AND created_at BETWEEN $2 AND $3
    `, companyId, from, to).then((result: any) => result[0]);
    
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
    
    const dailyStats = await this.prisma.$queryRawUnsafe(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent
      FROM approaches
      WHERE company_id = $1
      AND created_at BETWEEN $2 AND $3
      GROUP BY DATE(created_at)
      ORDER BY date
    `, companyId, startDate, endDate);
    
    return {
      year,
      month,
      dailyStats,
      total: (dailyStats as any[]).reduce((sum, day) => sum + parseInt(day.count), 0)
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
  
  private createSkillSheetUrlSection(engineerIds: number[], urls: string[]): string {
    // エンジニア情報取得（実際の実装では名前を取得）
    let urlSection = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    urlSection += '■ エンジニアスキルシート閲覧URL\n';
    urlSection += '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    urls.forEach((url, index) => {
      urlSection += `エンジニア${index + 1}: ${url}\n\n`;
    });
    
    urlSection += '※ URLの有効期限は30日間です。\n';
    urlSection += '※ URLをクリックすると、スキルシートを閲覧できます。\n';
    urlSection += '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    
    return urlSection;
  }
  
  private embedUrlsInEmailContent(content: string, urlSection: string): string {
    // メール本文にURL情報を埋め込み
    // {{SKILL_SHEET_URLS}}プレースホルダーがあればそこに挿入
    if (content.includes('{{SKILL_SHEET_URLS}}')) {
      return content.replace('{{SKILL_SHEET_URLS}}', urlSection);
    }
    
    // プレースホルダーがなければ本文の末尾に追加
    return content + urlSection;
  }
  
  private calculateNextRun(schedule: string): Date {
    // 簡易実装：次の実行日時を計算
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(9, 0, 0, 0);
    return nextRun;
  }
  
  private async getTargetEmail(targetId: number): Promise<string> {
    const target = await this.prisma.$queryRawUnsafe(`
      SELECT email FROM business_partners
      WHERE id = $1
    `, targetId).then((result: any) => result[0]);
    
    return target?.email || 'default@example.com';
  }
  
  private async getFreelanceEmail(freelanceId: number): Promise<string> {
    const freelance = await this.prisma.$queryRawUnsafe(`
      SELECT email FROM freelancers
      WHERE id = $1
    `, freelanceId).then((result: any) => result[0]);
    
    return freelance?.email || 'freelance@example.com';
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}