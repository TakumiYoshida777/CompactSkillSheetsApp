import { describe, test, expect } from 'vitest';
import { filterEngineers, FilterOptions } from '../engineerFilter';
import type { Engineer } from '../../components/EngineerSearch/EngineerSearchTable';

// テスト用のモックエンジニアデータ
const mockEngineers: Engineer[] = [
  {
    key: '1',
    engineerId: 'ENG001',
    name: '田中太郎',
    age: 32,
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    experience: 8,
    status: 'available',
    availableDate: '2024/02/01',
    lastUpdated: '2024/01/10',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    rate: { min: 60, max: 80 },
    companyName: '株式会社テックソリューション',
    roleExperiences: [
      { role: 'PL', years: 3 },
      { role: 'SE', years: 5 },
    ],
    workExperiences: [
      { task: '要件定義', level: 'advanced' },
      { task: '基本設計', level: 'expert' },
    ],
  },
  {
    key: '2',
    engineerId: 'ENG002',
    name: '佐藤花子',
    age: 28,
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    experience: 5,
    status: 'waiting',
    availableDate: '2024/02/15',
    lastUpdated: '2024/01/08',
    email: 'sato@example.com',
    phone: '090-2345-6789',
    rate: { min: 55, max: 70 },
    companyName: '株式会社デジタルイノベーション',
    roleExperiences: [
      { role: 'SE', years: 3 },
      { role: 'PG', years: 5 },
    ],
    workExperiences: [
      { task: '詳細設計', level: 'advanced' },
      { task: '実装', level: 'expert' },
    ],
  },
  {
    key: '3',
    engineerId: 'ENG003',
    name: '鈴木一郎',
    age: 35,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    experience: 10,
    status: 'assigned',
    currentProject: 'ECサイトリニューアル',
    availableDate: '2024/03/01',
    lastUpdated: '2024/01/05',
    email: 'suzuki@example.com',
    phone: '090-3456-7890',
    rate: { min: 70, max: 90 },
    companyName: '株式会社テックソリューション',
    roleExperiences: [
      { role: 'PM', years: 3 },
      { role: 'PL', years: 5 },
      { role: 'SE', years: 10 },
    ],
    workExperiences: [
      { task: '要件定義', level: 'expert' },
      { task: 'プロジェクト管理', level: 'advanced' },
      { task: '基本設計', level: 'expert' },
    ],
  },
];

