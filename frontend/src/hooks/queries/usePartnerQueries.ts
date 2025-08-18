// 取引先管理用のTanStack Query hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnerApi } from '@/api/partnerApi'
import type { 
  BusinessPartner, 
  PartnerPermissions, 
  PartnerUser, 
  AccessUrl, 
  PartnerFilters 
} from '@/types/partner'
import { message } from 'antd'

// Query Keys
const QUERY_KEYS = {
  partners: ['partners'] as const,
  partner: (id: string) => ['partners', id] as const,
  partnerPermissions: (id: string) => ['partners', id, 'permissions'] as const,
  partnerUsers: (id: string) => ['partners', id, 'users'] as const,
  partnerAccessUrls: (id: string) => ['partners', id, 'access-urls'] as const,
  partnerActivity: (id: string) => ['partners', id, 'activity'] as const,
  partnerAnalytics: (id: string) => ['partners', id, 'analytics'] as const,
  partnerStatistics: ['partners', 'statistics'] as const,
}

// 取引先一覧取得
export const usePartners = (filters?: PartnerFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.partners, filters],
    queryFn: () => partnerApi.fetchPartners(filters),
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// 取引先詳細取得
export const usePartner = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.partner(partnerId),
    queryFn: () => partnerApi.fetchPartnerById(partnerId),
    enabled: !!partnerId,
  })
}

// 取引先権限取得
export const usePartnerPermissions = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.partnerPermissions(partnerId),
    queryFn: () => partnerApi.fetchPartnerPermissions(partnerId),
    enabled: !!partnerId,
  })
}

// 取引先ユーザー一覧取得
export const usePartnerUsers = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.partnerUsers(partnerId),
    queryFn: () => partnerApi.fetchPartnerUsers(partnerId),
    enabled: !!partnerId,
  })
}

// アクセスURL一覧取得
export const usePartnerAccessUrls = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.partnerAccessUrls(partnerId),
    queryFn: () => partnerApi.fetchAccessUrls(partnerId),
    enabled: !!partnerId,
  })
}

// 取引先アクティビティ取得
export const usePartnerActivity = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.partnerActivity(partnerId),
    queryFn: () => partnerApi.fetchPartnerActivity(partnerId),
    enabled: !!partnerId,
  })
}

// 取引先分析データ取得
export const usePartnerAnalytics = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.partnerAnalytics(partnerId),
    queryFn: () => partnerApi.fetchPartnerAnalytics(partnerId),
    enabled: !!partnerId,
  })
}

// 統計情報取得
export const usePartnerStatistics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.partnerStatistics,
    queryFn: () => partnerApi.fetchStatistics(),
    staleTime: 10 * 60 * 1000, // 10分
  })
}

// 取引先作成
export const useCreatePartner = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (partner: Omit<BusinessPartner, 'id' | 'createdAt' | 'updatedAt'>) => 
      partnerApi.createPartner(partner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners })
      message.success('取引先を作成しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '取引先の作成に失敗しました')
    },
  })
}

// 取引先更新
export const useUpdatePartner = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, partner }: { partnerId: string; partner: Partial<BusinessPartner> }) => 
      partnerApi.updatePartner(partnerId, partner),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partner(partnerId) })
      message.success('取引先を更新しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '取引先の更新に失敗しました')
    },
  })
}

// 取引先削除
export const useDeletePartner = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (partnerId: string) => partnerApi.deletePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners })
      message.success('取引先を削除しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '取引先の削除に失敗しました')
    },
  })
}

// 権限更新
export const useUpdatePartnerPermissions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, permissions }: { partnerId: string; permissions: Partial<PartnerPermissions> }) => 
      partnerApi.updatePartnerPermissions(partnerId, permissions),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partnerPermissions(partnerId) })
      message.success('権限を更新しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '権限の更新に失敗しました')
    },
  })
}

// アクセスURL生成
export const useGenerateAccessUrl = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, expiresAt }: { partnerId: string; expiresAt?: string }) => 
      partnerApi.generateAccessUrl(partnerId, expiresAt),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partnerAccessUrls(partnerId) })
      message.success('アクセスURLを生成しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'アクセスURLの生成に失敗しました')
    },
  })
}

// アクセスURL無効化
export const useRevokeAccessUrl = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, urlId }: { partnerId: string; urlId: string }) => 
      partnerApi.revokeAccessUrl(partnerId, urlId),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partnerAccessUrls(partnerId) })
      message.success('アクセスURLを無効化しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'アクセスURLの無効化に失敗しました')
    },
  })
}

// 取引先ユーザー作成
export const useCreatePartnerUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, user }: { partnerId: string; user: Omit<PartnerUser, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'> }) => 
      partnerApi.createPartnerUser(partnerId, user),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partnerUsers(partnerId) })
      message.success('ユーザーを作成しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'ユーザーの作成に失敗しました')
    },
  })
}

// 取引先ユーザー更新
export const useUpdatePartnerUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, userId, user }: { partnerId: string; userId: string; user: Partial<PartnerUser> }) => 
      partnerApi.updatePartnerUser(partnerId, userId, user),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partnerUsers(partnerId) })
      message.success('ユーザーを更新しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'ユーザーの更新に失敗しました')
    },
  })
}

// 取引先ユーザー削除
export const useDeletePartnerUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ partnerId, userId }: { partnerId: string; userId: string }) => 
      partnerApi.deletePartnerUser(partnerId, userId),
    onSuccess: (_, { partnerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partnerUsers(partnerId) })
      message.success('ユーザーを削除しました')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'ユーザーの削除に失敗しました')
    },
  })
}

// パスワードリセット
export const useResetPartnerUserPassword = () => {
  return useMutation({
    mutationFn: ({ partnerId, userId }: { partnerId: string; userId: string }) => 
      partnerApi.resetUserPassword(partnerId, userId),
    onSuccess: (data) => {
      message.success(`仮パスワードを生成しました: ${data.temporaryPassword}`)
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'パスワードのリセットに失敗しました')
    },
  })
}