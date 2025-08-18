import { create } from 'zustand';
import { skillSheetApi, skillMasterApi } from '../api/engineers/skillSheetApi';
import type { 
  SkillSheet,
  SkillSheetUpdateRequest,
  Skill,
  ProjectExperience,
  Certification,
  Education,
  SkillMaster,
  SkillCategory,
  SkillSheetProgress
} from '../types/skillSheet';

interface SkillSheetState {
  // データ
  skillSheet: SkillSheet | null;
  skillMasters: {
    programmingLanguages: SkillMaster[];
    frameworks: SkillMaster[];
    databases: SkillMaster[];
    cloudServices: SkillMaster[];
  };
  progress: SkillSheetProgress | null;
  
  // 状態管理
  isLoading: boolean;
  isSaving: boolean;
  isAutoSaving: boolean;
  isDirty: boolean;
  autoSaveEnabled: boolean;
  error: string | null;
  lastSaved: string | null;
  
  // Actions - 取得系
  fetchSkillSheet: (engineerId: string) => Promise<void>;
  fetchSkillMasters: () => Promise<void>;
  
  // Actions - 更新系
  updateSkillSheet: (data: Partial<SkillSheetUpdateRequest>) => void;
  saveSkillSheet: () => Promise<void>;
  autoSave: () => Promise<void>;
  publishSkillSheet: () => Promise<void>;
  completeSkillSheet: (engineerId: string) => Promise<void>;
  
  // Actions - スキル管理
  addSkill: (category: SkillCategory, skill: Skill) => void;
  removeSkill: (category: SkillCategory, skillId: string) => void;
  updateSkill: (category: SkillCategory, skillId: string, data: Partial<Skill>) => void;
  
  // Actions - プロジェクト管理
  addProject: (project: ProjectExperience) => void;
  updateProject: (projectId: string, data: Partial<ProjectExperience>) => void;
  removeProject: (projectId: string) => void;
  
  // Actions - 資格・学歴管理
  addCertification: (certification: Certification) => void;
  updateCertification: (certId: string, data: Partial<Certification>) => void;
  removeCertification: (certId: string) => void;
  
  addEducation: (education: Education) => void;
  updateEducation: (eduId: string, data: Partial<Education>) => void;
  removeEducation: (eduId: string) => void;
  
  // Actions - エクスポート
  exportSkillSheet: (engineerId: string, format: 'pdf' | 'excel') => Promise<void>;
  
  // Actions - 進捗管理
  calculateProgress: () => void;
  
  // Actions - その他
  setAutoSave: (enabled: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  skillSheet: null,
  skillMasters: {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    cloudServices: [],
  },
  progress: null,
  isLoading: false,
  isSaving: false,
  isAutoSaving: false,
  isDirty: false,
  autoSaveEnabled: true,
  error: null,
  lastSaved: null,
};

const useSkillSheetStore = create<SkillSheetState>((set, get) => ({
  ...initialState,

  // 取得系
  fetchSkillSheet: async (engineerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const skillSheet = await skillSheetApi.fetch(engineerId);
      set({
        skillSheet,
        isLoading: false,
        isDirty: false,
      });
      get().calculateProgress();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'スキルシートの取得に失敗しました',
      });
    }
  },

  fetchSkillMasters: async () => {
    try {
      const skillMasters = await skillMasterApi.fetchAll();
      set({ skillMasters });
    } catch (error: any) {
      console.error('スキルマスタの取得に失敗しました:', error);
    }
  },

  // 更新系
  updateSkillSheet: (data: Partial<SkillSheetUpdateRequest>) => {
    set((state) => ({
      skillSheet: state.skillSheet ? {
        ...state.skillSheet,
        ...data,
      } : null,
      isDirty: true,
    }));
  },

