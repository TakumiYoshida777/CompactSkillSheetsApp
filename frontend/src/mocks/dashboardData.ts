/**
 * ダッシュボード用モックデータ
 * 将来的にAPIから取得するデータの仮実装
 */

export interface DashboardStats {
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

/**
 * ダッシュボードの統計データを取得
 * TODO: 実際のAPI実装後は、このファイルを削除してAPIから取得する
 */
export const /**
 * ダッシュボードの統計データを取得
 * 実際のAPI実装後は、このファイルを削除してAPIから取得する
 */
export function getDashboardStats(): DashboardStats {
  return {
    engineers: {
      total: 42,
      totalChange: 5,
      active: 35,
      waiting: 7,
      waitingScheduled: 3,
    },
    approaches: {
      monthlyCount: 128,
      monthlyChange: 15,
      successRate: 68.5,
    },
    skillSheets: {
      monthlyUpdated: 28,
      needsUpdate: 14,
    },
  }
};

/**
 * パーセンテージ計算
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10; // 小数点1桁まで
};