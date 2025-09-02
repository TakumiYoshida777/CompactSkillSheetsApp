import { errorLog } from '../../utils/logger';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// プロジェクト関連の型定義
export interface Project {
  id: string;
  name: string;
  clientCompany: string;
  startDate: string;
  endDate?: string;
  plannedEndDate?: string;
  projectScale: 'small' | 'medium' | 'large';
  industry?: string;
  businessType?: string;
  developmentMethodology?: string;
  teamSize?: number;
  description?: string;
  status: 'planning' | 'in_progress' | 'waiting' | 'completed';
  requiredSkills?: string[];
  contractInfo?: {
    period: string;
    unitPrice?: number;
    numberOfPeople?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  projectId: string;
  engineerId: string;
  engineerName?: string;
  role: string;
  responsibilities?: string;
  phases?: string[];
  technologies?: string[];
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  achievements?: string;
  utilization?: number;
}

export interface TimelineData {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  assignments: Assignment[];
  milestones?: {
    date: string;
    description: string;
  }[];
}

export interface ProjectFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  clientCompany?: string;
  skills?: string[];
}

export interface UtilizationData {
  engineerId: string;
  engineerName: string;
  currentUtilization: number;
  futureUtilization: {
    month: string;
    utilization: number;
  }[];
}

// APIクライアント
class ProjectAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // プロジェクト一覧取得
  async fetchProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/projects`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクト一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクト検索
  async searchProjects(searchCriteria: any): Promise<Project[]> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects/search`,
        searchCriteria,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクト検索に失敗しました:', error);
      throw error;
    }
  }

  // カレンダー用プロジェクト取得
  async fetchProjectsForCalendar(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/projects/calendar`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      errorLog('カレンダー用プロジェクトの取得に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクト詳細取得
  async fetchProjectById(projectId: string): Promise<Project> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクト詳細の取得に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクト作成
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects`,
        projectData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクトの作成に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクト更新
  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/projects/${projectId}`,
        projectData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクトの更新に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクト削除
  async deleteProject(projectId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      errorLog('プロジェクトの削除に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクトステータス更新
  async updateProjectStatus(projectId: string, status: string): Promise<Project> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/status`,
        { status },
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクトステータスの更新に失敗しました:', error);
      throw error;
    }
  }

  // アサイン一覧取得
  async fetchAssignments(projectId: string): Promise<Assignment[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assignments`,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('アサイン一覧の取得に失敗しました:', error);
      throw error;
    }
  }

  // アサイン作成
  async createAssignment(projectId: string, assignmentData: Omit<Assignment, 'id'>): Promise<Assignment> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assignments`,
        assignmentData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('アサインの作成に失敗しました:', error);
      throw error;
    }
  }

  // アサイン更新
  async updateAssignment(
    projectId: string,
    assignmentId: string,
    assignmentData: Partial<Assignment>
  ): Promise<Assignment> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assignments/${assignmentId}`,
        assignmentData,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('アサインの更新に失敗しました:', error);
      throw error;
    }
  }

  // アサイン削除
  async deleteAssignment(projectId: string, assignmentId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assignments/${assignmentId}`,
        { headers: this.getHeaders() }
      );
    } catch (error) {
      errorLog('アサインの削除に失敗しました:', error);
      throw error;
    }
  }

  // 利用可能なエンジニア取得
  async fetchAvailableEngineers(date?: string): Promise<any[]> {
    try {
      const params = date ? { date } : undefined;
      const response = await axios.get(`${API_BASE_URL}/api/v1/engineers/available`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data.data;
    } catch (error) {
      errorLog('利用可能なエンジニアの取得に失敗しました:', error);
      throw error;
    }
  }

  // タイムライン取得
  async fetchTimeline(): Promise<TimelineData[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/projects/timeline`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      errorLog('タイムラインの取得に失敗しました:', error);
      throw error;
    }
  }

  // 稼働率取得
  async fetchUtilization(): Promise<UtilizationData[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/projects/utilization`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      errorLog('稼働率の取得に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクトタイムライン取得
  async fetchProjectTimeline(projectId: string): Promise<TimelineData> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/projects/${projectId}/timeline`,
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクトタイムラインの取得に失敗しました:', error);
      throw error;
    }
  }

  // プロジェクト延長
  async extendProject(projectId: string, newEndDate: string): Promise<Project> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects/${projectId}/extend`,
        { newEndDate },
        { headers: this.getHeaders() }
      );
      return response.data.data;
    } catch (error) {
      errorLog('プロジェクトの延長に失敗しました:', error);
      throw error;
    }
  }
}

export const projectAPI = new ProjectAPI();