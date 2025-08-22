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
  attachments?: string[];
  responseDate?: string;
  responseNote?: string;
}

export interface ProposedEngineer {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  unitPrice: number;
  status: 'proposed' | 'accepted' | 'rejected' | 'pending';
  proposedDate: string;
  projectName?: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  engineerCount: number;
  totalRevenue: number;
  status: 'active' | 'completed' | 'paused';
  engineers: string[];
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
  preferredIndustries?: string[];
  requirements?: string;
  status: 'active' | 'inactive' | 'prospective';
  registeredDate: string;
  lastContactDate?: string;
  totalProposals: number;
  acceptedProposals: number;
  currentEngineers: number;
  monthlyRevenue?: number;
  totalRevenue?: number;
  rating?: number;
  tags?: string[];
  paymentTerms?: string;
  autoEmailEnabled?: boolean;
  followUpEnabled?: boolean;
  notes?: string;
  approaches?: ApproachHistory[];
  proposedEngineers?: ProposedEngineer[];
  projects?: Project[];
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
      const response = await api.get('/partner-list', { params });
      return response.data;
    } catch (error: any) {
      message.error('取引先一覧の取得に失敗しました');
      throw error;
    }
  },

  // 取引先詳細取得
  async getById(id: string): Promise<BusinessPartner> {
    try {
      const response = await api.get(`/partner-list/${id}`);
      return response.data.data;
    } catch (error: any) {
      message.error('取引先情報の取得に失敗しました');
      throw error;
    }
  },

  // 取引先作成
  async create(data: Partial<BusinessPartner>): Promise<BusinessPartner> {
    try {
      const response = await api.post('/business-partners', data);
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
      const response = await api.put(`/business-partners/${id}`, data);
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
      await api.delete(`/business-partners/${id}`);
      message.success('取引先を削除しました');
    } catch (error: any) {
      message.error('取引先の削除に失敗しました');
      throw error;
    }
  },

  // アプローチ履歴追加
  async addApproach(partnerId: string, approach: Partial<ApproachHistory>): Promise<ApproachHistory> {
    try {
      const response = await api.post(`/business-partners/${partnerId}/approaches`, approach);
      message.success('アプローチ履歴を追加しました');
      return response.data.data;
    } catch (error: any) {
      message.error('アプローチ履歴の追加に失敗しました');
      throw error;
    }
  },
};