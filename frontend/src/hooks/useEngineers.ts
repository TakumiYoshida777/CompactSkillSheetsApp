import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { engineerApi } from '../api/engineers/engineerApi';
import type { EngineerFilterParams, EngineerCreateRequest, EngineerUpdateRequest } from '../types/engineer';
import { errorLog } from '../utils/logger';
import { getErrorMessage } from '../types/error.types';

/**
 * エンジニア一覧を取得するカスタムフック
 */
export const useEngineers = (filters: EngineerFilterParams) => {
  return useQuery({
    queryKey: ['engineers', filters],
    queryFn: async () => {
      try {
        const result = await engineerApi.fetchList(filters);
        return result;
      } catch (error) {
        errorLog('[useEngineers] Fetch error:', error);
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
    mutationFn: (data: EngineerCreateRequest) => engineerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      message.success('エンジニアを登録しました');
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
    },
  });
};

/**
 * エンジニアを更新するカスタムフック
 */
export const useUpdateEngineer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EngineerUpdateRequest }) => 
      engineerApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      queryClient.invalidateQueries({ queryKey: ['engineer', variables.id] });
      message.success('エンジニア情報を更新しました');
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
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
    onError: (error) => {
      message.error(getErrorMessage(error));
    },
  });
};