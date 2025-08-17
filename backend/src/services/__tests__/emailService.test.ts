import { emailService } from '../emailService';
import nodemailer from 'nodemailer';
import { emailTemplateRepository } from '../../repositories/emailTemplateRepository';
import { emailLogRepository } from '../../repositories/emailLogRepository';

jest.mock('nodemailer');
jest.mock('../../repositories/emailTemplateRepository');
jest.mock('../../repositories/emailLogRepository');

describe('EmailService', () => {
  let mockTransporter: any;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    mockTransporter = {
      sendMail: mockSendMail
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    
    jest.clearAllMocks();
  });

  describe('sendOfferEmails', () => {
    it('複数のエンジニアにオファーメールを送信する', async () => {
      const offer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        projectName: 'ECサイトリニューアル',
        projectDescription: 'React/TypeScriptでの開発',
        projectPeriodStart: new Date('2024-03-01'),
        projectPeriodEnd: new Date('2024-12-31'),
        requiredSkills: ['React', 'TypeScript'],
        location: '東京都港区',
        rateMin: 600000,
        rateMax: 800000,
        offerEngineers: [
          {
            id: '1',
            engineer: {
              id: '1',
              name: '田中太郎',
              email: 'tanaka@example.com'
            }
          },
          {
            id: '2',
            engineer: {
              id: '2',
              name: '佐藤花子',
              email: 'sato@example.com'
            }
          }
        ],
        clientCompany: {
          name: 'ABC商事',
          contactEmail: 'contact@abc.com'
        }
      };

      const mockTemplate = {
        subject: '【案件オファー】{{projectName}}',
        body: `
{{engineerName}} 様

{{companyName}}よりオファーがございます。

案件名: {{projectName}}
期間: {{periodStart}} 〜 {{periodEnd}}
必要スキル: {{requiredSkills}}
場所: {{location}}
単価: {{rateMin}}万円 〜 {{rateMax}}万円

案件詳細:
{{projectDescription}}

ご検討よろしくお願いいたします。
        `,
        senderName: 'ABC商事 採用担当',
        senderEmail: 'noreply@abc.com'
      };

      (emailTemplateRepository.findOfferTemplate as jest.Mock).mockResolvedValue(mockTemplate);
      (emailLogRepository.create as jest.Mock).mockResolvedValue({ id: '1' });

      await emailService.sendOfferEmails(offer);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
      
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: '"ABC商事 採用担当" <noreply@abc.com>',
        to: 'tanaka@example.com',
        subject: '【案件オファー】ECサイトリニューアル',
        html: expect.stringContaining('田中太郎 様')
      }));

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'sato@example.com',
        html: expect.stringContaining('佐藤花子 様')
      }));

      expect(emailLogRepository.create).toHaveBeenCalledTimes(2);
    });

    it('テンプレートが見つからない場合はデフォルトテンプレートを使用する', async () => {
      const offer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        projectName: 'テストプロジェクト',
        offerEngineers: [
          {
            engineer: {
              name: '山田太郎',
              email: 'yamada@example.com'
            }
          }
        ],
        clientCompany: {
          name: 'XYZ会社'
        }
      };

      (emailTemplateRepository.findOfferTemplate as jest.Mock).mockResolvedValue(null);

      await emailService.sendOfferEmails(offer);

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        subject: '【オファー】テストプロジェクト - XYZ会社',
        html: expect.stringContaining('山田太郎 様')
      }));
    });

    it('メール送信失敗時はエラーログを記録する', async () => {
      const offer = {
        id: '1',
        offerEngineers: [
          {
            engineer: {
              name: '田中太郎',
              email: 'invalid-email'
            }
          }
        ]
      };

      mockSendMail.mockRejectedValue(new Error('Invalid email address'));
      (emailLogRepository.create as jest.Mock).mockResolvedValue({ id: '1' });
      (emailLogRepository.updateStatus as jest.Mock).mockResolvedValue({});

      await emailService.sendOfferEmails(offer);

      expect(emailLogRepository.updateStatus).toHaveBeenCalledWith(
        '1',
        'FAILED',
        expect.stringContaining('Invalid email address')
      );
    });
  });

  describe('sendReminderEmail', () => {
    it('リマインドメールを送信する', async () => {
      const offer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        projectName: 'ECサイトリニューアル',
        reminderCount: 1,
        sentAt: new Date('2024-01-10'),
        offerEngineers: [
          {
            individualStatus: 'PENDING',
            engineer: {
              name: '田中太郎',
              email: 'tanaka@example.com'
            }
          },
          {
            individualStatus: 'ACCEPTED',
            engineer: {
              name: '佐藤花子',
              email: 'sato@example.com'
            }
          }
        ],
        clientCompany: {
          name: 'ABC商事'
        }
      };

      await emailService.sendReminderEmail(offer);

      // PENDING状態のエンジニアのみに送信
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'tanaka@example.com',
        subject: expect.stringContaining('【リマインド】')
      }));
    });

    it('3回目のリマインドの場合は特別なメッセージを含める', async () => {
      const offer = {
        id: '1',
        reminderCount: 2, // 次が3回目
        projectName: 'テストプロジェクト',
        offerEngineers: [
          {
            individualStatus: 'PENDING',
            engineer: {
              name: '山田太郎',
              email: 'yamada@example.com'
            }
          }
        ]
      };

      await emailService.sendReminderEmail(offer);

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        html: expect.stringContaining('最終のご連絡')
      }));
    });
  });

  describe('sendBulkReminderEmails', () => {
    it('複数のオファーに対してリマインドメールを送信する', async () => {
      const offers = [
        {
          id: '1',
          projectName: 'プロジェクトA',
          offerEngineers: [
            {
              individualStatus: 'PENDING',
              engineer: { email: 'a@example.com', name: 'A' }
            }
          ]
        },
        {
          id: '2',
          projectName: 'プロジェクトB',
          offerEngineers: [
            {
              individualStatus: 'PENDING',
              engineer: { email: 'b@example.com', name: 'B' }
            }
          ]
        }
      ];

      await emailService.sendBulkReminderEmails(offers);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateEmailContent', () => {
    it('テンプレート変数を正しく置換する', () => {
      const template = '{{engineerName}}様、{{projectName}}のオファーです。期間: {{periodStart}}〜{{periodEnd}}';
      const variables = {
        engineerName: '田中太郎',
        projectName: 'ECサイト開発',
        periodStart: '2024-03-01',
        periodEnd: '2024-12-31'
      };

      const result = emailService.generateEmailContent(template, variables);

      expect(result).toBe('田中太郎様、ECサイト開発のオファーです。期間: 2024-03-01〜2024-12-31');
    });

    it('配列の変数を正しく処理する', () => {
      const template = '必要スキル: {{requiredSkills}}';
      const variables = {
        requiredSkills: ['React', 'TypeScript', 'Node.js']
      };

      const result = emailService.generateEmailContent(template, variables);

      expect(result).toBe('必要スキル: React, TypeScript, Node.js');
    });

    it('存在しない変数は空文字列に置換する', () => {
      const template = '{{name}}様、{{unknown}}';
      const variables = {
        name: '田中'
      };

      const result = emailService.generateEmailContent(template, variables);

      expect(result).toBe('田中様、');
    });
  });
});