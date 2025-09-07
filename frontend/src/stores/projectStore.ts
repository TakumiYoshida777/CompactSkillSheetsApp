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
  assignEngineer: (projectId: string, engineerId: string, data: { startDate: string; endDate?: string; role?: string }) => Promise<void>;
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
  selectedProject: null,
  assignments: [],
  timeline: null,
  utilization: null,
  viewMode: 'kanban',
  isLoading: false,
  error: null,

  fetchProjects: async (filters?: ProjectFilters) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectAPI.fetchProjects(filters);
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトの取得に失敗しました',
      });
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.fetchProjectById(id);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? project : p),
        selectedProject: project,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトの取得に失敗しました',
      });
    }
  },

  createProject: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.createProject(data);
      set((state) => ({
        projects: [...state.projects, project],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトの作成に失敗しました',
      });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.updateProject(id, data);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? project : p),
        selectedProject: state.selectedProject?.id === id ? project : state.selectedProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトの更新に失敗しました',
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectAPI.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトの削除に失敗しました',
      });
      throw error;
    }
  },

  updateProjectStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.updateProjectStatus(id, status);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? project : p),
        selectedProject: state.selectedProject?.id === id ? project : state.selectedProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトステータスの更新に失敗しました',
      });
      throw error;
    }
  },

  fetchAssignments: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const assignments = await projectAPI.fetchAssignments(projectId);
      set({ assignments, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アサインメントの取得に失敗しました',
      });
    }
  },

  assignEngineer: async (projectId: string, engineerId: string, data: { startDate: string; endDate?: string; role?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await projectAPI.createAssignment(projectId, {
        ...data,
        projectId,
        engineerId,
      });
      set((state) => ({
        assignments: [...state.assignments, assignment],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'エンジニアのアサインに失敗しました',
      });
      throw error;
    }
  },

  updateAssignment: async (projectId: string, assignmentId: string, data: Partial<Assignment>) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await projectAPI.updateAssignment(projectId, assignmentId, data);
      set((state) => ({
        assignments: state.assignments.map(a => a.id === assignmentId ? assignment : a),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アサインメントの更新に失敗しました',
      });
      throw error;
    }
  },

  removeAssignment: async (projectId: string, assignmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectAPI.deleteAssignment(projectId, assignmentId);
      set((state) => ({
        assignments: state.assignments.filter(a => a.id !== assignmentId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'アサインメントの削除に失敗しました',
      });
      throw error;
    }
  },

  fetchTimeline: async () => {
    set({ isLoading: true, error: null });
    try {
      const timeline = await projectAPI.fetchTimeline();
      set({ timeline, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'タイムラインの取得に失敗しました',
      });
    }
  },

  fetchUtilization: async () => {
    set({ isLoading: true, error: null });
    try {
      const utilization = await projectAPI.fetchUtilization();
      set({ utilization, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || '稼働率の取得に失敗しました',
      });
    }
  },

  fetchProjectTimeline: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const timeline = await projectAPI.fetchProjectTimeline(projectId);
      set((state) => ({
        timeline: [timeline],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトタイムラインの取得に失敗しました',
      });
    }
  },

  extendProject: async (projectId: string, newEndDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectAPI.extendProject(projectId, newEndDate);
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? project : p),
        selectedProject: state.selectedProject?.id === projectId ? project : state.selectedProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'プロジェクトの延長に失敗しました',
      });
      throw error;
    }
  },

  setViewMode: (mode: 'kanban' | 'list' | 'calendar') => set({ viewMode: mode }),
  setSelectedProject: (project: Project | null) => set({ selectedProject: project }),
  clearError: () => set({ error: null }),
}));

export { useProjectStore };