import axios from '@/lib/axios';
import type { AxiosResponse } from 'axios';

// 取引先企業の型定義
export interface BusinessPartner {
  id: string;
  companyName: string;
  companyNameKana: string;
  address: string;
  phoneNumber: string;
  email: string;
  websiteUrl?: string;
  establishedDate?: string;
  capitalStock?: number;
  numberOfEmployees?: number;
  businessDescription?: string;
  contractType: 'basic' | 'premium' | 'enterprise';
  contractStartDate: string;
  contractEndDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 取引先ユーザーの型定義
export interface ClientUser {
  id: string;
  businessPartnerId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// アクセス権限の型定義
export interface AccessPermission {
  id: string;
  businessPartnerId: string;
  canViewAllEngineers: boolean;
  canViewWaitingEngineers: boolean;
  canViewAvailableEngineers: boolean;
  engineerDisplayMode: 'all' | 'waiting' | 'available' | 'custom';
  allowedEngineerIds?: string[];
  ngListEngineerIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// NGリストエンジニアの型定義
export interface NGListEngineer {
  engineerId: string;
  engineerName: string;
  reason?: string;
  addedAt: string;
}

// 検索条件の型定義
export interface BusinessPartnerSearchParams {
  keyword?: string;
  contractType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// レスポンスの型定義
export interface BusinessPartnerListResponse {
  partners: BusinessPartner[];
  total: number;
  page: number;
  limit: number;
}

export interface BusinessPartnerDetailResponse {
  partner: BusinessPartner;
  users: ClientUser[];
  permissions: AccessPermission;
}

// リクエストの型定義
export interface CreateBusinessPartnerDto {
  companyName: string;
  companyNameKana: string;
  address: string;
  phoneNumber: string;
  email: string;
  websiteUrl?: string;
  establishedDate?: string;
  capitalStock?: number;
  numberOfEmployees?: number;
  businessDescription?: string;
  contractType: 'basic' | 'premium' | 'enterprise';
  contractStartDate: string;
  contractEndDate?: string;
}

export interface UpdateBusinessPartnerDto extends Partial<CreateBusinessPartnerDto> {
  isActive?: boolean;
}

export interface CreateClientUserDto {
  businessPartnerId: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  role: 'admin' | 'user';
}

export interface UpdateClientUserDto extends Partial<Omit<CreateClientUserDto, 'password' | 'businessPartnerId'>> {
  isActive?: boolean;
}

export interface UpdateAccessPermissionDto {
  canViewAllEngineers?: boolean;
  canViewWaitingEngineers?: boolean;
  canViewAvailableEngineers?: boolean;
  engineerDisplayMode?: 'all' | 'waiting' | 'available' | 'custom';
  allowedEngineerIds?: string[];
}

export interface AddNGListDto {
  engineerId: string;
  reason?: string;
}

// アクティビティログの型定義
export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// 利用分析の型定義
export interface Analytics {
  totalViews: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  topViewedEngineers: Array<{
    engineerId: string;
    engineerName: string;
    viewCount: number;
  }>;
  monthlyStats: Array<{
    month: string;
    views: number;
    users: number;
  }>;
}

// エンゲージメントの型定義
export interface Engagement {
  totalInteractions: number;
  favoriteCount: number;
  inquiryCount: number;
  downloadCount: number;
  lastActiveDate: string;
  engagementScore: number;
}

class BusinessPartnerService {
  private readonly baseUrl = '/api/business-partners';

