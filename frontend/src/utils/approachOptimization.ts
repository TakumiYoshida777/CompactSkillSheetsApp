import { Approach, ApproachStatistics, FreelancerData } from '../api/approaches/approachApi';
import { differenceInDays, parseISO, format, getHours, setHours } from 'date-fns';

/**
 * アプローチ最適化関連のビジネスロジック
 */

// 最適送信時間の判定
export interface OptimalSendTime {
  hour: number;
  dayOfWeek: number;
  openRate: number;
  replyRate: number;
  recommendation: string;
}

export const determineOptimalSendTime = (
  statistics: ApproachStatistics
): OptimalSendTime => {
  // デフォルト値（火曜日の10時）
  let optimalHour = 10;
  let optimalDayOfWeek = 2;
  let maxScore = 0;
  
  // 過去のデータから最適な送信時間を分析
  if (statistics && statistics.byPeriod) {
    const timeAnalysis: Map<string, { openRate: number; replyRate: number; count: number }> = new Map();
    
    statistics.byPeriod.forEach(period => {
      const date = parseISO(period.date);
      const hour = getHours(date);
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}-${hour}`;
      
      const existing = timeAnalysis.get(key) || { openRate: 0, replyRate: 0, count: 0 };
      const openRate = period.sent > 0 ? period.opened / period.sent : 0;
      const replyRate = period.opened > 0 ? period.replied / period.opened : 0;
      
      timeAnalysis.set(key, {
        openRate: (existing.openRate * existing.count + openRate) / (existing.count + 1),
        replyRate: (existing.replyRate * existing.count + replyRate) / (existing.count + 1),
        count: existing.count + 1,
      });
    });
    
    // スコアが最も高い時間帯を選択
    timeAnalysis.forEach((stats, key) => {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      const score = stats.openRate * 0.4 + stats.replyRate * 0.6; // 返信率を重視
      
      if (score > maxScore) {
        maxScore = score;
        optimalHour = hour;
        optimalDayOfWeek = dayOfWeek;
      }
    });
  }
  
  // ビジネスアワー内に調整
  if (optimalHour < 9) optimalHour = 9;
  if (optimalHour > 18) optimalHour = 10;
  
  // 週末を避ける
  if (optimalDayOfWeek === 0) optimalDayOfWeek = 1; // 日曜日→月曜日
  if (optimalDayOfWeek === 6) optimalDayOfWeek = 5; // 土曜日→金曜日
  
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const recommendation = `${dayNames[optimalDayOfWeek]}曜日の${optimalHour}時頃の送信が最も効果的です`;
  
  return {
    hour: optimalHour,
    dayOfWeek: optimalDayOfWeek,
    openRate: statistics?.openRate || 0,
    replyRate: statistics?.replyRate || 0,
    recommendation,
  };
};

// 対象エンジニアの自動選択
export interface EngineerSelection {
  engineerId: string;
  engineerName: string;
  score: number;
  reasons: string[];
  isRecommended: boolean;
}

export const selectTargetEngineers = (
  engineers: unknown[],
  criteria: {
    skills?: string[];
    experience?: number;
    status?: string[];
    excludeAssigned?: boolean;
    excludeRecentlyApproached?: boolean;
    recentDays?: number;
  },
  approachHistory: Approach[]
): EngineerSelection[] => {
  const selections: EngineerSelection[] = [];
  
  engineers.forEach(engineer => {
    let score = 0;
    const reasons: string[] = [];
    
    // スキルマッチング
    if (criteria.skills && criteria.skills.length > 0) {
      const matchedSkills = criteria.skills.filter(skill =>
        engineer.skills?.some((es: string) => 
          es.toLowerCase().includes(skill.toLowerCase())
        )
      );
      const skillScore = matchedSkills.length / criteria.skills.length;
      score += skillScore * 40;
      if (skillScore > 0) {
        reasons.push(`スキルマッチ: ${Math.round(skillScore * 100)}%`);
      }
    }
    
    // 経験年数
    if (criteria.experience && engineer.experience) {
      if (engineer.experience >= criteria.experience) {
        score += 20;
        reasons.push(`経験年数: ${engineer.experience}年`);
      }
    }
    
    // ステータス
    if (criteria.status && criteria.status.includes(engineer.currentStatus)) {
      score += 30;
      reasons.push(`ステータス: ${engineer.currentStatus}`);
    }
    
    // 最近アプローチしていない
    if (criteria.excludeRecentlyApproached) {
      const recentDays = criteria.recentDays || 90;
      const recentApproach = approachHistory.find(a => 
        a.targetEngineers?.includes(engineer.id) &&
        differenceInDays(new Date(), parseISO(a.sentAt)) < recentDays
      );
      
      if (!recentApproach) {
        score += 10;
        reasons.push('最近のアプローチなし');
      } else {
        score -= 50; // ペナルティ
        reasons.push(`${differenceInDays(new Date(), parseISO(recentApproach.sentAt))}日前にアプローチ済み`);
      }
    }
    
    selections.push({
      engineerId: engineer.id,
      engineerName: engineer.name,
      score,
      reasons,
      isRecommended: score >= 50,
    });
  });
  
  // スコアでソート
  return selections.sort((a, b) => b.score - a.score);
};

// 重複送信の防止
export const checkDuplicateApproach = (
  targetId: string,
  targetType: 'company' | 'freelancer',
  approachHistory: Approach[],
  minimumIntervalDays: number = 30
): {
  isDuplicate: boolean;
  lastApproachDate?: string;
  daysSinceLastApproach?: number;
  message: string;
} => {
  const recentApproaches = approachHistory.filter(approach => {
    if (targetType === 'company') {
      return approach.toCompanyId === targetId;
    } else {
      return approach.toFreelancerId === targetId;
    }
  });
  
  if (recentApproaches.length === 0) {
    return {
      isDuplicate: false,
      message: 'アプローチ履歴なし',
    };
  }
  
  // 最新のアプローチを取得
  const lastApproach = recentApproaches.sort((a, b) => 
    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )[0];
  
  const daysSinceLastApproach = differenceInDays(new Date(), parseISO(lastApproach.sentAt));
  
  if (daysSinceLastApproach < minimumIntervalDays) {
    return {
      isDuplicate: true,
      lastApproachDate: lastApproach.sentAt,
      daysSinceLastApproach,
      message: `${daysSinceLastApproach}日前にアプローチ済みです。最低${minimumIntervalDays}日間隔を空けてください。`,
    };
  }
  
  return {
    isDuplicate: false,
    lastApproachDate: lastApproach.sentAt,
    daysSinceLastApproach,
    message: `前回のアプローチから${daysSinceLastApproach}日経過しています。`,
  };
};

// 成約率向上のための分析
export interface ConversionAnalysis {
  overallConversionRate: number;
  byTemplate: {
    templateId: string;
    templateName: string;
    conversionRate: number;
    sampleSize: number;
  }[];
  byTimeSlot: {
    hour: number;
    conversionRate: number;
    sampleSize: number;
  }[];
  byDayOfWeek: {
    dayOfWeek: number;
    conversionRate: number;
    sampleSize: number;
  }[];
  recommendations: string[];
}

export const analyzeConversionRate = (
  approaches: Approach[],
  templates: unknown[]
): ConversionAnalysis => {
  const totalApproaches = approaches.length;
  const acceptedApproaches = approaches.filter(a => a.status === 'accepted').length;
  const overallConversionRate = totalApproaches > 0 ? acceptedApproaches / totalApproaches : 0;
  
  // テンプレート別分析
  const byTemplate = templates.map(template => {
    const templateApproaches = approaches.filter(a => a.emailTemplateId === template.id);
    const accepted = templateApproaches.filter(a => a.status === 'accepted').length;
    
    return {
      templateId: template.id,
      templateName: template.name,
      conversionRate: templateApproaches.length > 0 ? accepted / templateApproaches.length : 0,
      sampleSize: templateApproaches.length,
    };
  }).sort((a, b) => b.conversionRate - a.conversionRate);
  
  // 時間帯別分析
  const timeSlotMap = new Map<number, { accepted: number; total: number }>();
  approaches.forEach(approach => {
    const hour = getHours(parseISO(approach.sentAt));
    const existing = timeSlotMap.get(hour) || { accepted: 0, total: 0 };
    existing.total++;
    if (approach.status === 'accepted') existing.accepted++;
    timeSlotMap.set(hour, existing);
  });
  
  const byTimeSlot = Array.from(timeSlotMap.entries()).map(([hour, stats]) => ({
    hour,
    conversionRate: stats.total > 0 ? stats.accepted / stats.total : 0,
    sampleSize: stats.total,
  })).sort((a, b) => b.conversionRate - a.conversionRate);
  
  // 曜日別分析
  const dayOfWeekMap = new Map<number, { accepted: number; total: number }>();
  approaches.forEach(approach => {
    const dayOfWeek = parseISO(approach.sentAt).getDay();
    const existing = dayOfWeekMap.get(dayOfWeek) || { accepted: 0, total: 0 };
    existing.total++;
    if (approach.status === 'accepted') existing.accepted++;
    dayOfWeekMap.set(dayOfWeek, existing);
  });
  
  const byDayOfWeek = Array.from(dayOfWeekMap.entries()).map(([dayOfWeek, stats]) => ({
    dayOfWeek,
    conversionRate: stats.total > 0 ? stats.accepted / stats.total : 0,
    sampleSize: stats.total,
  })).sort((a, b) => b.conversionRate - a.conversionRate);
  
  // 推奨事項の生成
  const recommendations: string[] = [];
  
  if (byTemplate.length > 0 && byTemplate[0].sampleSize >= 10) {
    recommendations.push(`「${byTemplate[0].templateName}」テンプレートが最も効果的です（成約率${Math.round(byTemplate[0].conversionRate * 100)}%）`);
  }
  
  if (byTimeSlot.length > 0 && byTimeSlot[0].sampleSize >= 5) {
    recommendations.push(`${byTimeSlot[0].hour}時台の送信が最も効果的です（成約率${Math.round(byTimeSlot[0].conversionRate * 100)}%）`);
  }
  
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  if (byDayOfWeek.length > 0 && byDayOfWeek[0].sampleSize >= 5) {
    recommendations.push(`${dayNames[byDayOfWeek[0].dayOfWeek]}曜日の送信が最も効果的です（成約率${Math.round(byDayOfWeek[0].conversionRate * 100)}%）`);
  }
  
  if (overallConversionRate < 0.1) {
    recommendations.push('成約率が低いため、アプローチ内容やターゲティングの見直しを推奨します');
  }
  
  return {
    overallConversionRate,
    byTemplate,
    byTimeSlot,
    byDayOfWeek,
    recommendations,
  };
};

// フリーランスアプローチ制限チェック
export const checkFreelanceApproachLimit = (
  freelancerId: string,
  approachHistory: Approach[],
  limitDays: number = 90
): {
  canApproach: boolean;
  lastApproachDate?: string;
  daysUntilNextApproach?: number;
  message: string;
} => {
  const freelanceApproaches = approachHistory.filter(a => 
    a.toFreelancerId === freelancerId
  ).sort((a, b) => 
    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
  
  if (freelanceApproaches.length === 0) {
    return {
      canApproach: true,
      message: 'アプローチ可能です',
    };
  }
  
  const lastApproach = freelanceApproaches[0];
  const daysSinceLastApproach = differenceInDays(new Date(), parseISO(lastApproach.sentAt));
  
  if (daysSinceLastApproach < limitDays) {
    const daysUntilNextApproach = limitDays - daysSinceLastApproach;
    return {
      canApproach: false,
      lastApproachDate: lastApproach.sentAt,
      daysUntilNextApproach,
      message: `前回のアプローチから${daysSinceLastApproach}日しか経過していません。あと${daysUntilNextApproach}日お待ちください。`,
    };
  }
  
  return {
    canApproach: true,
    lastApproachDate: lastApproach.sentAt,
    message: `前回のアプローチから${daysSinceLastApproach}日経過しています。アプローチ可能です。`,
  };
};

// アプローチ効果スコア算出
export const calculateApproachEffectivenessScore = (
  approach: Approach
): number => {
  let score = 0;
  
  // ステータスによるスコア
  switch (approach.status) {
    case 'accepted':
      score += 100;
      break;
    case 'replied':
      score += 50;
      break;
    case 'opened':
      score += 20;
      break;
    case 'sent':
      score += 5;
      break;
    case 'rejected':
      score -= 10;
      break;
  }
  
  // 返信速度によるボーナス
  if (approach.repliedAt && approach.sentAt) {
    const responseTime = differenceInDays(parseISO(approach.repliedAt), parseISO(approach.sentAt));
    if (responseTime <= 1) score += 20;
    else if (responseTime <= 3) score += 10;
    else if (responseTime <= 7) score += 5;
  }
  
  return Math.max(0, score);
};