import { errorLog } from '../utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { offerApi } from '@/api/client/offerApi';
import type { CreateOfferDto, UpdateOfferStatusDto, Offer } from '@/types/offer';

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferDto) => offerApi.createOffer(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offerBoard'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      message.success('オファーを送信しました');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'オファーの送信に失敗しました';
      message.error(errorMessage);
      errorLog('Offer creation error:', error);
    },
  });
};

export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: UpdateOfferStatusDto }) =>
      offerApi.updateOfferStatus(offerId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', variables.offerId] });
      message.success('ステータスを更新しました');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'ステータスの更新に失敗しました';
      message.error(errorMessage);
      errorLog('Status update error:', error);
    },
  });
};

export const useSendReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => offerApi.sendReminder(offerId),
    onSuccess: (data, offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offer', offerId] });
      message.success('リマインドメールを送信しました');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'リマインドメールの送信に失敗しました';
      message.error(errorMessage);
      errorLog('Reminder send error:', error);
    },
  });
};

export const useWithdrawOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => 
      offerApi.updateOfferStatus(offerId, { status: 'withdrawn' }),
    onSuccess: (data, offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', offerId] });
      message.success('オファーを取り下げました');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'オファーの取り下げに失敗しました';
      message.error(errorMessage);
      errorLog('Offer withdrawal error:', error);
    },
  });
};

export const useBulkOfferAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, offerIds }: { action: string; offerIds: string[] }) =>
      offerApi.bulkAction({ action, offerIds }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offerBoard'] });
      message.success('一括操作を実行しました');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '一括操作に失敗しました';
      message.error(errorMessage);
      errorLog('Bulk action error:', error);
    },
  });
};