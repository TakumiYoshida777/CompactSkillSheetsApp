/**
 * アプローチ管理機能のバリデーションスキーマ
 * 
 * 企業・フリーランスへのアプローチ作成・更新・送信・テンプレート管理などの
 * 各種操作時の入力値検証を行います
 * 
 * @author システム開発チーム
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as yup from 'yup';

export const approachValidation = {
  create: yup.object({
    body: yup.object({
      targetType: yup.string().oneOf(['company', 'freelance']).required('対象タイプは必須です'),
      targetId: yup.number(),
      targetName: yup.string(),
      engineerIds: yup.array().of(yup.number()),
      templateId: yup.number(),
      subject: yup.string().required('件名は必須です'),
      body: yup.string().required('本文は必須です')
    })
  }),
  
  update: yup.object({
    body: yup.object({
      targetType: yup.string().oneOf(['company', 'freelance']),
      targetId: yup.number(),
      targetName: yup.string(),
      engineerIds: yup.array().of(yup.number()),
      templateId: yup.number(),
      subject: yup.string(),
      body: yup.string(),
      status: yup.string().oneOf(['draft', 'sending', 'sent', 'failed'])
    })
  }),
  
  send: yup.object({
    body: yup.object({
      targetType: yup.string().oneOf(['company', 'freelance']).required(),
      targetId: yup.number(),
      targetName: yup.string(),
      engineerIds: yup.array().of(yup.number()),
      templateId: yup.number(),
      subject: yup.string().required('件名は必須です'),
      body: yup.string().required('本文は必須です'),
      recipientEmail: yup.string().email('有効なメールアドレスを入力してください').required('送信先メールアドレスは必須です'),
      variables: yup.object()
    })
  }),
  
  bulk: yup.object({
    body: yup.object({
      targetIds: yup.array().of(yup.number()).required('送信先IDの配列は必須です'),
      engineerIds: yup.array().of(yup.number()),
      templateId: yup.number(),
      subject: yup.string(),
      customMessage: yup.string()
    })
  }),
  
  template: yup.object({
    body: yup.object({
      name: yup.string().required('テンプレート名は必須です'),
      category: yup.string(),
      subject: yup.string().required('件名は必須です'),
      body: yup.string().required('本文は必須です'),
      variables: yup.object()
    })
  }),
  
  periodic: yup.object({
    body: yup.object({
      name: yup.string().required('定期アプローチ名は必須です'),
      targetCompanies: yup.array().of(yup.number()),
      engineerConditions: yup.object(),
      templateId: yup.number(),
      schedule: yup.string().required('スケジュールは必須です')
    })
  }),
  
  freelance: yup.object({
    body: yup.object({
      freelanceId: yup.number().required('フリーランスIDは必須です'),
      projectDetails: yup.object({
        name: yup.string().required('プロジェクト名は必須です'),
        description: yup.string(),
        startDate: yup.date(),
        endDate: yup.date(),
        budget: yup.number()
      }).required('プロジェクト詳細は必須です'),
      message: yup.string().required('メッセージは必須です')
    })
  })
};