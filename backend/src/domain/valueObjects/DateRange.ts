/**
 * DateRange ValueObject
 * 期間を表す値オブジェクト
 */
export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date;

  constructor(startDate: Date | string, endDate: Date | string) {
    this.startDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
    this.endDate = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (!this.isValid()) {
      throw new Error('Invalid date range: start date must be before or equal to end date');
    }
  }

  /**
   * 有効な期間かチェック
   */
  private isValid(): boolean {
    return this.startDate <= this.endDate;
  }

  /**
   * 開始日の取得
   */
  getStartDate(): Date {
    return new Date(this.startDate);
  }

  /**
   * 終了日の取得
   */
  getEndDate(): Date {
    return new Date(this.endDate);
  }

  /**
   * 日数の取得
   */
  getDays(): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((this.endDate.getTime() - this.startDate.getTime()) / millisecondsPerDay) + 1;
  }

  /**
   * 月数の取得（概算）
   */
  getMonths(): number {
    const months = (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12
                 + (this.endDate.getMonth() - this.startDate.getMonth());
    const daysDiff = this.endDate.getDate() - this.startDate.getDate();
    return months + (daysDiff >= 0 ? 0 : -1);
  }

  /**
   * 指定日が期間内かチェック
   */
  contains(date: Date | string): boolean {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    return checkDate >= this.startDate && checkDate <= this.endDate;
  }

  /**
   * 他の期間と重なっているかチェック
   */
  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  /**
   * 等価性の確認
   */
  equals(other: DateRange): boolean {
    if (!other) return false;
    return this.startDate.getTime() === other.startDate.getTime() &&
           this.endDate.getTime() === other.endDate.getTime();
  }

  /**
   * フォーマットされた文字列を取得
   */
  toString(): string {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return `${formatDate(this.startDate)} 〜 ${formatDate(this.endDate)}`;
  }

  /**
   * 期間の拡張
   */
  extend(days: number): DateRange {
    const newEndDate = new Date(this.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    return new DateRange(this.startDate, newEndDate);
  }

  /**
   * 期間の短縮
   */
  shorten(days: number): DateRange {
    const newEndDate = new Date(this.endDate);
    newEndDate.setDate(newEndDate.getDate() - days);
    return new DateRange(this.startDate, newEndDate);
  }

  /**
   * 現在の日付が期間内かチェック
   */
  isActive(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.contains(today);
  }

  /**
   * 期間が過去かチェック
   */
  isPast(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.endDate < today;
  }

  /**
   * 期間が未来かチェック
   */
  isFuture(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.startDate > today;
  }
}