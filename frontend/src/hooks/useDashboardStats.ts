import { useState, useEffect } from 'react';
import { getDashboardStats, calculatePercentage } from '../mocks/dashboardData';
import type { DashboardStats } from '../mocks/dashboardData';

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  engineerActivePercent: number;
  engineerWaitingPercent: number;
  engineerWaitingScheduledPercent: number;
}

/**
 * ダッシュボードの統計データを取得するカスタムフック
 */
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // パーセンテージ計算
  const engineerActivePercent = stats 
    ? calculatePercentage(stats.engineers.active, stats.engineers.total)
    : 0;
  
  const engineerWaitingPercent = stats
    ? calculatePercentage(stats.engineers.waiting, stats.engineers.total)
    : 0;
  
  const engineerWaitingScheduledPercent = stats
    ? calculatePercentage(stats.engineers.waitingScheduled, stats.engineers.total)
    : 0;

  return {
    stats,
    loading,
    error,
    engineerActivePercent,
    engineerWaitingPercent,
    engineerWaitingScheduledPercent,
  };
};