/**
 * パンくずリストコンポーネント
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

export const Breadcrumb: React.FC = () => {
  const location = useLocation()

  // パスからパンくずアイテムを生成
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'ホーム', path: '/' }
    ]

    // パスセグメントをラベルに変換するマッピング
    const labelMap: Record<string, string> = {
      dashboard: 'ダッシュボード',
      engineers: 'エンジニア管理',
      'skill-sheets': 'スキルシート',
      projects: 'プロジェクト',
      approaches: 'アプローチ',
      clients: '取引先管理',
      offers: 'オファー管理',
      contracts: '契約管理',
      billing: '請求管理',
      calendar: 'カレンダー',
      analytics: '分析・レポート',
      admin: '管理者設定',
      settings: '設定',
      new: '新規作成',
      edit: '編集',
      detail: '詳細',
    }

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // IDっぽいセグメント（UUID or 数字）はスキップ
      if (/^[0-9a-f-]+$/i.test(segment) || /^\d+$/.test(segment)) {
        return
      }

      const label = labelMap[segment] || segment
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // パンくずが1つだけ（ホームのみ）の場合は表示しない
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav aria-label="パンくずリスト" className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isFirst = index === 0

        return (
          <React.Fragment key={index}>
            {!isFirst && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            
            {isFirst ? (
              // ホームアイコン
              <Link
                to={item.path!}
                className="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center"
              >
                <Home className="w-4 h-4" />
              </Link>
            ) : isLast ? (
              // 最後のアイテム（現在のページ）
              <span className="text-gray-900 font-medium">
                {item.label}
              </span>
            ) : (
              // 中間のアイテム（リンク）
              <Link
                to={item.path!}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb