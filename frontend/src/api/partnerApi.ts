// 取引先管理APIクライアント

import axios from 'axios'
import type { 
  BusinessPartner, 
  PartnerPermissions, 
  PartnerUser, 
  AccessUrl, 
  PartnerFilters,
  PartnerStatistics 
} from '@/types/partner'

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
      // 401エラー時はログイン画面にリダイレクト
      localStorage.removeItem('access_token')
      window.location.href = 'login'
    }
    return Promise.reject(error)
  }
)

export const partnerApi = {
  // 取引先企業管理
  fetchPartners: async (filters?: PartnerFilters): Promise<BusinessPartner[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value))
        }
      })
    }
    const response = await apiClient.get('business-partners', { params })
    return response.data.data
  },

  fetchPartnerById: async (partnerId: string): Promise<BusinessPartner> => {
    const response = await apiClient.get(`/business-partners/${partnerId}`)
    return response.data.data
  },

  createPartner: async (partner: Omit<BusinessPartner, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessPartner> => {
    const response = await apiClient.post('business-partners', partner)
    return response.data.data
  },

  updatePartner: async (partnerId: string, partner: Partial<BusinessPartner>): Promise<BusinessPartner> => {
    const response = await apiClient.put(`/business-partners/${partnerId}`, partner)
    return response.data.data
  },

  deletePartner: async (partnerId: string): Promise<void> => {
    await apiClient.delete(`/business-partners/${partnerId}`)
  },

  // 権限管理
  fetchPartnerPermissions: async (partnerId: string): Promise<PartnerPermissions> => {
    const response = await apiClient.get(`/business-partners/${partnerId}/permissions`)
    return response.data.data
  },

  updatePartnerPermissions: async (partnerId: string, permissions: Partial<PartnerPermissions>): Promise<PartnerPermissions> => {
    const response = await apiClient.put(`/business-partners/${partnerId}/permissions`, permissions)
    return response.data.data
  },

  updateAllowedEngineers: async (partnerId: string, engineerIds: string[]): Promise<void> => {
    await apiClient.put(`/business-partners/${partnerId}/engineers`, { engineerIds })
  },

  // ユーザー管理
  fetchPartnerUsers: async (partnerId: string): Promise<PartnerUser[]> => {
    const response = await apiClient.get(`/business-partners/${partnerId}/users`)
    return response.data.data
  },

  createPartnerUser: async (partnerId: string, user: Omit<PartnerUser, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>): Promise<PartnerUser> => {
    const response = await apiClient.post(`/business-partners/${partnerId}/users`, user)
    return response.data.data
  },

  updatePartnerUser: async (partnerId: string, userId: string, user: Partial<PartnerUser>): Promise<PartnerUser> => {
    const response = await apiClient.put(`/business-partners/${partnerId}/users/${userId}`, user)
    return response.data.data
  },

  deletePartnerUser: async (partnerId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/business-partners/${partnerId}/users/${userId}`)
  },

  resetUserPassword: async (partnerId: string, userId: string): Promise<{ temporaryPassword: string }> => {
    const response = await apiClient.post(`/business-partners/${partnerId}/users/${userId}/reset-password`)
    return response.data.data
  },

  // アクセスURL管理
  fetchAccessUrls: async (partnerId: string): Promise<AccessUrl[]> => {
    const response = await apiClient.get(`/business-partners/${partnerId}/access-urls`)
    return response.data.data
  },

  generateAccessUrl: async (partnerId: string, expiresAt?: string): Promise<AccessUrl> => {
    const response = await apiClient.post(`/business-partners/${partnerId}/access-urls`, { expiresAt })
    return response.data.data
  },

  revokeAccessUrl: async (partnerId: string, urlId: string): Promise<void> => {
    await apiClient.delete(`/business-partners/${partnerId}/access-urls/${urlId}`)
  },

  refreshAccessUrl: async (partnerId: string, urlId: string): Promise<AccessUrl> => {
    const response = await apiClient.put(`/business-partners/${partnerId}/access-urls/${urlId}/refresh`)
    return response.data.data
  },

  // アクティビティ・統計
  fetchPartnerActivity: async (partnerId: string): Promise<any> => {
    const response = await apiClient.get(`/business-partners/${partnerId}/activity`)
    return response.data.data
  },

  fetchPartnerAnalytics: async (partnerId: string): Promise<any> => {
    const response = await apiClient.get(`/business-partners/${partnerId}/analytics`)
    return response.data.data
  },

  fetchStatistics: async (): Promise<PartnerStatistics> => {
    const response = await apiClient.get('business-partners/statistics')
    return response.data.data
  },

  // エクスポート
  exportPartners: async (format: 'csv' | 'excel'): Promise<Blob> => {
    const response = await apiClient.get('business-partners/export', {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }
}