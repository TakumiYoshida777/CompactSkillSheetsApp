/**
 * 検索機能のバリデーションスキーマ
 * 
 * エンジニア検索、プロジェクト検索、スキル検索などの
 * 各種検索機能の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const searchValidation = {
  engineers: yup.object({
    keyword: yup.string().optional(),
    skills: yup.array().of(yup.string()).optional(),
    status: yup.string().oneOf(['WORKING', 'WAITING', 'WAITING_SOON']).optional(),
    minExperience: yup.number().min(0, '最小経験年数は0以上で入力してください').optional(),
    maxExperience: yup.number().min(0, '最大経験年数は0以上で入力してください').optional(),
    engineerType: yup.string().oneOf(['EMPLOYEE', 'FREELANCE']).optional(),
    sortBy: yup.string().oneOf(['name', 'experience', 'createdAt']).optional(),
    order: yup.string().oneOf(['asc', 'desc']).optional()
  }),

  projects: yup.object({
    keyword: yup.string().optional(),
    status: yup.string().oneOf(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
    industry: yup.string().optional(),
    scale: yup.string().oneOf(['SMALL', 'MEDIUM', 'LARGE']).optional(),
    startDate: yup.date().optional(),
    endDate: yup.date().optional()
  }),

  bySkills: yup.object({
    skills: yup.array().of(yup.string()).min(1, 'スキルは1つ以上指定してください').required('スキルは必須です'),
    matchType: yup.string().oneOf(['all', 'any']).default('any'),
    minMatchCount: yup.number().min(1, '最小マッチ数は1以上で入力してください').optional()
  }),

  available: yup.object({
    fromDate: yup.date().required('開始日は必須です'),
    toDate: yup.date().min(yup.ref('fromDate'), '終了日は開始日以降の日付を指定してください').required('終了日は必須です'),
    skills: yup.array().of(yup.string()).optional()
  }),

  advanced: yup.object({
    query: yup.string().required('検索クエリは必須です'),
    filters: yup.object().optional(),
    aggregations: yup.array().of(yup.string()).optional()
  }),

  saveSearch: yup.object({
    name: yup.string().required('検索名は必須です'),
    query: yup.object().required('検索条件は必須です'),
    description: yup.string().optional()
  }),

  updateSavedSearch: yup.object({
    name: yup.string().optional(),
    query: yup.object().optional(),
    description: yup.string().optional()
  })
};