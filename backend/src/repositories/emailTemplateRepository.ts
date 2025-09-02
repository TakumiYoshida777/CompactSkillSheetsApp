import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailTemplate {
  id: string;
  clientCompanyId: string;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
}

class EmailTemplateRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * オファーメールのテンプレートを取得
   */
  async findOfferTemplate(clientCompanyId: string): Promise<EmailTemplate | null> {
    // TODO:モックの実装はせずテーブルがないならテーブルを作る
    // TODO: email_templatesテーブル作成後に実装を更新
    return null;
  }

  /**
   * テンプレートを作成
   */
  async create(data: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    // TODO: 実装
    return {
      id: '1',
      ...data,
    };
  }

  /**
   * テンプレートを更新
   */
  async update(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    // TODO: 実装
    return {
      id,
      ...data,
    } as EmailTemplate;
  }

  /**
   * テンプレートを削除
   */
  async delete(id: string): Promise<void> {
    // TODO: 実装
  }
}

export const emailTemplateRepository = new EmailTemplateRepository();