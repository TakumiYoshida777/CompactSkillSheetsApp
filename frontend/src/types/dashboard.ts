// ダッシュボード関連の型定義

export interface KPIData {
  totalEngineers: number;
  activeEngineers: number;
  waitingEngineers: number;
  monthlyRevenue: number;
  acceptanceRate: number;
}

export interface ApproachStats {
  current: number;
  previous: number;
  growth: number;
}

export interface Activity {
  type: 'approach' | 'project' | 'notification';
  title: string;
  status: string;
  createdAt: Date;
}

export interface DashboardData {
  kpi: KPIData;
  approaches: ApproachStats;
  recentActivities: Activity[];
}

export interface EngineerStatistics {
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
}

export interface ApproachStatistics {
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
}