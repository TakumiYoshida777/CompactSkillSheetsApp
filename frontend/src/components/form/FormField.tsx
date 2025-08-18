/**
 * フォームフィールドコンポーネント
 */

import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validate?: (value: any) => boolean | string
}

interface FormFieldProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time' | 'textarea' | 'select'
  value?: any
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  validation?: ValidationRule
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  error?: string
  hint?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
  className?: string
  autoComplete?: string
  autoFocus?: boolean
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validation,
  placeholder,
  required,
  disabled,
  readOnly,
  error,
  hint,
  options,
  rows = 3,
  className,
  autoComplete,
  autoFocus,
}, ref) => {
  const isRequired = required || validation?.required

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${className || ''}
  `

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={isRequired}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={baseInputClasses}
            autoFocus={autoFocus}
          />
        )

      case 'select':
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            required={isRequired}
            disabled={disabled}
            className={baseInputClasses}
            autoFocus={autoFocus}
          >
            <option value="">選択してください</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={isRequired}
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            min={validation?.min}
            max={validation?.max}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      {/* ラベル */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* 入力フィールド */}
      {renderInput()}

      {/* ヒント */}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="flex items-center space-x-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField