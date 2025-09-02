// 取引先管理用のZustand Store

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { partnerApi } from '@/api/partnerApi'
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
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>

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
          const partners = await partnerApi.fetchPartners(filters)
          set({ partners, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の取得に失敗しました', isLoading: false })
        }
      },

      fetchPartnerById: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const partner = await partnerApi.fetchPartnerById(partnerId)
          set({ selectedPartner: partner, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '取引先の取得に失敗しました', isLoading: false })
        }
      },

      createPartner: async (partner) => {
        set({ isLoading: true, error: null })
        try {
          const newPartner = await partnerApi.createPartner(partner)
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
          const updatedPartner = await partnerApi.updatePartner(partnerId, partner)
          set(state => ({
            partners: state.partners.map(p =>
              p.id === partnerId ? updatedPartner : p
            ),
            selectedPartner: state.selectedPartner?.id === partnerId
              ? updatedPartner
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
          await partnerApi.deletePartner(partnerId)
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
          const permissions = await partnerApi.fetchPartnerPermissions(partnerId)
          set({ permissions, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '権限情報の取得に失敗しました', isLoading: false })
        }
      },

      updatePartnerPermissions: async (partnerId: string, permissions) => {
        set({ isLoading: true, error: null })
        try {
          const updatedPermissions = await partnerApi.updatePartnerPermissions(partnerId, permissions)
          set({ permissions: updatedPermissions, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '権限の更新に失敗しました', isLoading: false })
        }
      },

      addAllowedEngineer: async (partnerId: string, engineerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const currentPermissions = get().permissions
          if (!currentPermissions) {
            throw new Error('権限情報が読み込まれていません')
          }
          
          const updatedAllowedEngineers = [...currentPermissions.allowedEngineers, engineerId]
          await partnerApi.updateAllowedEngineers(partnerId, updatedAllowedEngineers)
          
          set(state => ({
            permissions: state.permissions
              ? {
                  ...state.permissions,
                  allowedEngineers: updatedAllowedEngineers
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
          const currentPermissions = get().permissions
          if (!currentPermissions) {
            throw new Error('権限情報が読み込まれていません')
          }
          
          const updatedAllowedEngineers = currentPermissions.allowedEngineers.filter(id => id !== engineerId)
          await partnerApi.updateAllowedEngineers(partnerId, updatedAllowedEngineers)
          
          set(state => ({
            permissions: state.permissions
              ? {
                  ...state.permissions,
                  allowedEngineers: updatedAllowedEngineers
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
          const currentPermissions = get().permissions
          if (!currentPermissions) {
            throw new Error('権限情報が読み込まれていません')
          }
          
          const updatedBlockedEngineers = [...currentPermissions.blockedEngineers, engineerId]
          const updatedPermissions = await partnerApi.updatePartnerPermissions(partnerId, {
            blockedEngineers: updatedBlockedEngineers
          })
          
          set({ permissions: updatedPermissions, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'NGエンジニアの追加に失敗しました', isLoading: false })
        }
      },

      removeBlockedEngineer: async (partnerId: string, engineerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const currentPermissions = get().permissions
          if (!currentPermissions) {
            throw new Error('権限情報が読み込まれていません')
          }
          
          const updatedBlockedEngineers = currentPermissions.blockedEngineers.filter(id => id !== engineerId)
          const updatedPermissions = await partnerApi.updatePartnerPermissions(partnerId, {
            blockedEngineers: updatedBlockedEngineers
          })
          
          set({ permissions: updatedPermissions, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'NGエンジニアの削除に失敗しました', isLoading: false })
        }
      },

      // ユーザー管理
      fetchPartnerUsers: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const users = await partnerApi.fetchPartnerUsers(partnerId)
          set({ partnerUsers: users, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'ユーザー一覧の取得に失敗しました', isLoading: false })
        }
      },

      createPartnerUser: async (partnerId: string, user) => {
        set({ isLoading: true, error: null })
        try {
          const newUser = await partnerApi.createPartnerUser(partnerId, {
            ...user,
            partnerId
          })
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
          const partnerId = get().selectedPartner?.id
          if (!partnerId) {
            throw new Error('取引先が選択されていません')
          }
          
          const updatedUser = await partnerApi.updatePartnerUser(partnerId, userId, user)
          set(state => ({
            partnerUsers: state.partnerUsers.map(u =>
              u.id === userId ? updatedUser : u
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
          const partnerId = get().selectedPartner?.id
          if (!partnerId) {
            throw new Error('取引先が選択されていません')
          }
          
          await partnerApi.deletePartnerUser(partnerId, userId)
          set(state => ({
            partnerUsers: state.partnerUsers.filter(u => u.id !== userId),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'ユーザーの削除に失敗しました', isLoading: false })
        }
      },

      resetUserPassword: async (userId: string, newPassword: string) => {
        set({ isLoading: true, error: null })
        try {
          const partnerId = get().selectedPartner?.id
          if (!partnerId) {
            throw new Error('取引先が選択されていません')
          }
          
          await partnerApi.resetUserPassword(partnerId, userId, newPassword)
          set({ isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'パスワードのリセットに失敗しました', isLoading: false })
        }
      },

      // アクセスURL管理
      fetchAccessUrls: async (partnerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const urls = await partnerApi.fetchAccessUrls(partnerId)
          set({ accessUrls: urls, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'アクセスURLの取得に失敗しました', isLoading: false })
        }
      },

      generateAccessUrl: async (partnerId: string, expiresAt?: string) => {
        set({ isLoading: true, error: null })
        try {
          const newUrl = await partnerApi.generateAccessUrl(partnerId, expiresAt)
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
          const partnerId = get().selectedPartner?.id
          if (!partnerId) {
            throw new Error('取引先が選択されていません')
          }
          
          await partnerApi.revokeAccessUrl(partnerId, urlId)
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
          const partnerId = get().selectedPartner?.id
          if (!partnerId) {
            throw new Error('取引先が選択されていません')
          }
          
          const refreshedUrl = await partnerApi.refreshAccessUrl(partnerId, urlId)
          set(state => ({
            accessUrls: state.accessUrls.map(url =>
              url.id === urlId ? refreshedUrl : url
            ),
            isLoading: false
          }))
          return refreshedUrl
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'アクセスURLの更新に失敗しました', isLoading: false })
          throw error
        }
      },

      // 統計
      fetchStatistics: async () => {
        set({ isLoading: true, error: null })
        try {
          const statistics = await partnerApi.fetchStatistics()
          set({ statistics, isLoading: false })
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