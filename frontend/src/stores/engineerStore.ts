import { create } from 'zustand';
import axios from 'axios';

interface EngineerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentStatus: 'working' | 'waiting' | 'waiting_soon';
  availableDate?: string;
  isPublic: boolean;
  githubUrl?: string;
  totalExperience?: number;
}

interface EngineerState {
  engineerData: EngineerData | null;
  skillSheetCompletion: number;
  currentProject: string | null;
  upcomingProjects: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEngineerData: () => Promise<void>;
  updateEngineerData: (data: Partial<EngineerData>) => Promise<void>;
  updateStatus: (status: string, availableDate?: string) => Promise<void>;
  togglePublicStatus: () => Promise<void>;
  clearError: () => void;
}

const useEngineerStore = create<EngineerState>((set, get) => ({
  engineerData: null,
  skillSheetCompletion: 0,
  currentProject: null,
  upcomingProjects: [],
  isLoading: false,
  error: null,

  fetchEngineerData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/engineers/me');
      
      set({
        engineerData: response.data.engineer,
        skillSheetCompletion: response.data.skillSheetCompletion,
        currentProject: response.data.currentProject,
        upcomingProjects: response.data.upcomingProjects,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'データの取得に失敗しました',
      });
    }
  },

  updateEngineerData: async (data: Partial<EngineerData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put('/api/engineers/me', data);
      
      set({
        engineerData: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '更新に失敗しました',
      });
      throw error;
    }
  },

  updateStatus: async (status: string, availableDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.patch('/api/engineers/me/status', {
        currentStatus: status,
        availableDate,
      });
      
      set((state) => ({
        engineerData: state.engineerData ? {
          ...state.engineerData,
          currentStatus: status as any,
          availableDate,
        } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'ステータス更新に失敗しました',
      });
      throw error;
    }
  },

  togglePublicStatus: async () => {
    const currentEngineer = get().engineerData;
    if (!currentEngineer) return;

    set({ isLoading: true, error: null });
    try {
      await axios.patch('/api/engineers/me/public', {
        isPublic: !currentEngineer.isPublic,
      });
      
      set((state) => ({
        engineerData: state.engineerData ? {
          ...state.engineerData,
          isPublic: !state.engineerData.isPublic,
        } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '公開設定の更新に失敗しました',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useEngineerStore };