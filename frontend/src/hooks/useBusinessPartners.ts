import { 
  useQuery, 
  useSuspenseQuery,
  useInfiniteQuery,
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import { queryOptions, infiniteQueryOptions } from '../config/queryClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// APIクライアント設定
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// リクエストインターセプター（認証トークン追加）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401エラーの場合はトークンをクリア
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// 型定義
interface BusinessPartner {
  id: string;
  clientCompany: {
    name: string;
    email: string;
    phone: string;
  };
  contractType: string;
  contractStartDate: string;
  contractEndDate?: string;
  monthlyFee?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusinessPartnerFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  contractType?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  nextCursor?: string;
  prevCursor?: string;
}

// クエリキー
const QUERY_KEYS = {
  businessPartners: 'businessPartners',
  businessPartner: (id: string) => ['businessPartner', id],
  businessPartnerStats: 'businessPartnerStats',
  engineerPermissions: (partnerId: string) => ['engineerPermissions', partnerId],
  ngList: (partnerId: string) => ['ngList', partnerId],
  viewableEngineers: (partnerId: string) => ['viewableEngineers', partnerId],
};

/**
 * 取引先企業一覧を取得（通常のuseQuery）
 * エラーハンドリングを自分で行いたい場合に使用
 */
export const useBusinessPartners = (filters?: BusinessPartnerFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.businessPartners, filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<BusinessPartner>>(
        '/business-partners',
        { params: filters }
      );
      return data;
    },
    ...queryOptions.search, // 検索用の設定を適用
  });
};

/**
 * 取引先企業一覧を取得（Suspense版）
 * ローディング状態をSuspenseで管理したい場合に使用
 */
export const useBusinessPartnersSuspense = (filters?: BusinessPartnerFilters) => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.businessPartners, filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<BusinessPartner>>(
        '/business-partners',
        { params: filters }
      );
      return data;
    },
    ...queryOptions.search,
  });
};

/**
 * 取引先企業一覧を無限スクロールで取得
 * ページネーションを自動で管理
 */
export const useInfiniteBusinessPartners = (filters?: Omit<BusinessPartnerFilters, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.businessPartners, 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get<PaginatedResponse<BusinessPartner>>(
        '/business-partners',
        { params: { ...filters, page: pageParam } }
      );
      return data;
    },
    ...infiniteQueryOptions,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};

/**
 * 取引先企業詳細を取得（Suspense版）
 */
export const useBusinessPartnerDetail = (id: string) => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.businessPartner(id),
    queryFn: async () => {
      const { data } = await apiClient.get<BusinessPartner>(
        `/business-partners/${id}`
      );
      return data;
    },
    ...queryOptions.user, // ユーザー情報用の設定を適用
  });
};

/**
 * 取引先企業統計を取得
 */
export const useBusinessPartnerStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.businessPartnerStats],
    queryFn: async () => {
      const { data } = await apiClient.get('/business-partners/stats');
      return data;
    },
    ...queryOptions.static, // 静的データ用の設定を適用
  });
};

/**
 * エンジニア表示権限を取得
 */
export const useEngineerPermissions = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.engineerPermissions(partnerId),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/business-partners/${partnerId}/permissions`
      );
      return data;
    },
    enabled: !!partnerId,
    ...queryOptions.user,
  });
};

/**
 * NGリストを取得
 */
export const useNgList = (partnerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ngList(partnerId),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/business-partners/${partnerId}/ng-list`
      );
      return data;
    },
    enabled: !!partnerId,
    ...queryOptions.user,
  });
};

/**
 * 閲覧可能なエンジニア一覧を取得（Suspense版）
 */
export const useViewableEngineersSuspense = (partnerId: string, filters?: any) => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.viewableEngineers(partnerId), filters],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/business-partners/${partnerId}/engineers`,
        { params: filters }
      );
      return data;
    },
    ...queryOptions.search,
  });
};

/**
 * 取引先企業を作成
 */
export const useCreateBusinessPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<BusinessPartner>) => {
      const response = await apiClient.post('/business-partners', data);
      return response.data;
    },
    onSuccess: () => {
      message.success('取引先企業を登録しました');
      // キャッシュを無効化
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.businessPartners] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.businessPartnerStats] 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '取引先企業の登録に失敗しました';
      message.error(errorMessage);
    },
  });
};

/**
 * 取引先企業を更新
 */
export const useUpdateBusinessPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BusinessPartner> }) => {
      const response = await apiClient.put(`/business-partners/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      message.success('取引先企業を更新しました');
      // 個別のキャッシュを更新
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.businessPartner(variables.id) 
      });
      // 一覧のキャッシュも更新
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.businessPartners] 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '取引先企業の更新に失敗しました';
      message.error(errorMessage);
    },
  });
};

/**
 * 取引先企業を削除
 */
export const useDeleteBusinessPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/business-partners/${id}`);
      return response.data;
    },
    onSuccess: () => {
      message.success('取引先企業を削除しました');
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.businessPartners] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.businessPartnerStats] 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '取引先企業の削除に失敗しました';
      message.error(errorMessage);
    },
  });
};

/**
 * エンジニア表示権限を更新
 */
export const useUpdateEngineerPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      partnerId, 
      permissions 
    }: { 
      partnerId: string; 
      permissions: Array<{ engineerId: string; isAllowed: boolean }> 
    }) => {
      const response = await apiClient.put(
        `/business-partners/${partnerId}/permissions`,
        { permissions }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      message.success('エンジニア表示権限を更新しました');
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.engineerPermissions(variables.partnerId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.viewableEngineers(variables.partnerId) 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '権限の更新に失敗しました';
      message.error(errorMessage);
    },
  });
};

/**
 * NGリストを更新
 */
export const useUpdateNgList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      partnerId, 
      engineerIds,
      action
    }: { 
      partnerId: string; 
      engineerIds: string[];
      action: 'add' | 'remove';
    }) => {
      const response = await apiClient.put(
        `/business-partners/${partnerId}/ng-list`,
        { engineerIds, action }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      const actionText = variables.action === 'add' ? '追加' : '削除';
      message.success(`NGリストを${actionText}しました`);
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ngList(variables.partnerId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.viewableEngineers(variables.partnerId) 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'NGリストの更新に失敗しました';
      message.error(errorMessage);
    },
  });
};

/**
 * 取引先企業のステータスを変更
 */
export const useToggleBusinessPartnerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.patch(
        `/business-partners/${id}/status`,
        { isActive }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      const statusText = variables.isActive ? '有効化' : '無効化';
      message.success(`取引先企業を${statusText}しました`);
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.businessPartner(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.businessPartners] 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'ステータスの変更に失敗しました';
      message.error(errorMessage);
    },
    // 楽観的更新を実装
    onMutate: async ({ id, isActive }) => {
      // 現在のキャッシュを取得
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.businessPartner(id) 
      });
      
      const previousData = queryClient.getQueryData(
        QUERY_KEYS.businessPartner(id)
      );
      
      // 楽観的に更新
      queryClient.setQueryData(
        QUERY_KEYS.businessPartner(id),
        (old: any) => ({
          ...old,
          isActive,
        })
      );
      
      return { previousData };
    },
    // エラー時はロールバック
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.businessPartner(variables.id),
          context.previousData
        );
      }
    },
  });
};