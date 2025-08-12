import * as yup from 'yup';
import {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  formatValidationErrors,
  validateData,
} from '../validation';

describe('Validation Utils', () => {
  describe('emailSchema', () => {
    it('有効なメールアドレスを受け入れる', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'admin+tag@company.org',
      ];

      for (const email of validEmails) {
        await expect(emailSchema.validate(email)).resolves.toBe(email);
      }
    });

    it('無効なメールアドレスを拒否する', async () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user name@example.com',
      ];

      for (const email of invalidEmails) {
        await expect(emailSchema.validate(email)).rejects.toThrow();
      }
    });

    it('空のメールアドレスを拒否する', async () => {
      await expect(emailSchema.validate('')).rejects.toThrow('メールアドレスは必須です');
    });
  });

  describe('passwordSchema', () => {
    it('有効なパスワードを受け入れる', async () => {
      const validPasswords = [
        'Password1',
        'SecurePass123',
        'MyP@ssw0rd',
      ];

      for (const password of validPasswords) {
        await expect(passwordSchema.validate(password)).resolves.toBe(password);
      }
    });

    it('短すぎるパスワードを拒否する', async () => {
      await expect(passwordSchema.validate('Pass1')).rejects.toThrow(
        'パスワードは8文字以上である必要があります'
      );
    });

    it('大文字を含まないパスワードを拒否する', async () => {
      await expect(passwordSchema.validate('password1')).rejects.toThrow(
        'パスワードは大文字、小文字、数字を含む必要があります'
      );
    });

    it('小文字を含まないパスワードを拒否する', async () => {
      await expect(passwordSchema.validate('PASSWORD1')).rejects.toThrow(
        'パスワードは大文字、小文字、数字を含む必要があります'
      );
    });

    it('数字を含まないパスワードを拒否する', async () => {
      await expect(passwordSchema.validate('Password')).rejects.toThrow(
        'パスワードは大文字、小文字、数字を含む必要があります'
      );
    });
  });

  describe('registerSchema', () => {
    it('有効な登録データを受け入れる', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        name: '山田太郎',
        companyName: '株式会社テスト',
      };

      await expect(registerSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('必須フィールドがない場合エラーになる', async () => {
      const invalidData = {
        email: 'test@example.com',
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });

    it('名前が短すぎる場合エラーになる', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        name: '太',
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow(
        '名前は2文字以上である必要があります'
      );
    });

    it('会社名が長すぎる場合エラーになる', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        name: '山田太郎',
        companyName: 'a'.repeat(101),
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow(
        '会社名は100文字以下である必要があります'
      );
    });
  });

  describe('loginSchema', () => {
    it('有効なログインデータを受け入れる', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('rememberMeがなくても有効', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('パスワードがない場合エラーになる', async () => {
      const invalidData = {
        email: 'test@example.com',
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow(
        'パスワードは必須です'
      );
    });
  });

  describe('updateProfileSchema', () => {
    it('有効なプロフィール更新データを受け入れる', async () => {
      const validData = {
        name: '山田花子',
        email: 'hanako@example.com',
        companyName: '新会社',
        phoneNumber: '03-1234-5678',
      };

      await expect(updateProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('部分的な更新データも受け入れる', async () => {
      const validData = {
        name: '新しい名前',
      };

      await expect(updateProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('無効な電話番号形式を拒否する', async () => {
      const invalidData = {
        phoneNumber: 'abc-1234-5678',
      };

      await expect(updateProfileSchema.validate(invalidData)).rejects.toThrow(
        '電話番号は数字とハイフンのみ使用できます'
      );
    });
  });

  describe('formatValidationErrors', () => {
    it('ValidationErrorを適切にフォーマットする', () => {
      const error = new yup.ValidationError('', null, '');
      error.inner = [
        new yup.ValidationError('エラー1', 'value1', 'field1'),
        new yup.ValidationError('エラー2', 'value2', 'field2'),
      ];

      const formatted = formatValidationErrors(error);

      expect(formatted).toEqual({
        field1: 'エラー1',
        field2: 'エラー2',
      });
    });

    it('pathがないエラーは無視される', () => {
      const error = new yup.ValidationError('', null, '');
      error.inner = [
        new yup.ValidationError('エラー1', 'value1', 'field1'),
        new yup.ValidationError('エラー2', 'value2', undefined),
      ];

      const formatted = formatValidationErrors(error);

      expect(formatted).toEqual({
        field1: 'エラー1',
      });
    });
  });

  describe('validateData', () => {
    const testSchema = yup.object({
      name: yup.string().required('名前は必須です'),
      age: yup.number().min(0, '年齢は0以上である必要があります'),
    });

    it('有効なデータを検証して返す', async () => {
      const validData = {
        name: 'テスト',
        age: 25,
      };

      await expect(validateData(testSchema, validData)).resolves.toEqual(validData);
    });

    it('無効なデータでエラーをスローする', async () => {
      const invalidData = {
        age: -1,
      };

      try {
        await validateData(testSchema, invalidData);
        fail('エラーがスローされるべき');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('入力データが無効です');
        expect(error.errors).toHaveProperty('name', '名前は必須です');
        expect(error.errors).toHaveProperty('age', '年齢は0以上である必要があります');
      }
    });

    it('検証以外のエラーはそのまま再スローする', async () => {
      const brokenSchema = {
        validate: () => {
          throw new Error('予期しないエラー');
        },
      } as any;

      await expect(validateData(brokenSchema, {})).rejects.toThrow('予期しないエラー');
    });
  });
});