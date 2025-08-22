/**
 * プロジェクト管理機能のバリデーションスキーマ
 * 
 * プロジェクトの作成・更新・ステータス変更・アサインメント管理などの
 * 各種操作時の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const projectValidation = {
  create: yup.object({
    body: yup.object({
      name: yup.string()
        .max(255, 'プロジェクト名は255文字以内で入力してください')
        .required('プロジェクト名は必須です'),
      clientCompany: yup.string()
        .optional(),
      startDate: yup.date()
        .required('開始日は必須です'),
      endDate: yup.date()
        .min(yup.ref('startDate'), '終了日は開始日以降の日付を指定してください')
        .optional(),
      plannedEndDate: yup.date()
        .optional(),
      projectScale: yup.string()
        .oneOf(['small', 'medium', 'large'], 'プロジェクト規模の値が不正です')
        .optional(),
      industry: yup.string()
        .optional(),
      businessType: yup.string()
        .optional(),
      developmentMethodology: yup.string()
        .optional(),
      teamSize: yup.number()
        .min(1, 'チームサイズは1以上で入力してください')
        .max(1000, 'チームサイズは1000以下で入力してください')
        .integer('チームサイズは整数で入力してください')
        .optional(),
      description: yup.string()
        .optional(),
    })
  }),

  update: yup.object({
    params: yup.object({
      id: yup.number().integer('プロジェクトIDは整数で指定してください').required('プロジェクトIDは必須です')
    }),
    body: yup.object({
      name: yup.string()
        .max(255, 'プロジェクト名は255文字以内で入力してください')
        .optional(),
      clientCompany: yup.string()
        .optional(),
      startDate: yup.date()
        .optional(),
      endDate: yup.date()
        .min(yup.ref('startDate'), '終了日は開始日以降の日付を指定してください')
        .optional(),
      plannedEndDate: yup.date()
        .optional(),
      projectScale: yup.string()
        .oneOf(['small', 'medium', 'large'], 'プロジェクト規模の値が不正です')
        .optional(),
      teamSize: yup.number()
        .min(1, 'チームサイズは1以上で入力してください')
        .max(1000, 'チームサイズは1000以下で入力してください')
        .integer('チームサイズは整数で入力してください')
        .optional(),
    })
  }),

  updateStatus: yup.object({
    params: yup.object({
      id: yup.number().integer('プロジェクトIDは整数で指定してください').required('プロジェクトIDは必須です')
    }),
    body: yup.object({
      status: yup.string()
        .oneOf(['planning', 'active', 'completed', 'cancelled'], 'ステータスの値が不正です')
        .required('ステータスは必須です'),
    })
  }),

  createAssignment: yup.object({
    params: yup.object({
      id: yup.number().integer('プロジェクトIDは整数で指定してください').required('プロジェクトIDは必須です')
    }),
    body: yup.object({
      engineerId: yup.number()
        .integer('エンジニアIDは整数で指定してください')
        .required('エンジニアIDは必須です'),
      role: yup.string()
        .required('役割は必須です'),
      startDate: yup.date()
        .required('開始日は必須です'),
      endDate: yup.date()
        .min(yup.ref('startDate'), '終了日は開始日以降の日付を指定してください')
        .optional(),
      allocationPercentage: yup.number()
        .min(1, '稼働率は1以上で入力してください')
        .max(100, '稼働率は100以下で入力してください')
        .integer('稼働率は整数で入力してください')
        .optional(),
    })
  }),

  updateAssignment: yup.object({
    params: yup.object({
      id: yup.number().integer('プロジェクトIDは整数で指定してください').required('プロジェクトIDは必須です'),
      assignmentId: yup.number().integer('アサインメントIDは整数で指定してください').required('アサインメントIDは必須です')
    }),
    body: yup.object({
      role: yup.string()
        .optional(),
      startDate: yup.date()
        .optional(),
      endDate: yup.date()
        .min(yup.ref('startDate'), '終了日は開始日以降の日付を指定してください')
        .optional(),
      allocationPercentage: yup.number()
        .min(1, '稼働率は1以上で入力してください')
        .max(100, '稼働率は100以下で入力してください')
        .integer('稼働率は整数で入力してください')
        .optional(),
    })
  }),
};