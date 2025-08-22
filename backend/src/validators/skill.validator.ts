/**
 * スキル管理機能のバリデーションスキーマ
 * 
 * スキルマスター、スキルカテゴリ、エンジニアスキルの
 * 作成・更新時の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const skillValidation = {
  createMaster: yup.object({
    name: yup.string().required('スキル名は必須です'),
    category: yup.string().required('カテゴリは必須です'),
    description: yup.string().optional(),
    tags: yup.array().of(yup.string()).optional()
  }),

  updateMaster: yup.object({
    name: yup.string().optional(),
    category: yup.string().optional(),
    description: yup.string().optional(),
    tags: yup.array().of(yup.string()).optional(),
    isActive: yup.boolean().optional()
  }),

  createCategory: yup.object({
    name: yup.string().required('カテゴリ名は必須です'),
    description: yup.string().optional(),
    parentId: yup.number().optional(),
    order: yup.number().optional()
  }),

  updateCategory: yup.object({
    name: yup.string().optional(),
    description: yup.string().optional(),
    parentId: yup.number().optional(),
    order: yup.number().optional(),
    isActive: yup.boolean().optional()
  }),

  addEngineerSkill: yup.object({
    skillId: yup.number().required('スキルIDは必須です'),
    level: yup.string().oneOf(['beginner', 'intermediate', 'advanced', 'expert']).required('スキルレベルは必須です'),
    yearsOfExperience: yup.number().min(0, '経験年数は0以上で入力してください').optional(),
    lastUsedDate: yup.date().optional(),
    note: yup.string().optional()
  }),

  updateEngineerSkill: yup.object({
    level: yup.string().oneOf(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    yearsOfExperience: yup.number().min(0, '経験年数は0以上で入力してください').optional(),
    lastUsedDate: yup.date().optional(),
    note: yup.string().optional()
  })
};