import * as yup from 'yup';

// ログインバリデーション
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('有効なメールアドレスを入力してください')
    .required('メールアドレスは必須です'),
  password: yup
    .string()
    .min(8, 'パスワードは8文字以上必要です')
    .required('パスワードは必須です'),
  rememberMe: yup.boolean().optional(),
});

// エンジニア登録バリデーション
export const engineerRegisterSchema = yup.object({
  email: yup
    .string()
    .email('有効なメールアドレスを入力してください')
    .required('メールアドレスは必須です'),
  password: yup
    .string()
    .min(8, 'パスワードは8文字以上必要です')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードは大文字、小文字、数字を含む必要があります'
    )
    .required('パスワードは必須です'),
  name: yup
    .string()
    .min(2, '名前は2文字以上必要です')
    .max(100, '名前は100文字以内で入力してください')
    .required('名前は必須です'),
  phoneNumber: yup
    .string()
    .matches(
      /^[0-9-]+$/,
      '電話番号は数字とハイフンのみ使用できます'
    )
    .optional(),
  experienceYears: yup
    .number()
    .min(0, '経験年数は0以上を入力してください')
    .max(50, '経験年数は50年以下を入力してください')
    .optional(),
});

// エンジニアプロフィール更新バリデーション
export const updateEngineerProfileSchema = yup.object({
  name: yup
    .string()
    .min(2, '名前は2文字以上必要です')
    .max(100, '名前は100文字以内で入力してください')
    .optional(),
  phoneNumber: yup
    .string()
    .matches(
      /^[0-9-]+$/,
      '電話番号は数字とハイフンのみ使用できます'
    )
    .optional(),
  experienceYears: yup
    .number()
    .min(0, '経験年数は0以上を入力してください')
    .max(50, '経験年数は50年以下を入力してください')
    .optional(),
  skills: yup
    .array()
    .of(yup.string())
    .optional(),
  availability: yup
    .string()
    .oneOf(['available', 'engaged', 'unavailable'], '無効な稼働状況です')
    .optional(),
  bio: yup
    .string()
    .max(1000, '自己紹介は1000文字以内で入力してください')
    .optional(),
  githubUrl: yup
    .string()
    .url('有効なURLを入力してください')
    .optional(),
  portfolioUrl: yup
    .string()
    .url('有効なURLを入力してください')
    .optional(),
  certifications: yup
    .array()
    .of(yup.string())
    .optional(),
  preferredRoles: yup
    .array()
    .of(yup.string().oneOf(['PG', 'PL', 'PM', 'EM'], '無効なロールです'))
    .optional(),
  preferredPhases: yup
    .array()
    .of(yup.string())
    .optional(),
});

// パスワード変更バリデーション
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('現在のパスワードは必須です'),
  newPassword: yup
    .string()
    .min(8, '新しいパスワードは8文字以上必要です')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードは大文字、小文字、数字を含む必要があります'
    )
    .notOneOf([yup.ref('currentPassword')], '新しいパスワードは現在のパスワードと異なる必要があります')
    .required('新しいパスワードは必須です'),
});

// スキルシート更新バリデーション
export const updateSkillSheetSchema = yup.object({
  basicInfo: yup.object({
    name: yup.string().optional(),
    phoneNumber: yup.string().optional(),
    experienceYears: yup.number().min(0).max(50).optional(),
    bio: yup.string().max(1000).optional(),
    githubUrl: yup.string().url().optional(),
    portfolioUrl: yup.string().url().optional(),
  }).optional(),
  technicalSkills: yup.object({
    programmingLanguages: yup.array().of(yup.string()).optional(),
    frameworks: yup.array().of(yup.string()).optional(),
    databases: yup.array().of(yup.string()).optional(),
    tools: yup.array().of(yup.string()).optional(),
  }).optional(),
  certifications: yup.array().of(yup.string()).optional(),
  preferredRoles: yup.array().of(yup.string()).optional(),
  preferredPhases: yup.array().of(yup.string()).optional(),
  availability: yup.string().oneOf(['available', 'engaged', 'unavailable']).optional(),
});