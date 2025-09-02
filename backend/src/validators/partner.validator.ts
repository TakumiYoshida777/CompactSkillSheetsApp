/**
 * 取引先管理機能のバリデーションスキーマ
 * 
 * 取引先企業の作成・更新・権限管理・エンジニア表示設定などの
 * 各種操作時の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const partnerValidation = {
  create: yup.object({
    body: yup.object({
      name: yup.string().required('企業名は必須です'),
      email: yup.string().email('有効なメールアドレスを入力してください'),
      phone: yup.string(),
      address: yup.string(),
      contractStatus: yup.string().oneOf(['active', 'inactive', 'pending']),
      contractStartDate: yup.date(),
      contractEndDate: yup.date(),
      maxViewableEngineers: yup.number().min(1).max(1000),
      contactPersonName: yup.string(),
      contactPersonEmail: yup.string().email('有効なメールアドレスを入力してください'),
      contactPersonPhone: yup.string(),
      notes: yup.string()
    })
  }),
  
  update: yup.object({
    body: yup.object({
      name: yup.string(),
      email: yup.string().email('有効なメールアドレスを入力してください'),
      phone: yup.string(),
      address: yup.string(),
      contractStatus: yup.string().oneOf(['active', 'inactive', 'pending']),
      contractStartDate: yup.date(),
      contractEndDate: yup.date(),
      maxViewableEngineers: yup.number().min(1).max(1000),
      contactPersonName: yup.string(),
      contactPersonEmail: yup.string().email('有効なメールアドレスを入力してください'),
      contactPersonPhone: yup.string(),
      notes: yup.string()
    })
  }),
  
  permissions: yup.object({
    body: yup.object({
      canViewEngineers: yup.boolean(),
      canSendOffers: yup.boolean(),
      maxViewableEngineers: yup.number().min(1).max(1000),
      autoPublishWaiting: yup.boolean(),
      customPermissions: yup.object()
    })
  }),
  
  visibleEngineers: yup.object({
    body: yup.object({
      engineerIds: yup.array().of(yup.number()).required('エンジニアIDの配列は必須です'),
      autoPublish: yup.boolean()
    })
  }),
  
  accessUrl: yup.object({
    body: yup.object({
      expiresIn: yup.number().min(1).max(365),
      maxUses: yup.number().min(1).max(100)
    })
  }),
  
  user: yup.object({
    body: yup.object({
      name: yup.string().required('名前は必須です'),
      email: yup.string().email('有効なメールアドレスを入力してください').required('メールアドレスは必須です'),
      password: yup.string().min(8, 'パスワードは8文字以上である必要があります'),
      role: yup.string().oneOf(['admin', 'viewer', 'editor'])
    })
  }),
  
  resetPassword: yup.object({
    body: yup.object({
      newPassword: yup.string()
        .required('新しいパスワードは必須です')
        .min(8, 'パスワードは8文字以上である必要があります')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'パスワードは大文字、小文字、数字を含む必要があります'
        )
    })
  })
};