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
  })
};