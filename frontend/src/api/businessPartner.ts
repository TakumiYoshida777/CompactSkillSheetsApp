import api from '@/utils/api';
import { message } from 'antd';

export interface ContactPerson {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface ApproachHistory {
  id: string;
  date: string;
  type: 'email' | 'phone' | 'meeting' | 'proposal';
  subject: string;
  engineerCount?: number;
  status: 'sent' | 'replied' | 'pending' | 'accepted' | 'rejected';
  note?: string;
}

export interface BusinessPartner {
  id: string;
  companyName: string;
  companyNameKana?: string;
  industry?: string;
  employeeSize?: string;
  website?: string;
  phone?: string;
  address?: string;
  businessDescription?: string;
  contacts: ContactPerson[];
  contractTypes?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredSkills?: string[];
  status: 'active' | 'inactive' | 'prospective';
  registeredDate: string;
  lastContactDate?: string;
  totalProposals: number;
  acceptedProposals: number;
  currentEngineers: number;
  monthlyRevenue?: number;
  rating?: number;
  tags?: string[];
  approaches?: ApproachHistory[];
}

export const businessPartnerApi = {
  // 取引先一覧取得
  async getList(params?: {
    status?: string;
    industry?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BusinessPartner[]; total: number }> {
    try {
      const response = await api.get('/api/v1/partner-list', { params });
      return response.data;
    } catch (error: any) {
      message.error('取引先一覧の取得に失敗しました');
      throw error;
    }
  },

  // 取引先詳細取得
  async getById(id: string): Promise<BusinessPartner> {
    try {
      const response = await api.get(`/api/v1/partner-list/${id}`);
      return response.data.data;
    } catch (error: any) {
      message.error('取引先情報の取得に失敗しました');
      throw error;
    }
  },

  // 取引先作成
  async create(data: Partial<BusinessPartner>): Promise<BusinessPartner> {
    try {
      const response = await api.post('/api/v1/business-partners', data);
      message.success('取引先を登録しました');
      return response.data.data;
    } catch (error: any) {
      message.error('取引先の登録に失敗しました');
      throw error;
    }
  },

  // 取引先更新
  async update(id: string, data: Partial<BusinessPartner>): Promise<BusinessPartner> {
    try {
      const response = await api.put(`/api/v1/business-partners/${id}`, data);
      message.success('取引先情報を更新しました');
      return response.data.data;
    } catch (error: any) {
      message.error('取引先情報の更新に失敗しました');
      throw error;
    }
  },

  // 取引先削除
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/business-partners/${id}`);
      message.success('取引先を削除しました');
    } catch (error: any) {
      message.error('取引先の削除に失敗しました');
      throw error;
    }
  },

  // アプローチ履歴追加
  async addApproach(partnerId: string, approach: Partial<ApproachHistory>): Promise<ApproachHistory> {
    try {
      const response = await api.post(`/api/v1/business-partners/${partnerId}/approaches`, approach);
      message.success('アプローチ履歴を追加しました');
      return response.data.data;
    } catch (error: any) {
      message.error('アプローチ履歴の追加に失敗しました');
      throw error;
    }
  },
};