import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/ses/dashboardApi';
import { useEffect } from 'react';

// クエリキー定義
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  dashboard: () => [...dashboardQueryKeys.all, 'data'] as const,
  engineerStats: () => [...dashboardQueryKeys.all, 'engineer-stats'] as const,
  approachStats: () => [...dashboardQueryKeys.all, 'approach-stats'] as const,
  waitingEngineers: () => [...dashboardQueryKeys.all, 'waiting-engineers'] as const,
  upcomingEngineers: () => [...dashboardQueryKeys.all, 'upcoming-engineers'] as const,
};

// ダッシュボードデータ取得フック
export const useDashboardData = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dashboardQueryKeys.dashboard(),
    queryFn: dashboardAPI.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分（旧cacheTime）
    refetchInterval: 30 * 1000, // 30秒ごとに自動更新
    refetchIntervalInBackground: false,
  });

  // エラー時の再試行設定
  useEffect(() => {
    if (query.isError) {
      const timer = setTimeout(() => {
        query.refetch();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [query.isError]);

  return query;
};

// エンジニア統計取得フック
export const useEngineerStatistics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.engineerStats(),
    queryFn: dashboardAPI.getEngineerStatistics,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// アプローチ統計取得フック
export const useApproachStatistics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.approachStats(),
    queryFn: dashboardAPI.getApproachStatistics,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// 待機中エンジニア一覧取得フック
export const useWaitingEngineers = (limit = 5) => {
  return useQuery({
    queryKey: [...dashboardQueryKeys.waitingEngineers(), limit] as const,
    queryFn: () => dashboardAPI.getWaitingEngineers(limit),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 稼働予定エンジニア一覧取得フック
export const useUpcomingEngineers = (limit = 5) => {
  return useQuery({
    queryKey: [...dashboardQueryKeys.upcomingEngineers(), limit] as const,
    queryFn: () => dashboardAPI.getUpcomingEngineers(limit),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// ダッシュボード全データプリフェッチフック
export const usePrefetchDashboardData = () => {
  const queryClient = useQueryClient();

  const prefetchAll = async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.dashboard(),
        queryFn: dashboardAPI.getDashboardData,
      }),
      queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.engineerStats(),
        queryFn: dashboardAPI.getEngineerStatistics,
      }),
      queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.approachStats(),
        queryFn: dashboardAPI.getApproachStatistics,
      }),
    ]);
  };

  return { prefetchAll };
};

// ダッシュボードデータリフレッシュフック
export const useRefreshDashboardData = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
  };

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard() });
  };

  const refreshStatistics = () => {
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.engineerStats() });
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.approachStats() });
  };

  return { refreshAll, refreshDashboard, refreshStatistics };
};