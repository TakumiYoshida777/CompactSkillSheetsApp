import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { businessPartnerService } from '../services/businessPartnerService';
import type { 
  BusinessPartner,
  BusinessPartnerListResponse,
  BusinessPartnerDetailResponse,
  BusinessPartnerSearchParams,
  CreateBusinessPartnerDto,
  UpdateBusinessPartnerDto,
  ClientUser,
  CreateClientUserDto,
  UpdateClientUserDto,
  AccessPermission,
  UpdateAccessPermissionDto,
  NGListEngineer,
  AddNGListDto
} from '../services/businessPartnerTypes';

interface BusinessPartnerState {
  // 状態
  partners: BusinessPartner[];
  currentPartner: BusinessPartnerDetailResponse | null;
  clientUsers: ClientUser[];
  accessPermission: AccessPermission | null;
  ngList: NGListEngineer[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  
  // 検索条件
  searchParams: BusinessPartnerSearchParams;
  
  // アクション - 取引先企業
  fetchBusinessPartners: (params?: BusinessPartnerSearchParams) => Promise<void>;
  fetchBusinessPartner: (partnerId: string) => Promise<void>;
  createBusinessPartner: (data: CreateBusinessPartnerDto) => Promise<BusinessPartner>;
  updateBusinessPartner: (partnerId: string, data: UpdateBusinessPartnerDto) => Promise<void>;
  deleteBusinessPartner: (partnerId: string) => Promise<void>;
  
  // アクション - 取引先ユーザー
  fetchClientUsers: (partnerId: string) => Promise<void>;
  createClientUser: (partnerId: string, data: Omit<CreateClientUserDto, 'businessPartnerId'>) => Promise<void>;
  updateClientUser: (partnerId: string, userId: string, data: UpdateClientUserDto) => Promise<void>;
  deleteClientUser: (partnerId: string, userId: string) => Promise<void>;
  resetClientUserPassword: (partnerId: string, userId: string, newPassword: string) => Promise<void>;
  
  // アクション - アクセス権限
  fetchAccessPermissions: (partnerId: string) => Promise<void>;
  updateAccessPermissions: (partnerId: string, data: UpdateAccessPermissionDto) => Promise<void>;
  updateAllowedEngineers: (partnerId: string, engineerIds: string[]) => Promise<void>;
  
  // アクション - NGリスト
  fetchNGList: (partnerId: string) => Promise<void>;
  addToNGList: (partnerId: string, data: AddNGListDto) => Promise<void>;
  removeFromNGList: (partnerId: string, engineerId: string) => Promise<void>;
  
  // アクション - URL管理
  generateAccessUrl: (partnerId: string) => Promise<{ url: string; expiresAt: string }>;
  updateAccessUrl: (partnerId: string) => Promise<{ url: string; expiresAt: string }>;
  
  // アクション - 分析
  fetchActivityLog: (partnerId: string) => Promise<any[]>;
  fetchAnalytics: (partnerId: string) => Promise<any>;
  fetchEngagement: (partnerId: string) => Promise<any>;
  
  // ユーティリティ
  setSearchParams: (params: BusinessPartnerSearchParams) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  partners: [],
  currentPartner: null,
  clientUsers: [],
  accessPermission: null,
  ngList: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
  searchParams: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
  },
};

