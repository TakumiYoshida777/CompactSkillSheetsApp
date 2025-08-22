import { Request, Response } from 'express';
import { BusinessPartnerController } from '../businessPartnerController';
import { BusinessPartnerService } from '../../services/businessPartnerService';
import { ValidationError } from '../../utils/errors';

// モック化
jest.mock('../../services/businessPartnerService');
jest.mock('../../utils/logger');

describe('BusinessPartnerController', () => {
  let controller: BusinessPartnerController;
  let mockService: jest.Mocked<BusinessPartnerService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    controller = new BusinessPartnerController();
    mockService = new BusinessPartnerService() as jest.Mocked<BusinessPartnerService>;
    
    mockRequest = {
      user: {
        id: '1',
        companyId: '1',
        email: 'test@example.com'
      },
      params: {},
      query: {},
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('getBusinessPartners', () => {
    it('取引先企業一覧を正常に取得できること', async () => {
      const mockPartners = {
        partners: [
          {
            id: BigInt(1),
            clientCompany: { name: 'テスト企業A' },
            isActive: true
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      };

      mockService.getBusinessPartners = jest.fn().mockResolvedValue(mockPartners);

      await controller.getBusinessPartners(mockRequest as any, mockResponse as Response);

      expect(mockService.getBusinessPartners).toHaveBeenCalledWith({
        sesCompanyId: BigInt(1),
        page: 1,
        limit: 20,
        search: undefined,
        status: undefined,
        sortBy: 'createdAt',
        order: 'desc'
      });

      expect(mockResponse.json).toHaveBeenCalledWith(mockPartners);
    });

    it('認証エラーを返すこと', async () => {
      mockRequest.user = undefined;

      await controller.getBusinessPartners(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: '認証が必要です' });
    });

    it('サーバーエラーを適切に処理すること', async () => {
      mockService.getBusinessPartners = jest.fn().mockRejectedValue(new Error('DB Error'));

      await controller.getBusinessPartners(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' });
    });
  });

  describe('getBusinessPartnerById', () => {
    it('取引先企業詳細を正常に取得できること', async () => {
      mockRequest.params = { id: '1' };
      
      const mockPartner = {
        id: BigInt(1),
        clientCompany: { name: 'テスト企業A' },
        isActive: true
      };

      mockService.getBusinessPartnerById = jest.fn().mockResolvedValue(mockPartner);

      await controller.getBusinessPartnerById(mockRequest as any, mockResponse as Response);

      expect(mockService.getBusinessPartnerById).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1)
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockPartner);
    });

    it('取引先企業が見つからない場合404を返すこと', async () => {
      mockRequest.params = { id: '999' };
      mockService.getBusinessPartnerById = jest.fn().mockResolvedValue(null);

      await controller.getBusinessPartnerById(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: '取引先企業が見つかりません' });
    });
  });

  describe('createBusinessPartner', () => {
    it('取引先企業を正常に作成できること', async () => {
      mockRequest.body = {
        companyName: '新規取引先',
        email: 'new@example.com',
        phone: '03-1234-5678'
      };

      const mockCreatedPartner = {
        id: BigInt(2),
        clientCompany: { name: '新規取引先' },
        isActive: true
      };

      mockService.checkCreatePermission = jest.fn().mockResolvedValue(true);
      mockService.createBusinessPartner = jest.fn().mockResolvedValue(mockCreatedPartner);

      await controller.createBusinessPartner(mockRequest as any, mockResponse as Response);

      expect(mockService.checkCreatePermission).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1)
      );

      expect(mockService.createBusinessPartner).toHaveBeenCalledWith({
        companyName: '新規取引先',
        email: 'new@example.com',
        phone: '03-1234-5678',
        sesCompanyId: BigInt(1),
        createdBy: BigInt(1)
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '取引先企業を登録しました',
        partner: mockCreatedPartner
      });
    });

    it('権限がない場合403を返すこと', async () => {
      mockService.checkCreatePermission = jest.fn().mockResolvedValue(false);

      await controller.createBusinessPartner(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: '権限がありません' });
    });

    it('バリデーションエラーを適切に処理すること', async () => {
      mockService.checkCreatePermission = jest.fn().mockResolvedValue(true);
      mockService.createBusinessPartner = jest.fn()
        .mockRejectedValue(new ValidationError('会社名は必須です'));

      await controller.createBusinessPartner(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: '会社名は必須です' });
    });
  });

  describe('updateBusinessPartner', () => {
    it('取引先企業を正常に更新できること', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        companyName: '更新後の会社名',
        phone: '03-9876-5432'
      };

      const mockUpdatedPartner = {
        id: BigInt(1),
        clientCompany: { name: '更新後の会社名' },
        isActive: true
      };

      mockService.checkUpdatePermission = jest.fn().mockResolvedValue(true);
      mockService.updateBusinessPartner = jest.fn().mockResolvedValue(mockUpdatedPartner);

      await controller.updateBusinessPartner(mockRequest as any, mockResponse as Response);

      expect(mockService.checkUpdatePermission).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
        BigInt(1)
      );

      expect(mockService.updateBusinessPartner).toHaveBeenCalledWith(
        BigInt(1),
        {
          companyName: '更新後の会社名',
          phone: '03-9876-5432',
          updatedBy: BigInt(1)
        }
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '取引先企業を更新しました',
        partner: mockUpdatedPartner
      });
    });
  });

  describe('deleteBusinessPartner', () => {
    it('取引先企業を正常に削除できること', async () => {
      mockRequest.params = { id: '1' };

      mockService.checkDeletePermission = jest.fn().mockResolvedValue(true);
      mockService.deleteBusinessPartner = jest.fn().mockResolvedValue(undefined);

      await controller.deleteBusinessPartner(mockRequest as any, mockResponse as Response);

      expect(mockService.checkDeletePermission).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1)
      );

      expect(mockService.deleteBusinessPartner).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1)
      );

      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: '取引先企業を削除しました' 
      });
    });

    it('削除権限がない場合403を返すこと', async () => {
      mockRequest.params = { id: '1' };
      mockService.checkDeletePermission = jest.fn().mockResolvedValue(false);

      await controller.deleteBusinessPartner(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: '削除権限がありません' 
      });
    });
  });

  describe('updateBusinessPartnerStatus', () => {
    it('ステータスを正常に変更できること', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { isActive: false };

      const mockUpdatedPartner = {
        id: BigInt(1),
        clientCompany: { name: 'テスト企業A' },
        isActive: false
      };

      mockService.checkUpdatePermission = jest.fn().mockResolvedValue(true);
      mockService.updateBusinessPartnerStatus = jest.fn().mockResolvedValue(mockUpdatedPartner);

      await controller.updateBusinessPartnerStatus(mockRequest as any, mockResponse as Response);

      expect(mockService.updateBusinessPartnerStatus).toHaveBeenCalledWith(
        BigInt(1),
        false
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '取引先企業を無効化しました',
        partner: mockUpdatedPartner
      });
    });
  });

  describe('getBusinessPartnerStats', () => {
    it('統計情報を正常に取得できること', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        inactive: 2,
        thisMonth: 3
      };

      mockService.getBusinessPartnerStats = jest.fn().mockResolvedValue(mockStats);

      await controller.getBusinessPartnerStats(mockRequest as any, mockResponse as Response);

      expect(mockService.getBusinessPartnerStats).toHaveBeenCalledWith(BigInt(1));
      expect(mockResponse.json).toHaveBeenCalledWith(mockStats);
    });
  });
});