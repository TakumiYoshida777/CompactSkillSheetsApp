/**
 * Money ValueObject
 * 金額を表す値オブジェクト
 */
export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'JPY') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!Money.isValidCurrency(currency)) {
      throw new Error(`Invalid currency: ${currency}`);
    }
    this.amount = Math.round(amount * 100) / 100; // 小数点以下2桁まで
    this.currency = currency;
  }

  /**
   * 有効な通貨コードかチェック
   */
  private static isValidCurrency(currency: string): boolean {
    const validCurrencies = ['JPY', 'USD', 'EUR', 'GBP', 'CNY'];
    return validCurrencies.includes(currency);
  }

  /**
   * 金額の取得
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * 通貨の取得
   */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * 加算
   */
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * 減算
   */
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * 乗算
   */
  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  /**
   * 除算
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  /**
   * 等価性の確認
   */
  equals(other: Money): boolean {
    if (!other) return false;
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * 比較（大きい）
   */
  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > other.amount;
  }

  /**
   * 比較（小さい）
   */
  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < other.amount;
  }

  /**
   * ゼロかチェック
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * 正の値かチェック
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * フォーマットされた文字列を取得
   */
  toString(): string {
    if (this.currency === 'JPY') {
      return `¥${this.amount.toLocaleString('ja-JP')}`;
    }
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CNY': '¥'
    };
    const symbol = symbols[this.currency] || this.currency;
    return `${symbol}${this.amount.toLocaleString()}`;
  }

  /**
   * パーセンテージ計算
   */
  percentage(percent: number): Money {
    return new Money(this.amount * percent / 100, this.currency);
  }

  /**
   * 税込計算（日本の消費税）
   */
  withTax(taxRate: number = 10): Money {
    return new Money(this.amount * (1 + taxRate / 100), this.currency);
  }

  /**
   * 税抜計算（日本の消費税）
   */
  withoutTax(taxRate: number = 10): Money {
    return new Money(this.amount / (1 + taxRate / 100), this.currency);
  }
}