export const useBusinessPartnerStore = create<BusinessPartnerState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 取引先企業一覧取得
      fetchBusinessPartners: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const searchParams = params || get().searchParams;
          const response = await businessPartnerService.getBusinessPartners(searchParams);
          set({
            partners: response.partners,
            total: response.total,
            page: response.page,
            limit: response.limit,
            searchParams,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先企業一覧の取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先企業詳細取得
      fetchBusinessPartner: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await businessPartnerService.getBusinessPartner(partnerId);
          set({
            currentPartner: response,
            clientUsers: response.users,
            accessPermission: response.permissions,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先企業詳細の取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先企業作成
      createBusinessPartner: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const partner = await businessPartnerService.createBusinessPartner(data);
          set((state) => ({
            partners: [partner, ...state.partners],
            isLoading: false,
          }));
          return partner;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先企業の作成に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先企業更新
      updateBusinessPartner: async (partnerId, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPartner = await businessPartnerService.updateBusinessPartner(partnerId, data);
          set((state) => ({
            partners: state.partners.map(p => 
              p.id === partnerId ? updatedPartner : p
            ),
            currentPartner: state.currentPartner?.partner.id === partnerId
              ? { ...state.currentPartner, partner: updatedPartner }
              : state.currentPartner,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先企業の更新に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先企業削除
      deleteBusinessPartner: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          await businessPartnerService.deleteBusinessPartner(partnerId);
          set((state) => ({
            partners: state.partners.filter(p => p.id !== partnerId),
            currentPartner: state.currentPartner?.partner.id === partnerId 
              ? null 
              : state.currentPartner,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先企業の削除に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先ユーザー一覧取得
      fetchClientUsers: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const users = await businessPartnerService.getClientUsers(partnerId);
          set({
            clientUsers: users,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先ユーザー一覧の取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先ユーザー作成
      createClientUser: async (partnerId, data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await businessPartnerService.createClientUser(partnerId, data);
          set((state) => ({
            clientUsers: [...state.clientUsers, user],
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先ユーザーの作成に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先ユーザー更新
      updateClientUser: async (partnerId, userId, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await businessPartnerService.updateClientUser(partnerId, userId, data);
          set((state) => ({
            clientUsers: state.clientUsers.map(u => 
              u.id === userId ? updatedUser : u
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先ユーザーの更新に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先ユーザー削除
      deleteClientUser: async (partnerId, userId) => {
        set({ isLoading: true, error: null });
        try {
          await businessPartnerService.deleteClientUser(partnerId, userId);
          set((state) => ({
            clientUsers: state.clientUsers.filter(u => u.id !== userId),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '取引先ユーザーの削除に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 取引先ユーザーパスワードリセット
      resetClientUserPassword: async (partnerId, userId, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await businessPartnerService.resetClientUserPassword(partnerId, userId, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'パスワードのリセットに失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // アクセス権限取得
      fetchAccessPermissions: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const permissions = await businessPartnerService.getAccessPermissions(partnerId);
          set({
            accessPermission: permissions,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'アクセス権限の取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // アクセス権限更新
      updateAccessPermissions: async (partnerId, data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPermissions = await businessPartnerService.updateAccessPermissions(partnerId, data);
          set({
            accessPermission: updatedPermissions,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'アクセス権限の更新に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 公開エンジニア設定
      updateAllowedEngineers: async (partnerId, engineerIds) => {
        set({ isLoading: true, error: null });
        try {
          await businessPartnerService.updateAllowedEngineers(partnerId, engineerIds);
          if (get().accessPermission) {
            set((state) => ({
              accessPermission: state.accessPermission 
                ? { ...state.accessPermission, allowedEngineerIds: engineerIds }
                : null,
              isLoading: false,
            }));
          }
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '公開エンジニアの設定に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // NGリスト取得
      fetchNGList: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const ngList = await businessPartnerService.getNGList(partnerId);
          set({
            ngList,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'NGリストの取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // NGリスト追加
      addToNGList: async (partnerId, data) => {
        set({ isLoading: true, error: null });
        try {
          await businessPartnerService.addToNGList(partnerId, data);
          await get().fetchNGList(partnerId);
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'NGリストへの追加に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // NGリスト削除
      removeFromNGList: async (partnerId, engineerId) => {
        set({ isLoading: true, error: null });
        try {
          await businessPartnerService.removeFromNGList(partnerId, engineerId);
          set((state) => ({
            ngList: state.ngList.filter(item => item.engineerId !== engineerId),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'NGリストからの削除に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // アクセスURL生成
      generateAccessUrl: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await businessPartnerService.generateAccessUrl(partnerId);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'アクセスURLの生成に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // アクセスURL更新
      updateAccessUrl: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await businessPartnerService.updateAccessUrl(partnerId);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'アクセスURLの更新に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // アクティビティログ取得
      fetchActivityLog: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const log = await businessPartnerService.getActivityLog(partnerId);
          set({ isLoading: false });
          return log;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'アクティビティログの取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 分析データ取得
      fetchAnalytics: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const analytics = await businessPartnerService.getAnalytics(partnerId);
          set({ isLoading: false });
          return analytics;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || '分析データの取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // エンゲージメント取得
      fetchEngagement: async (partnerId) => {
        set({ isLoading: true, error: null });
        try {
          const engagement = await businessPartnerService.getEngagement(partnerId);
          set({ isLoading: false });
          return engagement;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'エンゲージメントデータの取得に失敗しました',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // 検索条件設定
      setSearchParams: (params) => {
        set({ searchParams: params });
      },
      
      // エラークリア
      clearError: () => {
        set({ error: null });
      },
      
      // リセット
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'business-partner-store',
    }
  )
);