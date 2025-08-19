/**
 * OfferStatus ValueObject
 * オファーステータスの値オブジェクト
 */
export class OfferStatus {
  static readonly PENDING = new OfferStatus('PENDING', '検討中', '#faad14');
  static readonly ACCEPTED = new OfferStatus('ACCEPTED', '承諾', '#52c41a');
  static readonly DECLINED = new OfferStatus('DECLINED', '辞退', '#ff4d4f');
  static readonly WITHDRAWN = new OfferStatus('WITHDRAWN', '撤回', '#8c8c8c');
  static readonly EXPIRED = new OfferStatus('EXPIRED', '期限切れ', '#d9d9d9');
  static readonly SENT = new OfferStatus('SENT', '送信済み', '#1890ff');

  private static readonly VALUES = [
    OfferStatus.PENDING,
    OfferStatus.ACCEPTED,
    OfferStatus.DECLINED,
    OfferStatus.WITHDRAWN,
    OfferStatus.EXPIRED,
    OfferStatus.SENT
  ];

  private constructor(
    private readonly value: string,
    private readonly displayName: string,
    private readonly color: string
  ) {}

  /**
   * 値の取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 表示名の取得
   */
  getDisplayName(): string {
    return this.displayName;
  }

  /**
   * 色の取得
   */
  getColor(): string {
    return this.color;
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
  equals(other: OfferStatus): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * 文字列からOfferStatusを取得
   */
  static fromString(value: string): OfferStatus {
    const status = this.VALUES.find(s => s.value === value);
    if (!status) {
      throw new Error(`Invalid offer status: ${value}`);
    }
    return status;
  }

  /**
   * 有効なステータス値かチェック
   */
  static isValid(value: string): boolean {
    return this.VALUES.some(s => s.value === value);
  }

  /**
   * すべての値を取得
   */
  static getAllValues(): OfferStatus[] {
    return [...this.VALUES];
  }

  /**
   * アクティブなステータスかチェック
   */
  isActive(): boolean {
    return this.equals(OfferStatus.PENDING) || 
           this.equals(OfferStatus.SENT);
  }

  /**
   * 最終ステータスかチェック
   */
  isFinal(): boolean {
    return this.equals(OfferStatus.ACCEPTED) ||
           this.equals(OfferStatus.DECLINED) ||
           this.equals(OfferStatus.WITHDRAWN) ||
           this.equals(OfferStatus.EXPIRED);
  }

  /**
   * 次の可能なステータスを取得
   */
  getNextPossibleStatuses(): OfferStatus[] {
    if (this.equals(OfferStatus.SENT)) {
      return [OfferStatus.PENDING, OfferStatus.WITHDRAWN];
    }
    if (this.equals(OfferStatus.PENDING)) {
      return [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.WITHDRAWN];
    }
    return [];
  }

  /**
   * ステータス遷移が可能かチェック
   */
  canTransitionTo(newStatus: OfferStatus): boolean {
    return this.getNextPossibleStatuses().some(s => s.equals(newStatus));
  }

  /**
   * Ant Design Tag用のステータス取得
   */
  getTagStatus(): 'success' | 'processing' | 'error' | 'warning' | 'default' {
    if (this.equals(OfferStatus.ACCEPTED)) return 'success';
    if (this.equals(OfferStatus.PENDING) || this.equals(OfferStatus.SENT)) return 'processing';
    if (this.equals(OfferStatus.DECLINED)) return 'error';
    if (this.equals(OfferStatus.EXPIRED)) return 'warning';
    return 'default';
  }
}