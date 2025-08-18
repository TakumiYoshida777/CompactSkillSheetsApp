import { Project, Assignment, UtilizationData } from '../api/projects/projectApi';
import { differenceInDays, addDays, format, parseISO, isWithinInterval, isBefore, isAfter } from 'date-fns';

/**
 * プロジェクト管理関連のビジネスロジック
 */

// 稼働率計算
export const calculateUtilization = (assignments: Assignment[]): number => {
  if (!assignments || assignments.length === 0) return 0;
  
  const currentAssignments = assignments.filter(a => a.isCurrent);
  if (currentAssignments.length === 0) return 0;
  
  // 各アサインメントの稼働率を合計（最大100%）
  const totalUtilization = currentAssignments.reduce((sum, assignment) => {
    return sum + (assignment.utilization || 100);
  }, 0);
  
  return Math.min(totalUtilization, 100);
};

// 月次稼働率計算
export const calculateMonthlyUtilization = (
  assignments: Assignment[], 
  targetMonth: Date
): number => {
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
  
  const activeAssignments = assignments.filter(assignment => {
    const startDate = parseISO(assignment.startDate);
    const endDate = assignment.endDate ? parseISO(assignment.endDate) : new Date(9999, 11, 31);
    
    // 対象月に重複する期間があるかチェック
    return !(isAfter(startDate, monthEnd) || isBefore(endDate, monthStart));
  });
  
  return calculateUtilization(activeAssignments);
};

// スキルマッチング率算出
export const calculateSkillMatchRate = (
  requiredSkills: string[],
  engineerSkills: string[]
): number => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!engineerSkills || engineerSkills.length === 0) return 0;
  
  const matchedSkills = requiredSkills.filter(skill => 
    engineerSkills.some(es => es.toLowerCase().includes(skill.toLowerCase()))
  );
  
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
};

// 終了予定日からの待機判定
export const determineWaitingStatus = (project: Project): 'working' | 'waiting_soon' | 'waiting' => {
  if (project.status === 'completed') return 'waiting';
  
  const endDate = project.plannedEndDate || project.endDate;
  if (!endDate) return 'working';
  
  const today = new Date();
  const end = parseISO(endDate);
  const daysUntilEnd = differenceInDays(end, today);
  
  if (daysUntilEnd < 0) return 'waiting';
  if (daysUntilEnd <= 90) return 'waiting_soon'; // 3ヶ月以内
  return 'working';
};

// リソース最適化提案
export interface ResourceOptimization {
  engineerId: string;
  engineerName: string;
  currentUtilization: number;
  availableCapacity: number;
  suggestedProjects: {
    projectId: string;
    projectName: string;
    matchRate: number;
    startDate: string;
    endDate?: string;
  }[];
}

export const suggestResourceOptimization = (
  engineers: any[],
  projects: Project[],
  assignments: Assignment[]
): ResourceOptimization[] => {
  const optimizations: ResourceOptimization[] = [];
  
  engineers.forEach(engineer => {
    const engineerAssignments = assignments.filter(a => a.engineerId === engineer.id);
    const currentUtilization = calculateUtilization(engineerAssignments);
    const availableCapacity = 100 - currentUtilization;
    
    if (availableCapacity > 20) { // 20%以上の余裕がある場合
      const suggestedProjects = projects
        .filter(p => p.status === 'planning' || p.status === 'in_progress')
        .map(project => ({
          projectId: project.id,
          projectName: project.name,
          matchRate: calculateSkillMatchRate(
            project.requiredSkills || [],
            engineer.skills || []
          ),
          startDate: project.startDate,
          endDate: project.endDate,
        }))
        .filter(p => p.matchRate >= 60) // 60%以上のマッチ率
        .sort((a, b) => b.matchRate - a.matchRate)
        .slice(0, 3); // 上位3件
      
      if (suggestedProjects.length > 0) {
        optimizations.push({
          engineerId: engineer.id,
          engineerName: engineer.name,
          currentUtilization,
          availableCapacity,
          suggestedProjects,
        });
      }
    }
  });
  
  return optimizations;
};

// 契約延長判定
export interface ExtensionRecommendation {
  projectId: string;
  projectName: string;
  currentEndDate: string;
  daysUntilEnd: number;
  hasActiveAssignments: boolean;
  recommendation: 'extend' | 'review' | 'complete';
  reason: string;
}

