// 取引先管理用のZustand Store

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { BusinessPartner, PartnerPermissions, PartnerUser, AccessUrl, PartnerFilters, PartnerStatistics } from '@/types/partner'

interface PartnerState {
  // State
  partners: BusinessPartner[]
  selectedPartner: BusinessPartner | null
  permissions: PartnerPermissions | null
  partnerUsers: PartnerUser[]
  accessUrls: AccessUrl[]
  statistics: PartnerStatistics | null
  filters: PartnerFilters
  isLoading: boolean
  error: string | null

  // Actions - 取引先管理
  fetchPartners: (filters?: PartnerFilters) => Promise<void>
  fetchPartnerById: (partnerId: string) => Promise<void>
  createPartner: (partner: Omit<BusinessPartner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BusinessPartner>
  updatePartner: (partnerId: string, partner: Partial<BusinessPartner>) => Promise<void>
  deletePartner: (partnerId: string) => Promise<void>
  selectPartner: (partner: BusinessPartner | null) => void

  // Actions - 権限管理
  fetchPartnerPermissions: (partnerId: string) => Promise<void>
  updatePartnerPermissions: (partnerId: string, permissions: Partial<PartnerPermissions>) => Promise<void>
  addAllowedEngineer: (partnerId: string, engineerId: string) => Promise<void>
  removeAllowedEngineer: (partnerId: string, engineerId: string) => Promise<void>
  addBlockedEngineer: (partnerId: string, engineerId: string) => Promise<void>
  removeBlockedEngineer: (partnerId: string, engineerId: string) => Promise<void>

  // Actions - ユーザー管理
  fetchPartnerUsers: (partnerId: string) => Promise<void>
  createPartnerUser: (partnerId: string, user: Omit<PartnerUser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PartnerUser>
  updatePartnerUser: (userId: string, user: Partial<PartnerUser>) => Promise<void>
  deletePartnerUser: (userId: string) => Promise<void>
  resetUserPassword: (userId: string) => Promise<void>

  // Actions - アクセスURL管理
  fetchAccessUrls: (partnerId: string) => Promise<void>
  generateAccessUrl: (partnerId: string, expiresAt?: string) => Promise<AccessUrl>
  revokeAccessUrl: (urlId: string) => Promise<void>
  refreshAccessUrl: (urlId: string) => Promise<AccessUrl>

  // Actions - 統計
  fetchStatistics: () => Promise<void>

  // Actions - フィルター
  setFilters: (filters: PartnerFilters) => void
  clearFilters: () => void

  // Actions - エラーハンドリング
  clearError: () => void
}

export const usePartnerStore = create<PartnerState>()(
  devtools(
    (set, get) => ({
      // Initial state
      partners: [],
      selectedPartner: null,
      permissions: null,
      partnerUsers: [],
      accessUrls: [],
      statistics: null,
      filters: {},
      isLoading: false,
      error: null,

      // 取引先管理
      fetchPartners: async (filters?: PartnerFilters) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装後に置き換え
          const mockPartners: BusinessPartner[] = [
            {
              id: '1',
              companyId: 'company1',
              partnerCompanyName: '株式会社サンプル取引先',
              partnerCompanyEmail: 'contact@sample-partner.co.jp',
              partnerCompanyPhone: '03-1234-5678',
              contractStatus: 'active',
              contractStartDate: '2024-01-01',
              contractEndDate: '2024-12-31',
              maxViewableEngineers: 50,
              currentViewableEngineers: 25,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-15T00:00:00Z'
            }
          ]
          set({ partners: mockPartners, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の取得に失敗しました', isLoading: false })
        }
      },

      fetchPartnerById: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const partner = get().partners.find(p => p.id === partnerId)
          if (partner) {
            set({ selectedPartner: partner, isLoading: false })
          } else {
            throw new Error('取引先が見つかりません')
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の取得に失敗しました', isLoading: false })
        }
      },

      createPartner: async (partner) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const newPartner: BusinessPartner = {
            ...partner,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          set(state => ({
            partners: [...state.partners, newPartner],
            isLoading: false
          }))
          return newPartner
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の作成に失敗しました', isLoading: false })
          throw error
        }
      },

      updatePartner: async (partnerId: string, partner) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            partners: state.partners.map(p =>
              p.id === partnerId ? { ...p, ...partner, updatedAt: new Date().toISOString() } : p
            ),
            selectedPartner: state.selectedPartner?.id === partnerId
              ? { ...state.selectedPartner, ...partner, updatedAt: new Date().toISOString() }
              : state.selectedPartner,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の更新に失敗しました', isLoading: false })
        }
      },

      deletePartner: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            partners: state.partners.filter(p => p.id !== partnerId),
            selectedPartner: state.selectedPartner?.id === partnerId ? null : state.selectedPartner,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の削除に失敗しました', isLoading: false })
        }
      },

      selectPartner: (partner) => {
        set({ selectedPartner: partner })
      },

      // 権限管理
      fetchPartnerPermissions: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const mockPermissions: PartnerPermissions = {
            partnerId,
            viewAllEngineers: false,
            viewWaitingEngineers: true,
            viewWorkingEngineers: false,
            canSendOffers: true,
            canViewDetailedSkillSheet: true,
            allowedEngineers: [],
            blockedEngineers: [],
            currentMonthOfferCount: 0
          }
          set({ permissions: mockPermissions, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '権限情報の取得に失敗しました', isLoading: false })
        }
      },

      updatePartnerPermissions: async (partnerId: string, permissions) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            permissions: state.permissions ? { ...state.permissions, ...permissions } : null,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '権限の更新に失敗しました', isLoading: false })
        }
      },

      addAllowedEngineer: async (partnerId: string, engineerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            permissions: state.permissions
              ? {
                  ...state.permissions,
                  allowedEngineers: [...state.permissions.allowedEngineers, engineerId]
                }
              : null,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'エンジニアの追加に失敗しました', isLoading: false })
        }
      },

      removeAllowedEngineer: async (partnerId: string, engineerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            permissions: state.permissions
              ? {
                  ...state.permissions,
                  allowedEngineers: state.permissions.allowedEngineers.filter(id => id !== engineerId)
                }
              : null,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'エンジニアの削除に失敗しました', isLoading: false })
        }
      },

      addBlockedEngineer: async (partnerId: string, engineerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            permissions: state.permissions
              ? {
                  ...state.permissions,
                  blockedEngineers: [...state.permissions.blockedEngineers, engineerId]
                }
              : null,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'NGエンジニアの追加に失敗しました', isLoading: false })
        }
      },

      removeBlockedEngineer: async (partnerId: string, engineerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            permissions: state.permissions
              ? {
                  ...state.permissions,
                  blockedEngineers: state.permissions.blockedEngineers.filter(id => id !== engineerId)
                }
              : null,
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'NGエンジニアの削除に失敗しました', isLoading: false })
        }
      },

      // ユーザー管理
      fetchPartnerUsers: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const mockUsers: PartnerUser[] = []
          set({ partnerUsers: mockUsers, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'ユーザー一覧の取得に失敗しました', isLoading: false })
        }
      },

      createPartnerUser: async (partnerId: string, user) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const newUser: PartnerUser = {
            ...user,
            id: Date.now().toString(),
            partnerId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          set(state => ({
            partnerUsers: [...state.partnerUsers, newUser],
            isLoading: false
          }))
          return newUser
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'ユーザーの作成に失敗しました', isLoading: false })
          throw error
        }
      },

      updatePartnerUser: async (userId: string, user) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            partnerUsers: state.partnerUsers.map(u =>
              u.id === userId ? { ...u, ...user, updatedAt: new Date().toISOString() } : u
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'ユーザーの更新に失敗しました', isLoading: false })
        }
      },

      deletePartnerUser: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            partnerUsers: state.partnerUsers.filter(u => u.id !== userId),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'ユーザーの削除に失敗しました', isLoading: false })
        }
      },

      resetUserPassword: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set({ isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'パスワードのリセットに失敗しました', isLoading: false })
        }
      },

      // アクセスURL管理
      fetchAccessUrls: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const mockUrls: AccessUrl[] = []
          set({ accessUrls: mockUrls, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'アクセスURLの取得に失敗しました', isLoading: false })
        }
      },

      generateAccessUrl: async (partnerId: string, expiresAt?: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const newUrl: AccessUrl = {
            id: Date.now().toString(),
            partnerId,
            url: `https://example.com/partner/access/${Date.now()}`,
            token: Math.random().toString(36).substring(7),
            expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            accessCount: 0,
            isActive: true
          }
          set(state => ({
            accessUrls: [...state.accessUrls, newUrl],
            isLoading: false
          }))
          return newUrl
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'アクセスURLの生成に失敗しました', isLoading: false })
          throw error
        }
      },

      revokeAccessUrl: async (urlId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          set(state => ({
            accessUrls: state.accessUrls.map(url =>
              url.id === urlId ? { ...url, isActive: false } : url
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'アクセスURLの無効化に失敗しました', isLoading: false })
        }
      },

      refreshAccessUrl: async (urlId: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const newUrl: AccessUrl = {
            id: Date.now().toString(),
            partnerId: 'partner1',
            url: `https://example.com/partner/access/${Date.now()}`,
            token: Math.random().toString(36).substring(7),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            accessCount: 0,
            isActive: true
          }
          set(state => ({
            accessUrls: [...state.accessUrls, newUrl],
            isLoading: false
          }))
          return newUrl
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'アクセスURLの更新に失敗しました', isLoading: false })
          throw error
        }
      },

      // 統計
      fetchStatistics: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: API実装
          const mockStatistics: PartnerStatistics = {
            totalPartners: 10,
            activePartners: 8,
            expiredContracts: 2,
            totalOffersSent: 150,
            averageConversionRate: 35.5,
            monthlyTrend: []
          }
          set({ statistics: mockStatistics, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '統計情報の取得に失敗しました', isLoading: false })
        }
      },

      // フィルター
      setFilters: (filters) => {
        set({ filters })
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      // エラーハンドリング
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'partner-store'
    }
  )
)