  saveSkillSheet: async () => {
    const { skillSheet } = get();
    if (!skillSheet) return;

    set({ isSaving: true, error: null });
    try {
      const updatedSkillSheet = await skillSheetApi.update(
        skillSheet.engineerId,
        skillSheet as SkillSheetUpdateRequest
      );
      
      set({
        skillSheet: updatedSkillSheet,
        isSaving: false,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      });
      get().calculateProgress();
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message || '保存に失敗しました',
      });
      throw error;
    }
  },

  autoSave: async () => {
    const { isDirty, autoSaveEnabled, isSaving, skillSheet } = get();
    if (!isDirty || !autoSaveEnabled || isSaving || !skillSheet) return;

    set({ isAutoSaving: true });
    try {
      const updatedSkillSheet = await skillSheetApi.patch(
        skillSheet.engineerId,
        skillSheet as Partial<SkillSheetUpdateRequest>
      );
      
      set({
        skillSheet: updatedSkillSheet,
        isAutoSaving: false,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error: any) {
      set({ isAutoSaving: false });
      console.error('自動保存に失敗しました:', error);
    }
  },

  publishSkillSheet: async () => {
    const { skillSheet } = get();
    if (!skillSheet) return;

    set({ isSaving: true, error: null });
    try {
      const publishedSkillSheet = await skillSheetApi.publish(skillSheet.id);
      set({
        skillSheet: publishedSkillSheet,
        isSaving: false,
      });
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message || '公開に失敗しました',
      });
      throw error;
    }
  },

  completeSkillSheet: async (engineerId: string) => {
    set({ isSaving: true, error: null });
    try {
      const completedSkillSheet = await skillSheetApi.complete(engineerId);
      set({
        skillSheet: completedSkillSheet,
        isSaving: false,
      });
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message || '完了設定に失敗しました',
      });
      throw error;
    }
  },

  // スキル管理
  addSkill: (category: SkillCategory, skill: Skill) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      const categoryMap: Record<SkillCategory, keyof SkillSheet> = {
        'programming_language': 'programmingLanguages',
        'framework': 'frameworks',
        'database': 'databases',
        'cloud_service': 'cloudServices',
        'tool': 'tools',
        'other': 'skills',
      };
      
      const categoryKey = categoryMap[category];
      const currentSkills = (state.skillSheet[categoryKey] as Skill[]) || [];
      
      return {
        skillSheet: {
          ...state.skillSheet,
          [categoryKey]: [...currentSkills, skill],
        },
        isDirty: true,
      };
    });
  },

  removeSkill: (category: SkillCategory, skillId: string) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      const categoryMap: Record<SkillCategory, keyof SkillSheet> = {
        'programming_language': 'programmingLanguages',
        'framework': 'frameworks',
        'database': 'databases',
        'cloud_service': 'cloudServices',
        'tool': 'tools',
        'other': 'skills',
      };
      
      const categoryKey = categoryMap[category];
      const currentSkills = (state.skillSheet[categoryKey] as Skill[]) || [];
      
      return {
        skillSheet: {
          ...state.skillSheet,
          [categoryKey]: currentSkills.filter(s => s.id !== skillId),
        },
        isDirty: true,
      };
    });
  },

  updateSkill: (category: SkillCategory, skillId: string, data: Partial<Skill>) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      const categoryMap: Record<SkillCategory, keyof SkillSheet> = {
        'programming_language': 'programmingLanguages',
        'framework': 'frameworks',
        'database': 'databases',
        'cloud_service': 'cloudServices',
        'tool': 'tools',
        'other': 'skills',
      };
      
      const categoryKey = categoryMap[category];
      const currentSkills = (state.skillSheet[categoryKey] as Skill[]) || [];
      
      return {
        skillSheet: {
          ...state.skillSheet,
          [categoryKey]: currentSkills.map(s => 
            s.id === skillId ? { ...s, ...data } : s
          ),
        },
        isDirty: true,
      };
    });
  },

  // プロジェクト管理
  addProject: (project: ProjectExperience) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          projectExperiences: [...state.skillSheet.projectExperiences, project],
        },
        isDirty: true,
      };
    });
  },

  updateProject: (projectId: string, data: Partial<ProjectExperience>) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          projectExperiences: state.skillSheet.projectExperiences.map(p =>
            p.id === projectId ? { ...p, ...data } : p
          ),
        },
        isDirty: true,
      };
    });
  },

  removeProject: (projectId: string) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          projectExperiences: state.skillSheet.projectExperiences.filter(
            p => p.id !== projectId
          ),
        },
        isDirty: true,
      };
    });
  },

  // 資格管理
  addCertification: (certification: Certification) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          certifications: [...state.skillSheet.certifications, certification],
        },
        isDirty: true,
      };
    });
  },

  updateCertification: (certId: string, data: Partial<Certification>) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          certifications: state.skillSheet.certifications.map(c =>
            c.id === certId ? { ...c, ...data } : c
          ),
        },
        isDirty: true,
      };
    });
  },

  removeCertification: (certId: string) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          certifications: state.skillSheet.certifications.filter(
            c => c.id !== certId
          ),
        },
        isDirty: true,
      };
    });
  },

  // 学歴管理
  addEducation: (education: Education) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          education: [...state.skillSheet.education, education],
        },
        isDirty: true,
      };
    });
  },

  updateEducation: (eduId: string, data: Partial<Education>) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          education: state.skillSheet.education.map(e =>
            e.id === eduId ? { ...e, ...data } : e
          ),
        },
        isDirty: true,
      };
    });
  },

  removeEducation: (eduId: string) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      return {
        skillSheet: {
          ...state.skillSheet,
          education: state.skillSheet.education.filter(
            e => e.id !== eduId
          ),
        },
        isDirty: true,
      };
    });
  },

  // エクスポート
  exportSkillSheet: async (engineerId: string, format: 'pdf' | 'excel') => {
    set({ isLoading: true, error: null });
    try {
      const blob = await skillSheetApi.export(engineerId, format);
      
      // ダウンロード処理
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `skillsheet_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'エクスポートに失敗しました',
      });
      throw error;
    }
  },

  // 進捗管理
  calculateProgress: () => {
    const { skillSheet } = get();
    if (!skillSheet) return;

    const sections = {
      basicInfo: 0,
      skills: 0,
      projects: 0,
      certifications: 0,
      education: 0,
      others: 0,
    };

    // 基本情報の進捗計算
    if (skillSheet.summary) sections.basicInfo += 50;
    if (skillSheet.specialization && skillSheet.specialization.length > 0) sections.basicInfo += 50;

    // スキルの進捗計算
    const skillCategories = [
      'programmingLanguages',
      'frameworks',
      'databases',
      'cloudServices',
      'tools'
    ];
    const filledCategories = skillCategories.filter(cat => 
      (skillSheet[cat as keyof SkillSheet] as any[])?.length > 0
    ).length;
    sections.skills = (filledCategories / skillCategories.length) * 100;

    // プロジェクトの進捗計算
    if (skillSheet.projectExperiences.length > 0) sections.projects = 100;

    // 資格の進捗計算
    if (skillSheet.certifications.length > 0) sections.certifications = 100;

    // 学歴の進捗計算
    if (skillSheet.education.length > 0) sections.education = 100;

    // その他の進捗計算
    let othersCount = 0;
    if (skillSheet.selfPR) othersCount++;
    if (skillSheet.desiredProject) othersCount++;
    if (skillSheet.availableForRemote !== undefined) othersCount++;
    sections.others = (othersCount / 3) * 100;

    // 全体の進捗計算
    const overall = Object.values(sections).reduce((sum, val) => sum + val, 0) / Object.keys(sections).length;

    const progress: SkillSheetProgress = {
      overall: Math.round(overall),
      sections,
      missingRequiredFields: [],
      suggestions: [],
    };

    // 必須フィールドの確認
    if (!skillSheet.summary) progress.missingRequiredFields.push('概要');
    if (skillSheet.programmingLanguages.length === 0) progress.missingRequiredFields.push('プログラミング言語');
    if (skillSheet.projectExperiences.length === 0) progress.missingRequiredFields.push('プロジェクト経歴');

    // 改善提案
    if (overall < 50) progress.suggestions.push('基本情報を充実させましょう');
    if (sections.skills < 50) progress.suggestions.push('スキル情報を追加しましょう');
    if (sections.projects === 0) progress.suggestions.push('プロジェクト経歴を追加しましょう');

    set({ progress });
  },

  // その他
  setAutoSave: (enabled: boolean) => {
    set({ autoSaveEnabled: enabled });
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

// 自動保存の設定（5秒間隔）
setInterval(() => {
  const state = useSkillSheetStore.getState();
  if (state.autoSaveEnabled && state.isDirty && !state.isSaving) {
    state.autoSave();
  }
}, 5000);

export { useSkillSheetStore };