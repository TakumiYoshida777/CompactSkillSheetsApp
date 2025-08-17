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
export const getDashboardStats = (): Promise<DashboardStats> => {
  // APIレスポンスをシミュレート
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        engineers: {
          total: 120,
          totalChange: 5,
          active: 105,
          waiting: 10,
          waitingScheduled: 5,
        },
        approaches: {
          monthlyCount: 25,
          monthlyChange: 8,
          successRate: 32,
        },
        skillSheets: {
          monthlyUpdated: 45,
          needsUpdate: 12,
        },
      });
    }, 100); // APIレスポンスの遅延をシミュレート
  });
};

/**
 * パーセンテージ計算
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10; // 小数点1桁まで
};