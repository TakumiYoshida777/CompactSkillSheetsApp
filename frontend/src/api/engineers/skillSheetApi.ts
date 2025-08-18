/**
 * スキルシートAPI クライアント
 * スキルシート情報の取得、作成、更新を行うAPIクライアント
 */

import axios from '../../lib/axios';
import type { 
  SkillSheet,
  SkillSheetUpdateRequest,
  Skill,
  SkillCategory,
  SkillMaster,
  ProjectExperience
} from '../../types/skillSheet';

/**
 * スキルシートAPI
 */
export const skillSheetApi = {
  /**
   * スキルシート取得
   */
  async fetch(engineerId: string): Promise<SkillSheet> {
    const response = await axios.get<SkillSheet>(`/api/v1/engineers/${engineerId}/skill-sheet`);
    return response.data;
  },

  /**
   * スキルシート更新
   */
  async update(engineerId: string, data: SkillSheetUpdateRequest): Promise<SkillSheet> {
    const response = await axios.put<SkillSheet>(`/api/v1/engineers/${engineerId}/skill-sheet`, data);
    return response.data;
  },

  /**
   * スキルシート部分更新
   */
  async patch(engineerId: string, data: Partial<SkillSheetUpdateRequest>): Promise<SkillSheet> {
    const response = await axios.patch<SkillSheet>(`/api/v1/engineers/${engineerId}/skill-sheet`, data);
    return response.data;
  },

  /**
   * スキルシート直接取得（ID指定）
   */
  async fetchById(sheetId: string): Promise<SkillSheet> {
    const response = await axios.get<SkillSheet>(`/api/v1/skill-sheets/${sheetId}`);
    return response.data;
  },

  /**
   * スキル更新
   */
  async updateSkills(sheetId: string, skills: Skill[]): Promise<SkillSheet> {
    const response = await axios.patch<SkillSheet>(`/api/v1/skill-sheets/${sheetId}/skills`, { skills });
    return response.data;
  },

  /**
   * スキルシート公開
   */
  async publish(sheetId: string): Promise<SkillSheet> {
    const response = await axios.post<SkillSheet>(`/api/v1/skill-sheets/${sheetId}/publish`);
    return response.data;
  },

  /**
   * スキルシート完了設定
   */
  async complete(engineerId: string): Promise<SkillSheet> {
    const response = await axios.patch<SkillSheet>(`/api/v1/engineers/${engineerId}/skill-sheet/complete`, {
      isCompleted: true,
    });
    return response.data;
  },

  /**
   * スキルシートエクスポート（PDF/Excel）
   */
  async export(engineerId: string, format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await axios.get(`/api/v1/engineers/${engineerId}/skill-sheet/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * スキルシートプレビュー取得
   */
  async preview(engineerId: string): Promise<any> {
    const response = await axios.get(`/api/v1/engineers/${engineerId}/skill-sheet/preview`);
    return response.data;
  },

  /**
   * スキルシートテンプレート取得
   */
  async fetchTemplate(engineerId: string): Promise<any> {
    const response = await axios.get(`/api/v1/engineers/${engineerId}/skill-sheet/template`);
    return response.data;
  },

  /**
   * プロジェクト経歴追加
   */
  async addProject(sheetId: string, project: ProjectExperience): Promise<SkillSheet> {
    const response = await axios.post<SkillSheet>(`/api/v1/skill-sheets/${sheetId}/projects`, project);
    return response.data;
  },

  /**
   * プロジェクト経歴更新
   */
  async updateProject(sheetId: string, projectId: string, project: Partial<ProjectExperience>): Promise<SkillSheet> {
    const response = await axios.put<SkillSheet>(`/api/v1/skill-sheets/${sheetId}/projects/${projectId}`, project);
    return response.data;
  },

  /**
   * プロジェクト経歴削除
   */
  async deleteProject(sheetId: string, projectId: string): Promise<SkillSheet> {
    const response = await axios.delete<SkillSheet>(`/api/v1/skill-sheets/${sheetId}/projects/${projectId}`);
    return response.data;
  },
};

/**
 * スキルマスタAPI
 */
export const skillMasterApi = {
  /**
   * プログラミング言語一覧取得
   */
  async fetchProgrammingLanguages(): Promise<SkillMaster[]> {
    const response = await axios.get<SkillMaster[]>('/api/v1/skills/programming-languages');
    return response.data;
  },

  /**
   * フレームワーク一覧取得
   */
  async fetchFrameworks(): Promise<SkillMaster[]> {
    const response = await axios.get<SkillMaster[]>('/api/v1/skills/frameworks');
    return response.data;
  },

  /**
   * データベース一覧取得
   */
  async fetchDatabases(): Promise<SkillMaster[]> {
    const response = await axios.get<SkillMaster[]>('/api/v1/skills/databases');
    return response.data;
  },

  /**
   * クラウドサービス一覧取得
   */
  async fetchCloudServices(): Promise<SkillMaster[]> {
    const response = await axios.get<SkillMaster[]>('/api/v1/skills/cloud-services');
    return response.data;
  },

  /**
   * 全スキルマスタ取得
   */
  async fetchAll(): Promise<{
    programmingLanguages: SkillMaster[];
    frameworks: SkillMaster[];
    databases: SkillMaster[];
    cloudServices: SkillMaster[];
  }> {
    const [programmingLanguages, frameworks, databases, cloudServices] = await Promise.all([
      this.fetchProgrammingLanguages(),
      this.fetchFrameworks(),
      this.fetchDatabases(),
      this.fetchCloudServices(),
    ]);

    return {
      programmingLanguages,
      frameworks,
      databases,
      cloudServices,
    };
  },

  /**
   * スキル候補提案
   */
  async suggest(query: string, category?: SkillCategory): Promise<SkillMaster[]> {
    const response = await axios.post<SkillMaster[]>('/api/v1/skills/suggest', {
      query,
      category,
    });
    return response.data;
  },

  /**
   * カスタムスキル追加
   */
  async addCustomSkill(skill: {
    name: string;
    category: SkillCategory;
    description?: string;
  }): Promise<SkillMaster> {
    const response = await axios.post<SkillMaster>('/api/v1/skills', skill);
    return response.data;
  },

  /**
   * スキル削除
   */
  async deleteSkill(skillId: string): Promise<void> {
    await axios.delete(`/api/v1/skills/${skillId}`);
  },
};