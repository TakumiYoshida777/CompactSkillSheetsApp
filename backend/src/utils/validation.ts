import * as yup from 'yup';

// メールアドレスの検証
export const emailSchema = yup.string()
  .email('有効なメールアドレスを入力してください')
  .required('メールアドレスは必須です');

// パスワードの検証
export const passwordSchema = yup.string()
  .min(8, 'パスワードは8文字以上である必要があります')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'パスワードは大文字、小文字、数字を含む必要があります'
  )
  .required('パスワードは必須です');

// ユーザー登録の検証スキーマ
export const registerSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  name: yup.string()
    .min(2, '名前は2文字以上である必要があります')
    .max(50, '名前は50文字以下である必要があります')
    .required('名前は必須です'),
  companyName: yup.string()
    .max(100, '会社名は100文字以下である必要があります'),
});

// ログインの検証スキーマ
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('パスワードは必須です'),
  rememberMe: yup.boolean(),
});

// プロフィール更新の検証スキーマ
export const updateProfileSchema = yup.object({
  name: yup.string()
    .min(2, '名前は2文字以上である必要があります')
    .max(50, '名前は50文字以下である必要があります'),
  email: emailSchema,
  companyName: yup.string()
    .max(100, '会社名は100文字以下である必要があります'),
  phoneNumber: yup.string()
    .matches(
      /^[\d-]+$/,
      '電話番号は数字とハイフンのみ使用できます'
    ),
});

// 検証エラーをフォーマット
export function formatValidationErrors(error: yup.ValidationError) {
  const errors: Record<string, string> = {};
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  return errors;
}

// 非同期検証ヘルパー
export async function validateData<T>(
  schema: yup.Schema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.validate(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw {
        status: 400,
        message: '入力データが無効です',
        errors: formatValidationErrors(error),
      };
    }
    throw error;
  }
}