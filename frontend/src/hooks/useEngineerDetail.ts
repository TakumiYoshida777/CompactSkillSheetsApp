import { useQuery } from '@tanstack/react-query';
import { engineerApi } from '../api/engineers/engineerApi';
import type { Engineer } from '../types/engineer';

/**
 * エンジニア詳細情報を取得するカスタムフック
 */
export const useEngineerDetail = (engineerId: string | undefined) => {
  return useQuery<Engineer, Error>({
    queryKey: ['engineer', engineerId],
    queryFn: () => {
      if (!engineerId) {
        throw new Error('Engineer ID is required');
      }
      return engineerApi.fetchDetail(engineerId);
    },
    enabled: !!engineerId,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
    gcTime: 10 * 60 * 1000, // 10分間はガベージコレクションしない
  });
};

/**
 * エンジニアのプロジェクト履歴を取得するカスタムフック
 */
export const useEngineerProjects = (engineerId: string | undefined) => {
  return useQuery({
    queryKey: ['engineer', engineerId, 'projects'],
    queryFn: () => {
      if (!engineerId) {
        throw new Error('Engineer ID is required');
      }
      return engineerApi.fetchProjectHistory(engineerId);
    },
    enabled: !!engineerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * エンジニアのアプローチ履歴を取得するカスタムフック
 */
export const useEngineerApproaches = (engineerId: string | undefined) => {
  return useQuery({
    queryKey: ['engineer', engineerId, 'approaches'],
    queryFn: () => {
      if (!engineerId) {
        throw new Error('Engineer ID is required');
      }
      return engineerApi.fetchApproaches(engineerId);
    },
    enabled: !!engineerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};