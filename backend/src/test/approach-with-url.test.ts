import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ApproachService } from '../services/approach.service';
import { SkillSheetUrlUtil } from '../utils/skillsheet-url.util';

// Mockの設定
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $transaction: jest.fn((callback) => callback()),
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn()
  }))
}));

jest.mock('../repositories/approach.repository');
jest.mock('../repositories/emailTemplate.repository');
jest.mock('../services/email.service');

describe('ApproachService - URL送信機能', () => {
  let approachService: ApproachService;

  beforeEach(() => {
    approachService = new ApproachService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendApproach', () => {
    it('エンジニアIDリストからスキルシートURLを生成して送信する', async () => {
      const mockApproachData = {
        targetType: 'company',
        targetId: 200,
        targetName: 'テスト企業',
        engineerIds: [1, 2, 3],
        templateId: null,
        subject: 'エンジニアのご紹介',
        body: 'エンジニアをご紹介させていただきます。',
        recipientEmail: 'test@example.com'
      };
      const companyId = 100;

      // Mockの設定
      const mockPrisma = (approachService as any).prisma;
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
        id: 1,
        ...mockApproachData,
        status: 'sending',
        created_at: new Date()
      }]);
      mockPrisma.$executeRawUnsafe.mockResolvedValue(1);

      const mockEmailService = (approachService as any).emailService;
      mockEmailService.send = jest.fn().mockResolvedValue({
        messageId: 'test-message-id'
      });

      const result = await approachService.sendApproach(mockApproachData, companyId);

      expect(result.success).toBe(true);
      expect(result.approachId).toBe(1);
      expect(result.skillSheetUrls).toBeDefined();
      expect(result.skillSheetUrls).toHaveLength(3);
      
      // 各URLが正しく生成されているか確認
      result.skillSheetUrls.forEach((url: string) => {
        expect(url).toContain('/skill-sheets/view?token=');
      });

      // メール送信が呼ばれたか確認
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'エンジニアのご紹介',
          body: expect.stringContaining('エンジニアスキルシート閲覧URL'),
          companyId: 100,
          approachId: 1
        })
      );
    });

    it('メール本文にURLセクションが埋め込まれる', async () => {
      const mockApproachData = {
        targetType: 'company',
        targetId: 200,
        engineerIds: [1],
        subject: 'テスト',
        body: 'お世話になっております。\n{{SKILL_SHEET_URLS}}\nよろしくお願いいたします。',
        recipientEmail: 'test@example.com'
      };
      const companyId = 100;

      // Mockの設定
      const mockPrisma = (approachService as any).prisma;
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{
        id: 1,
        ...mockApproachData
      }]);

      const mockEmailService = (approachService as any).emailService;
      mockEmailService.send = jest.fn().mockResolvedValue({
        messageId: 'test-message-id'
      });

      await approachService.sendApproach(mockApproachData, companyId);

      // メール本文にURLが埋め込まれているか確認
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('エンジニアスキルシート閲覧URL')
        })
      );
      
      const callArgs = mockEmailService.send.mock.calls[0][0];
      expect(callArgs.body).toContain('URLの有効期限は30日間です');
      expect(callArgs.body).not.toContain('{{SKILL_SHEET_URLS}}');
    });
  });

  describe('bulkSendApproaches', () => {
    it('複数の企業に対してURL付きアプローチを送信する', async () => {
      const mockBulkData = {
        targetIds: [201, 202],
        engineerIds: [1, 2],
        templateId: null,
        subject: '複数エンジニアのご紹介',
        body: 'エンジニアをご紹介いたします。'
      };
      const companyId = 100;

      // Mockの設定
      const mockPrisma = (approachService as any).prisma;
      
      // getTargetEmailのMock
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ email: 'company1@example.com' }])
        .mockResolvedValueOnce([{ id: 1 }]) // approach作成
        .mockResolvedValueOnce([{ email: 'company2@example.com' }])
        .mockResolvedValueOnce([{ id: 2 }]); // approach作成

      mockPrisma.$executeRawUnsafe.mockResolvedValue(1);

      const mockEmailService = (approachService as any).emailService;
      mockEmailService.send = jest.fn().mockResolvedValue({
        messageId: 'test-message-id'
      });

      const results = await approachService.bulkSendApproaches(mockBulkData, companyId);

      expect(results.successful).toHaveLength(2);
      expect(results.failed).toHaveLength(0);
      
      // 各送信結果にURLが含まれているか確認
      results.successful.forEach((result: any) => {
        expect(result.skillSheetUrls).toBeDefined();
        expect(result.skillSheetUrls).toHaveLength(2);
      });
    });
  });
});