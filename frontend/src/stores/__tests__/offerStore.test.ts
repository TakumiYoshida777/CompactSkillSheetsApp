import { renderHook, act } from '@testing-library/react';
import { useOfferStore } from '../offerStore';

describe('useOfferStore', () => {
  beforeEach(() => {
    useOfferStore.setState({
      selectedEngineers: [],
      filterStatus: ['SENT', 'PENDING', 'OPENED'],
      projectDetails: null,
    });
  });

  describe('エンジニア選択機能', () => {
    it('エンジニアを選択できる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.toggleEngineer('engineer1');
      });

      expect(result.current.selectedEngineers).toContain('engineer1');
    });

    it('選択済みのエンジニアを選択解除できる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.toggleEngineer('engineer1');
        result.current.toggleEngineer('engineer1');
      });

      expect(result.current.selectedEngineers).not.toContain('engineer1');
    });

    it('複数のエンジニアを選択できる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.toggleEngineer('engineer1');
        result.current.toggleEngineer('engineer2');
        result.current.toggleEngineer('engineer3');
      });

      expect(result.current.selectedEngineers).toEqual(['engineer1', 'engineer2', 'engineer3']);
    });

    it('全エンジニアを一括選択できる', () => {
      const { result } = renderHook(() => useOfferStore());
      const engineerIds = ['engineer1', 'engineer2', 'engineer3', 'engineer4'];

      act(() => {
        result.current.selectAllEngineers(engineerIds);
      });

      expect(result.current.selectedEngineers).toEqual(engineerIds);
    });

    it('選択をクリアできる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.selectAllEngineers(['engineer1', 'engineer2']);
        result.current.clearSelection();
      });

      expect(result.current.selectedEngineers).toEqual([]);
    });
  });

  describe('プロジェクト詳細管理', () => {
    it('プロジェクト詳細を設定できる', () => {
      const { result } = renderHook(() => useOfferStore());
      const projectDetails = {
        projectName: 'ECサイトリニューアル',
        projectPeriodStart: '2024-03-01',
        projectPeriodEnd: '2024-12-31',
        requiredSkills: ['React', 'TypeScript', 'Node.js'],
        projectDescription: 'ECサイトのフルリニューアル案件',
        location: '東京都港区',
        rateMin: 600000,
        rateMax: 800000,
        remarks: '長期案件希望',
      };

      act(() => {
        result.current.setProjectDetails(projectDetails);
      });

      expect(result.current.projectDetails).toEqual(projectDetails);
    });

    it('プロジェクト詳細をクリアできる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.setProjectDetails({
          projectName: 'テストプロジェクト',
          projectPeriodStart: '2024-03-01',
          projectPeriodEnd: '2024-12-31',
          requiredSkills: [],
          projectDescription: 'テスト',
        });
        result.current.clearProjectDetails();
      });

      expect(result.current.projectDetails).toBeNull();
    });
  });

  describe('フィルター機能', () => {
    it('ステータスフィルターを設定できる', () => {
      const { result } = renderHook(() => useOfferStore());
      const newFilters = ['ACCEPTED', 'DECLINED'];

      act(() => {
        result.current.setFilterStatus(newFilters);
      });

      expect(result.current.filterStatus).toEqual(newFilters);
    });

    it('ステータスフィルターをトグルできる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.toggleFilterStatus('ACCEPTED');
      });

      expect(result.current.filterStatus).toContain('ACCEPTED');

      act(() => {
        result.current.toggleFilterStatus('SENT');
      });

      expect(result.current.filterStatus).not.toContain('SENT');
    });

    it('すべてのフィルターをクリアできる', () => {
      const { result } = renderHook(() => useOfferStore());

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.filterStatus).toEqual([]);
    });
  });
});