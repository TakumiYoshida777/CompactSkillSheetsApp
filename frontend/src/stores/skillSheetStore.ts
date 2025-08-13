import { create } from 'zustand';
import axios from 'axios';

interface Skill {
  id: string;
  name: string;
  level: number;
  years: number;
  lastUsed?: string;
}

interface SkillSheet {
  id: string;
  engineerId: string;
  summary?: string;
  totalExperience?: number;
  education?: string;
  certifications?: string[];
  programmingLanguages?: Skill[];
  frameworks?: Skill[];
  databases?: Skill[];
  cloudServices?: Skill[];
  tools?: Skill[];
  possibleRoles?: string[];
  possiblePhases?: string[];
  specialSkills?: string;
  isCompleted: boolean;
  completionRate: number;
  lastUpdated: string;
}

interface SkillSheetState {
  skillSheet: SkillSheet | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: string | null;

  // Actions
  fetchSkillSheet: () => Promise<void>;
  updateSkillSheet: (data: Partial<SkillSheet>) => void;
  saveSkillSheet: (data: any) => Promise<void>;
  addSkill: (category: string, skill: Skill) => void;
  removeSkill: (category: string, skillId: string) => void;
  updateSkill: (category: string, skillId: string, data: Partial<Skill>) => void;
  calculateCompletion: () => number;
  exportPDF: () => Promise<void>;
  clearError: () => void;
}

const useSkillSheetStore = create<SkillSheetState>((set, get) => ({
  skillSheet: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSaved: null,

  fetchSkillSheet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/skill-sheets/me');
      
      set({
        skillSheet: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'スキルシートの取得に失敗しました',
      });
    }
  },

  updateSkillSheet: (data: Partial<SkillSheet>) => {
    set((state) => ({
      skillSheet: state.skillSheet ? {
        ...state.skillSheet,
        ...data,
      } : null,
    }));
  },

  saveSkillSheet: async (data: any) => {
    set({ isSaving: true, error: null });
    try {
      const response = await axios.put('/api/skill-sheets/me', data);
      
      set({
        skillSheet: response.data,
        isSaving: false,
        lastSaved: new Date().toISOString(),
      });
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message || '保存に失敗しました',
      });
      throw error;
    }
  },

  addSkill: (category: string, skill: Skill) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      const categoryKey = category as keyof SkillSheet;
      const currentSkills = (state.skillSheet[categoryKey] as Skill[]) || [];
      
      return {
        skillSheet: {
          ...state.skillSheet,
          [category]: [...currentSkills, skill],
        },
      };
    });
  },

  removeSkill: (category: string, skillId: string) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      const categoryKey = category as keyof SkillSheet;
      const currentSkills = (state.skillSheet[categoryKey] as Skill[]) || [];
      
      return {
        skillSheet: {
          ...state.skillSheet,
          [category]: currentSkills.filter(s => s.id !== skillId),
        },
      };
    });
  },

  updateSkill: (category: string, skillId: string, data: Partial<Skill>) => {
    set((state) => {
      if (!state.skillSheet) return state;
      
      const categoryKey = category as keyof SkillSheet;
      const currentSkills = (state.skillSheet[categoryKey] as Skill[]) || [];
      
      return {
        skillSheet: {
          ...state.skillSheet,
          [category]: currentSkills.map(s => 
            s.id === skillId ? { ...s, ...data } : s
          ),
        },
      };
    });
  },

  calculateCompletion: () => {
    const { skillSheet } = get();
    if (!skillSheet) return 0;

    let completed = 0;
    let total = 0;

    // 基本情報
    const basicFields = ['summary', 'totalExperience', 'education'];
    basicFields.forEach(field => {
      total++;
      if (skillSheet[field as keyof SkillSheet]) completed++;
    });

    // スキル情報
    const skillCategories = [
      'programmingLanguages',
      'frameworks',
      'databases',
      'cloudServices'
    ];
    skillCategories.forEach(category => {
      total++;
      const skills = skillSheet[category as keyof SkillSheet] as Skill[];
      if (skills && skills.length > 0) completed++;
    });

    // ロール・フェーズ
    total += 2;
    if (skillSheet.possibleRoles && skillSheet.possibleRoles.length > 0) completed++;
    if (skillSheet.possiblePhases && skillSheet.possiblePhases.length > 0) completed++;

    return Math.round((completed / total) * 100);
  },

  exportPDF: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/skill-sheets/me/export', {
        responseType: 'blob',
      });
      
      // PDFダウンロード処理
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `skillsheet_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'PDF出力に失敗しました',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export { useSkillSheetStore };