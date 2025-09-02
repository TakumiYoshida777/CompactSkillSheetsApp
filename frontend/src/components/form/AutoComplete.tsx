/**
 * オートコンプリートコンポーネント
 */

import { errorLog } from '../../utils/logger';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { debounce } from 'lodash'

interface AutoCompleteOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
}

interface AutoCompleteProps {
  name: string
  label: string
  value?: string | string[]
  onChange: (value: string | string[]) => void
  options?: AutoCompleteOption[]
  fetchOptions?: (query: string) => Promise<AutoCompleteOption[]>
  placeholder?: string
  required?: boolean
  disabled?: boolean
  multiple?: boolean
  error?: string
  hint?: string
  debounceMs?: number
  minChars?: number
  maxSelections?: number
  className?: string
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
  name,
  label,
  value,
  onChange,
  options: staticOptions,
  fetchOptions,
  placeholder = '入力して検索...',
  required,
  disabled,
  multiple = false,
  error,
  hint,
  debounceMs = 300,
  minChars = 2,
  maxSelections,
  className,
}) => {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<AutoCompleteOption[]>(staticOptions || [])
  const [filteredOptions, setFilteredOptions] = useState<AutoCompleteOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<AutoCompleteOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 選択された値の初期化
  useEffect(() => {
    if (value) {
      const values = Array.isArray(value) ? value : [value]
      const selected = (staticOptions || options).filter(opt => 
        values.includes(opt.value)
      )
      setSelectedOptions(selected)
    }
  }, [value, staticOptions, options])

  // デバウンスされた検索処理
  const debouncedFetch = useCallback(
    debounce(async (searchQuery: string) => {
      if (fetchOptions && searchQuery.length >= minChars) {
        setIsLoading(true)
        try {
          const results = await fetchOptions(searchQuery)
          setOptions(results)
          setFilteredOptions(results)
        } catch (error) {
          errorLog('Failed to fetch options:', error)
          setFilteredOptions([])
        } finally {
          setIsLoading(false)
        }
      }
    }, debounceMs),
    [fetchOptions, minChars, debounceMs]
  )

  // 検索クエリの変更処理
  useEffect(() => {
    if (query.length >= minChars) {
      if (fetchOptions) {
        debouncedFetch(query)
      } else if (staticOptions) {
        // 静的オプションのフィルタリング
        const filtered = staticOptions.filter(opt =>
          opt.label.toLowerCase().includes(query.toLowerCase()) ||
          opt.value.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredOptions(filtered)
      }
      setIsOpen(true)
    } else {
      setFilteredOptions([])
      setIsOpen(false)
    }
  }, [query, staticOptions, fetchOptions, debouncedFetch, minChars])

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // オプション選択処理
  const handleSelectOption = (option: AutoCompleteOption) => {
    if (multiple) {
      const isSelected = selectedOptions.some(opt => opt.value === option.value)
      
      if (isSelected) {
        const newSelected = selectedOptions.filter(opt => opt.value !== option.value)
        setSelectedOptions(newSelected)
        onChange(newSelected.map(opt => opt.value))
      } else {
        if (maxSelections && selectedOptions.length >= maxSelections) {
          return
        }
        const newSelected = [...selectedOptions, option]
        setSelectedOptions(newSelected)
        onChange(newSelected.map(opt => opt.value))
      }
      setQuery('')
    } else {
      setSelectedOptions([option])
      onChange(option.value)
      setQuery(option.label)
      setIsOpen(false)
    }
  }

  // 選択解除処理
  const handleRemoveOption = (option: AutoCompleteOption) => {
    const newSelected = selectedOptions.filter(opt => opt.value !== option.value)
    setSelectedOptions(newSelected)
    onChange(multiple ? newSelected.map(opt => opt.value) : '')
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div className={`space-y-1 ${className || ''}`}>
      {/* ラベル */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* 選択されたアイテム（複数選択時） */}
      {multiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
            >
              {option.label}
              <button
                type="button"
                onClick={() => handleRemoveOption(option)}
                className="ml-1 hover:text-blue-900"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 入力フィールド */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            id={name}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= minChars && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-10 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {/* ドロップダウン */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.map((option, index) => {
              const isSelected = selectedOptions.some(opt => opt.value === option.value)
              const isHighlighted = index === highlightedIndex

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2
                    ${isSelected ? 'bg-blue-50 text-blue-700' : ''}
                    ${isHighlighted ? 'bg-gray-100' : ''}
                  `}
                >
                  {option.icon && <span>{option.icon}</span>}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">{option.description}</div>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ヒント */}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {/* エラーメッセージ */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export default AutoComplete