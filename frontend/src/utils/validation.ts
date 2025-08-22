import dayjs from 'dayjs';

// メールアドレスのバリデーション
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 電話番号のバリデーション（日本の電話番号形式）
export const validatePhoneNumber = (phone: string): boolean => {
  // 様々な形式に対応（ハイフン有無、市外局番の括弧など）
  const phoneRegex = /^[\d\-\(\)]+$/;
  const digitsOnly = phone.replace(/[\-\(\)]/g, '');
  
  // 数字のみで10桁または11桁であることを確認
  return phoneRegex.test(phone) && (digitsOnly.length === 10 || digitsOnly.length === 11);
};

// URLのバリデーション
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 企業名（カナ）のバリデーション
export const validateKatakana = (text: string): boolean => {
  // カタカナ、長音符、中点、スペースを許可
  const katakanaRegex = /^[ァ-ヶー・\s]+$/;
  return katakanaRegex.test(text);
};

// 郵便番号のバリデーション
export const validatePostalCode = (code: string): boolean => {
  // 7桁の数字（ハイフン有無どちらも対応）
  const postalCodeRegex = /^\d{3}-?\d{4}$/;
  return postalCodeRegex.test(code);
};

// 金額のバリデーション
export const validateAmount = (amount: number, min?: number, max?: number): boolean => {
  if (amount < 0) return false;
  if (min !== undefined && amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
};

// 日付のバリデーション
export const validateDate = (date: string | dayjs.Dayjs, options?: {
  minDate?: string | dayjs.Dayjs;
  maxDate?: string | dayjs.Dayjs;
  allowFuture?: boolean;
  allowPast?: boolean;
}): boolean => {
  const targetDate = dayjs(date);
  
  if (!targetDate.isValid()) return false;
  
  if (options?.minDate && targetDate.isBefore(dayjs(options.minDate))) return false;
  if (options?.maxDate && targetDate.isAfter(dayjs(options.maxDate))) return false;
  if (options?.allowFuture === false && targetDate.isAfter(dayjs())) return false;
  if (options?.allowPast === false && targetDate.isBefore(dayjs())) return false;
  
  return true;
};

// 必須フィールドのバリデーション
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

// 文字数制限のバリデーション
export const validateLength = (text: string, options: {
  min?: number;
  max?: number;
  exact?: number;
}): boolean => {
  const length = text.length;
  
  if (options.exact !== undefined) return length === options.exact;
  if (options.min !== undefined && length < options.min) return false;
  if (options.max !== undefined && length > options.max) return false;
  
  return true;
};

// Ant Design Form用のバリデーションルール生成
export const createValidationRules = {
  email: [
    { required: true, message: 'メールアドレスを入力してください' },
    { type: 'email' as const, message: '有効なメールアドレスを入力してください' },
  ],
  
  phone: [
    { required: true, message: '電話番号を入力してください' },
    {
      pattern: /^[\d\-\(\)]+$/,
      message: '有効な電話番号を入力してください',
    },
    {
      validator: (_: any, value: string) => {
        if (!value) return Promise.resolve();
        const digitsOnly = value.replace(/[\-\(\)]/g, '');
        if (digitsOnly.length === 10 || digitsOnly.length === 11) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('電話番号は10桁または11桁で入力してください'));
      },
    },
  ],
  
  url: [
    {
      validator: (_: any, value: string) => {
        if (!value) return Promise.resolve();
        if (validateUrl(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('有効なURLを入力してください'));
      },
    },
  ],
  
  katakana: [
    { required: true, message: 'カナを入力してください' },
    {
      pattern: /^[ァ-ヶー・\s]+$/,
      message: 'カタカナで入力してください',
    },
  ],
  
  postalCode: [
    {
      pattern: /^\d{3}-?\d{4}$/,
      message: '有効な郵便番号を入力してください（例: 123-4567）',
    },
  ],
  
  required: (fieldName: string) => [
    { required: true, message: `${fieldName}を入力してください` },
  ],
  
  maxLength: (max: number, fieldName: string) => [
    { max, message: `${fieldName}は${max}文字以内で入力してください` },
  ],
  
  minLength: (min: number, fieldName: string) => [
    { min, message: `${fieldName}は${min}文字以上で入力してください` },
  ],
  
  amount: (options?: { min?: number; max?: number }) => [
    { required: true, message: '金額を入力してください' },
    {
      validator: (_: any, value: number) => {
        if (!value && value !== 0) return Promise.resolve();
        if (value < 0) {
          return Promise.reject(new Error('金額は0以上で入力してください'));
        }
        if (options?.min !== undefined && value < options.min) {
          return Promise.reject(new Error(`金額は${options.min}円以上で入力してください`));
        }
        if (options?.max !== undefined && value > options.max) {
          return Promise.reject(new Error(`金額は${options.max}円以下で入力してください`));
        }
        return Promise.resolve();
      },
    },
  ],
  
  dateRange: (options?: { allowFuture?: boolean; allowPast?: boolean }) => [
    { required: true, message: '日付を選択してください' },
    {
      validator: (_: any, value: dayjs.Dayjs) => {
        if (!value) return Promise.resolve();
        if (options?.allowFuture === false && value.isAfter(dayjs())) {
          return Promise.reject(new Error('未来の日付は選択できません'));
        }
        if (options?.allowPast === false && value.isBefore(dayjs())) {
          return Promise.reject(new Error('過去の日付は選択できません'));
        }
        return Promise.resolve();
      },
    },
  ],
};

// 複数フィールドの相関バリデーション
export const createCrossFieldValidator = {
  // 開始日と終了日の整合性チェック
  dateRange: (startFieldName: string, endFieldName: string) => ({
    validator: ({ getFieldValue }: any) => ({
      validator(_: any, value: any) {
        const startDate = getFieldValue(startFieldName);
        const endDate = getFieldValue(endFieldName);
        
        if (!startDate || !endDate) {
          return Promise.resolve();
        }
        
        if (dayjs(endDate).isBefore(dayjs(startDate))) {
          return Promise.reject(new Error('終了日は開始日より後の日付を選択してください'));
        }
        
        return Promise.resolve();
      },
    }),
  }),
  
  // 最小値と最大値の整合性チェック
  amountRange: (minFieldName: string, maxFieldName: string) => ({
    validator: ({ getFieldValue }: any) => ({
      validator(_: any, value: any) {
        const minAmount = getFieldValue(minFieldName);
        const maxAmount = getFieldValue(maxFieldName);
        
        if (!minAmount || !maxAmount) {
          return Promise.resolve();
        }
        
        if (maxAmount < minAmount) {
          return Promise.reject(new Error('上限は下限より大きい値を入力してください'));
        }
        
        return Promise.resolve();
      },
    }),
  }),
  
  // パスワード確認
  passwordConfirm: (passwordFieldName: string) => ({
    validator: ({ getFieldValue }: any) => ({
      validator(_: any, value: any) {
        if (!value || getFieldValue(passwordFieldName) === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('パスワードが一致しません'));
      },
    }),
  }),
};