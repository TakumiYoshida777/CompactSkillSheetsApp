import { create } from 'zustand';
import { 
  approachAPI, 
  Approach, 
  EmailTemplate, 
  PeriodicApproach, 
  ApproachStatistics, 
  FreelancerData,
  ApproachFilters,
  BulkApproachData 
} from '../api/approaches/approachApi';

interface ApproachState {
  approaches: Approach[];
  templates: EmailTemplate[];
  periodicSettings: PeriodicApproach[];
  statistics: ApproachStatistics | null;
  freelancers: FreelancerData[];
  selectedApproach: Approach | null;
  selectedTemplate: EmailTemplate | null;
  isLoading: boolean;
  error: string | null;

  // Approach management
  fetchApproaches: (filters?: ApproachFilters) => Promise<void>;
  fetchApproachById: (id: string) => Promise<void>;
  createApproach: (data: Omit<Approach, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  sendBulkApproach: (data: BulkApproachData) => Promise<void>;
  deleteApproach: (id: string) => Promise<void>;
  
  // Template management
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<EmailTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  
  // Periodic approach management
  fetchPeriodicApproaches: () => Promise<void>;
  createPeriodicApproach: (data: Omit<PeriodicApproach, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePeriodicApproach: (id: string, data: Partial<PeriodicApproach>) => Promise<void>;
  deletePeriodicApproach: (id: string) => Promise<void>;
  pausePeriodicApproach: (id: string, pause: boolean) => Promise<void>;
  
  // Freelancer management
  fetchFreelancers: (filters?: { skills?: string[]; experience?: number; workStyle?: string }) => Promise<void>;
  sendFreelanceApproach: (data: { freelancerId: string; projectDetails: string; emailTemplateId?: string; customMessage?: string }) => Promise<void>;
  sendBulkFreelanceApproach: (data: { freelancerIds: string[]; projectDetails: string; emailTemplateId?: string; customMessage?: string }) => Promise<void>;
  fetchFreelanceApproachHistory: (freelancerId?: string) => Promise<void>;
  
  // Statistics
  fetchStatistics: (period?: { from: string; to: string }) => Promise<void>;
  
  // UI state management
  setSelectedApproach: (approach: Approach | null) => void;
  setSelectedTemplate: (template: EmailTemplate | null) => void;
  clearError: () => void;
}

const useApproachStore = create<ApproachState>((set) => ({
  approaches: [],
  templates: [],
  periodicSettings: [],
  statistics: null,
  freelancers: [],
  selectedApproach: null,
  selectedTemplate: null,
  isLoading: false,
  error: null,

  fetchApproaches: async (filters?: ApproachFilters) => {
    set({ isLoading: true, error: null });
    try {
      const approaches = await approachAPI.fetchApproaches(filters);
      set({ approaches, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アプローチ履歴の取得に失敗しました',
      });
    }
  },

  fetchApproachById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const approach = await approachAPI.fetchApproachById(id);
      set((state) => ({
        approaches: state.approaches.map(a => a.id === id ? approach : a),
        selectedApproach: approach,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アプローチの取得に失敗しました',
      });
    }
  },

  createApproach: async (data: Omit<Approach, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const approach = await approachAPI.createApproach(data);
      set((state) => ({
        approaches: [approach, ...state.approaches],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アプローチの作成に失敗しました',
      });
      throw error;
    }
  },

  sendBulkApproach: async (data: BulkApproachData) => {
    set({ isLoading: true, error: null });
    try {
      const approaches = await approachAPI.sendBulkApproach(data);
      set((state) => ({
        approaches: [...approaches, ...state.approaches],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '一括アプローチの送信に失敗しました',
      });
      throw error;
    }
  },

  deleteApproach: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await approachAPI.deleteApproach(id);
      set((state) => ({
        approaches: state.approaches.filter(a => a.id !== id),
        selectedApproach: state.selectedApproach?.id === id ? null : state.selectedApproach,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アプローチの削除に失敗しました',
      });
      throw error;
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await approachAPI.fetchTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'テンプレート一覧の取得に失敗しました',
      });
    }
  },

  createTemplate: async (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const template = await approachAPI.createTemplate(data);
      set((state) => ({
        templates: [...state.templates, template],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'テンプレートの作成に失敗しました',
      });
      throw error;
    }
  },

  updateTemplate: async (id: string, templateData: Partial<EmailTemplate>) => {
    set({ isLoading: true, error: null });
    try {
      const template = await approachAPI.updateTemplate(id, templateData);
      set((state) => ({
        templates: state.templates.map(t => t.id === id ? template : t),
        selectedTemplate: state.selectedTemplate?.id === id ? template : state.selectedTemplate,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'テンプレートの更新に失敗しました',
      });
      throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await approachAPI.updateTemplate(id, { isActive: false });
      set((state) => ({
        templates: state.templates.filter(t => t.id !== id),
        selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'テンプレートの削除に失敗しました',
      });
      throw error;
    }
  },

  fetchPeriodicApproaches: async () => {
    set({ isLoading: true, error: null });
    try {
      const periodicSettings = await approachAPI.fetchPeriodicApproaches();
      set({ periodicSettings, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '定期アプローチ設定の取得に失敗しました',
      });
    }
  },

  createPeriodicApproach: async (data: Omit<PeriodicApproach, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const periodicApproach = await approachAPI.createPeriodicApproach(data);
      set((state) => ({
        periodicSettings: [...state.periodicSettings, periodicApproach],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '定期アプローチの作成に失敗しました',
      });
      throw error;
    }
  },

  updatePeriodicApproach: async (id: string, data: Partial<PeriodicApproach>) => {
    set({ isLoading: true, error: null });
    try {
      const periodicApproach = await approachAPI.updatePeriodicApproach(id, data);
      set((state) => ({
        periodicSettings: state.periodicSettings.map(p => p.id === id ? periodicApproach : p),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '定期アプローチの更新に失敗しました',
      });
      throw error;
    }
  },

  deletePeriodicApproach: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await approachAPI.deletePeriodicApproach(id);
      set((state) => ({
        periodicSettings: state.periodicSettings.filter(p => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '定期アプローチの削除に失敗しました',
      });
      throw error;
    }
  },

  pausePeriodicApproach: async (id: string, pause: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const periodicApproach = await approachAPI.pausePeriodicApproach(id, pause);
      set((state) => ({
        periodicSettings: state.periodicSettings.map(p => p.id === id ? periodicApproach : p),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '定期アプローチの一時停止/再開に失敗しました',
      });
      throw error;
    }
  },

  fetchFreelancers: async (filters?: { skills?: string[]; experience?: number; workStyle?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const freelancers = await approachAPI.fetchFreelancers(filters);
      set({ freelancers, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'フリーランス一覧の取得に失敗しました',
      });
    }
  },

  sendFreelanceApproach: async (data: { freelancerId: string; projectDetails: string; emailTemplateId?: string; customMessage?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const approach = await approachAPI.sendFreelanceApproach(data);
      set((state) => ({
        approaches: [approach, ...state.approaches],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'フリーランスアプローチの送信に失敗しました',
      });
      throw error;
    }
  },

  sendBulkFreelanceApproach: async (data: { freelancerIds: string[]; projectDetails: string; emailTemplateId?: string; customMessage?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const approaches = await approachAPI.sendBulkFreelanceApproach(data);
      set((state) => ({
        approaches: [...approaches, ...state.approaches],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'フリーランス一括アプローチの送信に失敗しました',
      });
      throw error;
    }
  },

  fetchFreelanceApproachHistory: async (freelancerId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const approaches = await approachAPI.fetchFreelanceApproachHistory(freelancerId);
      set({ approaches, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'フリーランスアプローチ履歴の取得に失敗しました',
      });
    }
  },

  fetchStatistics: async (period?: { from: string; to: string }) => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await approachAPI.fetchStatistics(period);
      set({ statistics, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アプローチ統計の取得に失敗しました',
      });
    }
  },

  setSelectedApproach: (approach: Approach | null) => set({ selectedApproach: approach }),
  setSelectedTemplate: (template: EmailTemplate | null) => set({ selectedTemplate: template }),
  clearError: () => set({ error: null }),
}));

export { useApproachStore };