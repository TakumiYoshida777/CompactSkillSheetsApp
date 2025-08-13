import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useEngineerStore } from '../engineerStore';

// axios をモック
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('engineerStore', () => {
  beforeEach(() => {
    // 各テストの前にストアをリセット
    useEngineerStore.setState({
      engineerData: null,
      skillSheetCompletion: 0,
      currentProject: null,
      upcomingProjects: [],
      isLoading: false,
      error: null,
    });
    
    // axios のモックをリセット
    vi.clearAllMocks();
  });

  describe('fetchEngineerData', () => {
    it('エンジニアデータの取得に成功する', async () => {
      const mockResponse = {
        data: {
          engineer: {
            id: 1,
            name: 'エンジニア太郎',
            email: 'engineer@example.com',
            currentStatus: 'available',
            skills: ['React', 'TypeScript'],
            isPublic: true,
          },
          skillSheetCompletion: 85,
          currentProject: {
            id: 1,
            name: 'プロジェクトA',
            startDate: '2024-01-01',
            endDate: '2024-06-30',
          },
          upcomingProjects: [
            { id: 2, name: 'プロジェクトB', startDate: '2024-07-01' },
          ],
        },
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const { fetchEngineerData } = useEngineerStore.getState();
      await fetchEngineerData();
      
      const state = useEngineerStore.getState();
      expect(state.engineerData).toEqual(mockResponse.data.engineer);
      expect(state.skillSheetCompletion).toBe(85);
      expect(state.currentProject).toEqual(mockResponse.data.currentProject);
      expect(state.upcomingProjects).toEqual(mockResponse.data.upcomingProjects);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('エンジニアデータの取得に失敗する', async () => {
      const errorMessage = 'データの取得に失敗しました';
      mockedAxios.get.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { fetchEngineerData } = useEngineerStore.getState();
      await fetchEngineerData();
      
      const state = useEngineerStore.getState();
      expect(state.engineerData).toBe(null);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateEngineerData', () => {
    it('エンジニアデータの更新に成功する', async () => {
      const updatedData = {
        name: '更新エンジニア',
        skills: ['React', 'TypeScript', 'Node.js'],
      };
      
      const mockResponse = {
        data: {
          id: 1,
          name: '更新エンジニア',
          email: 'engineer@example.com',
          skills: ['React', 'TypeScript', 'Node.js'],
        },
      };
      
      mockedAxios.put.mockResolvedValue(mockResponse);
      
      const { updateEngineerData } = useEngineerStore.getState();
      await updateEngineerData(updatedData);
      
      const state = useEngineerStore.getState();
      expect(state.engineerData).toEqual(mockResponse.data);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('エンジニアデータの更新に失敗する', async () => {
      const errorMessage = '更新に失敗しました';
      mockedAxios.put.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { updateEngineerData } = useEngineerStore.getState();
      
      await expect(updateEngineerData({ name: 'テスト' })).rejects.toThrow();
      
      const state = useEngineerStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateStatus', () => {
    it('ステータスの更新に成功する', async () => {
      // 初期状態を設定
      useEngineerStore.setState({
        engineerData: {
          id: 1,
          name: 'エンジニア',
          currentStatus: 'available' as any,
          isPublic: true,
        },
      });
      
      mockedAxios.patch.mockResolvedValue({ data: { success: true } });
      
      const { updateStatus } = useEngineerStore.getState();
      await updateStatus('busy', '2024-07-01');
      
      const state = useEngineerStore.getState();
      expect(state.engineerData?.currentStatus).toBe('busy');
      expect(state.engineerData?.availableDate).toBe('2024-07-01');
      expect(state.isLoading).toBe(false);
    });

    it('ステータスの更新に失敗する', async () => {
      const errorMessage = 'ステータス更新に失敗しました';
      mockedAxios.patch.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { updateStatus } = useEngineerStore.getState();
      
      await expect(updateStatus('busy')).rejects.toThrow();
      
      const state = useEngineerStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('togglePublicStatus', () => {
    it('公開ステータスの切り替えに成功する', async () => {
      // 初期状態を設定
      useEngineerStore.setState({
        engineerData: {
          id: 1,
          name: 'エンジニア',
          currentStatus: 'available' as any,
          isPublic: false,
        },
      });
      
      mockedAxios.patch.mockResolvedValue({ data: { success: true } });
      
      const { togglePublicStatus } = useEngineerStore.getState();
      await togglePublicStatus();
      
      const state = useEngineerStore.getState();
      expect(state.engineerData?.isPublic).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('エンジニアデータがない場合は何もしない', async () => {
      const { togglePublicStatus } = useEngineerStore.getState();
      await togglePublicStatus();
      
      expect(mockedAxios.patch).not.toHaveBeenCalled();
    });

    it('公開ステータスの切り替えに失敗する', async () => {
      // 初期状態を設定
      useEngineerStore.setState({
        engineerData: {
          id: 1,
          name: 'エンジニア',
          currentStatus: 'available' as any,
          isPublic: false,
        },
      });
      
      const errorMessage = '公開設定の更新に失敗しました';
      mockedAxios.patch.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { togglePublicStatus } = useEngineerStore.getState();
      
      await expect(togglePublicStatus()).rejects.toThrow();
      
      const state = useEngineerStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('エラーをクリアできる', () => {
      // エラー状態を設定
      useEngineerStore.setState({
        error: 'テストエラー',
      });
      
      const { clearError } = useEngineerStore.getState();
      clearError();
      
      const state = useEngineerStore.getState();
      expect(state.error).toBe(null);
    });
  });
});