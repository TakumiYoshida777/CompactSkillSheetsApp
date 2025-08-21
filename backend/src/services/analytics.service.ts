import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const prisma = new PrismaClient();

class AnalyticsService {
  // ダッシュボードデータ取得
  async getDashboardData(companyId: string) {
    // company-1のような形式から数値部分を抽出
    const numericId = companyId.includes('-') ? companyId.split('-').pop() : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // エンジニア総数
    const totalEngineers = await prisma.engineer.count({
      where: { companyId: companyIdBigInt }
    });

    // 稼働中エンジニア数
    const activeEngineers = await prisma.engineer.count({
      where: {
        companyId: companyIdBigInt,
        engineerProjects: {
          some: {
            endDate: {
              gte: now
            }
          }
        }
      }
    });

    // 待機中エンジニア数
    const waitingEngineers = totalEngineers - activeEngineers;

    // 今月のアプローチ数
    const currentMonthApproaches = await prisma.approach.count({
      where: {
        fromCompanyId: companyIdBigInt,
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    // 先月のアプローチ数
    const lastMonthApproaches = await prisma.approach.count({
      where: {
        fromCompanyId: companyIdBigInt,
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    });

    // アプローチ成約率
    const totalApproaches = await prisma.approach.count({
      where: {
        fromCompanyId: companyIdBigInt
      }
    });

    const acceptedApproaches = await prisma.approach.count({
      where: {
        fromCompanyId: companyIdBigInt,
        status: 'REPLIED'
      }
    });

    const acceptanceRate = totalApproaches > 0 
      ? Math.round((acceptedApproaches / totalApproaches) * 100) 
      : 0;

    // 今月の売上予測（仮計算）
    const monthlyRevenue = activeEngineers * 600000; // 平均60万円/月と仮定

    return {
      kpi: {
        totalEngineers,
        activeEngineers,
        waitingEngineers,
        monthlyRevenue,
        acceptanceRate
      },
      approaches: {
        current: currentMonthApproaches,
        previous: lastMonthApproaches,
        growth: lastMonthApproaches > 0 
          ? Math.round(((currentMonthApproaches - lastMonthApproaches) / lastMonthApproaches) * 100)
          : 0
      },
      recentActivities: await this.getRecentActivities(companyIdBigInt)
    };
  }

  // エンジニア統計取得
  async getEngineerStatistics(companyId: string) {
    // company-1のような形式から数値部分を抽出
    const numericId = companyId.includes('-') ? companyId.split('-').pop() : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    const now = new Date();

    // ステータス別エンジニア数
    const statusCounts = await prisma.engineer.groupBy({
      by: ['currentStatus'],
      where: { companyId: companyIdBigInt },
      _count: true
    });

    // 稼働予定エンジニア（次の30日以内）
    const upcomingEngineers = await prisma.engineer.findMany({
      where: {
        companyId: companyIdBigInt,
        engineerProjects: {
          some: {
            startDate: {
              gte: now,
              lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      },
      include: {
        engineerProjects: {
          where: {
            startDate: {
              gte: now
            }
          },
          orderBy: {
            startDate: 'asc'
          },
          take: 1
        }
      },
      take: 5
    });

    // スキル別エンジニア数
    const skillDistribution = await prisma.engineerSkills.groupBy({
      by: ['skillId'],
      where: {
        engineer: {
          companyId: companyIdBigInt
        }
      },
      _count: true,
      orderBy: {
        _count: {
          skillId: 'desc'
        }
      },
      take: 10
    });

    // スキル情報を取得
    const skillIds = skillDistribution.map(s => s.skillId);
    const skills = await prisma.skillMaster.findMany({
      where: {
        id: {
          in: skillIds
        }
      }
    });

    const skillMap = new Map(skills.map(s => [s.id, s.name]));
    const skillStats = skillDistribution.map(s => ({
      skillName: skillMap.get(s.skillId) || '不明',
      count: s._count
    }));

    return {
      statusDistribution: statusCounts.map(s => ({
        status: s.currentStatus,
        count: s._count
      })),
      upcomingEngineers: upcomingEngineers.map(e => ({
        id: e.id,
        name: e.name,
        startDate: e.engineerProjects[0]?.startDate,
        projectName: e.engineerProjects[0]?.projectName
      })),
      skillDistribution: skillStats
    };
  }

  // アプローチ統計取得
  async getApproachStatistics(companyId: string) {
    // company-1のような形式から数値部分を抽出
    const numericId = companyId.includes('-') ? companyId.split('-').pop() : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ステータス別アプローチ数
    const statusCounts = await prisma.approach.groupBy({
      by: ['status'],
      where: {
        fromCompanyId: companyIdBigInt
      },
      _count: true
    });

    // 最近30日間のアプローチ推移
    const recentApproaches = await prisma.approach.findMany({
      where: {
        fromCompanyId: companyIdBigInt,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // 日別集計
    const dailyStats = new Map<string, { total: number; accepted: number }>();
    recentApproaches.forEach(approach => {
      const dateKey = approach.createdAt.toISOString().split('T')[0];
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { total: 0, accepted: 0 });
      }
      const stats = dailyStats.get(dateKey)!;
      stats.total++;
      if (approach.status === 'REPLIED') {
        stats.accepted++;
      }
    });

    // 配列に変換してソート
    const dailyTrend = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        total: stats.total,
        accepted: stats.accepted
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 取引先別アプローチ数
    const clientStats = await prisma.approach.groupBy({
      by: ['toCompanyId'],
      where: {
        fromCompanyId: companyIdBigInt
      },
      _count: true,
      orderBy: {
        _count: {
          toCompanyId: 'desc'
        }
      },
      take: 5
    });

    // 取引先情報を取得
    const clientIds = clientStats.map(c => c.toCompanyId).filter(id => id != null);
    const clients = await prisma.company.findMany({
      where: {
        id: {
          in: clientIds as BigInt[]
        }
      }
    });

    const clientMap = new Map(clients.map(c => [c.id.toString(), c.name]));
    const topClients = clientStats.map(c => ({
      clientName: c.toCompanyId ? (clientMap.get(c.toCompanyId.toString()) || '不明') : '不明',
      count: c._count
    }));

    return {
      statusDistribution: statusCounts.map(s => ({
        status: s.status,
        count: s._count
      })),
      dailyTrend,
      topClients
    };
  }

  // 最近のアクティビティ取得
  private async getRecentActivities(companyId: bigint) {
    const activities = [];

    // 最新のアプローチ
    const recentApproaches = await prisma.approach.findMany({
      where: {
        fromCompanyId: companyId
      },
      include: {
        toCompany: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    recentApproaches.forEach(approach => {
      activities.push({
        type: 'approach',
        title: `${approach.toCompany?.name || 'フリーランス'}へのアプローチ`,
        status: approach.status,
        createdAt: approach.createdAt
      });
    });

    // 最新のプロジェクト
    const recentProjects = await prisma.engineerProject.findMany({
      where: {
        engineer: {
          companyId: companyId
        }
      },
      include: {
        engineer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    recentProjects.forEach(project => {
      activities.push({
        type: 'project',
        title: `${project.engineer.name}のプロジェクト: ${project.projectName}`,
        status: 'active',
        createdAt: project.createdAt
      });
    });

    // 時系列でソートして返す
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }
}

export const analyticsService = new AnalyticsService();