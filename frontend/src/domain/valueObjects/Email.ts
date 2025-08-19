/**
 * Email ValueObject
 * メールアドレスの値オブジェクト
 */
export class Email {
  private readonly value: string;

  constructor(value: string) {
    const trimmedValue = value.trim();
    if (!Email.isValid(trimmedValue)) {
      throw new Error(`Invalid email address: ${value}`);
    }
    this.value = trimmedValue.toLowerCase();
  }

  /**
   * メールアドレスのバリデーション
   */
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 値の取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 文字列変換
   */
  toString(): string {
    return this.value;
  }

  /**
   * 等価性の確認
   */
  equals(other: Email): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * ドメイン部分の取得
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * ローカル部分の取得
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * マスク表示用の文字列を生成
   */
  getMasked(): string {
    const [localPart, domain] = this.value.split('@');
    const maskedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '***'
      : '***';
    return `${maskedLocal}@${domain}`;
  }
}