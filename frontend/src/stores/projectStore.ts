import { create } from 'zustand';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  clientCompany: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  teamSize: number;
  technologies: string[];
  phases: string[];
  description: string;
  achievements?: string;
  industry?: string;
  location?: string;
  responsibilities?: string[];
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  upcomingProjects: Project[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (projectId: string) => Promise<void>;
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
      const response = await axios.patch(`/api/engineers/me/projects/${projectId}/current`);
      
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