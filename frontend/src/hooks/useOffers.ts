import { 
  useQuery, 
  useSuspenseQuery,
  useInfiniteQuery,
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { message } from 'antd';
import * as offerApi from '../api/client/offerApi';
import { OfferStatus } from '../stores/offerStore';
import { queryOptions, infiniteQueryOptions } from '../config/queryClient';

const QUERY_KEYS = {
  offers: 'offers',
  offerBoard: 'offerBoard',
  offerHistory: 'offerHistory',
  availableEngineers: 'availableEngineers',
  offerStatistics: 'offerStatistics',
  engineerDetails: (id: string) => ['engineer', id],
  offerDetails: (id: string) => ['offer', id],
};

export const useOffers = (filters?: offerApi.OfferFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.offers, filters],
    queryFn: () => offerApi.getOffers(filters),
    ...queryOptions.search, // 改善されたリトライとキャッシュ設定
  });
};

/**
 * オファー一覧を取得（Suspense版）
 * ローディング状態をSuspenseで管理
 */
export const useOffersSuspense = (filters?: offerApi.OfferFilters) => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.offers, filters],
    queryFn: () => offerApi.getOffers(filters),
    ...queryOptions.search,
  });
};

/**
 * オファー一覧を無限スクロールで取得
 */
export const useInfiniteOffers = (filters?: Omit<offerApi.OfferFilters, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.offers, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      offerApi.getOffers({ ...filters, page: pageParam }),
    ...infiniteQueryOptions,
    getNextPageParam: (lastPage: any) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
  });
};

export const useOfferBoard = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.offerBoard],
    queryFn: offerApi.getOfferBoard,
    ...queryOptions.realtime, // リアルタイム更新が必要なデータ
    refetchInterval: 30000, // 30秒ごとに自動更新
  });
};

/**
 * オファーボードを取得（Suspense版）
 */
export const useOfferBoardSuspense = () => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.offerBoard],
    queryFn: offerApi.getOfferBoard,
    ...queryOptions.realtime,
    refetchInterval: 30000,
  });
};

export const useAvailableEngineers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.availableEngineers],
    queryFn: offerApi.getAvailableEngineers,
    ...queryOptions.user, // ユーザー関連データの設定
  });
};

/**
 * 利用可能なエンジニア一覧を取得（Suspense版）
 */
export const useAvailableEngineersSuspense = () => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.availableEngineers],
    queryFn: offerApi.getAvailableEngineers,
    ...queryOptions.user,
  });
};

export const useEngineerDetails = (engineerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.engineerDetails(engineerId),
    queryFn: () => offerApi.getEngineerDetails(engineerId),
    enabled: !!engineerId,
    ...queryOptions.user,
  });
};

/**
 * エンジニア詳細を取得（Suspense版）
 */
export const useEngineerDetailsSuspense = (engineerId: string) => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.engineerDetails(engineerId),
    queryFn: () => offerApi.getEngineerDetails(engineerId),
    ...queryOptions.user,
  });
};

export const useOfferDetails = (offerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.offerDetails(offerId),
    queryFn: () => offerApi.getOfferById(offerId),
    enabled: !!offerId,
  });
};

export const useOfferHistory = (filters?: offerApi.OfferFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.offerHistory, filters],
    queryFn: () => offerApi.getOfferHistory(filters),
    staleTime: 60000,
  });
};

export const useOfferStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.offerStatistics],
    queryFn: offerApi.getOfferStatistics,
    ...queryOptions.static, // 静的データの設定（長いキャッシュ）
  });
};

/**
 * オファー統計を取得（Suspense版）
 */
export const useOfferStatisticsSuspense = () => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.offerStatistics],
    queryFn: offerApi.getOfferStatistics,
    ...queryOptions.static,
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: offerApi.createOffer,
    onSuccess: (data) => {
      message.success('オファーを送信しました');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.offers] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.offerBoard] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.offerStatistics] });
    },
    onError: (error: any) => {
      // エラーハンドリングはグローバル設定でも行われる
      const errorMessage = error.response?.data?.message || 'オファー送信に失敗しました';
      message.error(errorMessage);
    },
    // 楽観的更新
    onMutate: async (newOffer) => {
      // 現在のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.offers] });
      
      // 現在のデータをスナップショット
      const previousOffers = queryClient.getQueryData([QUERY_KEYS.offers]);
      
      // 楽観的に更新
      queryClient.setQueryData([QUERY_KEYS.offers], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [newOffer, ...old.data],
        };
      });
      
      return { previousOffers };
    },
    // エラー時はロールバック
    onError: (err, newOffer, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData([QUERY_KEYS.offers], context.previousOffers);
      }
    },
  });
};

export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: OfferStatus }) => 
      offerApi.updateOfferStatus(offerId, status),
    onSuccess: (data, variables) => {
      if (variables.status === 'WITHDRAWN') {
        message.success('オファーを撤回しました');
      } else {
        message.success('ステータスを更新しました');
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.offers] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerDetails(variables.offerId) });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'ステータス更新に失敗しました');
    },
  });
};

export const useSendReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: offerApi.sendReminder,
    onSuccess: (_, offerId) => {
      message.success('リマインドメールを送信しました');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.offerDetails(offerId) });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'リマインド送信に失敗しました');
    },
  });
};

export const useBulkAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ offerIds, action }: { offerIds: string[]; action: 'reminder' | 'withdraw' }) =>
      offerApi.bulkAction(offerIds, action),
    onSuccess: (_, variables) => {
      if (variables.action === 'reminder') {
        message.success('選択したオファーにリマインドを送信しました');
      } else {
        message.success('選択したオファーを撤回しました');
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.offers] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '一括操作に失敗しました');
    },
  });
};

export const useSearchEngineers = () => {
  return useMutation({
    mutationFn: offerApi.searchEngineers,
    onError: (error: any) => {
      message.error(error.response?.data?.message || '検索に失敗しました');
    },
  });
};

export const useExportOfferHistory = () => {
  return useMutation({
    mutationFn: (format: 'csv' | 'excel' = 'csv') => offerApi.exportOfferHistory(format),
    onSuccess: (data, format) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offer_history_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('エクスポートが完了しました');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'エクスポートに失敗しました');
    },
  });
};