  /**
   * 取引先企業一覧取得
   */
  async getBusinessPartners(params?: BusinessPartnerSearchParams): Promise<BusinessPartnerListResponse> {
    try {
      const response: AxiosResponse<BusinessPartnerListResponse> = await axios.get(
        this.baseUrl,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('取引先企業一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業詳細取得
   */
  async getBusinessPartner(partnerId: string): Promise<BusinessPartnerDetailResponse> {
    try {
      const response: AxiosResponse<BusinessPartnerDetailResponse> = await axios.get(
        `${this.baseUrl}/${partnerId}`
      );
      return response.data;
    } catch (error) {
      console.error('取引先企業詳細取得エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業新規作成
   */
  async createBusinessPartner(data: CreateBusinessPartnerDto): Promise<BusinessPartner> {
    try {
      const response: AxiosResponse<BusinessPartner> = await axios.post(
        this.baseUrl,
        data
      );
      return response.data;
    } catch (error) {
      console.error('取引先企業作成エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業更新
   */
  async updateBusinessPartner(partnerId: string, data: UpdateBusinessPartnerDto): Promise<BusinessPartner> {
    try {
      const response: AxiosResponse<BusinessPartner> = await axios.put(
        `${this.baseUrl}/${partnerId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('取引先企業更新エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業削除（論理削除）
   */
  async deleteBusinessPartner(partnerId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${partnerId}`);
    } catch (error) {
      console.error('取引先企業削除エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先ユーザー一覧取得
   */
  async getClientUsers(partnerId: string): Promise<ClientUser[]> {
    try {
      const response: AxiosResponse<ClientUser[]> = await axios.get(
        `${this.baseUrl}/${partnerId}/users`
      );
      return response.data;
    } catch (error) {
      console.error('取引先ユーザー一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先ユーザー作成
   */
  async createClientUser(partnerId: string, data: Omit<CreateClientUserDto, 'businessPartnerId'>): Promise<ClientUser> {
    try {
      const response: AxiosResponse<ClientUser> = await axios.post(
        `${this.baseUrl}/${partnerId}/users`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('取引先ユーザー作成エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先ユーザー更新
   */
  async updateClientUser(partnerId: string, userId: string, data: UpdateClientUserDto): Promise<ClientUser> {
    try {
      const response: AxiosResponse<ClientUser> = await axios.put(
        `${this.baseUrl}/${partnerId}/users/${userId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('取引先ユーザー更新エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先ユーザー削除
   */
  async deleteClientUser(partnerId: string, userId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${partnerId}/users/${userId}`);
    } catch (error) {
      console.error('取引先ユーザー削除エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先ユーザーパスワードリセット
   */
  async resetClientUserPassword(partnerId: string, userId: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/${partnerId}/users/${userId}/reset-password`, {
        newPassword
      });
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      throw error;
    }
  }

  /**
   * アクセス権限取得
   */
  async getAccessPermissions(partnerId: string): Promise<AccessPermission> {
    try {
      const response: AxiosResponse<AccessPermission> = await axios.get(
        `${this.baseUrl}/${partnerId}/permissions`
      );
      return response.data;
    } catch (error) {
      console.error('アクセス権限取得エラー:', error);
      throw error;
    }
  }

  /**
   * アクセス権限更新
   */
  async updateAccessPermissions(partnerId: string, data: UpdateAccessPermissionDto): Promise<AccessPermission> {
    try {
      const response: AxiosResponse<AccessPermission> = await axios.put(
        `${this.baseUrl}/${partnerId}/permissions`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('アクセス権限更新エラー:', error);
      throw error;
    }
  }

  /**
   * 公開エンジニア設定
   */
  async updateAllowedEngineers(partnerId: string, engineerIds: string[]): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/${partnerId}/engineers`,
        { engineerIds }
      );
    } catch (error) {
      console.error('公開エンジニア設定エラー:', error);
      throw error;
    }
  }

  /**
   * NGリスト取得
   */
  async getNGList(partnerId: string): Promise<NGListEngineer[]> {
    try {
      const response: AxiosResponse<NGListEngineer[]> = await axios.get(
        `${this.baseUrl}/${partnerId}/ng-list`
      );
      return response.data;
    } catch (error) {
      console.error('NGリスト取得エラー:', error);
      throw error;
    }
  }

  /**
   * NGリスト追加
   */
  async addToNGList(partnerId: string, data: AddNGListDto): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${partnerId}/ng-list`,
        data
      );
    } catch (error) {
      console.error('NGリスト追加エラー:', error);
      throw error;
    }
  }

  /**
   * NGリスト削除
   */
  async removeFromNGList(partnerId: string, engineerId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/${partnerId}/ng-list/${engineerId}`
      );
    } catch (error) {
      console.error('NGリスト削除エラー:', error);
      throw error;
    }
  }

  /**
   * アクセスURL生成
   */
  async generateAccessUrl(partnerId: string): Promise<{ url: string; expiresAt: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${partnerId}/access-url`
      );
      return response.data;
    } catch (error) {
      console.error('アクセスURL生成エラー:', error);
      throw error;
    }
  }

  /**
   * アクセスURL更新
   */
  async updateAccessUrl(partnerId: string): Promise<{ url: string; expiresAt: string }> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/${partnerId}/access-url`
      );
      return response.data;
    } catch (error) {
      console.error('アクセスURL更新エラー:', error);
      throw error;
    }
  }

  /**
   * アクセス履歴取得
   */
  async getActivityLog(partnerId: string): Promise<ActivityLog[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${partnerId}/activity`
      );
      return response.data;
    } catch (error) {
      console.error('アクセス履歴取得エラー:', error);
      throw error;
    }
  }

  /**
   * 利用分析取得
   */
  async getAnalytics(partnerId: string): Promise<Analytics> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${partnerId}/analytics`
      );
      return response.data;
    } catch (error) {
      console.error('利用分析取得エラー:', error);
      throw error;
    }
  }

  /**
   * エンゲージメント取得
   */
  async getEngagement(partnerId: string): Promise<Engagement> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${partnerId}/engagement`
      );
      return response.data;
    } catch (error) {
      console.error('エンゲージメント取得エラー:', error);
      throw error;
    }
  }
}

export const businessPartnerService = new BusinessPartnerService();