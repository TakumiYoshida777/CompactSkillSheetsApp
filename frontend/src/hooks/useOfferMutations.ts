import { errorLog } from '../utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { offerApi } from '@/api/client/offerApi';
import type { CreateOfferDto, UpdateOfferStatusDto, Offer } from '@/types/offer';
import { getErrorMessage } from '@/types/error.types';

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferDto) => offerApi.createOffer(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offerBoard'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      message.success('オファーを送信しました');
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
      errorLog('Bulk action error:', error);
    },
  });
};