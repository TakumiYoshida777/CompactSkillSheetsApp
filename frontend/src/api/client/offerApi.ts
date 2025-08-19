import axios from '@/lib/axios';
import type {
  OfferBoardData,
  Offer,
  CreateOfferDto,
  UpdateOfferStatusDto,
  OfferFilter,
  OfferStatistics,
  OfferStatus,
} from '@/types/offer';

const BASE_URL = '/api/client';

// モックデータ（バックエンドAPI実装まで使用）
const mockOfferBoardData: OfferBoardData = {
  statistics: {
    totalEngineers: 25,
    availableEngineers: 12,
    offeredEngineers: 8,
    acceptedOffers: 5,
    offerAcceptanceRate: 62.5,
  },
  summary: {
    totalOffers: 48,
    monthlyOffers: 15,
    weeklyOffers: 8,
    todayOffers: 3,
    pendingResponses: 12,
    acceptanceRate: 65,
  },
  engineers: [
    {
      id: '1',
      name: '田中太郎',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 5,
      availability: '2024-02-01',
      availabilityStatus: 'available',
      rate: { min: 60, max: 80 },
      lastOfferStatus: null,
      offerHistory: [],
    },
    {
      id: '2',
      name: '佐藤花子',
      skills: ['TypeScript', 'React', 'AWS'],
      experience: 3,
      availability: '2024-02-01',
      availabilityStatus: 'available',
      rate: { min: 50, max: 70 },
      lastOfferStatus: 'pending',
      offerHistory: [
        {
          offerId: 'OFF-2024-010',
          projectName: 'ECサイト開発',
          status: 'pending',
          sentAt: '2024-01-10',
        },
      ],
    },
    {
      id: '3',
      name: '山田次郎',
      skills: ['Java', 'Spring', 'MySQL'],
      experience: 7,
      availability: '2024-03-01',
      availabilityStatus: 'pending',
      rate: { min: 70, max: 90 },
      lastOfferStatus: 'accepted',
      offerHistory: [
        {
          offerId: 'OFF-2024-005',
          projectName: '基幹システム改修',
          status: 'accepted',
          sentAt: '2024-01-05',
        },
      ],
    },
  ],
  recentOffers: [
    {
      id: 'OFF-2024-045',
      offerNumber: 'OFF-2024-045',
      projectName: 'ECサイトリニューアル開発',
      clientCompanyId: '1',
      status: 'pending',
      engineerIds: ['1', '2'],
      sentAt: new Date('2024-01-15T10:30:00').toISOString(),
      createdAt: new Date('2024-01-15T10:30:00').toISOString(),
      updatedAt: new Date('2024-01-15T10:30:00').toISOString(),
    },
  ],
};

export const offerApi = {
  // オファーボード関連
  getOfferBoard: async (): Promise<OfferBoardData> => {
    try {
      const response = await axios.get(`${BASE_URL}/offer-board`);
      return response.data;
    } catch (error) {
      // エラー時はモックデータを返す（フォールバック）
      console.warn('API call failed, returning mock data:', error);
      return mockOfferBoardData;
    }
  },

  // オファー管理
  getOffers: async (filter?: OfferFilter): Promise<Offer[]> => {
    const response = await axios.get(`${BASE_URL}/offers`, { params: filter });
    return response.data;
  },

  getOffer: async (offerId: string): Promise<Offer> => {
    const response = await axios.get(`${BASE_URL}/offers/${offerId}`);
    return response.data;
  },

  createOffer: async (data: CreateOfferDto): Promise<Offer> => {
    const response = await axios.post(`${BASE_URL}/offers`, data);
    return response.data;
  },

  updateOfferStatus: async (
    offerId: string,
    data: UpdateOfferStatusDto
  ): Promise<Offer> => {
    const response = await axios.put(`${BASE_URL}/offers/${offerId}/status`, data);
    return response.data;
  },

  sendReminder: async (offerId: string): Promise<{ success: boolean }> => {
    const response = await axios.post(`${BASE_URL}/offers/${offerId}/reminder`);
    return response.data;
  },

  bulkAction: async (data: {
    action: string;
    offerIds: string[];
  }): Promise<{ success: boolean; results: any[] }> => {
    const response = await axios.post(`${BASE_URL}/offers/bulk-action`, data);
    return response.data;
  },

  // 統計情報
  getStatistics: async (): Promise<OfferStatistics> => {
    const response = await axios.get(`${BASE_URL}/offers/statistics`);
    return response.data;
  },

  // オファー履歴
  getOfferHistory: async (filter?: OfferFilter): Promise<Offer[]> => {
    const response = await axios.get(`${BASE_URL}/offer-history`, { params: filter });
    return response.data;
  },

  exportOfferHistory: async (filter?: OfferFilter): Promise<Blob> => {
    const response = await axios.get(`${BASE_URL}/offer-history/export`, {
      params: filter,
      responseType: 'blob',
    });
    return response.data;
  },

  searchOffers: async (query: {
    keyword?: string;
    status?: OfferStatus[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Offer[]> => {
    const response = await axios.post(`${BASE_URL}/offer-history/search`, query);
    return response.data;
  },

  // エンジニア検索
  searchAvailableEngineers: async (params: {
    skills?: string[];
    availability?: string;
    experience?: number;
    rate?: { min?: number; max?: number };
  }) => {
    try {
      const response = await axios.get(`${BASE_URL}/engineers/available`, { params });
      return response.data;
    } catch (error) {
      console.warn('Failed to search engineers:', error);
      return { engineers: [], totalCount: 0 };
    }
  },

  getEngineerDetail: async (engineerId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/engineers/${engineerId}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get engineer detail:', error);
      throw error;
    }
  },
};