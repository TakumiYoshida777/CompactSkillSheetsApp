import {
  calculateUtilization,
  calculateSkillMatchRate,
  determineWaitingStatus,
  recommendProjectExtension,
  calculateProjectProgress,
  determineProjectStatus,
} from '../../utils/projectLogic';
import { Project, Assignment } from '../../api/projects/projectApi';

describe('Project Logic Utils', () => {
  describe('calculateUtilization', () => {
    it('現在のアサインメントがない場合は0を返す', () => {
      const assignments: Assignment[] = [];
      expect(calculateUtilization(assignments)).toBe(0);
    });

    it('単一のアサインメントの稼働率を正しく計算する', () => {
      const assignments: Assignment[] = [
        {
          id: '1',
          projectId: 'p1',
          engineerId: 'e1',
          role: 'Developer',
          startDate: '2024-01-01',
          isCurrent: true,
          utilization: 80,
        },
      ];
      expect(calculateUtilization(assignments)).toBe(80);
    });

    it('複数のアサインメントの稼働率を合計し、100%を超えない', () => {
      const assignments: Assignment[] = [
        {
          id: '1',
          projectId: 'p1',
          engineerId: 'e1',
          role: 'Developer',
          startDate: '2024-01-01',
          isCurrent: true,
          utilization: 60,
        },
        {
          id: '2',
          projectId: 'p2',
          engineerId: 'e1',
          role: 'Developer',
          startDate: '2024-01-01',
          isCurrent: true,
          utilization: 50,
        },
      ];
      expect(calculateUtilization(assignments)).toBe(100);
    });
  });

  describe('calculateSkillMatchRate', () => {
    it('必要スキルがない場合は100%を返す', () => {
      expect(calculateSkillMatchRate([], ['JavaScript', 'React'])).toBe(100);
    });

    it('エンジニアスキルがない場合は0%を返す', () => {
      expect(calculateSkillMatchRate(['JavaScript', 'React'], [])).toBe(0);
    });

    it('スキルマッチ率を正しく計算する', () => {
      const requiredSkills = ['JavaScript', 'React', 'TypeScript'];
      const engineerSkills = ['JavaScript', 'React', 'Vue'];
      expect(calculateSkillMatchRate(requiredSkills, engineerSkills)).toBe(67);
    });

    it('大文字小文字を区別せずにマッチングする', () => {
      const requiredSkills = ['javascript', 'react'];
      const engineerSkills = ['JavaScript', 'React'];
      expect(calculateSkillMatchRate(requiredSkills, engineerSkills)).toBe(100);
    });
  });

  describe('determineWaitingStatus', () => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nearFutureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    it('完了済みプロジェクトは待機中を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        status: 'completed',
        createdAt: pastDate,
        updatedAt: today,
      };
      expect(determineWaitingStatus(project)).toBe('waiting');
    });

    it('終了日が過ぎている場合は待機中を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: pastDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: today,
      };
      expect(determineWaitingStatus(project)).toBe('waiting');
    });

    it('終了予定が3ヶ月以内の場合は待機予定を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        plannedEndDate: nearFutureDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: today,
      };
      expect(determineWaitingStatus(project)).toBe('waiting_soon');
    });

    it('終了予定が3ヶ月より先の場合は稼働中を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        plannedEndDate: futureDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: today,
      };
      expect(determineWaitingStatus(project)).toBe('working');
    });
  });

  describe('recommendProjectExtension', () => {
    const today = new Date().toISOString().split('T')[0];
    const nearFutureDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    it('終了日が過ぎていてアクティブなアサインメントがある場合は延長を推奨', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: pastDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: today,
      };
      const assignments: Assignment[] = [
        {
          id: '1',
          projectId: '1',
          engineerId: 'e1',
          role: 'Developer',
          startDate: pastDate,
          isCurrent: true,
        },
      ];
      
      const recommendation = recommendProjectExtension(project, assignments);
      expect(recommendation.recommendation).toBe('extend');
      expect(recommendation.hasActiveAssignments).toBe(true);
    });

    it('終了が近くアクティブなアサインメントがある場合は延長を推奨', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: nearFutureDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: today,
      };
      const assignments: Assignment[] = [
        {
          id: '1',
          projectId: '1',
          engineerId: 'e1',
          role: 'Developer',
          startDate: pastDate,
          isCurrent: true,
        },
      ];
      
      const recommendation = recommendProjectExtension(project, assignments);
      expect(recommendation.recommendation).toBe('extend');
      expect(recommendation.daysUntilEnd).toBeLessThanOrEqual(30);
    });
  });

  describe('calculateProjectProgress', () => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    it('プロジェクト開始前は0%を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: futureDate,
        endDate: futureDate,
        status: 'planning',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      expect(calculateProjectProgress(project)).toBe(0);
    });

    it('プロジェクト終了後は100%を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: pastDate,
        status: 'completed',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      expect(calculateProjectProgress(project)).toBe(100);
    });

    it('プロジェクト中間地点で約50%を返す', () => {
      const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate,
        endDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      
      const progress = calculateProjectProgress(project);
      expect(progress).toBeGreaterThan(45);
      expect(progress).toBeLessThan(55);
    });
  });

  describe('determineProjectStatus', () => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    it('終了日が過ぎている場合は完了を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: pastDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      expect(determineProjectStatus(project, [])).toBe('completed');
    });

    it('開始日前の場合は計画中を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: futureDate,
        status: 'planning',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      expect(determineProjectStatus(project, [])).toBe('planning');
    });

    it('アクティブなアサインメントがある場合は進行中を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: futureDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      const assignments: Assignment[] = [
        {
          id: '1',
          projectId: '1',
          engineerId: 'e1',
          role: 'Developer',
          startDate: pastDate,
          isCurrent: true,
        },
      ];
      expect(determineProjectStatus(project, assignments)).toBe('in_progress');
    });

    it('アサインメントがない場合は待機中を返す', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientCompany: 'Test Company',
        startDate: pastDate,
        endDate: futureDate,
        status: 'in_progress',
        createdAt: pastDate,
        updatedAt: pastDate,
      };
      expect(determineProjectStatus(project, [])).toBe('waiting');
    });
  });
});