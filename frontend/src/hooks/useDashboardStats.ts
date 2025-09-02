import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../api/ses/dashboardApi';
import type { DashboardData } from '../types/dashboard';

interface DashboardStats {
  engineers: {
    total: number;
    totalChange: number;
    active: number;
    waiting: number;
    waitingScheduled: number;
  };
  approaches: {
    monthlyCount: number;
    monthlyChange: number;
    successRate: number;
  };
  skillSheets: {
    monthlyUpdated: number;
    needsUpdate: number;
  };
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  engineerActivePercent: number;
  engineerWaitingPercent: number;
  engineerWaitingScheduledPercent: number;
}

/**
 * パーセンテージ計算
 */
const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10; // 小数点1桁まで
};

/**
 * DashboardDataをDashboardStatsに変換
 */
const transformDashboardData = (data: DashboardData): DashboardStats => {
  return {
    engineers: {
      total: data.kpi.totalEngineers,
      totalChange: 0, // APIから取得できない場合は0
      active: data.kpi.activeEngineers,
      waiting: data.kpi.waitingEngineers,
      waitingScheduled: 0, // APIから取得できない場合は0
    },
    approaches: {
      monthlyCount: data.approaches.current,
      monthlyChange: data.approaches.growth,
      successRate: data.kpi.acceptanceRate,
    },
    skillSheets: {
      monthlyUpdated: 0, // APIから別途取得が必要
      needsUpdate: 0, // APIから別途取得が必要
    },
  };
};

/**
 * ダッシュボードの統計データを取得するカスタムフック
 */
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const dashboardData = await dashboardAPI.getDashboardData();
      return transformDashboardData(dashboardData);
    },
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    gcTime: 1000 * 60 * 10, // 10分間キャッシュを保持
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // パーセンテージ計算
  const engineerActivePercent = data
    ? calculatePercentage(data.engineers.active, data.engineers.total)
    : 0;
  
  const engineerWaitingPercent = data
    ? calculatePercentage(data.engineers.waiting, data.engineers.total)
    : 0;
  
  const engineerWaitingScheduledPercent = data
    ? calculatePercentage(data.engineers.waitingScheduled, data.engineers.total)
    : 0;

  return {
    stats: data || null,
    loading: isLoading,
    error: error as Error | null,
    engineerActivePercent,
    engineerWaitingPercent,
    engineerWaitingScheduledPercent,
  };
};