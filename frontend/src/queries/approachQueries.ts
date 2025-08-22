import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Query Keys
export const approachKeys = {
  all: ['approaches'] as const,
  lists: () => [...approachKeys.all, 'list'] as const,
  list: (filters?: ApproachFilters) => [...approachKeys.lists(), filters] as const,
  details: () => [...approachKeys.all, 'detail'] as const,
  detail: (id: string) => [...approachKeys.details(), id] as const,
  statistics: (period?: { from: string; to: string }) => [...approachKeys.all, 'statistics', period] as const,
  templates: () => ['email-templates'] as const,
  periodic: () => ['periodic-approaches'] as const,
  freelancers: (filters?: any) => ['freelancers', filters] as const,
  freelanceHistory: (freelancerId?: string) => ['freelance-history', freelancerId] as const,
};

// アプローチ履歴取得
export const useApproaches = (filters?: ApproachFilters) => {
  return useQuery({
    queryKey: approachKeys.list(filters),
    queryFn: () => approachAPI.fetchApproaches(filters),
    staleTime: 2 * 60 * 1000, // 2分
    cacheTime: 5 * 60 * 1000, // 5分
  });
};

// アプローチ詳細取得
export const useApproach = (approachId: string, enabled = true) => {
  return useQuery({
    queryKey: approachKeys.detail(approachId),
    queryFn: () => approachAPI.fetchApproachById(approachId),
    enabled: enabled && !!approachId,
    staleTime: 2 * 60 * 1000,
  });
};

// アプローチ統計取得
export const useApproachStatistics = (period?: { from: string; to: string }) => {
  return useQuery({
    queryKey: approachKeys.statistics(period),
    queryFn: () => approachAPI.fetchStatistics(period),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // 5分ごとに自動更新
  });
};

// メールテンプレート取得
export const useEmailTemplates = () => {
  return useQuery({
    queryKey: approachKeys.templates(),
    queryFn: () => approachAPI.fetchTemplates(),
    staleTime: 10 * 60 * 1000, // 10分
  });
};

// 定期アプローチ設定取得
export const usePeriodicApproaches = () => {
  return useQuery({
    queryKey: approachKeys.periodic(),
    queryFn: () => approachAPI.fetchPeriodicApproaches(),
    staleTime: 5 * 60 * 1000,
  });
};

// フリーランス一覧取得
export const useFreelancers = (filters?: {
  skills?: string[];
  experience?: number;
  workStyle?: string;
}) => {
  return useQuery({
    queryKey: approachKeys.freelancers(filters),
    queryFn: () => approachAPI.fetchFreelancers(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// フリーランスアプローチ履歴取得
export const useFreelanceApproachHistory = (freelancerId?: string) => {
  return useQuery({
    queryKey: approachKeys.freelanceHistory(freelancerId),
    queryFn: () => approachAPI.fetchFreelanceApproachHistory(freelancerId),
    staleTime: 2 * 60 * 1000,
  });
};

// アプローチ作成
export const useCreateApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Approach, 'id' | 'createdAt' | 'updatedAt'>) => 
      approachAPI.createApproach(data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.lists());
      queryClient.invalidateQueries(approachKeys.statistics());
    },
  });
};

// 一括アプローチ送信
export const useSendBulkApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkApproachData) => approachAPI.sendBulkApproach(data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.lists());
      queryClient.invalidateQueries(approachKeys.statistics());
    },
  });
};

// アプローチ削除
export const useDeleteApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => approachAPI.deleteApproach(id),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.lists());
      queryClient.invalidateQueries(approachKeys.statistics());
    },
  });
};

// メールテンプレート作成
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => 
      approachAPI.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.templates());
    },
  });
};

// メールテンプレート更新
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) => 
      approachAPI.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.templates());
    },
  });
};

// 定期アプローチ作成
export const useCreatePeriodicApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<PeriodicApproach, 'id' | 'createdAt' | 'updatedAt'>) => 
      approachAPI.createPeriodicApproach(data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.periodic());
    },
  });
};

// 定期アプローチ更新
export const useUpdatePeriodicApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PeriodicApproach> }) => 
      approachAPI.updatePeriodicApproach(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.periodic());
    },
  });
};

// 定期アプローチ削除
export const useDeletePeriodicApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => approachAPI.deletePeriodicApproach(id),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.periodic());
    },
  });
};

// 定期アプローチ一時停止/再開
export const usePausePeriodicApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, pause }: { id: string; pause: boolean }) => 
      approachAPI.pausePeriodicApproach(id, pause),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.periodic());
    },
  });
};

// フリーランスアプローチ送信
export const useSendFreelanceApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      freelancerId: string;
      projectDetails: string;
      emailTemplateId?: string;
      customMessage?: string;
    }) => approachAPI.sendFreelanceApproach(data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.lists());
      queryClient.invalidateQueries(approachKeys.freelanceHistory());
      queryClient.invalidateQueries(approachKeys.statistics());
    },
  });
};

// フリーランス一括アプローチ送信
export const useSendBulkFreelanceApproach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      freelancerIds: string[];
      projectDetails: string;
      emailTemplateId?: string;
      customMessage?: string;
    }) => approachAPI.sendBulkFreelanceApproach(data),
    onSuccess: () => {
      queryClient.invalidateQueries(approachKeys.lists());
      queryClient.invalidateQueries(approachKeys.freelanceHistory());
      queryClient.invalidateQueries(approachKeys.statistics());
    },
  });
};