import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as offerApi from '../api/client/offerApi';
import { OfferStatus } from '../stores/offerStore';

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
    staleTime: 30000,
  });
};

export const useOfferBoard = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.offerBoard],
    queryFn: offerApi.getOfferBoard,
    staleTime: 60000,
  });
};

export const useAvailableEngineers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.availableEngineers],
    queryFn: offerApi.getAvailableEngineers,
    staleTime: 60000,
  });
};

export const useEngineerDetails = (engineerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.engineerDetails(engineerId),
    queryFn: () => offerApi.getEngineerDetails(engineerId),
    enabled: !!engineerId,
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
    staleTime: 300000,
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
      message.error(error.response?.data?.message || 'オファー送信に失敗しました');
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