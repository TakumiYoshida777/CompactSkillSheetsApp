import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { engineerApi } from '../api/engineers/engineerApi';
import type { EngineerFilterParams } from '../types/engineer';

/**
 * エンジニア一覧を取得するカスタムフック
 */
export const useEngineers = (filters: EngineerFilterParams) => {
  return useQuery({
    queryKey: ['engineers', filters],
    queryFn: async () => {
      console.log('[useEngineers] Fetching with filters:', filters);
      try {
        const result = await engineerApi.fetchList(filters);
        console.log('[useEngineers] Fetch success:', result);
        return result;
      } catch (error) {
        console.error('[useEngineers] Fetch error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
  });
};

/**
 * エンジニア詳細を取得するカスタムフック
 */
export const useEngineer = (engineerId: string, enabled = true) => {
  return useQuery({
    queryKey: ['engineer', engineerId],
    queryFn: () => engineerApi.fetchDetail(engineerId),
    enabled: enabled && !!engineerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * エンジニアを作成するカスタムフック
 */
export const useCreateEngineer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => engineerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      message.success('エンジニアを登録しました');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'エンジニアの登録に失敗しました');
    },
  });
};

/**
 * エンジニアを更新するカスタムフック
 */
export const useUpdateEngineer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      engineerApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      queryClient.invalidateQueries({ queryKey: ['engineer', variables.id] });
      message.success('エンジニア情報を更新しました');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'エンジニア情報の更新に失敗しました');
    },
  });
};

/**
 * エンジニアを削除するカスタムフック
 */
export const useDeleteEngineer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => engineerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      message.success('エンジニアを削除しました');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'エンジニアの削除に失敗しました');
    },
  });
};

/**
 * エンジニアのステータスを更新するカスタムフック
 */
export const useUpdateEngineerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      engineerApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      queryClient.invalidateQueries({ queryKey: ['engineer', variables.id] });
      message.success('ステータスを更新しました');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'ステータスの更新に失敗しました');
    },
  });
};

/**
 * 一括エクスポート用のカスタムフック
 */
export const useBulkExport = () => {
  return useMutation({
    mutationFn: ({ engineerIds, format }: { engineerIds: string[]; format: string }) => 
      engineerApi.bulkExport(engineerIds, format),
    onSuccess: () => {
      message.success('エクスポートを開始しました');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'エクスポートに失敗しました');
    },
  });
};