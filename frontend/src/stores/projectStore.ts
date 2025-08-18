import { create } from 'zustand';
import { projectAPI, Project, Assignment, TimelineData, ProjectFilters, UtilizationData } from '../api/projects/projectApi';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  assignments: Assignment[];
  timeline: TimelineData[] | null;
  utilization: UtilizationData[] | null;
  viewMode: 'kanban' | 'list' | 'calendar';
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  
  // Assignment management
  fetchAssignments: (projectId: string) => Promise<void>;
  assignEngineer: (projectId: string, engineerId: string, data: any) => Promise<void>;
  updateAssignment: (projectId: string, assignmentId: string, data: Partial<Assignment>) => Promise<void>;
  removeAssignment: (projectId: string, assignmentId: string) => Promise<void>;
  
  // Timeline and utilization
  fetchTimeline: () => Promise<void>;
  fetchUtilization: () => Promise<void>;
  fetchProjectTimeline: (projectId: string) => Promise<void>;
  extendProject: (projectId: string, newEndDate: string) => Promise<void>;
  
  // View management
  setViewMode: (mode: 'kanban' | 'list' | 'calendar') => void;
  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  upcomingProjects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/engineers/me/projects');
      
      const projects = response.data;
      const currentProject = projects.find((p: Project) => 
        p.status === 'ongoing' && !p.endDate
      );
      const upcomingProjects = projects.filter((p: Project) => 
        p.status === 'upcoming'
      );
      
      set({
        projects,
        currentProject,
        upcomingProjects,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'プロジェクトの取得に失敗しました',
      });
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/projects/${id}`);
      
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? response.data : p
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'プロジェクトの取得に失敗しました',
      });
    }
  },

  addProject: async (project: Omit<Project, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/engineers/me/projects', project);
      
      set((state) => ({
        projects: [...state.projects, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'プロジェクトの追加に失敗しました',
      });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/engineers/me/projects/${id}`, data);
      
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? response.data : p
        ),
        currentProject: state.currentProject?.id === id 
          ? response.data 
          : state.currentProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'プロジェクトの更新に失敗しました',
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/engineers/me/projects/${id}`);
      
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id 
          ? null 
          : state.currentProject,
        upcomingProjects: state.upcomingProjects.filter(p => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'プロジェクトの削除に失敗しました',
      });
      throw error;
    }
  },

  setCurrentProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.patch(`/api/engineers/me/projects/${projectId}/current`);
      
      const project = get().projects.find(p => p.id === projectId);
      
      set({
        currentProject: project || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '現在のプロジェクト設定に失敗しました',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useProjectStore };