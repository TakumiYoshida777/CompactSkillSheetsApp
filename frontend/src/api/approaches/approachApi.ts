import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// アプローチ関連の型定義
export interface Approach {
  id: string;
  fromCompanyId: string;
  toCompanyId?: string;
  toFreelancerId?: string;
  approachType: 'manual' | 'periodic' | 'assign_request';
  contactMethods?: string[];
  targetEngineers?: string[];
  projectDetails?: string;
  messageContent?: string;
  emailTemplateId?: string;
  status: 'sent' | 'opened' | 'replied' | 'rejected' | 'accepted';
  sentBy: string;
  sentAt: string;
  openedAt?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  companyId: string;
  templateType: 'approach' | 'periodic' | 'freelance_approach';
  name: string;
  subject: string;
  body: string;
  senderName?: string;
  senderEmail?: string;
  variables?: string[];
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodicApproach {
  id: string;
  companyId: string;
  name: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  targetCompanies: string[];
  engineerSelectionCriteria: {
    status?: string[];
    skills?: string[];
    experience?: number;
    excludeAssigned?: boolean;
  };
  excludeSettings: {
    excludeNgEngineers: boolean;
    excludeRecentlyApproached: boolean;
    recentDays?: number;
  };
  emailTemplateId: string;
  isActive: boolean;
  isPaused: boolean;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApproachStatistics {
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  totalAccepted: number;
  openRate: number;
  replyRate: number;
  acceptRate: number;
  byPeriod: {
    date: string;
    sent: number;
    opened: number;
    replied: number;
    accepted: number;
  }[];
  byCompany: {
    companyId: string;
    companyName: string;
    sent: number;
    opened: number;
    replied: number;
    accepted: number;
  }[];
  byEngineer: {
    engineerId: string;
    engineerName: string;
    approaches: number;
    lastApproached: string;
  }[];
}

export interface FreelancerData {
  id: string;
  engineerId: string;
  name: string;
  email: string;
  githubUrl?: string;
  skills: string[];
  experience: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  monthlyRateMin?: number;
  monthlyRateMax?: number;
  workStyle: 'remote' | 'onsite' | 'hybrid';
  isPublic: boolean;
  lastApproached?: string;
  approachable: boolean;
}

export interface ApproachFilters {
  status?: string;
  approachType?: string;
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
}

export interface BulkApproachData {
  targetType: 'company' | 'freelancer';
  targetIds: string[];
  engineerIds: string[];
  emailTemplateId: string;
  projectDetails?: string;
  customMessage?: string;
  scheduledAt?: string;
}

// APIクライアント
class ApproachAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // アプローチ履歴取得
  async fetchApproaches(filters?: ApproachFilters): Promise<Approach[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/approaches`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('アプローチ履歴の取得に失敗しました:', error);
      throw error;
    }
  }

  // アプローチ詳細取得
  async fetchApproachById(approachId: string): Promise<Approach> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/approaches/${approachId}`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('アプローチ詳細の取得に失敗しました:', error);
      throw error;
    }
  }

  // アプローチ統計取得
  async fetchStatistics(period?: { from: string; to: string }): Promise<ApproachStatistics> {
    try {
      const params = period ? new URLSearchParams({
        from: period.from,
        to: period.to,
      }) : undefined;

      const response = await axios.get(`${API_BASE_URL}/api/v1/approaches/statistics`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('アプローチ統計の取得に失敗しました:', error);
      throw error;
    }
  }

  // アプローチ削除
  async deleteApproach(approachId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/approaches/${approachId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('アプローチの削除に失敗しました:', error);
      throw error;
    }
  }

  // アプローチ作成
  async createApproach(approachData: Omit<Approach, 'id' | 'createdAt' | 'updatedAt'>): Promise<Approach> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches`,
        approachData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('アプローチの作成に失敗しました:', error);
      throw error;
    }
  }

  // 一括アプローチ送信
  async sendBulkApproach(bulkData: BulkApproachData): Promise<Approach[]> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches/bulk`,
        bulkData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('一括アプローチの送信に失敗しました:', error);
      throw error;
    }
  }

  // メールテンプレート一覧取得
  async fetchTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/approaches/templates`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('メールテンプレート一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // メールテンプレート作成
  async createTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches/templates`,
        templateData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メールテンプレートの作成に失敗しました:', error);
      throw error;
    }
  }

  // メールテンプレート更新
  async updateTemplate(templateId: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/approaches/templates/${templateId}`,
        templateData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メールテンプレートの更新に失敗しました:', error);
      throw error;
    }
  }

  // 定期アプローチ一覧取得
  async fetchPeriodicApproaches(): Promise<PeriodicApproach[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/approaches/periodic`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('定期アプローチ一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // 定期アプローチ作成
  async createPeriodicApproach(periodicData: Omit<PeriodicApproach, 'id' | 'createdAt' | 'updatedAt'>): Promise<PeriodicApproach> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches/periodic`,
        periodicData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('定期アプローチの作成に失敗しました:', error);
      throw error;
    }
  }

  // 定期アプローチ更新
  async updatePeriodicApproach(periodicId: string, periodicData: Partial<PeriodicApproach>): Promise<PeriodicApproach> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/approaches/periodic/${periodicId}`,
        periodicData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('定期アプローチの更新に失敗しました:', error);
      throw error;
    }
  }

  // 定期アプローチ削除
  async deletePeriodicApproach(periodicId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/approaches/periodic/${periodicId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('定期アプローチの削除に失敗しました:', error);
      throw error;
    }
  }

  // 定期アプローチ一時停止/再開
  async pausePeriodicApproach(periodicId: string, pause: boolean): Promise<PeriodicApproach> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches/periodic/${periodicId}/pause`,
        { pause },
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('定期アプローチの一時停止/再開に失敗しました:', error);
      throw error;
    }
  }

  // フリーランス一覧取得
  async fetchFreelancers(filters?: {
    skills?: string[];
    experience?: number;
    workStyle?: string;
  }): Promise<FreelancerData[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.skills?.length) {
          params.append('skills', filters.skills.join(','));
        }
        if (filters.experience !== undefined) {
          params.append('experience', String(filters.experience));
        }
        if (filters.workStyle) {
          params.append('workStyle', filters.workStyle);
        }
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/freelancers`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('フリーランス一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // フリーランスアプローチ送信
  async sendFreelanceApproach(approachData: {
    freelancerId: string;
    projectDetails: string;
    emailTemplateId?: string;
    customMessage?: string;
  }): Promise<Approach> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches/freelance`,
        approachData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('フリーランスアプローチの送信に失敗しました:', error);
      throw error;
    }
  }

  // フリーランスアプローチ履歴取得
  async fetchFreelanceApproachHistory(freelancerId?: string): Promise<Approach[]> {
    try {
      const params = freelancerId ? new URLSearchParams({ freelancerId }) : undefined;
      const response = await axios.get(`${API_BASE_URL}/api/v1/approaches/freelance/history`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('フリーランスアプローチ履歴の取得に失敗しました:', error);
      throw error;
    }
  }

  // フリーランス一括アプローチ
  async sendBulkFreelanceApproach(bulkData: {
    freelancerIds: string[];
    projectDetails: string;
    emailTemplateId?: string;
    customMessage?: string;
  }): Promise<Approach[]> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/approaches/freelance/bulk`,
        bulkData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('フリーランス一括アプローチの送信に失敗しました:', error);
      throw error;
    }
  }
}

export const approachAPI = new ApproachAPI();