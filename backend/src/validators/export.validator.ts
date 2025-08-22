/**
 * エクスポート機能のバリデーションスキーマ
 * 
 * スキルシート、エンジニア情報、プロジェクト情報などの
 * 各種データのエクスポート時の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const exportValidation = {
  skillSheet: yup.object({
    format: yup.string().oneOf(['pdf', 'excel', 'word']).default('pdf'),
    template: yup.string().optional(),
    includePhoto: yup.boolean().default(true),
    includePersonalInfo: yup.boolean().default(false)
  }),

  bulkSkillSheets: yup.object({
    engineerIds: yup.array().of(yup.number()).min(1).required('エンジニアIDは必須です'),
    format: yup.string().oneOf(['pdf', 'excel', 'word']).default('pdf'),
    template: yup.string().optional(),
    mergeIntoOne: yup.boolean().default(false)
  }),

  engineers: yup.object({
    filters: yup.object().optional(),
    format: yup.string().oneOf(['csv', 'excel']).default('csv'),
    columns: yup.array().of(yup.string()).optional()
  }),

  projects: yup.object({
    filters: yup.object().optional(),
    format: yup.string().oneOf(['csv', 'excel']).default('csv'),
    includeAssignments: yup.boolean().default(false)
  }),

  approaches: yup.object({
    fromDate: yup.date().optional(),
    toDate: yup.date().optional(),
    status: yup.string().optional(),
    format: yup.string().oneOf(['csv', 'excel']).default('csv')
  }),

  statistics: yup.object({
    reportType: yup.string().oneOf(['monthly', 'quarterly', 'yearly']).required('レポートタイプは必須です'),
    period: yup.string().required('期間は必須です'),
    metrics: yup.array().of(yup.string()).optional(),
    format: yup.string().oneOf(['pdf', 'excel']).default('pdf')
  }),

  custom: yup.object({
    query: yup.object().required('クエリは必須です'),
    format: yup.string().oneOf(['csv', 'excel', 'pdf']).default('csv'),
    template: yup.string().optional()
  }),

  template: yup.object({
    name: yup.string().required('テンプレート名は必須です'),
    type: yup.string().oneOf(['skillSheet', 'report', 'list']).required('テンプレートタイプは必須です'),
    format: yup.string().oneOf(['pdf', 'excel', 'word']).required('フォーマットは必須です'),
    layout: yup.object().optional(),
    styles: yup.object().optional()
  })
};