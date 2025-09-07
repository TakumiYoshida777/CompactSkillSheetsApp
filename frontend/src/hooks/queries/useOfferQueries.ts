// オファー管理用のTanStack Query hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { offerApi } from '@/api/offerApi'
import type { 
  Offer,
  CreateOfferDto,
  UpdateOfferStatusDto,
  OfferFilter,
  Engineer
} from '@/types/offer'
import type { OfferTemplate, CreateOfferTemplateDto, UpdateOfferTemplateDto } from '@/types/template.types'
import type { EngineerFilter } from '@/types/filter.types'
import { getErrorMessage } from '@/types/error.types'
import { message } from 'antd'

// Query Keys
const QUERY_KEYS = {
  offers: ['offers'] as const,
  offer: (id: string) => ['offers', id] as const,
  availableEngineers: (partnerId?: string) => ['offers', 'available-engineers', partnerId] as const,
  engineerStatus: (id: string) => ['offers', 'engineers', id, 'status'] as const,
  offerBoard: (partnerId?: string) => ['offers', 'board', partnerId] as const,
  offerTemplates: ['offers', 'templates'] as const,
  offerStatistics: (filters?: OfferFilter) => ['offers', 'statistics', filters] as const,
  monthlyStatistics: ['offers', 'statistics', 'monthly'] as const,
  conversionRate: ['offers', 'conversion-rate'] as const,
  offerHistory: (engineerId?: string) => ['offers', 'history', engineerId] as const,
}

// オファー一覧取得
export const useOffers = (filters?: OfferFilter) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.offers, filters],
    queryFn: () => offerApi.fetchOffers(filters),
    staleTime: 3 * 60 * 1000, // 3分
  })
}

// オファー詳細取得
export const useOffer = (offerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.offer(offerId),
    queryFn: () => offerApi.fetchOfferById(offerId),
    enabled: !!offerId,
  })
}

// 利用可能エンジニア一覧取得
export const useAvailableEngineers = (partnerId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.availableEngineers(partnerId),
    queryFn: () => offerApi.fetchAvailableEngineers(partnerId),
    refetchInterval: 60 * 1000, // 1分ごとに更新
    staleTime: 30 * 1000, // 30秒
  })
}

// エンジニアのオファーステータス取得
export const useEngineerOfferStatus = (engineerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.engineerStatus(engineerId),
    queryFn: () => offerApi.fetchEngineerOfferStatus(engineerId),
    enabled: !!engineerId,
  })
}

// オファーボードデータ取得
export const useOfferBoardData = (partnerId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.offerBoard(partnerId),
    queryFn: () => offerApi.fetchOfferBoardData(partnerId),
    refetchInterval: 60 * 1000, // 1分ごとに更新
    staleTime: 30 * 1000, // 30秒
  })
}

// オファーテンプレート一覧取得
export const useOfferTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.offerTemplates,
    queryFn: () => offerApi.fetchOfferTemplates(),
    staleTime: 10 * 60 * 1000, // 10分
  })
}

// オファー統計取得
export const useOfferStatistics = (filters?: OfferFilter) => {
  return useQuery({
    queryKey: QUERY_KEYS.offerStatistics(filters),
    queryFn: () => offerApi.fetchStatistics(filters),
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// 月次統計取得
export const useMonthlyStatistics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.monthlyStatistics,
    queryFn: () => offerApi.fetchMonthlyStatistics(),
    staleTime: 10 * 60 * 1000, // 10分
  })
}

// 成約率取得
export const useConversionRate = () => {
  return useQuery({
    queryKey: QUERY_KEYS.conversionRate,
    queryFn: () => offerApi.fetchConversionRate(),
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// オファー履歴取得
export const useOfferHistory = (engineerId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.offerHistory(engineerId),
    queryFn: () => offerApi.fetchOfferHistory(engineerId),
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// オファー作成
export const useCreateOffer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (offer: CreateOfferDto) => offerApi.createOffer(offer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offers })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availableEngineers() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerBoard() })
      message.success('オファーを送信しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// 一括オファー作成
export const useBulkCreateOffers = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (offers: CreateOfferDto[]) => offerApi.bulkCreateOffers(offers),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offers })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availableEngineers() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerBoard() })
      message.success(`${data.length}件のオファーを送信しました`)
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// オファーステータス更新
export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ offerId, statusUpdate }: { offerId: string; statusUpdate: UpdateOfferStatusDto }) => 
      offerApi.updateOfferStatus(offerId, statusUpdate),
    onSuccess: (_, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offers })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offer(offerId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerBoard() })
      message.success('ステータスを更新しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// オファー削除
export const useDeleteOffer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (offerId: string) => offerApi.deleteOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offers })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerBoard() })
      message.success('オファーを削除しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// リマインダー送信
export const useSendReminder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (offerId: string) => offerApi.sendReminder(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offer(offerId) })
      message.success('リマインダーを送信しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// オファー撤回
export const useWithdrawOffer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason?: string }) => 
      offerApi.withdrawOffer(offerId, reason),
    onSuccess: (_, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offers })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offer(offerId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerBoard() })
      message.success('オファーを撤回しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// エンジニアフィルタリング
export const useFilterEngineers = () => {
  return useMutation({
    mutationFn: (filters: EngineerFilter) => offerApi.filterEngineers(filters),
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// テンプレート作成
export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (template: CreateOfferTemplateDto) => offerApi.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerTemplates })
      message.success('テンプレートを作成しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// テンプレート更新
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ templateId, template }: { templateId: string; template: UpdateOfferTemplateDto }) => 
      offerApi.updateTemplate(templateId, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerTemplates })
      message.success('テンプレートを更新しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// テンプレート削除
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (templateId: string) => offerApi.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerTemplates })
      message.success('テンプレートを削除しました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// レポート生成
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (params: { type: string; format: 'pdf' | 'excel'; dateRange?: { start: string; end: string } }) => 
      offerApi.generateReport(params),
    onSuccess: () => {
      message.success('レポートを生成しています')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// レポートエクスポート
export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: 'pdf' | 'excel' }) => 
      offerApi.exportReport(reportId, format),
    onSuccess: (blob, { format }) => {
      // ダウンロード処理
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('レポートをダウンロードしました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// オファー履歴エクスポート
export const useExportOfferHistory = () => {
  return useMutation({
    mutationFn: (format: 'csv' | 'excel') => offerApi.exportOfferHistory(format),
    onSuccess: (blob, format) => {
      // ダウンロード処理
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `offer_history.${format === 'excel' ? 'xlsx' : 'csv'}`
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('オファー履歴をダウンロードしました')
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}

// オファー履歴検索
export const useSearchOfferHistory = () => {
  return useMutation({
    mutationFn: (searchParams: OfferFilter) => offerApi.searchOfferHistory(searchParams),
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })
}