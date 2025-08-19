/**
 * PhoneNumber ValueObject
 * 電話番号を表す値オブジェクト
 */
export class PhoneNumber {
  private readonly value: string;
  private readonly countryCode: string;

  constructor(value: string, countryCode: string = 'JP') {
    const normalizedValue = this.normalize(value);
    if (!PhoneNumber.isValid(normalizedValue, countryCode)) {
      throw new Error(`Invalid phone number: ${value}`);
    }
    this.value = normalizedValue;
    this.countryCode = countryCode;
  }

  /**
   * 電話番号の正規化
   */
  private normalize(value: string): string {
    // ハイフン、スペース、括弧を除去
    return value.replace(/[-\s()]/g, '');
  }

  /**
   * 有効な電話番号かチェック
   */
  static isValid(value: string, countryCode: string = 'JP'): boolean {
    const normalized = value.replace(/[-\s()]/g, '');
    
    if (countryCode === 'JP') {
      // 日本の電話番号パターン
      // 固定電話: 0X-XXXX-XXXX or 0XX-XXX-XXXX or 0XXX-XX-XXXX
      // 携帯電話: 070/080/090-XXXX-XXXX
      // IP電話: 050-XXXX-XXXX
      const japanPhoneRegex = /^(0[3-9]0?\d{8}|050\d{8})$/;
      return japanPhoneRegex.test(normalized);
    }
    
    // その他の国の簡易チェック（数字のみ、7-15桁）
    const generalPhoneRegex = /^\d{7,15}$/;
    return generalPhoneRegex.test(normalized);
  }

  /**
   * 値の取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 国コードの取得
   */
  getCountryCode(): string {
    return this.countryCode;
  }

  /**
   * フォーマットされた文字列を取得
   */
  getFormatted(): string {
    if (this.countryCode === 'JP') {
      // 日本の電話番号フォーマット
      if (this.value.startsWith('050')) {
        // IP電話: 050-XXXX-XXXX
        return `${this.value.slice(0, 3)}-${this.value.slice(3, 7)}-${this.value.slice(7)}`;
      } else if (this.value.startsWith('0') && (this.value[1] === '7' || this.value[1] === '8' || this.value[1] === '9')) {
        // 携帯電話: 0X0-XXXX-XXXX
        return `${this.value.slice(0, 3)}-${this.value.slice(3, 7)}-${this.value.slice(7)}`;
      } else if (this.value.length === 10) {
        // 固定電話（10桁）
        if (this.value[1] === '3' || this.value[1] === '6') {
          // 東京(03)、大阪(06): 0X-XXXX-XXXX
          return `${this.value.slice(0, 2)}-${this.value.slice(2, 6)}-${this.value.slice(6)}`;
        } else {
          // その他: 0XX-XXX-XXXX
          return `${this.value.slice(0, 3)}-${this.value.slice(3, 6)}-${this.value.slice(6)}`;
        }
      } else if (this.value.length === 11) {
        // 固定電話（11桁）: 0XXX-XX-XXXX
        return `${this.value.slice(0, 4)}-${this.value.slice(4, 6)}-${this.value.slice(6)}`;
      }
    }
    
    // デフォルトフォーマット
    return this.value;
  }

  /**
   * 国際電話番号形式を取得
   */
  getInternational(): string {
    if (this.countryCode === 'JP') {
      // 日本の国番号は+81
      const withoutLeadingZero = this.value.substring(1);
      return `+81-${withoutLeadingZero}`;
    }
    return this.value;
  }

  /**
   * マスク表示用の文字列を生成
   */
  getMasked(): string {
    const formatted = this.getFormatted();
    const parts = formatted.split('-');
    if (parts.length >= 3) {
      return `${parts[0]}-****-${parts[parts.length - 1]}`;
    }
    return formatted.substring(0, 3) + '****';
  }

  /**
   * 携帯電話番号かチェック
   */
  isMobile(): boolean {
    if (this.countryCode === 'JP') {
      return this.value.startsWith('070') || 
             this.value.startsWith('080') || 
             this.value.startsWith('090');
    }
    return false;
  }

  /**
   * 等価性の確認
   */
  equals(other: PhoneNumber): boolean {
    if (!other) return false;
    return this.value === other.value && this.countryCode === other.countryCode;
  }

  /**
   * 文字列変換
   */
  toString(): string {
    return this.getFormatted();
  }
}