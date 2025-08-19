const nodemailer = require('nodemailer');
import { PrismaClient } from '@prisma/client';
import { config } from '../config/environment';
import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  companyId: number;
  approachId?: number;
}

export class EmailService {
  private transporter: any;
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
    
    // Nodemailer設定
    if (config.smtp.host && config.smtp.user) {
      this.transporter = nodemailer.createTransporter({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.password
        }
      });
    } else {
      // 開発環境用のダミートランスポート
      logger.warn('SMTP設定が不完全です。メール送信は無効化されています。');
      this.transporter = {
        sendMail: async (options: any) => {
          logger.info('メール送信（ダミー）:', options);
          return { messageId: `dummy-${Date.now()}` };
        }
      };
    }
  }
  
  async send(options: EmailOptions) {
    try {
      // メール送信
      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.body
      });
      
      // ログ記録
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO email_logs 
        (company_id, approach_id, recipient_email, subject, body, status, sent_at, message_id)
        VALUES ($1, $2, $3, $4, $5, 'sent', NOW(), $6)
      `,
        options.companyId,
        options.approachId || null,
        options.to,
        options.subject,
        options.body,
        info.messageId
      );
      
      logger.info(`メール送信成功: ${options.to}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      // エラーログ記録
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO email_logs 
        (company_id, approach_id, recipient_email, subject, body, status, error_message, created_at)
        VALUES ($1, $2, $3, $4, $5, 'failed', $6, NOW())
      `,
        options.companyId,
        options.approachId || null,
        options.to,
        options.subject,
        options.body,
        error.message
      );
      
      logger.error(`メール送信失敗: ${options.to}`, error);
      throw error;
    }
  }
  
  async trackOpen(messageId: string) {
    // メール開封トラッキング
    await this.prisma.$executeRawUnsafe(`
      UPDATE email_logs
      SET opened_at = NOW()
      WHERE message_id = $1 AND opened_at IS NULL
    `, messageId);
  }
  
  async trackClick(messageId: string) {
    // リンククリックトラッキング
    await this.prisma.$executeRawUnsafe(`
      UPDATE email_logs
      SET clicked_at = NOW()
      WHERE message_id = $1 AND clicked_at IS NULL
    `, messageId);
  }

  async sendBulk(emails: EmailOptions[]) {
    const results = {
      successful: [] as any[],
      failed: [] as any[]
    };

    for (const email of emails) {
      try {
        const result = await this.send(email);
        results.successful.push({ ...email, ...result });
      } catch (error: any) {
        results.failed.push({ ...email, error: error.message });
      }
    }

    return results;
  }

  async getEmailLogs(companyId: number, filters?: any) {
    let query = `
      SELECT * FROM email_logs
      WHERE company_id = $1
    `;
    
    const params: any[] = [companyId];
    let paramIndex = 2;
    
    if (filters) {
      if (filters.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }
      
      if (filters.dateFrom) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }
      
      if (filters.dateTo) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }
    }
    
    query += ' ORDER BY created_at DESC';
    
    return this.prisma.$queryRawUnsafe(query, ...params);
  }
}