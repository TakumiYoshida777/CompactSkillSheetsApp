import {
  validateEmail,
  validatePhoneNumber,
  validatePostalCode,
  validateKatakana,
  validateHiragana,
  validateURL,
  validateCorporateNumber,
  validateDate,
  validateFiscalYear,
  createValidationRules,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('正しいメールアドレスを検証できること', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@example.co.jp')).toBe(true);
      expect(validateEmail('test+tag@example.com')).toBe(true);
    });

    it('不正なメールアドレスを検証できること', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('正しい電話番号を検証できること', () => {
      expect(validatePhoneNumber('03-1234-5678')).toBe(true);
      expect(validatePhoneNumber('090-1234-5678')).toBe(true);
      expect(validatePhoneNumber('0120-123-456')).toBe(true);
      expect(validatePhoneNumber('03-1234-5678')).toBe(true);
      expect(validatePhoneNumber('0312345678')).toBe(true);
      expect(validatePhoneNumber('09012345678')).toBe(true);
    });

    it('不正な電話番号を検証できること', () => {
      expect(validatePhoneNumber('123-456')).toBe(false);
      expect(validatePhoneNumber('abc-1234-5678')).toBe(false);
      expect(validatePhoneNumber('1234567890')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validatePostalCode', () => {
    it('正しい郵便番号を検証できること', () => {
      expect(validatePostalCode('100-0001')).toBe(true);
      expect(validatePostalCode('1000001')).toBe(true);
      expect(validatePostalCode('999-9999')).toBe(true);
    });

    it('不正な郵便番号を検証できること', () => {
      expect(validatePostalCode('100-000')).toBe(false);
      expect(validatePostalCode('10000001')).toBe(false);
      expect(validatePostalCode('abc-defg')).toBe(false);
      expect(validatePostalCode('')).toBe(false);
    });
  });

  describe('validateKatakana', () => {
    it('カタカナ文字列を検証できること', () => {
      expect(validateKatakana('カタカナ')).toBe(true);
      expect(validateKatakana('ヤマダタロウ')).toBe(true);
      expect(validateKatakana('カタカナ　スペース')).toBe(true);
      expect(validateKatakana('カタカナ・ナカテン')).toBe(true);
    });

    it('カタカナ以外の文字列を検証できること', () => {
      expect(validateKatakana('ひらがな')).toBe(false);
      expect(validateKatakana('漢字')).toBe(false);
      expect(validateKatakana('English')).toBe(false);
      expect(validateKatakana('カタカナhiragana')).toBe(false);
      expect(validateKatakana('')).toBe(false);
    });
  });

  describe('validateHiragana', () => {
    it('ひらがな文字列を検証できること', () => {
      expect(validateHiragana('ひらがな')).toBe(true);
      expect(validateHiragana('やまだたろう')).toBe(true);
      expect(validateHiragana('ひらがな　すぺーす')).toBe(true);
    });

    it('ひらがな以外の文字列を検証できること', () => {
      expect(validateHiragana('カタカナ')).toBe(false);
      expect(validateHiragana('漢字')).toBe(false);
      expect(validateHiragana('English')).toBe(false);
      expect(validateHiragana('')).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('正しいURLを検証できること', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://example.com')).toBe(true);
      expect(validateURL('https://www.example.com')).toBe(true);
      expect(validateURL('https://example.com/path')).toBe(true);
      expect(validateURL('https://example.com:8080')).toBe(true);
      expect(validateURL('https://sub.example.co.jp')).toBe(true);
    });

    it('不正なURLを検証できること', () => {
      expect(validateURL('example.com')).toBe(false);
      expect(validateURL('htp://example.com')).toBe(false);
      expect(validateURL('https://')).toBe(false);
      expect(validateURL('not a url')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });

  describe('validateCorporateNumber', () => {
    it('正しい法人番号を検証できること', () => {
      expect(validateCorporateNumber('1234567890123')).toBe(true);
      expect(validateCorporateNumber('9999999999999')).toBe(true);
    });

    it('不正な法人番号を検証できること', () => {
      expect(validateCorporateNumber('123456789012')).toBe(false);
      expect(validateCorporateNumber('12345678901234')).toBe(false);
      expect(validateCorporateNumber('abcdefghijklm')).toBe(false);
      expect(validateCorporateNumber('')).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('正しい日付を検証できること', () => {
      expect(validateDate('2024-01-01')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
      expect(validateDate('2024-02-29')).toBe(true); // うるう年
    });

    it('不正な日付を検証できること', () => {
      expect(validateDate('2024-13-01')).toBe(false);
      expect(validateDate('2024-00-01')).toBe(false);
      expect(validateDate('2024-01-32')).toBe(false);
      expect(validateDate('2023-02-29')).toBe(false); // 平年
      expect(validateDate('2024/01/01')).toBe(false);
      expect(validateDate('not a date')).toBe(false);
      expect(validateDate('')).toBe(false);
    });
  });

  describe('validateFiscalYear', () => {
    it('正しい年度を検証できること', () => {
      expect(validateFiscalYear(2024)).toBe(true);
      expect(validateFiscalYear(2000)).toBe(true);
      expect(validateFiscalYear(2100)).toBe(true);
    });

    it('不正な年度を検証できること', () => {
      expect(validateFiscalYear(1899)).toBe(false);
      expect(validateFiscalYear(2101)).toBe(false);
      expect(validateFiscalYear(0)).toBe(false);
      expect(validateFiscalYear(-2024)).toBe(false);
      expect(validateFiscalYear(NaN)).toBe(false);
    });
  });

  describe('createValidationRules', () => {
    describe('required', () => {
      it('必須項目のルールを生成できること', () => {
        const rules = createValidationRules.required('会社名');
        expect(rules).toHaveLength(1);
        expect(rules[0].required).toBe(true);
        expect(rules[0].message).toBe('会社名を入力してください');
      });
    });

    describe('email', () => {
      it('メールアドレスのルールを生成できること', () => {
        const rules = createValidationRules.email;
        expect(rules).toHaveLength(2);
        expect(rules[0].required).toBe(true);
        expect(rules[1].type).toBe('email');
      });
    });

    describe('phone', () => {
      it('電話番号のルールを生成できること', () => {
        const rules = createValidationRules.phone;
        expect(rules).toHaveLength(1);
        
        // バリデータ関数のテスト
        const validator = rules[0].validator;
        if (validator) {
          // 正しい電話番号
          expect(() => validator({} as any, '03-1234-5678')).not.toThrow();
          expect(() => validator({} as any, '090-1234-5678')).not.toThrow();
          
          // 不正な電話番号
          return validator({} as any, 'invalid').catch((error: Error) => {
            expect(error.message).toBe('正しい電話番号を入力してください');
          });
        }
      });
    });

    describe('postalCode', () => {
      it('郵便番号のルールを生成できること', () => {
        const rules = createValidationRules.postalCode;
        expect(rules).toHaveLength(1);
        
        const validator = rules[0].validator;
        if (validator) {
          // 正しい郵便番号
          expect(() => validator({} as any, '100-0001')).not.toThrow();
          
          // 不正な郵便番号
          return validator({} as any, 'invalid').catch((error: Error) => {
            expect(error.message).toBe('正しい郵便番号を入力してください（例：100-0001）');
          });
        }
      });
    });

    describe('katakana', () => {
      it('カタカナのルールを生成できること', () => {
        const rules = createValidationRules.katakana;
        expect(rules).toHaveLength(1);
        
        const validator = rules[0].validator;
        if (validator) {
          // 正しいカタカナ
          expect(() => validator({} as any, 'カタカナ')).not.toThrow();
          
          // カタカナ以外
          return validator({} as any, 'ひらがな').catch((error: Error) => {
            expect(error.message).toBe('カタカナで入力してください');
          });
        }
      });
    });

    describe('url', () => {
      it('URLのルールを生成できること', () => {
        const rules = createValidationRules.url;
        expect(rules).toHaveLength(1);
        
        const validator = rules[0].validator;
        if (validator) {
          // 正しいURL
          expect(() => validator({} as any, 'https://example.com')).not.toThrow();
          
          // 不正なURL
          return validator({} as any, 'not a url').catch((error: Error) => {
            expect(error.message).toBe('正しいURLを入力してください');
          });
        }
      });
    });

    describe('minLength', () => {
      it('最小文字数のルールを生成できること', () => {
        const rules = createValidationRules.minLength(8, 'パスワード');
        expect(rules).toHaveLength(1);
        expect(rules[0].min).toBe(8);
        expect(rules[0].message).toBe('パスワードは8文字以上で入力してください');
      });
    });

    describe('maxLength', () => {
      it('最大文字数のルールを生成できること', () => {
        const rules = createValidationRules.maxLength(100, '説明');
        expect(rules).toHaveLength(1);
        expect(rules[0].max).toBe(100);
        expect(rules[0].message).toBe('説明は100文字以内で入力してください');
      });
    });

    describe('corporateNumber', () => {
      it('法人番号のルールを生成できること', () => {
        const rules = createValidationRules.corporateNumber;
        expect(rules).toHaveLength(1);
        
        const validator = rules[0].validator;
        if (validator) {
          // 正しい法人番号
          expect(() => validator({} as any, '1234567890123')).not.toThrow();
          
          // 不正な法人番号
          return validator({} as any, '123').catch((error: Error) => {
            expect(error.message).toBe('正しい法人番号を入力してください（13桁）');
          });
        }
      });
    });

    describe('date', () => {
      it('日付のルールを生成できること', () => {
        const rules = createValidationRules.date;
        expect(rules).toHaveLength(1);
        
        const validator = rules[0].validator;
        if (validator) {
          // 正しい日付
          expect(() => validator({} as any, '2024-01-01')).not.toThrow();
          
          // 不正な日付
          return validator({} as any, '2024-13-01').catch((error: Error) => {
            expect(error.message).toBe('正しい日付を入力してください（YYYY-MM-DD）');
          });
        }
      });
    });
  });
});