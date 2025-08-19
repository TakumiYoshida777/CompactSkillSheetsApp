import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { dashboardAPI } from '../api/ses/dashboardApi';
import {
  DashboardData,
  EngineerStatistics,
  ApproachStatistics
} from '../types/dashboard';

interface DashboardState {
  // データ
  dashboardData: DashboardData | null;
  engineerStatistics: EngineerStatistics | null;
  approachStatistics: ApproachStatistics | null;
  
  // 状態管理
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // アクション
  fetchDashboardData: () => Promise<void>;
  fetchEngineerStatistics: () => Promise<void>;
  fetchApproachStatistics: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      dashboardData: null,
      engineerStatistics: null,
      approachStatistics: null,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // ダッシュボードデータ取得
      fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await dashboardAPI.getDashboardData();
          set({ 
            dashboardData: data, 
            lastUpdated: new Date(),
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'ダッシュボードデータの取得に失敗しました';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('ダッシュボードデータ取得エラー:', error);
        }
      },

      // エンジニア統計取得
      fetchEngineerStatistics: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await dashboardAPI.getEngineerStatistics();
          set({ 
            engineerStatistics: data, 
            lastUpdated: new Date(),
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'エンジニア統計の取得に失敗しました';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('エンジニア統計取得エラー:', error);
        }
      },

      // アプローチ統計取得
      fetchApproachStatistics: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await dashboardAPI.getApproachStatistics();
          set({ 
            approachStatistics: data, 
            lastUpdated: new Date(),
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'アプローチ統計の取得に失敗しました';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('アプローチ統計取得エラー:', error);
        }
      },

      // 全データ更新
      refreshAllData: async () => {
        const { fetchDashboardData, fetchEngineerStatistics, fetchApproachStatistics } = get();
        
        set({ isLoading: true, error: null });
        
        try {
          await Promise.all([
            fetchDashboardData(),
            fetchEngineerStatistics(),
            fetchApproachStatistics()
          ]);
        } catch (error) {
          console.error('データ更新エラー:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // エラークリア
      clearError: () => {
        set({ error: null });
      },

      // エラー設定
      setError: (error: string) => {
        set({ error });
      }
    }),
    {
      name: 'dashboard-store'
    }
  )
);