// ダッシュボード関連の型定義

export type KPIData = {
  totalEngineers: number;
  activeEngineers: number;
  waitingEngineers: number;
  monthlyRevenue: number;
  acceptanceRate: number;
};

export type ApproachStats = {
  current: number;
  previous: number;
  growth: number;
};

export type Activity = {
  type: 'approach' | 'project' | 'notification';
  title: string;
  status: string;
  createdAt: Date;
};

export type DashboardData = {
  kpi: KPIData;
  approaches: ApproachStats;
  recentActivities: Activity[];
};

export type EngineerStatistics = {
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  upcomingEngineers: Array<{
    id: string;
    name: string;
    startDate: Date;
    projectName: string;
  }>;
  skillDistribution: Array<{
    skillName: string;
    count: number;
  }>;
};

export type ApproachStatistics = {
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    total: number;
    accepted: number;
  }>;
  topClients: Array<{
    clientName: string;
    count: number;
  }>;
};