/**
 * フォーマッターユーティリティ
 */

/**
 * フォーマッター関数群
 */
export const formatters = {
  /**
   * 通貨フォーマット（日本円）
   */
  currency: (value: number | string | null | undefined, options?: {
    showSymbol?: boolean
    decimals?: number
  }): string => {
    const { showSymbol = true, decimals = 0 } = options || {}
    
    if (value === null || value === undefined) return ''
    
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    
    const formatted = new Intl.NumberFormat('ja-JP', {
      style: 'decimal',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
    
    return showSymbol ? `¥${formatted}` : formatted
  },

  /**
   * パーセンテージフォーマット
   */
  percentage: (value: number | string | null | undefined, options?: {
    decimals?: number
    showSymbol?: boolean
  }): string => {
    const { decimals = 1, showSymbol = true } = options || {}
    
    if (value === null || value === undefined) return ''
    
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    
    const formatted = num.toFixed(decimals)
    return showSymbol ? `${formatted}%` : formatted
  },

  /**
   * ファイルサイズフォーマット
   */
  fileSize: (bytes: number | null | undefined): string => {
    if (bytes === null || bytes === undefined) return ''
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 電話番号フォーマット（日本）
   */
  phoneNumber: (value: string | null | undefined): string => {
    if (!value) return ''
    
    // 数字以外を除去
    const cleaned = value.replace(/\D/g, '')
    
    // 携帯電話番号（11桁）
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      if (cleaned.startsWith('070') || cleaned.startsWith('080') || cleaned.startsWith('090')) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
      }
    }
    
    // 固定電話（10桁）
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      // 東京03など
      if (cleaned.startsWith('03') || cleaned.startsWith('06')) {
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
      }
      // その他の地域
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    
    // フォーマットできない場合はそのまま返す
    return value
  },

  /**
   * 郵便番号フォーマット
   */
  postalCode: (value: string | null | undefined): string => {
    if (!value) return ''
    
    // 数字以外を除去
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length === 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }
    
    return value
  },

  /**
   * 数値の3桁カンマ区切り
   */
  number: (value: number | string | null | undefined, decimals?: number): string => {
    if (value === null || value === undefined) return ''
    
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    
    return new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  },

  /**
   * 名前のフォーマット（姓名の間にスペース）
   */
  fullName: (lastName: string | null | undefined, firstName: string | null | undefined): string => {
    const parts = []
    if (lastName) parts.push(lastName)
    if (firstName) parts.push(firstName)
    return parts.join(' ')
  },

  /**
   * 名前のイニシャル
   */
  initials: (name: string | null | undefined): string => {
    if (!name) return ''
    
    const parts = name.split(/\s+/)
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    
    return parts
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  },

  /**
   * 銀行口座番号のフォーマット
   */
  bankAccount: (value: string | null | undefined): string => {
    if (!value) return ''
    
    const cleaned = value.replace(/\D/g, '')
    
    // 7桁の場合（一般的な口座番号）
    if (cleaned.length === 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }
    
    return value
  },

  /**
   * クレジットカード番号のマスキング
   */
  creditCardMask: (value: string | null | undefined): string => {
    if (!value) return ''
    
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length >= 12) {
      const last4 = cleaned.slice(-4)
      const masked = '*'.repeat(cleaned.length - 4)
      
      // 4桁ごとに区切る
      const formatted = (masked + last4).match(/.{1,4}/g)?.join(' ') || value
      return formatted
    }
    
    return value
  },

  /**
   * 時間のフォーマット（秒を時:分:秒に変換）
   */
  duration: (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) return ''
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}時間${minutes}分${secs}秒`
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`
    } else {
      return `${secs}秒`
    }
  },

  /**
   * 略語の生成
   */
  abbreviate: (text: string | null | undefined, maxLength: number = 20): string => {
    if (!text) return ''
    
    if (text.length <= maxLength) return text
    
    return text.slice(0, maxLength - 3) + '...'
  },

  /**
   * スネークケースからキャメルケースへ
   */
  snakeToCamel: (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  },

  /**
   * キャメルケースからスネークケースへ
   */
  camelToSnake: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  },

  /**
   * パスカルケースへの変換
   */
  toPascalCase: (str: string): string => {
    return str
      .replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[a-z]/, letter => letter.toUpperCase())
  },

  /**
   * URLセーフな文字列に変換（スラッグ化）
   */
  slugify: (text: string | null | undefined): string => {
    if (!text) return ''
    
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '-') // スペースをハイフンに
      .replace(/--+/g, '-') // 連続するハイフンを1つに
      .replace(/^-+/, '') // 先頭のハイフンを削除
      .replace(/-+$/, '') // 末尾のハイフンを削除
  },
}

export default formatters