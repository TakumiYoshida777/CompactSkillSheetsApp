import axios from 'axios';
import { OfferStatus, ProjectDetails } from '../../stores/offerStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Offer {
  id: string;
  offerNumber: string;
  clientCompanyId: string;
  status: OfferStatus;
  projectName: string;
  projectPeriodStart: string;
  projectPeriodEnd: string;
  requiredSkills: string[];
  projectDescription: string;
  location?: string;
  rateMin?: number;
  rateMax?: number;
  remarks?: string;
  sentAt: string;
  openedAt?: string;
  respondedAt?: string;
  reminderSentAt?: string;
  reminderCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  engineers?: OfferEngineer[];
}

export interface OfferEngineer {
  id: string;
  offerId: string;
  engineerId: string;
  individualStatus: OfferStatus;
  respondedAt?: string;
  responseNote?: string;
  engineer?: Engineer;
}

export interface Engineer {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  status: 'AVAILABLE' | 'PENDING' | 'ASSIGNED';
  availableFrom?: string;
  offerStatus?: OfferStatus;
  lastOfferDate?: string;
}

export interface OfferBoardData {
  summary: {
    availableEngineers: number;
    monthlyOffers: number;
    todayOffers: number;
    acceptedOffers: number;
    pendingOffers: number;
    declinedOffers: number;
  };
  engineers: Engineer[];
  recentOffers?: Offer[];
}

export interface CreateOfferRequest {
  engineerIds: string[];
  projectDetails: ProjectDetails;
  sendEmail: boolean;
}

export interface OfferFilters {
  status?: OfferStatus;
  from?: string;
  to?: string;
  engineerId?: string;
  projectName?: string;
}

export interface OfferStatistics {
  totalOffers: number;
  monthlyOffers: number;
  weeklyOffers: number;
  todayOffers: number;
  acceptanceRate: number;
  averageResponseTime: number;
  declineRate: number;
  statusBreakdown: Record<OfferStatus, number>;
}

export const getOffers = async (filters?: OfferFilters): Promise<Offer[]> => {
  const { data } = await apiClient.get('/client/offers', { params: filters });
  return data;
};

export const getOfferById = async (offerId: string): Promise<Offer> => {
  const { data } = await apiClient.get(`/client/offers/${offerId}`);
  return data;
};

export const createOffer = async (request: CreateOfferRequest): Promise<Offer> => {
  const { data } = await apiClient.post('/client/offers', request);
  return data;
};

export const updateOfferStatus = async (offerId: string, status: OfferStatus): Promise<Offer> => {
  const { data } = await apiClient.put(`/client/offers/${offerId}/status`, { status });
  return data;
};

export const sendReminder = async (offerId: string): Promise<void> => {
  await apiClient.post(`/client/offers/${offerId}/reminder`);
};

export const bulkAction = async (offerIds: string[], action: 'reminder' | 'withdraw'): Promise<void> => {
  await apiClient.post('/client/offers/bulk-action', { offerIds, action });
};

export const getOfferBoard = async (): Promise<OfferBoardData> => {
  const { data } = await apiClient.get('/client/offer-board');
  return data;
};

export const getAvailableEngineers = async (): Promise<Engineer[]> => {
  const { data } = await apiClient.get('/client/engineers/available');
  return data;
};

export const getEngineerDetails = async (engineerId: string): Promise<Engineer & { offerHistory: Offer[] }> => {
  const { data } = await apiClient.get(`/client/engineers/${engineerId}`);
  return data;
};

export const searchEngineers = async (query: any): Promise<Engineer[]> => {
  const { data } = await apiClient.post('/client/search/engineers', query);
  return data;
};

export const getOfferHistory = async (filters?: OfferFilters): Promise<Offer[]> => {
  const { data } = await apiClient.get('/client/offer-history', { params: filters });
  return data;
};

export const exportOfferHistory = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  const response = await apiClient.get('/client/offer-history/export', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
};

export const getOfferStatistics = async (): Promise<OfferStatistics> => {
  const { data } = await apiClient.get('/client/offers/statistics');
  return data;
};