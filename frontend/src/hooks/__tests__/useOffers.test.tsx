import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOffers, useOfferBoard, useCreateOffer, useUpdateOfferStatus } from '../useOffers';
import * as offerApi from '../../api/client/offerApi';

jest.mock('../../api/client/offerApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOffers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOffers', () => {
    it('オファー一覧を取得できる', async () => {
      const mockOffers = [
        {
          id: '1',
          offerNumber: 'OFF-2024-001',
          status: 'SENT',
          projectName: 'ECサイト開発',
          sentAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          offerNumber: 'OFF-2024-002',
          status: 'PENDING',
          projectName: 'システム刷新',
          sentAt: '2024-01-14T10:00:00Z',
        },
      ];

      (offerApi.getOffers as jest.Mock).mockResolvedValue(mockOffers);

      const { result } = renderHook(() => useOffers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockOffers);
      expect(offerApi.getOffers).toHaveBeenCalledTimes(1);
    });

    it('フィルター付きでオファーを取得できる', async () => {
      const filters = { status: 'PENDING' };
      const mockOffers = [
        {
          id: '2',
          offerNumber: 'OFF-2024-002',
          status: 'PENDING',
          projectName: 'システム刷新',
          sentAt: '2024-01-14T10:00:00Z',
        },
      ];

      (offerApi.getOffers as jest.Mock).mockResolvedValue(mockOffers);

      const { result } = renderHook(() => useOffers(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockOffers);
      expect(offerApi.getOffers).toHaveBeenCalledWith(filters);
    });
  });

  describe('useOfferBoard', () => {
    it('オファーボード情報を取得できる', async () => {
      const mockBoardData = {
        summary: {
          availableEngineers: 25,
          monthlyOffers: 8,
          todayOffers: 2,
          acceptedOffers: 3,
          pendingOffers: 4,
          declinedOffers: 1,
        },
        engineers: [
          {
            id: 'eng1',
            name: '田中太郎',
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: 5,
            status: 'AVAILABLE',
            offerStatus: null,
          },
        ],
      };

      (offerApi.getOfferBoard as jest.Mock).mockResolvedValue(mockBoardData);

      const { result } = renderHook(() => useOfferBoard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockBoardData);
      expect(offerApi.getOfferBoard).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCreateOffer', () => {
    it('オファーを作成できる', async () => {
      const newOffer = {
        engineerIds: ['eng1', 'eng2'],
        projectDetails: {
          projectName: 'ECサイト開発',
          projectPeriodStart: '2024-03-01',
          projectPeriodEnd: '2024-12-31',
          requiredSkills: ['React', 'TypeScript'],
          projectDescription: 'ECサイトのフルリニューアル',
          location: '東京都港区',
          rateMin: 600000,
          rateMax: 800000,
        },
        sendEmail: true,
      };

      const mockResponse = {
        id: '3',
        offerNumber: 'OFF-2024-003',
        status: 'SENT',
        ...newOffer.projectDetails,
      };

      (offerApi.createOffer as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateOffer(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(newOffer);

      expect(offerApi.createOffer).toHaveBeenCalledWith(newOffer);
    });

    it('オファー作成エラーをハンドリングできる', async () => {
      const newOffer = {
        engineerIds: [],
        projectDetails: {
          projectName: '',
          projectPeriodStart: '',
          projectPeriodEnd: '',
          requiredSkills: [],
          projectDescription: '',
        },
        sendEmail: false,
      };

      const mockError = new Error('エンジニアを選択してください');
      (offerApi.createOffer as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateOffer(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(newOffer)).rejects.toThrow('エンジニアを選択してください');
    });
  });

  describe('useUpdateOfferStatus', () => {
    it('オファーステータスを更新できる', async () => {
      const updateData = {
        offerId: '1',
        status: 'WITHDRAWN' as const,
      };

      const mockResponse = {
        id: '1',
        status: 'WITHDRAWN',
      };

      (offerApi.updateOfferStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateOfferStatus(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(updateData);

      expect(offerApi.updateOfferStatus).toHaveBeenCalledWith(updateData.offerId, updateData.status);
    });
  });
});