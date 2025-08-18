import type { Engineer } from '../components/EngineerSearch/EngineerSearchTable';

export interface FilterOptions {
  searchText?: string;
  status?: string;
  skills?: string[];
  experienceRange?: [number, number];
  ageRange?: [number, number];
  rateRange?: [number, number];
  showCompanyColumn?: boolean;
  roleFilters?: Array<{ role: string; minYears: number }>;
  taskFilters?: string[];
}

/**
 * エンジニアリストをフィルタリング条件に基づいてフィルタリング
 * @param engineers エンジニアのリスト
 * @param options フィルタリングオプション
 * @returns フィルタリングされたエンジニアのリスト
 */
export function filterEngineers(
  engineers: Engineer[],
  options: FilterOptions
): Engineer[] {
  let filtered = [...engineers];

  // テキスト検索（名前、スキル）
  if (options.searchText) {
    const searchLower = options.searchText.toLowerCase();
    filtered = filtered.filter(engineer => {
      const nameMatch = engineer.name.toLowerCase().includes(searchLower);
      const skillMatch = engineer.skills?.some(skill => 
        skill.toLowerCase().includes(searchLower)
      );
      return nameMatch || skillMatch;
    });
  }

  // ステータスフィルター
  if (options.status && options.status !== 'all') {
    filtered = filtered.filter(engineer => engineer.status === options.status);
  }

  // スキルフィルター（OR条件）
  if (options.skills && options.skills.length > 0) {
    filtered = filtered.filter(engineer => {
      if (!engineer.skills) return false;
      return options.skills!.some(skill => 
        engineer.skills?.includes(skill)
      );
    });
  }

  // 経験年数フィルター
  if (options.experienceRange) {
    const [min, max] = options.experienceRange;
    filtered = filtered.filter(engineer => 
      engineer.experience >= min && engineer.experience <= max
    );
  }

  // 年齢フィルター
  if (options.ageRange) {
    const [min, max] = options.ageRange;
    filtered = filtered.filter(engineer => 
      engineer.age >= min && engineer.age <= max
    );
  }

  // 単価フィルター（企業カラム表示時のみ）
  if (options.showCompanyColumn && options.rateRange) {
    const [min, max] = options.rateRange;
    filtered = filtered.filter(engineer => {
      if (!engineer.rate) return false;
      // 範囲が重なる場合を含む
      return engineer.rate.max >= min && engineer.rate.min <= max;
    });
  }

  // ロール経験フィルター（AND条件）
  if (options.roleFilters && options.roleFilters.length > 0) {
    filtered = filtered.filter(engineer => {
      if (!engineer.roleExperiences) return false;
      
      return options.roleFilters!.every(filter => {
        return engineer.roleExperiences?.some(exp => {
          const roleMatch = exp.role.toLowerCase() === filter.role.toLowerCase();
          const yearsMatch = exp.years >= filter.minYears;
          return roleMatch && yearsMatch;
        });
      });
    });
  }

  // 業務経験フィルター（AND条件）
  if (options.taskFilters && options.taskFilters.length > 0) {
    filtered = filtered.filter(engineer => {
      if (!engineer.workExperiences) return false;
      
      return options.taskFilters!.every(taskFilter => {
        return engineer.workExperiences?.some(exp => 
          exp.task.includes(taskFilter)
        );
      });
    });
  }

  return filtered;
}

/**
 * エンジニアリストをソート
 * @param engineers エンジニアのリスト
 * @param sortField ソートフィールド
 * @param sortOrder ソート順序
 * @returns ソートされたエンジニアのリスト
 */
export function sortEngineers(
  engineers: Engineer[],
  sortField: string,
  sortOrder: 'ascend' | 'descend'
): Engineer[] {
  const sorted = [...engineers];
  
  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'age':
        aValue = a.age;
        bValue = b.age;
        break;
      case 'experience':
        aValue = a.experience;
        bValue = b.experience;
        break;
      case 'availableDate':
        aValue = new Date(a.availableDate).getTime();
        bValue = new Date(b.availableDate).getTime();
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sortOrder === 'ascend' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'ascend' ? 1 : -1;
    }
    return 0;
  });
  
  return sorted;
}

/**
 * エンジニアリストから統計情報を計算
 * @param engineers エンジニアのリスト
 * @returns 統計情報
 */
export function calculateStatistics(engineers: Engineer[]) {
  const totalCount = engineers.length;
  const availableCount = engineers.filter(e => e.status === 'available').length;
  const waitingCount = engineers.filter(e => e.status === 'waiting').length;
  const assignedCount = engineers.filter(e => e.status === 'assigned').length;
  
  // SES企業数をカウント
  const companySet = new Set(engineers.map(e => e.companyName).filter(Boolean));
  const companyCount = companySet.size;
  
  // スキル統計
  const skillCount = new Map<string, number>();
  engineers.forEach(engineer => {
    engineer.skills?.forEach(skill => {
      skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
    });
  });
  
  // 平均値計算
  const avgAge = totalCount > 0 
    ? Math.round(engineers.reduce((sum, e) => sum + e.age, 0) / totalCount)
    : 0;
  
  const avgExperience = totalCount > 0
    ? Math.round(engineers.reduce((sum, e) => sum + e.experience, 0) / totalCount)
    : 0;
  
  return {
    totalCount,
    availableCount,
    waitingCount,
    assignedCount,
    companyCount,
    avgAge,
    avgExperience,
    topSkills: Array.from(skillCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count })),
  };
}