export const recommendProjectExtension = (
  project: Project,
  assignments: Assignment[]
): ExtensionRecommendation => {
  const endDate = project.plannedEndDate || project.endDate;
  if (!endDate) {
    return {
      projectId: project.id,
      projectName: project.name,
      currentEndDate: '',
      daysUntilEnd: -1,
      hasActiveAssignments: false,
      recommendation: 'review',
      reason: '終了日が設定されていません',
    };
  }
  
  const today = new Date();
  const end = parseISO(endDate);
  const daysUntilEnd = differenceInDays(end, today);
  const activeAssignments = assignments.filter(a => 
    a.projectId === project.id && a.isCurrent
  );
  
  let recommendation: 'extend' | 'review' | 'complete';
  let reason: string;
  
  if (daysUntilEnd < 0) {
    recommendation = activeAssignments.length > 0 ? 'extend' : 'complete';
    reason = activeAssignments.length > 0 
      ? `プロジェクトは終了日を過ぎていますが、${activeAssignments.length}名のエンジニアがアサインされています`
      : 'プロジェクトは終了日を過ぎており、アクティブなアサインメントがありません';
  } else if (daysUntilEnd <= 30) {
    recommendation = activeAssignments.length > 0 ? 'extend' : 'review';
    reason = activeAssignments.length > 0
      ? `終了まで${daysUntilEnd}日、${activeAssignments.length}名のエンジニアがアサインされています`
      : `終了まで${daysUntilEnd}日です。延長の必要性を検討してください`;
  } else {
    recommendation = 'review';
    reason = `終了まで${daysUntilEnd}日あります`;
  }
  
  return {
    projectId: project.id,
    projectName: project.name,
    currentEndDate: endDate,
    daysUntilEnd,
    hasActiveAssignments: activeAssignments.length > 0,
    recommendation,
    reason,
  };
};

// プロジェクト期間の重複チェック
export const checkProjectOverlap = (
  project1: { startDate: string; endDate?: string },
  project2: { startDate: string; endDate?: string }
): boolean => {
  const start1 = parseISO(project1.startDate);
  const end1 = project1.endDate ? parseISO(project1.endDate) : new Date(9999, 11, 31);
  const start2 = parseISO(project2.startDate);
  const end2 = project2.endDate ? parseISO(project2.endDate) : new Date(9999, 11, 31);
  
  return !(isAfter(start1, end2) || isBefore(end1, start2));
};

// プロジェクトのステータス自動判定
export const determineProjectStatus = (
  project: Project,
  assignments: Assignment[]
): 'planning' | 'in_progress' | 'waiting' | 'completed' => {
  const today = new Date();
  const startDate = parseISO(project.startDate);
  const endDate = project.endDate ? parseISO(project.endDate) : null;
  
  // 終了日が過ぎている場合
  if (endDate && isBefore(endDate, today)) {
    return 'completed';
  }
  
  // 開始日前の場合
  if (isAfter(startDate, today)) {
    return 'planning';
  }
  
  // アクティブなアサインメントがある場合
  const activeAssignments = assignments.filter(a => 
    a.projectId === project.id && a.isCurrent
  );
  
  if (activeAssignments.length > 0) {
    return 'in_progress';
  }
  
  // アサインメントがない、または全て終了している場合
  return 'waiting';
};

// プロジェクトの進捗率計算
export const calculateProjectProgress = (
  project: Project
): number => {
  const startDate = parseISO(project.startDate);
  const endDate = project.endDate || project.plannedEndDate;
  
  if (!endDate) return 0;
  
  const end = parseISO(endDate);
  const today = new Date();
  
  if (isBefore(today, startDate)) return 0;
  if (isAfter(today, end)) return 100;
  
  const totalDays = differenceInDays(end, startDate);
  const elapsedDays = differenceInDays(today, startDate);
  
  return Math.round((elapsedDays / totalDays) * 100);
};

// 稼働予測
export const predictFutureUtilization = (
  assignments: Assignment[],
  months: number = 6
): { month: string; utilization: number }[] => {
  const predictions: { month: string; utilization: number }[] = [];
  const today = new Date();
  
  for (let i = 0; i < months; i++) {
    const targetMonth = addDays(today, i * 30);
    const utilization = calculateMonthlyUtilization(assignments, targetMonth);
    
    predictions.push({
      month: format(targetMonth, 'yyyy-MM'),
      utilization,
    });
  }
  
  return predictions;
};