/**
 * 日付処理ユーティリティ
 */

import { format, parse, addDays, differenceInDays, isWeekend, addBusinessDays, isValid } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付ユーティリティ関数
 */
export const dateUtils = {
  /**
   * 日付のフォーマット
   */
  format: (date: Date | string | null | undefined, formatStr: string = 'yyyy年MM月dd日'): string => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (!isValid(dateObj)) return ''
    
    return format(dateObj, formatStr, { locale: ja })
  },

  /**
   * 日時のフォーマット
   */
  formatDateTime: (date: Date | string | null | undefined): string => {
    return dateUtils.format(date, 'yyyy年MM月dd日 HH:mm:ss')
  },

  /**
   * 時刻のフォーマット
   */
  formatTime: (date: Date | string | null | undefined): string => {
    return dateUtils.format(date, 'HH:mm')
  },

  /**
   * 相対時間の表示（例：3時間前）
   */
  formatRelative: (date: Date | string): string => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'たった今'
    if (diffInMinutes < 60) return `${diffInMinutes}分前`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}時間前`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}日前`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}週間前`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}ヶ月前`
    
    return `${Math.floor(diffInDays / 365)}年前`
  },

  /**
   * 文字列から日付をパース
   */
  parse: (dateString: string, formatStr: string = 'yyyy-MM-dd'): Date | null => {
    try {
      const parsed = parse(dateString, formatStr, new Date(), { locale: ja })
      return isValid(parsed) ? parsed : null
    } catch {
      return null
    }
  },

  /**
   * 日数を加算
   */
  addDays: (date: Date | string, days: number): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return addDays(dateObj, days)
  },

  /**
   * 営業日を加算
   */
  addBusinessDays: (date: Date | string, days: number): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return addBusinessDays(dateObj, days)
  },

  /**
   * 日数の差分を計算
   */
  diffInDays: (date1: Date | string, date2: Date | string): number => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
    return differenceInDays(dateObj1, dateObj2)
  },

  /**
   * 営業日かどうかを判定
   */
  isBusinessDay: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // 週末でない
    if (isWeekend(dateObj)) return false
    
    // 日本の祝日判定（簡易版）
    const holidays = getJapaneseHolidays(dateObj.getFullYear())
    const dateStr = format(dateObj, 'yyyy-MM-dd')
    
    return !holidays.includes(dateStr)
  },

  /**
   * 期間内の営業日数を取得
   */
  getBusinessDays: (start: Date | string, end: Date | string): number => {
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end
    
    let count = 0
    let current = new Date(startDate)
    
    while (current <= endDate) {
      if (dateUtils.isBusinessDay(current)) {
        count++
      }
      current = addDays(current, 1)
    }
    
    return count
  },

  /**
   * ISO形式に変換
   */
  toISO: (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString()
  },

  /**
   * 日付の比較
   */
  isBefore: (date1: Date | string, date2: Date | string): boolean => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
    return dateObj1 < dateObj2
  },

  isAfter: (date1: Date | string, date2: Date | string): boolean => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
    return dateObj1 > dateObj2
  },

  isSameDay: (date1: Date | string, date2: Date | string): boolean => {
    const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
    const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
    return format(dateObj1, 'yyyy-MM-dd') === format(dateObj2, 'yyyy-MM-dd')
  },

  /**
   * 年齢計算
   */
  calculateAge: (birthDate: Date | string): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  },

  /**
   * 期限までの残り日数
   */
  daysUntil: (targetDate: Date | string): number => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  },

  /**
   * 日付範囲の生成
   */
  getDateRange: (start: Date | string, end: Date | string): Date[] => {
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end
    const dates: Date[] = []
    let current = new Date(startDate)
    
    while (current <= endDate) {
      dates.push(new Date(current))
      current = addDays(current, 1)
    }
    
    return dates
  },
}

/**
 * 日本の祝日を取得（簡易版）
 * 実際の実装では、内閣府のデータやライブラリを使用することを推奨
 */
function getJapaneseHolidays(year: number): string[] {
  const holidays: string[] = []
  
  // 固定祝日
  holidays.push(`${year}-01-01`) // 元日
  holidays.push(`${year}-02-11`) // 建国記念の日
  holidays.push(`${year}-02-23`) // 天皇誕生日
  holidays.push(`${year}-04-29`) // 昭和の日
  holidays.push(`${year}-05-03`) // 憲法記念日
  holidays.push(`${year}-05-04`) // みどりの日
  holidays.push(`${year}-05-05`) // こどもの日
  holidays.push(`${year}-08-11`) // 山の日
  holidays.push(`${year}-11-03`) // 文化の日
  holidays.push(`${year}-11-23`) // 勤労感謝の日
  
  // 移動祝日は計算が複雑なため、実際の実装では専用ライブラリを使用
  
  return holidays
}

export default dateUtils