import { Request, Response } from 'express';
import { OfferController } from '../offer';
import { offerService } from '../../../services/offerService';
import { emailService } from '../../../services/emailService';
import { offerValidator } from '../../../validators/offerValidator';

jest.mock('../../../services/offerService');
jest.mock('../../../services/emailService');
jest.mock('../../../validators/offerValidator');

describe('OfferController', () => {
  let controller: OfferController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    controller = new OfferController();
    
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    
    mockRequest = {
      user: {
        userId: '1',
        companyId: '100',
        email: 'test@example.com',
        roles: ['client'],
        permissions: []
      },
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: responseStatus,
      json: responseJson
    };

    jest.clearAllMocks();
  });

  describe('createOffer', () => {
    const validOfferData = {
      engineer_ids: ['1', '2', '3'],
      project_details: {
        name: 'ECサイトリニューアル開発',
        period_start: '2024-03-01',
        period_end: '2024-12-31',
        required_skills: ['React', 'TypeScript', 'Node.js'],
        description: 'React/TypeScriptでのフロントエンド開発',
        location: '東京都港区（リモート週2-3日可）',
        rate_min: 600000,
        rate_max: 800000,
        remarks: '長期案件'
      },
      send_email: true
    };

    it('正常にオファーを作成し、メールを送信する', async () => {
      mockRequest.body = validOfferData;
      
      (offerValidator.validate as jest.Mock).mockResolvedValue({ valid: true });
      (offerService.createOffer as jest.Mock).mockResolvedValue({
        id: '1',
        offerNumber: 'OFF-2024-001',
        ...validOfferData
      });
      (emailService.sendOfferEmails as jest.Mock).mockResolvedValue(true);

      await controller.createOffer(mockRequest as Request, mockResponse as Response);

      expect(offerValidator.validate).toHaveBeenCalledWith(validOfferData);
      expect(offerService.createOffer).toHaveBeenCalledWith({
        client_company_id: '100',
        engineer_ids: validOfferData.engineer_ids,
        project_details: validOfferData.project_details,
        created_by: '1'
      });
      expect(emailService.sendOfferEmails).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        offerNumber: 'OFF-2024-001'
      }));
    });

    it('バリデーションエラーの場合400を返す', async () => {
      mockRequest.body = { engineer_ids: [] }; // 不正なデータ
      
      (offerValidator.validate as jest.Mock).mockResolvedValue({
        valid: false,
        errors: ['engineer_ids は必須です']
      });

      await controller.createOffer(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        errors: ['engineer_ids は必須です']
      });
      expect(offerService.createOffer).not.toHaveBeenCalled();
    });

    it('メール送信をスキップできる', async () => {
      mockRequest.body = { ...validOfferData, send_email: false };
      
      (offerValidator.validate as jest.Mock).mockResolvedValue({ valid: true });
      (offerService.createOffer as jest.Mock).mockResolvedValue({
        id: '1',
        offerNumber: 'OFF-2024-001'
      });

      await controller.createOffer(mockRequest as Request, mockResponse as Response);

      expect(emailService.sendOfferEmails).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('getOffers', () => {
    it('オファー一覧を取得する', async () => {
      mockRequest.query = { page: '1', limit: '10', status: 'PENDING' };
      
      const mockOffers = {
        data: [
          { id: '1', offerNumber: 'OFF-2024-001', status: 'PENDING' },
          { id: '2', offerNumber: 'OFF-2024-002', status: 'PENDING' }
        ],
        total: 2,
        page: 1,
        limit: 10
      };
      
      (offerService.getOffers as jest.Mock).mockResolvedValue(mockOffers);

      await controller.getOffers(mockRequest as Request, mockResponse as Response);

      expect(offerService.getOffers).toHaveBeenCalledWith({
        companyId: '100',
        page: 1,
        limit: 10,
        status: 'PENDING'
      });
      expect(responseJson).toHaveBeenCalledWith(mockOffers);
    });
  });

  describe('getOfferById', () => {
    it('指定されたオファーの詳細を取得する', async () => {
      mockRequest.params = { id: '1' };
      
      const mockOffer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        status: 'PENDING',
        engineers: [
          { id: '1', name: '田中太郎', individual_status: 'PENDING' }
        ]
      };
      
      (offerService.getOfferById as jest.Mock).mockResolvedValue(mockOffer);

      await controller.getOfferById(mockRequest as Request, mockResponse as Response);

      expect(offerService.getOfferById).toHaveBeenCalledWith('1', '100');
      expect(responseJson).toHaveBeenCalledWith(mockOffer);
    });

    it('オファーが見つからない場合404を返す', async () => {
      mockRequest.params = { id: '999' };
      
      (offerService.getOfferById as jest.Mock).mockResolvedValue(null);

      await controller.getOfferById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'オファーが見つかりません'
      });
    });
  });

  describe('updateOfferStatus', () => {
    it('オファーステータスを更新する', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'withdrawn' };
      
      (offerService.updateOfferStatus as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'WITHDRAWN'
      });

      await controller.updateOfferStatus(mockRequest as Request, mockResponse as Response);

      expect(offerService.updateOfferStatus).toHaveBeenCalledWith('1', 'withdrawn', '100');
      expect(responseJson).toHaveBeenCalledWith({
        id: '1',
        status: 'WITHDRAWN'
      });
    });

    it('無効なステータスの場合400を返す', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'invalid_status' };

      await controller.updateOfferStatus(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: '無効なステータスです'
      });
    });
  });

  describe('sendReminder', () => {
    it('リマインドメールを送信する', async () => {
      mockRequest.params = { id: '1' };
      
      const mockOffer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        reminderCount: 1
      };
      
      (offerService.getOfferById as jest.Mock).mockResolvedValue(mockOffer);
      (emailService.sendReminderEmail as jest.Mock).mockResolvedValue(true);
      (offerService.updateReminderInfo as jest.Mock).mockResolvedValue({
        ...mockOffer,
        reminderCount: 2
      });

      await controller.sendReminder(mockRequest as Request, mockResponse as Response);

      expect(emailService.sendReminderEmail).toHaveBeenCalledWith(mockOffer);
      expect(offerService.updateReminderInfo).toHaveBeenCalledWith('1');
      expect(responseJson).toHaveBeenCalledWith({
        message: 'リマインドメールを送信しました',
        reminderCount: 2
      });
    });
  });

  describe('bulkAction', () => {
    it('複数オファーに一括でリマインドを送信する', async () => {
      mockRequest.body = {
        offer_ids: ['1', '2', '3'],
        action: 'remind'
      };
      
      (offerService.bulkRemind as jest.Mock).mockResolvedValue({
        success: 3,
        failed: 0
      });

      await controller.bulkAction(mockRequest as Request, mockResponse as Response);

      expect(offerService.bulkRemind).toHaveBeenCalledWith(['1', '2', '3'], '100');
      expect(responseJson).toHaveBeenCalledWith({
        message: '一括操作が完了しました',
        result: { success: 3, failed: 0 }
      });
    });

    it('複数オファーを一括で撤回する', async () => {
      mockRequest.body = {
        offer_ids: ['1', '2'],
        action: 'withdraw'
      };
      
      (offerService.bulkWithdraw as jest.Mock).mockResolvedValue({
        success: 2,
        failed: 0
      });

      await controller.bulkAction(mockRequest as Request, mockResponse as Response);

      expect(offerService.bulkWithdraw).toHaveBeenCalledWith(['1', '2'], '100');
      expect(responseJson).toHaveBeenCalledWith({
        message: '一括操作が完了しました',
        result: { success: 2, failed: 0 }
      });
    });
  });

  describe('getOfferBoard', () => {
    it('オファーボード情報を取得する', async () => {
      const mockBoardData = {
        available_engineers: 25,
        monthly_offers: 12,
        today_offers: 2,
        accepted: 5,
        pending: 4,
        declined: 3,
        engineers: []
      };
      
      (offerService.getOfferBoardData as jest.Mock).mockResolvedValue(mockBoardData);

      await controller.getOfferBoard(mockRequest as Request, mockResponse as Response);

      expect(offerService.getOfferBoardData).toHaveBeenCalledWith('100');
      expect(responseJson).toHaveBeenCalledWith(mockBoardData);
    });
  });

  describe('getOfferHistory', () => {
    it('オファー履歴を取得する', async () => {
      mockRequest.query = {
        page: '1',
        limit: '20',
        search: 'React',
        status: 'ACCEPTED',
        period: 'last_6_months'
      };
      
      const mockHistory = {
        data: [],
        total: 0,
        page: 1,
        limit: 20
      };
      
      (offerService.getOfferHistory as jest.Mock).mockResolvedValue(mockHistory);

      await controller.getOfferHistory(mockRequest as Request, mockResponse as Response);

      expect(offerService.getOfferHistory).toHaveBeenCalledWith({
        companyId: '100',
        page: 1,
        limit: 20,
        search: 'React',
        status: 'ACCEPTED',
        period: 'last_6_months'
      });
      expect(responseJson).toHaveBeenCalledWith(mockHistory);
    });
  });

  describe('getStatistics', () => {
    it('オファー統計情報を取得する', async () => {
      const mockStats = {
        totalOffers: 45,
        monthlyOffers: 12,
        weeklyOffers: 5,
        todayOffers: 2,
        acceptanceRate: 0.35,
        averageResponseTime: 3.5,
        declineRate: 0.15
      };
      
      (offerService.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      await controller.getStatistics(mockRequest as Request, mockResponse as Response);

      expect(offerService.getStatistics).toHaveBeenCalledWith('100');
      expect(responseJson).toHaveBeenCalledWith(mockStats);
    });
  });
});