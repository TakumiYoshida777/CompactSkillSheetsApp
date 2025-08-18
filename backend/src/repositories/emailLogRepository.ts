import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailLog {
  id: string;
  offerId: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  errorMessage?: string;
  sentAt?: Date;
  createdAt: Date;
}

interface CreateEmailLogData {
  offerId: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
}

class EmailLogRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * メールログを作成
   */
  async create(data: CreateEmailLogData): Promise<EmailLog> {
    // 実際のテーブルがまだない場合のモック実装
    // TODO: email_logsテーブル作成後に実装を更新
    return {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
    };
  }

  /**
   * ステータスを更新
   */
  async updateStatus(
    id: string,
    status: 'SENT' | 'FAILED',
    errorMessage?: string
  ): Promise<void> {
    // TODO: 実装
    const updateData: any = {
      status,
    };

    if (status === 'SENT') {
      updateData.sentAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    // await this.prisma.emailLog.update({
    //   where: { id },
    //   data: updateData,
    // });
  }

  /**
   * オファーIDでメールログを取得
   */
  async findByOfferId(offerId: string): Promise<EmailLog[]> {
    // TODO: 実装
    return [];
  }

  /**
   * 期間指定でメールログを取得
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    clientCompanyId?: string
  ): Promise<EmailLog[]> {
    // TODO: 実装
    return [];
  }

  /**
   * ステータス別の統計を取得
   */
  async getStatistics(clientCompanyId?: string) {
    // TODO: 実装
    return {
      queued: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };
  }

  /**
   * 失敗したメールを再送信用に取得
   */
  async getFailedEmails(limit: number = 100): Promise<EmailLog[]> {
    // TODO: 実装
    return [];
  }
}

export const emailLogRepository = new EmailLogRepository();