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

export const offerApi = {
  // オファーボード関連
  getOfferBoard: async (): Promise<OfferBoardData> => {
    const response = await axios.get(`${BASE_URL}/offer-board`);
    return response.data;
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
    const response = await axios.get(`${BASE_URL}/engineers/available`, { params });
    return response.data;
  },

  getEngineerDetail: async (engineerId: string) => {
    const response = await axios.get(`${BASE_URL}/engineers/${engineerId}`);
    return response.data;
  },
};