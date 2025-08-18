/**
 * バリデーション ユーティリティ
 */

import type { 
  EngineerCreateRequest,
  EngineerUpdateRequest,
} from '../types/engineer';
import type {
  SkillSheetUpdateRequest,
  Skill,
  ProjectExperience,
} from '../types/skillSheet';

/**
 * バリデーションエラー
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * メールアドレスのバリデーション
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 電話番号のバリデーション（日本）
 */
export function isValidPhoneNumber(phone: string): boolean {
  // ハイフンあり・なし両方に対応
  const phoneRegex = /^(0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{4}|0[0-9]{9,10})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * URLのバリデーション
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 日付のバリデーション
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 必須フィールドのチェック
 */
export function checkRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        field: String(field),
        message: `${String(field)}は必須項目です`,
      });
    }
  });
  
  return errors;
}

/**
 * エンジニア作成データのバリデーション
 */
export function validateEngineerCreateRequest(
  data: EngineerCreateRequest
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // 必須フィールドチェック
  errors.push(...checkRequiredFields(data, ['name', 'email', 'engineerType']));
  
  // メールアドレスのバリデーション
  if (data.email && !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: '有効なメールアドレスを入力してください',
    });
  }
  
  // 電話番号のバリデーション
  if (data.phone && !isValidPhoneNumber(data.phone)) {
    errors.push({
      field: 'phone',
      message: '有効な電話番号を入力してください',
    });
  }
  
  // GitHubURLのバリデーション
  if (data.githubUrl && !isValidUrl(data.githubUrl)) {
    errors.push({
      field: 'githubUrl',
      message: '有効なURLを入力してください',
    });
  }
  
  // ポートフォリオURLのバリデーション
  if (data.portfolioUrl && !isValidUrl(data.portfolioUrl)) {
    errors.push({
      field: 'portfolioUrl',
      message: '有効なURLを入力してください',
    });
  }
  
  // 生年月日のバリデーション
  if (data.birthDate && !isValidDate(data.birthDate)) {
    errors.push({
      field: 'birthDate',
      message: '有効な日付を入力してください',
    });
  }
  
  // 経験年数のバリデーション
  if (data.yearsOfExperience !== undefined && data.yearsOfExperience < 0) {
    errors.push({
      field: 'yearsOfExperience',
      message: '経験年数は0以上の数値を入力してください',
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * スキルのバリデーション
 */
export function validateSkill(skill: Skill): ValidationResult {
  const errors: ValidationError[] = [];
  
  // 必須フィールドチェック
  if (!skill.name || skill.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'スキル名は必須です',
    });
  }
  
  // レベルのバリデーション
  if (skill.level < 1 || skill.level > 5) {
    errors.push({
      field: 'level',
      message: 'スキルレベルは1〜5の範囲で入力してください',
    });
  }
  
  // 経験年数のバリデーション
  if (skill.experienceYears < 0) {
    errors.push({
      field: 'experienceYears',
      message: '経験年数は0以上の数値を入力してください',
    });
  }
  
  // 最終使用日のバリデーション
  if (skill.lastUsedDate && !isValidDate(skill.lastUsedDate)) {
    errors.push({
      field: 'lastUsedDate',
      message: '有効な日付を入力してください',
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * プロジェクト経歴のバリデーション
 */
export function validateProjectExperience(
  project: ProjectExperience
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // 必須フィールドチェック
  errors.push(...checkRequiredFields(project, [
    'projectName',
    'startDate',
    'role',
    'description',
  ]));
  
  // 日付のバリデーション
  if (project.startDate && !isValidDate(project.startDate)) {
    errors.push({
      field: 'startDate',
      message: '有効な開始日を入力してください',
    });
  }
  
  if (project.endDate && !isValidDate(project.endDate)) {
    errors.push({
      field: 'endDate',
      message: '有効な終了日を入力してください',
    });
  }
  
  // 開始日と終了日の整合性チェック
  if (project.startDate && project.endDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    if (start > end) {
      errors.push({
        field: 'endDate',
        message: '終了日は開始日より後の日付を入力してください',
      });
    }
  }
  
  // チームサイズのバリデーション
  if (project.teamSize !== undefined && project.teamSize <= 0) {
    errors.push({
      field: 'teamSize',
      message: 'チームサイズは1以上の数値を入力してください',
    });
  }
  
  // 責任範囲のバリデーション
  if (project.responsibilities && project.responsibilities.length === 0) {
    errors.push({
      field: 'responsibilities',
      message: '責任範囲を少なくとも1つ入力してください',
    });
  }
  
  // 使用技術のバリデーション
  if (project.technologies && project.technologies.length === 0) {
    errors.push({
      field: 'technologies',
      message: '使用技術を少なくとも1つ入力してください',
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * スキルシートのバリデーション
 */
export function validateSkillSheet(
  data: SkillSheetUpdateRequest
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // スキルのバリデーション
  const allSkills = [
    ...(data.programmingLanguages || []),
    ...(data.frameworks || []),
    ...(data.databases || []),
    ...(data.cloudServices || []),
    ...(data.tools || []),
    ...(data.skills || []),
  ];
  
  allSkills.forEach((skill, index) => {
    const skillValidation = validateSkill(skill);
    if (!skillValidation.isValid) {
      skillValidation.errors.forEach(error => {
        errors.push({
          field: `skills[${index}].${error.field}`,
          message: error.message,
        });
      });
    }
  });
  
  // プロジェクト経歴のバリデーション
  data.projectExperiences?.forEach((project, index) => {
    const projectValidation = validateProjectExperience(project);
    if (!projectValidation.isValid) {
      projectValidation.errors.forEach(error => {
        errors.push({
          field: `projectExperiences[${index}].${error.field}`,
          message: error.message,
        });
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * バリデーションエラーをフィールドごとにグループ化
 */
export function groupErrorsByField(
  errors: ValidationError[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  errors.forEach(error => {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error.message);
  });
  
  return grouped;
}