import { PrismaClient } from '@prisma/client';
import { OfferEngineerRepository } from '../offerEngineerRepository';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('OfferEngineerRepository', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: OfferEngineerRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new OfferEngineerRepository(prisma);
  });

  describe('addEngineersToOffer', () => {
    it('オファーに複数のエンジニアを追加できること', async () => {
      const mockOfferEngineers = [
        {
          id: BigInt(1),
          offerId: BigInt(1),
          engineerId: BigInt(10),
          individualStatus: 'SENT',
          respondedAt: null,
          responseNote: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: BigInt(2),
          offerId: BigInt(1),
          engineerId: BigInt(11),
          individualStatus: 'SENT',
          respondedAt: null,
          responseNote: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.offerEngineer.createMany.mockResolvedValue({ count: 2 });
      prisma.offerEngineer.findMany.mockResolvedValue(mockOfferEngineers as any);

      const result = await repository.addEngineersToOffer(
        BigInt(1),
        [BigInt(10), BigInt(11)]
      );

      expect(result).toEqual(mockOfferEngineers);
      expect(prisma.offerEngineer.createMany).toHaveBeenCalledWith({
        data: [
          {
            offerId: BigInt(1),
            engineerId: BigInt(10),
            individualStatus: 'SENT',
          },
          {
            offerId: BigInt(1),
            engineerId: BigInt(11),
            individualStatus: 'SENT',
          },
        ],
      });
    });

    it('重複するエンジニアIDがある場合はスキップすること', async () => {
      const existingEngineers = [
        { engineerId: BigInt(10) },
      ];

      prisma.offerEngineer.findMany.mockResolvedValueOnce(existingEngineers as any);
      prisma.offerEngineer.createMany.mockResolvedValue({ count: 1 });
      prisma.offerEngineer.findMany.mockResolvedValueOnce([]);

      await repository.addEngineersToOffer(
        BigInt(1),
        [BigInt(10), BigInt(11)] // 10は既存、11のみ追加
      );

      expect(prisma.offerEngineer.createMany).toHaveBeenCalledWith({
        data: [
          {
            offerId: BigInt(1),
            engineerId: BigInt(11),
            individualStatus: 'SENT',
          },
        ],
      });
    });
  });

  describe('findEngineersByOffer', () => {
    it('オファーIDでエンジニア一覧を取得できること', async () => {
      const mockOfferEngineers = [
        {
          id: BigInt(1),
          offerId: BigInt(1),
          engineerId: BigInt(10),
          individualStatus: 'SENT',
          engineer: {
            id: BigInt(10),
            name: '田中太郎',
            email: 'tanaka@example.com',
          },
        },
        {
          id: BigInt(2),
          offerId: BigInt(1),
          engineerId: BigInt(11),
          individualStatus: 'PENDING',
          engineer: {
            id: BigInt(11),
            name: '佐藤花子',
            email: 'sato@example.com',
          },
        },
      ];

      prisma.offerEngineer.findMany.mockResolvedValue(mockOfferEngineers as any);

      const result = await repository.findEngineersByOffer(BigInt(1));

      expect(result).toEqual(mockOfferEngineers);
      expect(prisma.offerEngineer.findMany).toHaveBeenCalledWith({
        where: { offerId: BigInt(1) },
        include: {
          engineer: {
            include: {
              skillSheet: true,
              company: true,
            },
          },
        },
      });
    });

    it('ステータスでフィルタリングできること', async () => {
      prisma.offerEngineer.findMany.mockResolvedValue([]);

      await repository.findEngineersByOffer(BigInt(1), { status: ['ACCEPTED'] });

      expect(prisma.offerEngineer.findMany).toHaveBeenCalledWith({
        where: {
          offerId: BigInt(1),
          individualStatus: { in: ['ACCEPTED'] },
        },
        include: expect.any(Object),
      });
    });
  });

  describe('updateEngineerStatus', () => {
    it('個別のエンジニアステータスを更新できること', async () => {
      const mockUpdated = {
        id: BigInt(1),
        offerId: BigInt(1),
        engineerId: BigInt(10),
        individualStatus: 'ACCEPTED',
        respondedAt: new Date(),
        responseNote: '承諾します',
      };

      prisma.offerEngineer.update.mockResolvedValue(mockUpdated as any);

      const result = await repository.updateEngineerStatus(
        BigInt(1),
        BigInt(10),
        'ACCEPTED',
        '承諾します'
      );

      expect(result).toEqual(mockUpdated);
      expect(prisma.offerEngineer.update).toHaveBeenCalledWith({
        where: {
          offerId_engineerId: {
            offerId: BigInt(1),
            engineerId: BigInt(10),
          },
        },
        data: {
          individualStatus: 'ACCEPTED',
          respondedAt: expect.any(Date),
          responseNote: '承諾します',
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('bulkUpdateStatuses', () => {
    it('複数のエンジニアステータスを一括更新できること', async () => {
      prisma.offerEngineer.updateMany.mockResolvedValue({ count: 3 });

      const result = await repository.bulkUpdateStatuses(
        BigInt(1),
        [BigInt(10), BigInt(11), BigInt(12)],
        'DECLINED'
      );

      expect(result).toBe(3);
      expect(prisma.offerEngineer.updateMany).toHaveBeenCalledWith({
        where: {
          offerId: BigInt(1),
          engineerId: { in: [BigInt(10), BigInt(11), BigInt(12)] },
        },
        data: {
          individualStatus: 'DECLINED',
          respondedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getOfferEngineerStatistics', () => {
    it('オファー対象エンジニアの統計を取得できること', async () => {
      prisma.offerEngineer.count.mockResolvedValueOnce(10); // 総数
      prisma.offerEngineer.count.mockResolvedValueOnce(3);  // SENT
      prisma.offerEngineer.count.mockResolvedValueOnce(2);  // OPENED
      prisma.offerEngineer.count.mockResolvedValueOnce(2);  // PENDING
      prisma.offerEngineer.count.mockResolvedValueOnce(2);  // ACCEPTED
      prisma.offerEngineer.count.mockResolvedValueOnce(1);  // DECLINED

      const result = await repository.getOfferEngineerStatistics(BigInt(1));

      expect(result).toEqual({
        total: 10,
        sent: 3,
        opened: 2,
        pending: 2,
        accepted: 2,
        declined: 1,
      });
    });
  });

  describe('findOffersByEngineer', () => {
    it('エンジニアIDで関連するオファー一覧を取得できること', async () => {
      const mockOffers = [
        {
          id: BigInt(1),
          offerId: BigInt(100),
          engineerId: BigInt(10),
          individualStatus: 'PENDING',
          offer: {
            id: BigInt(100),
            projectName: 'プロジェクトA',
            clientCompany: { name: 'ABC商事' },
          },
        },
        {
          id: BigInt(2),
          offerId: BigInt(101),
          engineerId: BigInt(10),
          individualStatus: 'ACCEPTED',
          offer: {
            id: BigInt(101),
            projectName: 'プロジェクトB',
            clientCompany: { name: 'XYZ株式会社' },
          },
        },
      ];

      prisma.offerEngineer.findMany.mockResolvedValue(mockOffers as any);

      const result = await repository.findOffersByEngineer(BigInt(10));

      expect(result).toEqual(mockOffers);
      expect(prisma.offerEngineer.findMany).toHaveBeenCalledWith({
        where: { engineerId: BigInt(10) },
        include: {
          offer: {
            include: {
              clientCompany: true,
            },
          },
        },
        orderBy: {
          offer: {
            sentAt: 'desc',
          },
        },
      });
    });
  });

  describe('removeEngineersFromOffer', () => {
    it('オファーからエンジニアを削除できること', async () => {
      prisma.offerEngineer.deleteMany.mockResolvedValue({ count: 2 });

      const result = await repository.removeEngineersFromOffer(
        BigInt(1),
        [BigInt(10), BigInt(11)]
      );

      expect(result).toBe(2);
      expect(prisma.offerEngineer.deleteMany).toHaveBeenCalledWith({
        where: {
          offerId: BigInt(1),
          engineerId: { in: [BigInt(10), BigInt(11)] },
        },
      });
    });
  });

  describe('checkEngineerAvailability', () => {
    it('エンジニアが他のアクティブなオファーを持っているか確認できること', async () => {
      prisma.offerEngineer.findFirst.mockResolvedValue({
        id: BigInt(1),
        offerId: BigInt(100),
        engineerId: BigInt(10),
        individualStatus: 'PENDING',
      } as any);

      const result = await repository.checkEngineerAvailability(BigInt(10));

      expect(result).toBe(false); // アクティブなオファーがある場合はfalse
      expect(prisma.offerEngineer.findFirst).toHaveBeenCalledWith({
        where: {
          engineerId: BigInt(10),
          individualStatus: {
            in: ['SENT', 'OPENED', 'PENDING', 'ACCEPTED'],
          },
        },
      });
    });

    it('アクティブなオファーがない場合はtrueを返すこと', async () => {
      prisma.offerEngineer.findFirst.mockResolvedValue(null);

      const result = await repository.checkEngineerAvailability(BigInt(10));

      expect(result).toBe(true);
    });
  });
});