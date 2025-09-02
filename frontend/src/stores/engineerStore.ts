import { create } from 'zustand';
import { engineerApi, engineerSearchApi } from '../api/engineers/engineerApi';
import type { 
  Engineer, 
  EngineerFilterParams, 
  EngineerCreateRequest,
  EngineerUpdateRequest,
  BulkStatusUpdateRequest,
  ExportFormat
} from '../types/engineer';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EngineerState {
  // 一覧管理
  engineers: Engineer[];
  selectedEngineer: Engineer | null;
  selectedEngineerIds: string[];
  
  // フィルター・検索
  filters: EngineerFilterParams;
  searchQuery: string;
  savedSearches: any[];
  
  // ページネーション
  pagination: PaginationState;
  
  // 表示モード
  viewMode: 'list' | 'card';
  
  // 状態管理
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Actions - 取得系
  fetchEngineers: (params?: EngineerFilterParams) => Promise<void>;
  fetchEngineerDetail: (id: string) => Promise<void>;
  searchEngineers: (query: string) => Promise<void>;
  
  // Actions - 作成・更新・削除
  createEngineer: (data: EngineerCreateRequest) => Promise<Engineer>;
  updateEngineer: (id: string, data: EngineerUpdateRequest) => Promise<void>;
  deleteEngineer: (id: string) => Promise<void>;
  
  // Actions - ステータス管理
  updateEngineerStatus: (id: string, status: string) => Promise<void>;
  updateAvailability: (id: string, date: string) => Promise<void>;
  togglePublicStatus: (id: string) => Promise<void>;
  
  // Actions - 一括操作
  selectEngineer: (id: string) => void;
  selectMultipleEngineers: (ids: string[]) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: string, availableDate?: string) => Promise<void>;
  bulkDelete: () => Promise<void>;
  
  // Actions - エクスポート
  exportEngineers: (format: ExportFormat) => Promise<void>;
  
  // Actions - フィルター・ページネーション
  setFilters: (filters: EngineerFilterParams) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setViewMode: (mode: 'list' | 'card') => void;
  
  // Actions - 検索条件保存
  saveSearch: (name: string) => Promise<void>;
  loadSavedSearch: (searchId: string) => Promise<void>;
  deleteSavedSearch: (searchId: string) => Promise<void>;
  
  // Actions - その他
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  engineers: [],
  selectedEngineer: null,
  selectedEngineerIds: [],
  filters: {},
  searchQuery: '',
  savedSearches: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  viewMode: 'list' as const,
  isLoading: false,
  isUpdating: false,
  error: null,
};