describe('engineerFilter', () => {
  describe('テキスト検索', () => {
    test('名前で検索できる', () => {
      const options: FilterOptions = {
        searchText: '田中',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('田中太郎');
    });

    test('スキルで検索できる', () => {
      const options: FilterOptions = {
        searchText: 'Python',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('佐藤花子');
    });

    test('大文字小文字を区別しない', () => {
      const options: FilterOptions = {
        searchText: 'react',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('田中太郎');
    });

    test('部分一致で検索できる', () => {
      const options: FilterOptions = {
        searchText: 'Script',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].skills).toContain('TypeScript');
    });
  });

  describe('ステータスフィルター', () => {
    test('稼働可能なエンジニアをフィルタリングできる', () => {
      const options: FilterOptions = {
        status: 'available',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('available');
    });

    test('待機中のエンジニアをフィルタリングできる', () => {
      const options: FilterOptions = {
        status: 'waiting',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('waiting');
    });

    test('allの場合は全エンジニアを返す', () => {
      const options: FilterOptions = {
        status: 'all',
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('スキルフィルター', () => {
    test('単一スキルでフィルタリングできる', () => {
      const options: FilterOptions = {
        skills: ['React'],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].skills).toContain('React');
    });

    test('複数スキルでフィルタリングできる（OR条件）', () => {
      const options: FilterOptions = {
        skills: ['React', 'Python'],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(2);
      expect(result.map(e => e.name)).toContain('田中太郎');
      expect(result.map(e => e.name)).toContain('佐藤花子');
    });

    test('空の配列の場合は全エンジニアを返す', () => {
      const options: FilterOptions = {
        skills: [],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('経験年数フィルター', () => {
    test('経験年数の範囲でフィルタリングできる', () => {
      const options: FilterOptions = {
        experienceRange: [5, 8],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(2);
      expect(result.map(e => e.experience)).toContain(8);
      expect(result.map(e => e.experience)).toContain(5);
    });

    test('最小値のみでフィルタリングできる', () => {
      const options: FilterOptions = {
        experienceRange: [8, 20],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(2);
      expect(result.every(e => e.experience >= 8)).toBe(true);
    });
  });

  describe('年齢フィルター', () => {
    test('年齢の範囲でフィルタリングできる', () => {
      const options: FilterOptions = {
        ageRange: [30, 35],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(2);
      expect(result.map(e => e.age)).toContain(32);
      expect(result.map(e => e.age)).toContain(35);
    });
  });

  describe('単価フィルター', () => {
    test('単価の範囲でフィルタリングできる', () => {
      const options: FilterOptions = {
        rateRange: [60, 80],
        showCompanyColumn: true,
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      // 範囲が重なるエンジニアを取得（60-80の範囲と重なるもの）
      // 田中太郎: 60-80 (完全一致)
      // 佐藤花子: 55-70 (部分的に重なる)
      // 鈴木一郎: 70-90 (部分的に重なる)
      expect(result).toHaveLength(3);
      expect(result.every(e => e.rate && (e.rate.max >= 60 && e.rate.min <= 80))).toBe(true);
    });

    test('showCompanyColumnがfalseの場合は単価フィルターを無視', () => {
      const options: FilterOptions = {
        rateRange: [60, 80],
        showCompanyColumn: false,
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('ロール経験フィルター', () => {
    test('単一ロールでフィルタリングできる', () => {
      const options: FilterOptions = {
        roleFilters: [{ role: 'PM', minYears: 1 }],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('鈴木一郎');
    });

    test('最小経験年数でフィルタリングできる', () => {
      const options: FilterOptions = {
        roleFilters: [{ role: 'PL', minYears: 5 }],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('鈴木一郎');
    });

    test('複数ロールでフィルタリングできる（AND条件）', () => {
      const options: FilterOptions = {
        roleFilters: [
          { role: 'PM', minYears: 3 },
          { role: 'PL', minYears: 5 },
        ],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('鈴木一郎');
    });

    test('ロール経験がないエンジニアは除外される', () => {
      const engineersWithoutRole = [
        { ...mockEngineers[0], roleExperiences: undefined },
      ];
      
      const options: FilterOptions = {
        roleFilters: [{ role: 'PL', minYears: 1 }],
      };
      
      const result = filterEngineers(engineersWithoutRole, options);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('業務経験フィルター', () => {
    test('単一業務でフィルタリングできる', () => {
      const options: FilterOptions = {
        taskFilters: ['要件定義'],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(2);
      expect(result.map(e => e.name)).toContain('田中太郎');
      expect(result.map(e => e.name)).toContain('鈴木一郎');
    });

    test('複数業務でフィルタリングできる（AND条件）', () => {
      const options: FilterOptions = {
        taskFilters: ['要件定義', '基本設計'],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(2);
      expect(result.every(e => 
        e.workExperiences?.some(w => w.task.includes('要件定義')) &&
        e.workExperiences?.some(w => w.task.includes('基本設計'))
      )).toBe(true);
    });

    test('部分一致で検索できる', () => {
      const options: FilterOptions = {
        taskFilters: ['設計'],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(3); // 全員が何かしらの設計経験あり
    });

    test('業務経験がないエンジニアは除外される', () => {
      const engineersWithoutTasks = [
        { ...mockEngineers[0], workExperiences: undefined },
      ];
      
      const options: FilterOptions = {
        taskFilters: ['要件定義'],
      };
      
      const result = filterEngineers(engineersWithoutTasks, options);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('複合フィルター', () => {
    test('複数の条件を組み合わせてフィルタリングできる', () => {
      const options: FilterOptions = {
        searchText: '田中',
        status: 'available',
        skills: ['React'],
        experienceRange: [5, 10],
        roleFilters: [{ role: 'PL', minYears: 2 }],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('田中太郎');
    });

    test('いずれかの条件に合わないと除外される', () => {
      const options: FilterOptions = {
        searchText: '田中',
        status: 'waiting', // 田中太郎はavailable
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(0);
    });

    test('空のフィルターは全エンジニアを返す', () => {
      const options: FilterOptions = {};
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('エッジケース', () => {
    test('空の配列を渡すと空の配列を返す', () => {
      const options: FilterOptions = {
        searchText: '田中',
      };
      
      const result = filterEngineers([], options);
      
      expect(result).toHaveLength(0);
    });

    test('null/undefined値を適切に処理する', () => {
      const engineersWithNull = [
        {
          ...mockEngineers[0],
          skills: undefined as any,
          roleExperiences: null as any,
        },
      ];
      
      const options: FilterOptions = {
        skills: ['React'],
        roleFilters: [{ role: 'PL', minYears: 1 }],
      };
      
      const result = filterEngineers(engineersWithNull, options);
      
      expect(result).toHaveLength(0);
    });

    test('大文字小文字の違いを無視してロールをマッチング', () => {
      const options: FilterOptions = {
        roleFilters: [{ role: 'pm', minYears: 1 }],
      };
      
      const result = filterEngineers(mockEngineers, options);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('鈴木一郎');
    });
  });
});