import { errorLog } from '../utils/logger';
import nodemailer from 'nodemailer';
import { emailTemplateRepository } from '../repositories/emailTemplateRepository';
import { emailLogRepository } from '../repositories/emailLogRepository';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    // テスト環境では実際のトランスポーターを作成しない
    if (process.env.NODE_ENV !== 'test') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  // テスト用にトランスポーターを設定するメソッド
  setTransporter(transporter: nodemailer.Transporter) {
    this.transporter = transporter;
  }

  /**
   * オファーメール送信
   */
  async sendOfferEmails(offer: any): Promise<void> {
    const template = await emailTemplateRepository.findOfferTemplate(offer.clientCompanyId);
    
    for (const offerEngineer of offer.offerEngineers) {
      const engineer = offerEngineer.engineer;
      
      const variables = {
        engineerName: engineer.name,
        companyName: offer.clientCompany?.name || '',
        projectName: offer.projectName,
        projectDescription: offer.projectDescription,
        periodStart: this.formatDate(offer.projectPeriodStart),
        periodEnd: this.formatDate(offer.projectPeriodEnd),
        requiredSkills: offer.requiredSkills || [],
        location: offer.location || '',
        rateMin: Math.floor((offer.rateMin || 0) / 10000),
        rateMax: Math.floor((offer.rateMax || 0) / 10000),
        offerNumber: offer.offerNumber
      };

      let subject: string;
      let body: string;
      let from: string;

      if (template) {
        subject = this.generateEmailContent(template.subject, variables);
        body = this.generateEmailContent(template.body, variables);
        from = `"${template.senderName}" <${template.senderEmail}>`;
      } else {
        subject = `【オファー】${offer.projectName} - ${offer.clientCompany?.name || ''}`;
        body = this.getDefaultOfferTemplate(variables);
        from = process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com';
      }

      const emailLog = await emailLogRepository.create({
        offerId: offer.id,
        fromEmail: from,
        toEmail: engineer.email,
        subject,
        body,
        status: 'QUEUED'
      });

      try {
        await this.sendEmail({
          to: engineer.email,
          subject,
          html: this.convertToHtml(body),
          from
        });

        await emailLogRepository.updateStatus(emailLog.id, 'SENT');
      } catch (error) {
        errorLog(`Failed to send email to ${engineer.email}:`, error);
        await emailLogRepository.updateStatus(
          emailLog.id,
          'FAILED',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  /**
   * リマインドメール送信
   */
  async sendReminderEmail(offer: any): Promise<void> {
    const pendingEngineers = offer.offerEngineers.filter(
      (oe: any) => ['SENT', 'OPENED', 'PENDING'].includes(oe.individualStatus)
    );

    for (const offerEngineer of pendingEngineers) {
      const engineer = offerEngineer.engineer;
      const isLastReminder = offer.reminderCount >= 2; // 3回目が最終

      const variables = {
        engineerName: engineer.name,
        projectName: offer.projectName,
        offerNumber: offer.offerNumber,
        daysSinceSent: this.calculateDaysSince(offer.sentAt),
        reminderCount: offer.reminderCount + 1,
        companyName: offer.clientCompany?.name || ''
      };

      const subject = `【リマインド${variables.reminderCount}回目】${offer.projectName}のオファーについて`;
      const body = isLastReminder
        ? this.getFinalReminderTemplate(variables)
        : this.getReminderTemplate(variables);

      await this.sendEmail({
        to: engineer.email,
        subject,
        html: this.convertToHtml(body)
      });
    }
  }

  /**
   * 一括リマインドメール送信
   */
  async sendBulkReminderEmails(offers: any[]): Promise<void> {
    for (const offer of offers) {
      await this.sendReminderEmail(offer);
    }
  }

  /**
   * メール送信
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: options.from || process.env.DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * テンプレート変数置換
   */
  generateEmailContent(template: string, variables: Record<string, any>): string {
    let content = template;
    
    // すべての{{variable}}パターンを置換
    content = content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) {
        const value = variables[key];
        if (Array.isArray(value)) {
          return value.join(', ');
        } else if (value !== null && value !== undefined) {
          return String(value);
        }
      }
      return ''; // 変数が存在しない場合は空文字列に置換
    });
    
    return content;
  }

  /**
   * テキストをHTMLに変換
   */
  private convertToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  }

  /**
   * 日付フォーマット
   */
  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ja-JP');
  }

  /**
   * 経過日数計算
   */
  private calculateDaysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * デフォルトオファーテンプレート
   */
  private getDefaultOfferTemplate(variables: any): string {
    return `
${variables.engineerName} 様

${variables.companyName}より、以下の案件についてオファーがございます。

【案件詳細】
案件名: ${variables.projectName}
期間: ${variables.periodStart} 〜 ${variables.periodEnd}
必要スキル: ${Array.isArray(variables.requiredSkills) ? variables.requiredSkills.join(', ') : ''}
勤務地: ${variables.location}
単価: ${variables.rateMin}万円 〜 ${variables.rateMax}万円/月

【案件内容】
${variables.projectDescription}

ご興味がございましたら、ご連絡をお待ちしております。

よろしくお願いいたします。
    `;
  }

  /**
   * リマインドテンプレート
   */
  private getReminderTemplate(variables: any): string {
    return `
${variables.engineerName} 様

先日ご連絡させていただきました「${variables.projectName}」の件について、
改めてご連絡させていただきます。

オファー番号: ${variables.offerNumber}
初回送信から${variables.daysSinceSent}日が経過しております。

ご多忙のところ恐れ入りますが、ご検討状況をお聞かせいただけますでしょうか。

${variables.companyName}
    `;
  }

  /**
   * 最終リマインドテンプレート
   */
  private getFinalReminderTemplate(variables: any): string {
    return `
${variables.engineerName} 様

「${variables.projectName}」の件について、最終のご連絡となります。

オファー番号: ${variables.offerNumber}

もしご興味がない場合は、お手数ですが一言ご返信いただけますと幸いです。
今後のご提案の参考にさせていただきます。

${variables.companyName}
    `;
  }
}

export const emailService = new EmailService();