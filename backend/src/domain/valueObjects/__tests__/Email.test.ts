import { Email } from '../Email';

describe('Email ValueObject', () => {
  describe('constructor', () => {
    it('有効なメールアドレスを受け入れる', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('大文字を小文字に変換する', () => {
      const email = new Email('Test@Example.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('前後の空白を削除する', () => {
      const email = new Email('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('無効なメールアドレスを拒否する', () => {
      expect(() => new Email('invalid')).toThrow('Invalid email address');
      expect(() => new Email('@example.com')).toThrow('Invalid email address');
      expect(() => new Email('test@')).toThrow('Invalid email address');
      expect(() => new Email('test@.com')).toThrow('Invalid email address');
    });
  });

  describe('isValid', () => {
    it('有効なメールアドレスを判定する', () => {
      expect(Email.isValid('test@example.com')).toBe(true);
      expect(Email.isValid('user.name@example.co.jp')).toBe(true);
      expect(Email.isValid('user+tag@example.com')).toBe(true);
    });

    it('無効なメールアドレスを判定する', () => {
      expect(Email.isValid('invalid')).toBe(false);
      expect(Email.isValid('test@')).toBe(false);
      expect(Email.isValid('@example.com')).toBe(false);
    });
  });

  describe('メソッド', () => {
    const email = new Email('user@example.com');

    it('ドメイン部分を取得する', () => {
      expect(email.getDomain()).toBe('example.com');
    });

    it('ローカル部分を取得する', () => {
      expect(email.getLocalPart()).toBe('user');
    });

    it('マスク表示を生成する', () => {
      expect(email.getMasked()).toBe('us***@example.com');
      
      const shortEmail = new Email('a@example.com');
      expect(shortEmail.getMasked()).toBe('***@example.com');
    });

    it('文字列に変換する', () => {
      expect(email.toString()).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    it('同じメールアドレスは等しい', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('異なるメールアドレスは等しくない', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });

    it('nullとは等しくない', () => {
      const email = new Email('test@example.com');
      expect(email.equals(null as any)).toBe(false);
    });
  });
});