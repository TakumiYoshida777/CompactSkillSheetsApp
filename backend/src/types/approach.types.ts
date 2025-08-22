// アプローチ関連の型定義

export interface ApproachCreateInput {
  targetType: 'company' | 'freelance';
  targetId?: number;
  targetName?: string;
  engineerIds?: number[];
  templateId?: number;
  subject: string;
  body: string;
  status?: 'draft' | 'sending' | 'sent' | 'failed';
  createdBy?: number;
}

export interface ApproachSendInput extends ApproachCreateInput {
  recipientEmail: string;
  variables?: Record<string, string>;
}

export interface BulkApproachInput {
  targetIds: number[];
  engineerIds?: number[];
  templateId?: number;
  subject?: string;
  customMessage?: string;
}

export interface EmailTemplateInput {
  name: string;
  category?: string;
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

export interface PeriodicApproachInput {
  name: string;
  targetCompanies?: number[];
  engineerConditions?: Record<string, any>;
  templateId?: number;
  schedule: string; // cron format
}

export interface FreelanceApproachInput {
  freelanceId: number;
  projectDetails: {
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
  };
  message: string;
}

export interface ApproachStatistics {
  total: number;
  sent: number;
  opened: number;
  replied: number;
  openRate: string;
  replyRate: string;
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  dailyStats: Array<{
    date: string;
    count: number;
    sent: number;
  }>;
  total: number;
}