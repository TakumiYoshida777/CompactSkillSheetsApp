/**
 * スキルシート関連の型定義
 */

/**
 * スキルレベル
 */
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

/**
 * スキルカテゴリー
 */
export type SkillCategory = 
  | 'programming_language'
  | 'framework'
  | 'database'
  | 'cloud_service'
  | 'tool'
  | 'other';

/**
 * スキル
 */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  experienceYears: number;
  lastUsedDate?: string;
  description?: string;
}

/**
 * スキルマスタ
 */
export interface SkillMaster {
  id: string;
  name: string;
  category: SkillCategory;
  description?: string;
  popularity?: number;
  relatedSkills?: string[];
}

/**
 * プロジェクト経歴
 */
export interface ProjectExperience {
  id: string;
  projectName: string;
  clientName?: string;
  startDate: string;
  endDate?: string;
  role: string;
  teamSize?: number;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements?: string[];
  isHighlight?: boolean;
}

/**
 * 資格・認定
 */
export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

/**
 * 学歴
 */
export interface Education {
  id: string;
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

/**
 * スキルシート
 */
export interface SkillSheet {
  id: string;
  engineerId: string;
  
  // 基本情報
  summary?: string;
  specialization?: string[];
  
  // スキル情報
  skills: Skill[];
  programmingLanguages: Skill[];
  frameworks: Skill[];
  databases: Skill[];
  cloudServices: Skill[];
  tools: Skill[];
  
  // 経歴情報
  projectExperiences: ProjectExperience[];
  totalExperienceYears: number;
  
  // 資格・学歴
  certifications: Certification[];
  education: Education[];
  
  // その他
  selfPR?: string;
  desiredProject?: string;
  availableForRemote?: boolean;
  preferredWorkLocation?: string[];
  
  // ステータス
  isCompleted: boolean;
  completionRate: number;
  isPublished: boolean;
  publishedAt?: string;
  
  // メタ情報
  version: number;
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: string;
}

/**
 * スキルシート更新リクエスト
 */
export interface SkillSheetUpdateRequest {
  summary?: string;
  specialization?: string[];
  skills?: Skill[];
  programmingLanguages?: Skill[];
  frameworks?: Skill[];
  databases?: Skill[];
  cloudServices?: Skill[];
  tools?: Skill[];
  projectExperiences?: ProjectExperience[];
  certifications?: Certification[];
  education?: Education[];
  selfPR?: string;
  desiredProject?: string;
  availableForRemote?: boolean;
  preferredWorkLocation?: string[];
}

/**
 * スキルシート進捗状況
 */
export interface SkillSheetProgress {
  overall: number;
  sections: {
    basicInfo: number;
    skills: number;
    projects: number;
    certifications: number;
    education: number;
    others: number;
  };
  missingRequiredFields: string[];
  suggestions: string[];
}

/**
 * スキルシートテンプレート
 */
export interface SkillSheetTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: {
    sections: Array<{
      id: string;
      name: string;
      isRequired: boolean;
      fields: Array<{
        id: string;
        name: string;
        type: string;
        isRequired: boolean;
        validation?: any;
      }>;
    }>;
  };
  sampleData?: Partial<SkillSheet>;
}