const useEngineerStore = create<EngineerState>((set, get) => ({
  ...initialState,

  // 取得系
  fetchEngineers: async (params?: EngineerFilterParams) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = params || get().filters;
      const response = await engineerApi.fetchList({
        ...currentFilters,
        page: get().pagination.page,
        limit: get().pagination.limit,
      });
      
      set({
        engineers: response.data,
        pagination: response.meta.pagination,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'エンジニア一覧の取得に失敗しました',
      });
    }
  },

  fetchEngineerDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const engineer = await engineerApi.fetchDetail(id);
      set({
        selectedEngineer: engineer,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'エンジニア詳細の取得に失敗しました',
      });
    }
  },

  searchEngineers: async (query: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const response = await engineerSearchApi.search({
        query,
        ...get().filters,
      });
      
      set({
        engineers: response.data,
        pagination: response.meta.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '検索に失敗しました',
      });
    }
  },

  // 作成・更新・削除
  createEngineer: async (data: EngineerCreateRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const engineer = await engineerApi.create(data);
      set((state) => ({
        engineers: [engineer, ...state.engineers],
        isUpdating: false,
      }));
      return engineer;
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || 'エンジニアの作成に失敗しました',
      });
      throw error;
    }
  },

  updateEngineer: async (id: string, data: EngineerUpdateRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedEngineer = await engineerApi.update(id, data);
      set((state) => ({
        engineers: state.engineers.map(eng => 
          eng.id === id ? updatedEngineer : eng
        ),
        selectedEngineer: state.selectedEngineer?.id === id 
          ? updatedEngineer 
          : state.selectedEngineer,
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '更新に失敗しました',
      });
      throw error;
    }
  },

  deleteEngineer: async (id: string) => {
    set({ isUpdating: true, error: null });
    try {
      await engineerApi.delete(id);
      set((state) => ({
        engineers: state.engineers.filter(eng => eng.id !== id),
        selectedEngineer: state.selectedEngineer?.id === id 
          ? null 
          : state.selectedEngineer,
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '削除に失敗しました',
      });
      throw error;
    }
  },

  // ステータス管理
  updateEngineerStatus: async (id: string, status: string) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedEngineer = await engineerApi.updateStatus(id, status);
      set((state) => ({
        engineers: state.engineers.map(eng => 
          eng.id === id ? updatedEngineer : eng
        ),
        selectedEngineer: state.selectedEngineer?.id === id 
          ? updatedEngineer 
          : state.selectedEngineer,
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || 'ステータス更新に失敗しました',
      });
      throw error;
    }
  },

  updateAvailability: async (id: string, date: string) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedEngineer = await engineerApi.updateAvailability(id, date);
      set((state) => ({
        engineers: state.engineers.map(eng => 
          eng.id === id ? updatedEngineer : eng
        ),
        selectedEngineer: state.selectedEngineer?.id === id 
          ? updatedEngineer 
          : state.selectedEngineer,
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '稼働可能時期の更新に失敗しました',
      });
      throw error;
    }
  },

  togglePublicStatus: async (id: string) => {
    const engineer = get().engineers.find(e => e.id === id);
    if (!engineer) return;

    set({ isUpdating: true, error: null });
    try {
      const updatedEngineer = await engineerApi.updatePublicStatus(id, !engineer.isPublic);
      set((state) => ({
        engineers: state.engineers.map(eng => 
          eng.id === id ? updatedEngineer : eng
        ),
        selectedEngineer: state.selectedEngineer?.id === id 
          ? updatedEngineer 
          : state.selectedEngineer,
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '公開設定の更新に失敗しました',
      });
      throw error;
    }
  },

  // 一括操作
  selectEngineer: (id: string) => {
    set((state) => ({
      selectedEngineerIds: state.selectedEngineerIds.includes(id)
        ? state.selectedEngineerIds.filter(eId => eId !== id)
        : [...state.selectedEngineerIds, id],
    }));
  },

  selectMultipleEngineers: (ids: string[]) => {
    set({ selectedEngineerIds: ids });
  },

  clearSelection: () => {
    set({ selectedEngineerIds: [] });
  },

  bulkUpdateStatus: async (status: string, availableDate?: string) => {
    const { selectedEngineerIds } = get();
    if (selectedEngineerIds.length === 0) return;

    set({ isUpdating: true, error: null });
    try {
      await engineerApi.bulkUpdateStatus({
        engineerIds: selectedEngineerIds,
        status: status as any,
        availableDate,
      });
      
      // 一覧を再取得
      await get().fetchEngineers();
      set({ selectedEngineerIds: [], isUpdating: false });
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '一括ステータス更新に失敗しました',
      });
      throw error;
    }
  },

  bulkDelete: async () => {
    const { selectedEngineerIds } = get();
    if (selectedEngineerIds.length === 0) return;

    set({ isUpdating: true, error: null });
    try {
      await engineerApi.bulkDelete(selectedEngineerIds);
      
      set((state) => ({
        engineers: state.engineers.filter(
          eng => !selectedEngineerIds.includes(eng.id)
        ),
        selectedEngineerIds: [],
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '一括削除に失敗しました',
      });
      throw error;
    }
  },

  // エクスポート
  exportEngineers: async (format: ExportFormat) => {
    set({ isLoading: true, error: null });
    try {
      const blob = await engineerApi.export(format, get().filters);
      
      // ダウンロード処理
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engineers_${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'エクスポートに失敗しました',
      });
    }
  },

  // フィルター・ページネーション
  setFilters: (filters: EngineerFilterParams) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
    get().fetchEngineers(filters);
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchEngineers();
  },

  setLimit: (limit: number) => {
    set((state) => ({
      pagination: { ...state.pagination, limit, page: 1 },
    }));
    get().fetchEngineers();
  },

  setViewMode: (mode: 'list' | 'card') => {
    set({ viewMode: mode });
  },

  // 検索条件保存
  saveSearch: async (name: string) => {
    set({ isUpdating: true, error: null });
    try {
      const savedSearch = await engineerSearchApi.saveSearch(name, get().filters);
      set((state) => ({
        savedSearches: [...state.savedSearches, savedSearch],
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '検索条件の保存に失敗しました',
      });
      throw error;
    }
  },

  loadSavedSearch: async (searchId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await engineerSearchApi.executeSavedSearch(searchId);
      set({
        engineers: result.data,
        pagination: result.meta.pagination,
        filters: result.filters,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '保存済み検索の読み込みに失敗しました',
      });
    }
  },

  deleteSavedSearch: async (searchId: string) => {
    set({ isUpdating: true, error: null });
    try {
      await engineerSearchApi.deleteSavedSearch(searchId);
      set((state) => ({
        savedSearches: state.savedSearches.filter(s => s.id !== searchId),
        isUpdating: false,
      }));
    } catch (error) {
      set({
        isUpdating: false,
        error: error.response?.data?.message || '保存済み検索の削除に失敗しました',
      });
      throw error;
    }
  },

  // その他
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));

export { useEngineerStore };