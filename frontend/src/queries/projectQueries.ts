import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI, Project, Assignment, TimelineData, ProjectFilters, UtilizationData } from '../api/projects/projectApi';

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  assignments: (projectId: string) => [...projectKeys.all, 'assignments', projectId] as const,
  timeline: () => [...projectKeys.all, 'timeline'] as const,
  projectTimeline: (projectId: string) => [...projectKeys.all, 'timeline', projectId] as const,
  utilization: () => [...projectKeys.all, 'utilization'] as const,
  calendar: () => [...projectKeys.all, 'calendar'] as const,
  available: (date?: string) => [...projectKeys.all, 'available', date] as const,
};

// プロジェクト一覧取得
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectAPI.fetchProjects(filters),
    staleTime: 2 * 60 * 1000, // 2分
    cacheTime: 5 * 60 * 1000, // 5分
  });
};

// プロジェクト詳細取得
export const useProject = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectAPI.fetchProjectById(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// プロジェクトカレンダー取得
export const useProjectCalendar = () => {
  return useQuery({
    queryKey: projectKeys.calendar(),
    queryFn: () => projectAPI.fetchProjectsForCalendar(),
    staleTime: 5 * 60 * 1000,
  });
};

// アサインメント取得
export const useAssignments = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: projectKeys.assignments(projectId),
    queryFn: () => projectAPI.fetchAssignments(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// タイムライン取得
export const useTimeline = () => {
  return useQuery({
    queryKey: projectKeys.timeline(),
    queryFn: () => projectAPI.fetchTimeline(),
    staleTime: 5 * 60 * 1000,
  });
};

// プロジェクトタイムライン取得
export const useProjectTimeline = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: projectKeys.projectTimeline(projectId),
    queryFn: () => projectAPI.fetchProjectTimeline(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// 稼働率取得
export const useUtilization = () => {
  return useQuery({
    queryKey: projectKeys.utilization(),
    queryFn: () => projectAPI.fetchUtilization(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // 5分ごとに自動更新
  });
};

// 利用可能なエンジニア取得
export const useAvailableEngineers = (date?: string) => {
  return useQuery({
    queryKey: projectKeys.available(date),
    queryFn: () => projectAPI.fetchAvailableEngineers(date),
    staleTime: 2 * 60 * 1000,
  });
};

// プロジェクト作成
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => 
      projectAPI.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries(projectKeys.lists());
      queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
    },
  });
};

// プロジェクト更新
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      projectAPI.updateProject(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries(projectKeys.lists());
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
    },
  });
};

// プロジェクト削除
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => projectAPI.deleteProject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(projectKeys.lists());
      queryClient.removeQueries(projectKeys.detail(id));
    },
  });
};

// プロジェクトステータス更新
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      projectAPI.updateProjectStatus(id, status),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries(projectKeys.lists());
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
    },
  });
};

// アサインメント作成
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Omit<Assignment, 'id'> }) => 
      projectAPI.createAssignment(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(projectKeys.assignments(variables.projectId));
      queryClient.invalidateQueries(projectKeys.timeline());
      queryClient.invalidateQueries(projectKeys.utilization());
    },
  });
};

// アサインメント更新
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, assignmentId, data }: { 
      projectId: string; 
      assignmentId: string; 
      data: Partial<Assignment> 
    }) => projectAPI.updateAssignment(projectId, assignmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(projectKeys.assignments(variables.projectId));
      queryClient.invalidateQueries(projectKeys.timeline());
      queryClient.invalidateQueries(projectKeys.utilization());
    },
  });
};

// アサインメント削除
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, assignmentId }: { projectId: string; assignmentId: string }) => 
      projectAPI.deleteAssignment(projectId, assignmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(projectKeys.assignments(variables.projectId));
      queryClient.invalidateQueries(projectKeys.timeline());
      queryClient.invalidateQueries(projectKeys.utilization());
    },
  });
};

// プロジェクト延長
export const useExtendProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, newEndDate }: { projectId: string; newEndDate: string }) => 
      projectAPI.extendProject(projectId, newEndDate),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries(projectKeys.lists());
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
      queryClient.invalidateQueries(projectKeys.timeline());
    },
  });
};