import { offerService } from '../offerService';
import { offerRepository } from '../../repositories/offerRepository';
import { offerEngineerRepository } from '../../repositories/offerEngineerRepository';
import { engineerRepository } from '../../repositories/engineerRepository';

jest.mock('../../repositories/offerRepository');
jest.mock('../../repositories/offerEngineerRepository');
jest.mock('../../repositories/engineerRepository');

describe('OfferService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOffer', () => {
    it('オファーとオファー対象エンジニアを作成する', async () => {
      const offerData = {
        client_company_id: '100',
        engineer_ids: ['1', '2', '3'],
        project_details: {
          name: 'ECサイトリニューアル',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React', 'TypeScript'],
          description: 'フロントエンド開発',
          location: '東京都',
          rate_min: 600000,
          rate_max: 800000,
          remarks: '長期案件'
        },
        created_by: '1'
      };

      const mockOffer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        clientCompanyId: '100',
        status: 'SENT',
        projectName: 'ECサイトリニューアル',
        projectPeriodStart: new Date('2024-03-01'),
        projectPeriodEnd: new Date('2024-12-31'),
        requiredSkills: ['React', 'TypeScript'],
        projectDescription: 'フロントエンド開発',
        location: '東京都',
        rateMin: 600000,
        rateMax: 800000,
        remarks: '長期案件',
        sentAt: new Date(),
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (offerRepository.create as jest.Mock).mockResolvedValue(mockOffer);
      (offerEngineerRepository.createMany as jest.Mock).mockResolvedValue([
        { id: '1', offerId: '1', engineerId: '1' },
        { id: '2', offerId: '1', engineerId: '2' },
        { id: '3', offerId: '1', engineerId: '3' }
      ]);

      const result = await offerService.createOffer(offerData);

      expect(offerRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        clientCompanyId: '100',
        projectName: 'ECサイトリニューアル',
        createdBy: '1'
      }));
      
      expect(offerEngineerRepository.createMany).toHaveBeenCalledWith([
        { offerId: '1', engineerId: '1', individualStatus: 'SENT' },
        { offerId: '1', engineerId: '2', individualStatus: 'SENT' },
        { offerId: '1', engineerId: '3', individualStatus: 'SENT' }
      ]);

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        offerNumber: 'OFF-2024-001'
      }));
    });

    it('オファー番号を自動生成する', async () => {
      const offerData = {
        client_company_id: '100',
        engineer_ids: ['1'],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-04-01',
          period_end: '2024-06-30',
          required_skills: ['Java'],
          description: 'バックエンド開発',
          location: '大阪',
          rate_min: 500000,
          rate_max: 700000,
          remarks: ''
        },
        created_by: '1'
      };

      (offerRepository.getNextOfferNumber as jest.Mock).mockResolvedValue('OFF-2024-002');
      (offerRepository.create as jest.Mock).mockResolvedValue({
        id: '2',
        offerNumber: 'OFF-2024-002'
      });

      await offerService.createOffer(offerData);

      expect(offerRepository.getNextOfferNumber).toHaveBeenCalled();
    });
  });

  describe('getOffers', () => {
    it('ページネーション付きでオファー一覧を取得する', async () => {
      const params = {
        companyId: '100',
        page: 1,
        limit: 10,
        status: 'PENDING'
      };

      const mockOffers = {
        data: [
          { id: '1', offerNumber: 'OFF-2024-001', status: 'PENDING' },
          { id: '2', offerNumber: 'OFF-2024-002', status: 'PENDING' }
        ],
        total: 2,
        page: 1,
        limit: 10
      };

      (offerRepository.findMany as jest.Mock).mockResolvedValue(mockOffers);

      const result = await offerService.getOffers(params);

      expect(offerRepository.findMany).toHaveBeenCalledWith({
        where: {
          clientCompanyId: '100',
          status: 'PENDING'
        },
        skip: 0,
        take: 10,
        orderBy: { sentAt: 'desc' }
      });

      expect(result).toEqual(mockOffers);
    });
  });

  describe('getOfferById', () => {
    it('オファー詳細とエンジニア情報を取得する', async () => {
      const mockOffer = {
        id: '1',
        offerNumber: 'OFF-2024-001',
        clientCompanyId: '100',
        status: 'PENDING',
        offerEngineers: [
          {
            id: '1',
            engineerId: '1',
            individualStatus: 'PENDING',
            engineer: {
              id: '1',
              name: '田中太郎',
              skills: ['React', 'TypeScript']
            }
          }
        ]
      };

      (offerRepository.findById as jest.Mock).mockResolvedValue(mockOffer);

      const result = await offerService.getOfferById('1', '100');

      expect(offerRepository.findById).toHaveBeenCalledWith('1', {
        include: {
          offerEngineers: {
            include: {
              engineer: true
            }
          }
        }
      });

      expect(result).toEqual(mockOffer);
    });

    it('他社のオファーにはアクセスできない', async () => {
      const mockOffer = {
        id: '1',
        clientCompanyId: '200' // 異なる企業ID
      };

      (offerRepository.findById as jest.Mock).mockResolvedValue(mockOffer);

      const result = await offerService.getOfferById('1', '100');

      expect(result).toBeNull();
    });
  });

  describe('updateOfferStatus', () => {
    it('オファーステータスを撤回に更新する', async () => {
      const mockOffer = {
        id: '1',
        clientCompanyId: '100',
        status: 'PENDING'
      };

      (offerRepository.findById as jest.Mock).mockResolvedValue(mockOffer);
      (offerRepository.update as jest.Mock).mockResolvedValue({
        ...mockOffer,
        status: 'WITHDRAWN'
      });

      const result = await offerService.updateOfferStatus('1', 'withdrawn', '100');

      expect(offerRepository.update).toHaveBeenCalledWith('1', {
        status: 'WITHDRAWN'
      });

      expect(result.status).toBe('WITHDRAWN');
    });
  });

  describe('bulkRemind', () => {
    it('複数のオファーにリマインドを送信する', async () => {
      const offerIds = ['1', '2', '3'];
      const companyId = '100';

      const mockOffers = [
        { id: '1', clientCompanyId: '100', status: 'PENDING' },
        { id: '2', clientCompanyId: '100', status: 'PENDING' },
        { id: '3', clientCompanyId: '100', status: 'ACCEPTED' } // 既に承諾済み
      ];

      (offerRepository.findByIds as jest.Mock).mockResolvedValue(mockOffers);
      (offerRepository.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await offerService.bulkRemind(offerIds, companyId);

      expect(result).toEqual({
        success: 2,
        failed: 1
      });
    });
  });

  describe('getOfferBoardData', () => {
    it('オファーボード用のサマリーデータを取得する', async () => {
      const companyId = '100';

      (engineerRepository.countAvailableEngineers as jest.Mock).mockResolvedValue(25);
      (offerRepository.countMonthlyOffers as jest.Mock).mockResolvedValue(12);
      (offerRepository.countTodayOffers as jest.Mock).mockResolvedValue(2);
      (offerRepository.countByStatus as jest.Mock)
        .mockResolvedValueOnce(5) // accepted
        .mockResolvedValueOnce(4) // pending
        .mockResolvedValueOnce(3); // declined
      
      (engineerRepository.findAvailableWithOfferStatus as jest.Mock).mockResolvedValue([
        {
          id: '1',
          name: '田中太郎',
          skills: ['React'],
          lastOfferStatus: null
        }
      ]);

      const result = await offerService.getOfferBoardData(companyId);

      expect(result).toEqual({
        available_engineers: 25,
        monthly_offers: 12,
        today_offers: 2,
        accepted: 5,
        pending: 4,
        declined: 3,
        engineers: expect.any(Array)
      });
    });
  });

  describe('getStatistics', () => {
    it('オファー統計情報を計算する', async () => {
      const companyId = '100';

      (offerRepository.countTotal as jest.Mock).mockResolvedValue(45);
      (offerRepository.countMonthlyOffers as jest.Mock).mockResolvedValue(12);
      (offerRepository.countWeeklyOffers as jest.Mock).mockResolvedValue(5);
      (offerRepository.countTodayOffers as jest.Mock).mockResolvedValue(2);
      (offerRepository.calculateAcceptanceRate as jest.Mock).mockResolvedValue(0.35);
      (offerRepository.calculateAverageResponseTime as jest.Mock).mockResolvedValue(3.5);
      (offerRepository.calculateDeclineRate as jest.Mock).mockResolvedValue(0.15);

      const result = await offerService.getStatistics(companyId);

      expect(result).toEqual({
        totalOffers: 45,
        monthlyOffers: 12,
        weeklyOffers: 5,
        todayOffers: 2,
        acceptanceRate: 0.35,
        averageResponseTime: 3.5,
        declineRate: 0.15
      });
    });
  });
});