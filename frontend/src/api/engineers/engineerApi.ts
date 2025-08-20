/**
 * エンジニア管理API クライアント
 * エンジニア情報の取得、作成、更新、削除を行うAPIクライアント
 */

import axios from '../../lib/axios';
import { parseApiError } from '../../utils/apiErrorHandler';
import { validateEngineerCreateRequest } from '../../utils/validation';
import type { 
  Engineer, 
  EngineerListResponse, 
  EngineerFilterParams,
  EngineerCreateRequest,
  EngineerUpdateRequest,
  BulkStatusUpdateRequest,
  ExportFormat
} from '../../types/engineer';

const API_BASE = 'v1/engineers';

/**
 * エンジニアAPI
 */
export const engineerApi = {
  /**
   * エンジニア一覧取得
   */
  async fetchList(params?: EngineerFilterParams): Promise<EngineerListResponse> {
    const response = await axios.get<EngineerListResponse>(API_BASE, { params });
    return response.data;
  },

  /**
   * エンジニア詳細取得
   */
  async fetchDetail(engineerId: string): Promise<Engineer> {
    const response = await axios.get<Engineer>(`${API_BASE}/${engineerId}`);
    return response.data;
  },

  /**
   * エンジニア作成
   */
  async create(data: EngineerCreateRequest): Promise<Engineer> {
    // クライアントサイドバリデーション
    const validation = validateEngineerCreateRequest(data);
    if (!validation.isValid) {
      throw parseApiError({
        response: {
          status: 422,
          data: {
            code: 'VALIDATION_ERROR',
            message: '入力内容に誤りがあります',
            details: { errors: validation.errors },
          },
        },
      });
    }

    try {
      const response = await axios.post<Engineer>(API_BASE, data);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * エンジニア更新
   */
  async update(engineerId: string, data: EngineerUpdateRequest): Promise<Engineer> {
    const response = await axios.put<Engineer>(`${API_BASE}/${engineerId}`, data);
    return response.data;
  },

  /**
   * エンジニア部分更新
   */
  async patch(engineerId: string, data: Partial<EngineerUpdateRequest>): Promise<Engineer> {
    const response = await axios.patch<Engineer>(`${API_BASE}/${engineerId}`, data);
    return response.data;
  },

  /**
   * エンジニア削除
   */
  async delete(engineerId: string): Promise<void> {
    await axios.delete(`${API_BASE}/${engineerId}`);
  },

  /**
   * ステータス更新
   */
  async updateStatus(engineerId: string, status: string): Promise<Engineer> {
    const response = await axios.patch<Engineer>(`${API_BASE}/${engineerId}/status`, { status });
    return response.data;
  },

  /**
   * 稼働可能時期更新
   */
  async updateAvailability(engineerId: string, availableDate: string): Promise<Engineer> {
    const response = await axios.put<Engineer>(`${API_BASE}/${engineerId}/availability`, { availableDate });
    return response.data;
  },

  /**
   * 公開設定変更
   */
  async updatePublicStatus(engineerId: string, isPublic: boolean): Promise<Engineer> {
    const response = await axios.patch<Engineer>(`${API_BASE}/${engineerId}/public`, { isPublic });
    return response.data;
  },

  /**
   * プロジェクト履歴取得
   */
  async fetchProjects(engineerId: string) {
    const response = await axios.get(`${API_BASE}/${engineerId}/projects`);
    return response.data;
  },

  /**
   * 現在のプロジェクト取得
   */
  async fetchCurrentProject(engineerId: string) {
    const response = await axios.get(`${API_BASE}/${engineerId}/projects/current`);
    return response.data;
  },

  /**
   * プロジェクト履歴取得
   */
  async fetchProjectHistory(engineerId: string) {
    const response = await axios.get(`${API_BASE}/${engineerId}/projects/history`);
    return response.data;
  },

  /**
   * アプローチ履歴取得
   */
  async fetchApproaches(engineerId: string) {
    const response = await axios.get(`${API_BASE}/${engineerId}/approaches`);
    return response.data;
  },

  /**
   * プロフィール画像アップロード
   */
  async uploadProfileImage(engineerId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_BASE}/${engineerId}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * プロフィール画像削除
   */
  async deleteProfileImage(engineerId: string): Promise<void> {
    await axios.delete(`${API_BASE}/${engineerId}/profile-image`);
  },

  /**
   * エクスポート（CSV/Excel）
   */
  async export(format: ExportFormat, params?: EngineerFilterParams): Promise<Blob> {
    const endpoint = format === 'csv' ? 'export/csv' : 'export/excel';
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * 一括ステータス更新
   */
  async bulkUpdateStatus(data: BulkStatusUpdateRequest): Promise<void> {
    await axios.patch(`${API_BASE}/bulk/status`, data);
  },

  /**
   * 一括メール送信
   */
  async bulkSendEmail(engineerIds: string[], emailData: any): Promise<void> {
    await axios.post(`${API_BASE}/bulk/email`, {
      engineerIds,
      ...emailData,
    });
  },

  /**
   * 一括削除
   */
  async bulkDelete(engineerIds: string[]): Promise<void> {
    await axios.delete(`${API_BASE}/bulk`, {
      data: { engineerIds },
    });
  },
};

/**
 * エンジニア検索API
 */
export const engineerSearchApi = {
  /**
   * 高度な検索
   */
  async search(params: any) {
    const response = await axios.post('v1/search/engineers', params);
    return response.data;
  },

  /**
   * 待機中エンジニア取得
   */
  async fetchWaiting() {
    const response = await axios.get('v1/engineers/waiting');
    return response.data;
  },

  /**
   * 稼働可能エンジニア取得
   */
  async fetchAvailable() {
    const response = await axios.get('v1/engineers/available');
    return response.data;
  },

  /**
   * スキル別エンジニア取得
   */
  async fetchBySkill(skill: string) {
    const response = await axios.get(`/api/v1/engineers/skills/${skill}`);
    return response.data;
  },

  /**
   * 検索条件保存
   */
  async saveSearch(name: string, params: any) {
    const response = await axios.post('v1/search/saved', {
      name,
      type: 'engineer',
      params,
    });
    return response.data;
  },

  /**
   * 保存済み検索一覧取得
   */
  async fetchSavedSearches() {
    const response = await axios.get('v1/search/saved');
    return response.data;
  },

  /**
   * 保存済み検索実行
   */
  async executeSavedSearch(searchId: string) {
    const response = await axios.get(`/api/v1/search/saved/${searchId}`);
    return response.data;
  },

  /**
   * 保存済み検索削除
   */
  async deleteSavedSearch(searchId: string) {
    await axios.delete(`/api/v1/search/saved/${searchId}`);
  },

  /**
   * 検索候補取得
   */
  async fetchSuggestions(query: string) {
    const response = await axios.get('v1/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * オートコンプリート
   */
  async autocomplete(field: string, query: string) {
    const response = await axios.get('v1/search/autocomplete', {
      params: { field, q: query },
    });
    return response.data;
  },
};