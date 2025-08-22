/**
 * エンジニア管理機能のバリデーションスキーマ
 * 
 * エンジニアの作成・更新・ステータス変更・スキルシート更新などの
 * 各種操作時の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const engineerValidation = {
  create: yup.object({
    body: yup.object({
      name: yup.string()
        .required('氏名は必須です')
        .max(100, '氏名は100文字以内で入力してください'),
      email: yup.string()
        .email('有効なメールアドレスを入力してください')
        .required('メールアドレスは必須です'),
      phone: yup.string()
        .matches(/^[0-9-]+$/, '電話番号は数字とハイフンのみ入力可能です')
        .optional(),
      birthDate: yup.date()
        .optional(),
      gender: yup.string()
        .oneOf(['male', 'female', 'other'], '性別の値が不正です')
        .optional(),
      nearestStation: yup.string()
        .optional(),
      engineerType: yup.string()
        .oneOf(['employee', 'freelance'], 'エンジニア種別の値が不正です')
        .optional(),
      status: yup.string()
        .oneOf(['waiting', 'assigned', 'upcoming', 'inactive'], 'ステータスの値が不正です')
        .optional(),
    })
  }),

  update: yup.object({
    params: yup.object({
      id: yup.number().integer('エンジニアIDは整数で指定してください').required('エンジニアIDは必須です')
    }),
    body: yup.object({
      name: yup.string()
        .max(100, '氏名は100文字以内で入力してください')
        .optional(),
      email: yup.string()
        .email('有効なメールアドレスを入力してください')
        .optional(),
      phone: yup.string()
        .matches(/^[0-9-]+$/, '電話番号は数字とハイフンのみ入力可能です')
        .optional(),
      birthDate: yup.date()
        .optional(),
      gender: yup.string()
        .oneOf(['male', 'female', 'other'], '性別の値が不正です')
        .optional(),
      nearestStation: yup.string()
        .optional(),
    })
  }),

  updateStatus: yup.object({
    params: yup.object({
      id: yup.number().integer('エンジニアIDは整数で指定してください').required('エンジニアIDは必須です')
    }),
    body: yup.object({
      status: yup.string()
        .oneOf(['waiting', 'assigned', 'upcoming', 'inactive'], 'ステータスの値が不正です')
        .required('ステータスは必須です'),
    })
  }),

  updateAvailability: yup.object({
    params: yup.object({
      id: yup.number().integer('エンジニアIDは整数で指定してください').required('エンジニアIDは必須です')
    }),
    body: yup.object({
      availableDate: yup.date()
        .required('稼働可能日は必須です'),
    })
  }),

  updatePublicStatus: yup.object({
    params: yup.object({
      id: yup.number().integer('エンジニアIDは整数で指定してください').required('エンジニアIDは必須です')
    }),
    body: yup.object({
      isPublic: yup.boolean()
        .required('公開状態は必須です'),
    })
  }),

  skillSheet: yup.object({
    params: yup.object({
      id: yup.number().integer('エンジニアIDは整数で指定してください').required('エンジニアIDは必須です')
    }),
    body: yup.object({
      summary: yup.string()
        .max(2000, '概要は2000文字以内で入力してください')
        .optional(),
      totalExperienceYears: yup.number()
        .min(0, '総経験年数は0以上で入力してください')
        .max(50, '総経験年数は50年以下で入力してください')
        .integer('総経験年数は整数で入力してください')
        .optional(),
      programmingLanguages: yup.array()
        .of(yup.string())
        .optional(),
      frameworks: yup.array()
        .of(yup.string())
        .optional(),
      databases: yup.array()
        .of(yup.string())
        .optional(),
      cloudServices: yup.array()
        .of(yup.string())
        .optional(),
      tools: yup.array()
        .of(yup.string())
        .optional(),
      certifications: yup.array()
        .of(yup.string())
        .optional(),
      possibleRoles: yup.array()
        .of(yup.string())
        .optional(),
      possiblePhases: yup.array()
        .of(yup.string())
        .optional(),
    })
  }),

  bulkUpdateStatus: yup.object({
    body: yup.object({
      engineerIds: yup.array()
        .of(yup.number().integer('エンジニアIDは整数で指定してください'))
        .min(1, 'エンジニアIDは1つ以上指定してください')
        .required('エンジニアIDリストは必須です'),
      status: yup.string()
        .oneOf(['waiting', 'assigned', 'upcoming', 'inactive'], 'ステータスの値が不正です')
        .required('ステータスは必須です'),
    })
  }),

  bulkExport: yup.object({
    body: yup.object({
      engineerIds: yup.array()
        .of(yup.number().integer('エンジニアIDは整数で指定してください'))
        .min(1, 'エンジニアIDは1つ以上指定してください')
        .required('エンジニアIDリストは必須です'),
      format: yup.string()
        .oneOf(['csv', 'excel', 'pdf'], 'エクスポート形式の値が不正です')
        .optional(),
    })
  }),
};