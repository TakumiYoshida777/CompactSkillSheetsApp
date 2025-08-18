// オファー管理APIクライアント

import axios from 'axios'
import type { 
  Offer,
  OfferSummary,
  OfferStatistics,
  CreateOfferDto,
  UpdateOfferStatusDto,
  OfferFilter,
  OfferBoardData,
  Engineer
} from '@/types/offer'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター（認証トークンの追加）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const offerApi = {
  // オファー管理
  fetchOffers: async (filters?: OfferFilter): Promise<Offer[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)))
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    const response = await apiClient.get('/offers', { params })
    return response.data.data
  },

  fetchOfferById: async (offerId: string): Promise<Offer> => {
    const response = await apiClient.get(`/offers/${offerId}`)
    return response.data.data
  },

  createOffer: async (offer: CreateOfferDto): Promise<Offer> => {
    const response = await apiClient.post('/offers', offer)
    return response.data.data
  },

  bulkCreateOffers: async (offers: CreateOfferDto[]): Promise<Offer[]> => {
    const response = await apiClient.post('/offers/bulk', { offers })
    return response.data.data
  },

  updateOfferStatus: async (offerId: string, statusUpdate: UpdateOfferStatusDto): Promise<Offer> => {
    const response = await apiClient.patch(`/offers/${offerId}/status`, statusUpdate)
    return response.data.data
  },

  deleteOffer: async (offerId: string): Promise<void> => {
    await apiClient.delete(`/offers/${offerId}`)
  },

  sendReminder: async (offerId: string): Promise<void> => {
    await apiClient.post(`/offers/${offerId}/reminder`)
  },

  withdrawOffer: async (offerId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/offers/${offerId}/withdraw`, { reason })
  },

  // エンジニア管理
  fetchAvailableEngineers: async (partnerId?: string): Promise<Engineer[]> => {
    const params = partnerId ? { partnerId } : undefined
    const response = await apiClient.get('/offers/available-engineers', { params })
    return response.data.data
  },

  fetchEngineerOfferStatus: async (engineerId: string): Promise<any> => {
    const response = await apiClient.get(`/offers/engineers/${engineerId}/status`)
    return response.data.data
  },

  filterEngineers: async (filters: any): Promise<Engineer[]> => {
    const response = await apiClient.post('/offers/engineers/filter', filters)
    return response.data.data
  },

  // オファーボード
  fetchOfferBoardData: async (partnerId?: string): Promise<OfferBoardData> => {
    const params = partnerId ? { partnerId } : undefined
    const response = await apiClient.get('/client/offer-board', { params })
    return response.data.data
  },

  // テンプレート管理
  fetchOfferTemplates: async (): Promise<any[]> => {
    const response = await apiClient.get('/offers/templates')
    return response.data.data
  },

  createTemplate: async (template: any): Promise<any> => {
    const response = await apiClient.post('/offers/templates', template)
    return response.data.data
  },

  updateTemplate: async (templateId: string, template: any): Promise<any> => {
    const response = await apiClient.put(`/offers/templates/${templateId}`, template)
    return response.data.data
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/offers/templates/${templateId}`)
  },

  // 統計・分析
  fetchStatistics: async (filters?: OfferFilter): Promise<OfferStatistics> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, JSON.stringify(value))
        }
      })
    }
    const response = await apiClient.get('/offers/statistics', { params })
    return response.data.data
  },

  fetchMonthlyStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/offers/statistics/monthly')
    return response.data.data
  },

  fetchStatisticsByCompany: async (): Promise<any> => {
    const response = await apiClient.get('/offers/statistics/by-company')
    return response.data.data
  },

  fetchConversionRate: async (): Promise<any> => {
    const response = await apiClient.get('/offers/conversion-rate')
    return response.data.data
  },

  // レポート生成
  generateReport: async (params: { type: string; format: 'pdf' | 'excel'; dateRange?: any }): Promise<any> => {
    const response = await apiClient.post('/offers/reports/generate', params)
    return response.data.data
  },

  fetchReport: async (reportId: string): Promise<any> => {
    const response = await apiClient.get(`/offers/reports/${reportId}`)
    return response.data.data
  },

  exportReport: async (reportId: string, format: 'pdf' | 'excel'): Promise<Blob> => {
    const response = await apiClient.get(`/offers/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },

  // オファー履歴
  fetchOfferHistory: async (engineerId?: string): Promise<Offer[]> => {
    const params = engineerId ? { engineerId } : undefined
    const response = await apiClient.get('/client/offer-history', { params })
    return response.data.data
  },

  exportOfferHistory: async (format: 'csv' | 'excel'): Promise<Blob> => {
    const response = await apiClient.get('/client/offer-history/export', {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },

  searchOfferHistory: async (searchParams: any): Promise<Offer[]> => {
    const response = await apiClient.post('/client/offer-history/search', searchParams)
    return response.data.data
  }
}