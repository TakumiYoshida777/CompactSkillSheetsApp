import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// メール配信関連の型定義
export interface EmailTemplate {
  id: string;
  companyId: string;
  templateType: 'approach' | 'periodic' | 'freelance_approach' | 'notification';
  name: string;
  subject: string;
  body: string;
  senderName?: string;
  senderEmail?: string;
  variables?: string[];
  category?: string;
  version?: number;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSendRequest {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  templateId?: string;
  variables?: Record<string, any>;
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
  scheduledAt?: string;
}

export interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  approachId?: string;
  templateId?: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounceType?: 'hard' | 'soft';
  createdAt: string;
  updatedAt: string;
}

export interface EmailBounce {
  id: string;
  email: string;
  bounceType: 'hard' | 'soft';
  bounceReason: string;
  bounceCount: number;
  lastBouncedAt: string;
  isBlocked: boolean;
}

export interface EmailPreviewRequest {
  templateId?: string;
  subject?: string;
  body?: string;
  variables?: Record<string, any>;
}

export interface EmailStatistics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  byDate: {
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  }[];
  byTemplate: {
    templateId: string;
    templateName: string;
    sent: number;
    openRate: number;
    clickRate: number;
  }[];
}

// APIクライアント
class EmailAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // メールテンプレート管理
  async fetchTemplates(category?: string): Promise<EmailTemplate[]> {
    try {
      const params = category ? new URLSearchParams({ category }) : undefined;
      const response = await axios.get(`${API_BASE_URL}/api/v1/email/templates`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('メールテンプレート一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  async createTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/email/templates`,
        templateData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メールテンプレートの作成に失敗しました:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/email/templates/${templateId}`,
        templateData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メールテンプレートの更新に失敗しました:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/email/templates/${templateId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('メールテンプレートの削除に失敗しました:', error);
      throw error;
    }
  }

  // メールプレビュー
  async previewEmail(previewData: EmailPreviewRequest): Promise<{
    subject: string;
    body: string;
    html: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/email/preview`,
        previewData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メールプレビューの生成に失敗しました:', error);
      throw error;
    }
  }

  // メール送信管理
  async sendEmail(sendRequest: EmailSendRequest): Promise<{
    messageId: string;
    status: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/email/send`,
        sendRequest,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メール送信に失敗しました:', error);
      throw error;
    }
  }

  // 送信キュー管理
  async fetchEmailQueue(status?: string): Promise<EmailQueueItem[]> {
    try {
      const params = status ? new URLSearchParams({ status }) : undefined;
      const response = await axios.get(`${API_BASE_URL}/api/v1/email/queue`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('メール送信キューの取得に失敗しました:', error);
      throw error;
    }
  }

  // 送信済みメール一覧
  async fetchSentEmails(filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<EmailLog[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/email/sent`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('送信済みメール一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // メール再送信
  async resendEmail(messageId: string): Promise<{
    messageId: string;
    status: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/email/resend`,
        { messageId },
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('メール再送信に失敗しました:', error);
      throw error;
    }
  }

  // バウンス管理
  async fetchBounces(filters?: {
    bounceType?: 'hard' | 'soft';
    isBlocked?: boolean;
  }): Promise<EmailBounce[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.bounceType) params.append('bounceType', filters.bounceType);
        if (filters.isBlocked !== undefined) params.append('isBlocked', String(filters.isBlocked));
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/email/bounces`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('バウンス一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // バウンスアドレスのブロック解除
  async unblockEmail(email: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/email/unblock`,
        { email },
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('メールアドレスのブロック解除に失敗しました:', error);
      throw error;
    }
  }

  // 配信停止リスト管理
  async fetchUnsubscribed(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/email/unsubscribed`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('配信停止リストの取得に失敗しました:', error);
      throw error;
    }
  }

  async addUnsubscribed(email: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/email/unsubscribe`,
        { email },
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('配信停止リストへの追加に失敗しました:', error);
      throw error;
    }
  }

  async removeUnsubscribed(email: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/email/resubscribe`,
        { email },
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('配信停止リストからの削除に失敗しました:', error);
      throw error;
    }
  }

  // メール統計
  async fetchStatistics(period?: { from: string; to: string }): Promise<EmailStatistics> {
    try {
      const params = period ? new URLSearchParams({
        from: period.from,
        to: period.to,
      }) : undefined;

      const response = await axios.get(`${API_BASE_URL}/api/v1/email/statistics`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('メール統計の取得に失敗しました:', error);
      throw error;
    }
  }

  // メールテスト送信
  async sendTestEmail(testData: {
    templateId?: string;
    to: string;
    variables?: Record<string, any>;
  }): Promise<{
    messageId: string;
    status: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/email/test`,
        testData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('テストメール送信に失敗しました:', error);
      throw error;
    }
  }
}

export const emailAPI = new EmailAPI();