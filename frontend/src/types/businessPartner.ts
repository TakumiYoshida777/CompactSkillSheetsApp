// 取引先企業関連の型定義

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