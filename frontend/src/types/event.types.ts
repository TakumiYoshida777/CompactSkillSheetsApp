/**
 * イベントハンドラー関連の型定義
 */

import { ReactElement, ChangeEvent, FormEvent, MouseEvent, KeyboardEvent } from 'react'
import { FormInstance } from 'antd/lib/form'

/**
 * フォームイベントハンドラー
 */
export type FormSubmitHandler<T = Record<string, unknown>> = (values: T) => void | Promise<void>

/**
 * 入力変更イベントハンドラー
 */
export type InputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => void
export type TextAreaChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => void
export type SelectChangeHandler = (value: string | string[] | number | number[]) => void

/**
 * ボタンクリックイベントハンドラー
 */
export type ButtonClickHandler = (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>

/**
 * テーブル変更イベントハンドラー
 */
export interface TableChangeParams<T = unknown> {
  current?: number
  pageSize?: number
  total?: number
}

export interface TableFilters {
  [key: string]: Array<string | number | boolean> | null
}

export interface TableSorter {
  field?: string
  order?: 'ascend' | 'descend' | null
}

export type TableChangeHandler<T = unknown> = (
  pagination: TableChangeParams<T>,
  filters: TableFilters,
  sorter: TableSorter | TableSorter[]
) => void

/**
 * フォームバリデーター
 */
export type FormValidator<T = unknown> = (
  rule: T,
  value: unknown
) => Promise<void> | void

/**
 * Ant Design Form のバリデーションルール
 */
export interface FormValidationRule {
  required?: boolean
  message?: string
  pattern?: RegExp
  min?: number
  max?: number
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'url' | 'date'
  validator?: FormValidator
}

/**
 * カスタムレンダラー
 */
export type CustomRenderer<T = unknown> = (
  value: T,
  record?: unknown,
  index?: number
) => ReactElement | string | number | null

/**
 * モーダル関連
 */
export interface ModalHandlers<T = Record<string, unknown>> {
  onOk: (values: T) => void | Promise<void>
  onCancel: () => void
}

/**
 * ファイルアップロード
 */
export interface UploadFile {
  uid: string
  name: string
  status?: 'uploading' | 'done' | 'error' | 'removed'
  url?: string
  size?: number
  type?: string
  response?: unknown
}

export interface UploadChangeInfo {
  file: UploadFile
  fileList: UploadFile[]
}

export type UploadChangeHandler = (info: UploadChangeInfo) => void

/**
 * ドラッグアンドドロップ
 */
export interface DragEndEvent<T = unknown> {
  active: { id: string; data?: T }
  over: { id: string; data?: T } | null
}

export type DragEndHandler<T = unknown> = (event: DragEndEvent<T>) => void

/**
 * 検索関連
 */
export interface SearchParams {
  keyword?: string
  filters?: Record<string, unknown>
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export type SearchHandler = (params: SearchParams) => void | Promise<void>

/**
 * ページネーション
 */
export interface PaginationParams {
  current: number
  pageSize: number
  total?: number
}

export type PaginationChangeHandler = (page: number, pageSize: number) => void

/**
 * チェックボックス
 */
export type CheckboxChangeHandler = (checked: boolean) => void
export type CheckboxGroupChangeHandler = (checkedValues: Array<string | number>) => void

/**
 * ラジオボタン
 */
export type RadioChangeHandler = (value: string | number) => void

/**
 * スイッチ
 */
export type SwitchChangeHandler = (checked: boolean) => void

/**
 * 日付選択
 */
export type DateChangeHandler = (date: Date | null, dateString: string) => void
export type DateRangeChangeHandler = (dates: [Date | null, Date | null] | null, dateStrings: [string, string]) => void

/**
 * タブ切り替え
 */
export type TabChangeHandler = (activeKey: string) => void

/**
 * メニュー選択
 */
export interface MenuInfo {
  key: string
  keyPath: string[]
  item: ReactElement
  domEvent: MouseEvent | KeyboardEvent
}

export type MenuClickHandler = (info: MenuInfo) => void