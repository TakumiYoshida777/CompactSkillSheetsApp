import { PrismaClient } from '@prisma/client';
import { OfferRepository } from '../offerRepository';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('OfferRepository', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: OfferRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new OfferRepository(prisma);
  });

  describe('createOffer', () => {
    it('新規オファーを作成できること', async () => {
      const mockOffer = {
        id: BigInt(1),
        offerNumber: 'OFF-2025-001',
        clientCompanyId: BigInt(1),
        status: 'SENT' as const,
        projectName: 'ECサイト開発',
        projectPeriodStart: new Date('2025-02-01'),
        projectPeriodEnd: new Date('2025-07-31'),
        requiredSkills: ['React', 'TypeScript', 'Node.js'],
        projectDescription: 'ECサイトのフルリニューアル',
        location: '東京都',
        rateMin: 500000,
        rateMax: 700000,
        remarks: null,
        sentAt: new Date(),
        openedAt: null,
        respondedAt: null,
        reminderSentAt: null,
        reminderCount: 0,
        createdBy: BigInt(1),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.offer.create.mockResolvedValue(mockOffer);

      const result = await repository.createOffer({
        clientCompanyId: BigInt(1),
        projectName: 'ECサイト開発',
        projectPeriodStart: new Date('2025-02-01'),
        projectPeriodEnd: new Date('2025-07-31'),
        requiredSkills: ['React', 'TypeScript', 'Node.js'],
        projectDescription: 'ECサイトのフルリニューアル',
        location: '東京都',
        rateMin: 500000,
        rateMax: 700000,
        createdBy: BigInt(1),
      });

      expect(result).toEqual(mockOffer);
      expect(prisma.offer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientCompanyId: BigInt(1),
          projectName: 'ECサイト開発',
        }),
      });
    });

    it('オファー番号を自動生成すること', async () => {
      const mockLatestOffer = {
        id: BigInt(99),
        offerNumber: 'OFF-2025-099',
      };

      prisma.offer.findFirst.mockResolvedValue(mockLatestOffer as any);
      prisma.offer.create.mockResolvedValue({
        ...mockLatestOffer,
        offerNumber: 'OFF-2025-100',
      } as any);

      await repository.createOffer({
        clientCompanyId: BigInt(1),
        projectName: 'テストプロジェクト',
        projectPeriodStart: new Date(),
        projectPeriodEnd: new Date(),
        requiredSkills: [],
        projectDescription: 'テスト',
        createdBy: BigInt(1),
      });

      expect(prisma.offer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          offerNumber: 'OFF-2025-100',
        }),
      });
    });
  });

  describe('findOfferById', () => {
    it('IDでオファーを取得できること', async () => {
      const mockOffer = {
        id: BigInt(1),
        offerNumber: 'OFF-2025-001',
        clientCompanyId: BigInt(1),
        projectName: 'テストプロジェクト',
      };

      prisma.offer.findUnique.mockResolvedValue(mockOffer as any);

      const result = await repository.findOfferById(BigInt(1));

      expect(result).toEqual(mockOffer);
      expect(prisma.offer.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          clientCompany: true,
          creator: true,
          offerEngineers: {
            include: {
              engineer: true,
            },
          },
        },
      });
    });

    it('存在しないIDの場合nullを返すこと', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      const result = await repository.findOfferById(BigInt(999));

      expect(result).toBeNull();
    });
  });

  describe('findOffersByCompany', () => {
    it('企業IDでオファー一覧を取得できること', async () => {
      const mockOffers = [
        { id: BigInt(1), clientCompanyId: BigInt(1), projectName: 'プロジェクト1' },
        { id: BigInt(2), clientCompanyId: BigInt(1), projectName: 'プロジェクト2' },
      ];

      prisma.offer.findMany.mockResolvedValue(mockOffers as any);

      const result = await repository.findOffersByCompany(BigInt(1));

      expect(result).toEqual(mockOffers);
      expect(prisma.offer.findMany).toHaveBeenCalledWith({
        where: { clientCompanyId: BigInt(1) },
        include: expect.any(Object),
        orderBy: { sentAt: 'desc' },
      });
    });

    it('ステータスでフィルタリングできること', async () => {
      prisma.offer.findMany.mockResolvedValue([]);

      await repository.findOffersByCompany(BigInt(1), { status: ['SENT', 'PENDING'] });

      expect(prisma.offer.findMany).toHaveBeenCalledWith({
        where: {
          clientCompanyId: BigInt(1),
          status: { in: ['SENT', 'PENDING'] },
        },
        include: expect.any(Object),
        orderBy: { sentAt: 'desc' },
      });
    });

    it('日付範囲でフィルタリングできること', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      prisma.offer.findMany.mockResolvedValue([]);

      await repository.findOffersByCompany(BigInt(1), { startDate, endDate });

      expect(prisma.offer.findMany).toHaveBeenCalledWith({
        where: {
          clientCompanyId: BigInt(1),
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: expect.any(Object),
        orderBy: { sentAt: 'desc' },
      });
    });
  });

  describe('updateOfferStatus', () => {
    it('オファーステータスを更新できること', async () => {
      const mockUpdatedOffer = {
        id: BigInt(1),
        status: 'ACCEPTED',
        respondedAt: new Date(),
      };

      prisma.offer.update.mockResolvedValue(mockUpdatedOffer as any);

      const result = await repository.updateOfferStatus(BigInt(1), 'ACCEPTED');

      expect(result).toEqual(mockUpdatedOffer);
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          status: 'ACCEPTED',
          respondedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('開封ステータスの場合openedAtを更新すること', async () => {
      prisma.offer.findUnique.mockResolvedValue({ openedAt: null } as any);
      prisma.offer.update.mockResolvedValue({} as any);

      await repository.updateOfferStatus(BigInt(1), 'OPENED');

      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          status: 'OPENED',
          openedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('sendReminder', () => {
    it('リマインドを送信し、カウントを増やすこと', async () => {
      const mockOffer = {
        id: BigInt(1),
        reminderCount: 0,
      };

      prisma.offer.findUnique.mockResolvedValue(mockOffer as any);
      prisma.offer.update.mockResolvedValue({
        ...mockOffer,
        reminderCount: 1,
        reminderSentAt: new Date(),
      } as any);

      const result = await repository.sendReminder(BigInt(1));

      expect(result).toBeTruthy();
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          reminderCount: 1,
          reminderSentAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getOfferStatistics', () => {
    it('オファー統計情報を取得できること', async () => {
      prisma.offer.count.mockResolvedValueOnce(50); // 総数
      prisma.offer.count.mockResolvedValueOnce(10); // SENT
      prisma.offer.count.mockResolvedValueOnce(5);  // OPENED
      prisma.offer.count.mockResolvedValueOnce(15); // PENDING
      prisma.offer.count.mockResolvedValueOnce(12); // ACCEPTED
      prisma.offer.count.mockResolvedValueOnce(3);  // DECLINED
      prisma.offer.count.mockResolvedValueOnce(5);  // WITHDRAWN

      const result = await repository.getOfferStatistics(BigInt(1));

      expect(result).toEqual({
        total: 50,
        sent: 10,
        opened: 5,
        pending: 15,
        accepted: 12,
        declined: 3,
        withdrawn: 5,
      });

      expect(prisma.offer.count).toHaveBeenCalledTimes(7);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('複数のオファーステータスを一括更新できること', async () => {
      prisma.offer.updateMany.mockResolvedValue({ count: 3 });

      const result = await repository.bulkUpdateStatus(
        [BigInt(1), BigInt(2), BigInt(3)],
        'WITHDRAWN'
      );

      expect(result).toBe(3);
      expect(prisma.offer.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: [BigInt(1), BigInt(2), BigInt(3)] },
        },
        data: {
          status: 'WITHDRAWN',
          updatedAt: expect.any(Date),
        },
      });
    });
  });
});