/**
 * サイドバーコンポーネント
 */

import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  Home,
  Users,
  FileText,
  FolderOpen,
  Send,
  Building,
  BarChart3,
  Settings,
  Shield,
  X,
  ChevronRight,
  Briefcase,
  Target,
  Calendar,
  DollarSign,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onClose?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
  children?: MenuItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onClose }) => {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const userRole = user?.role || 'guest'

  // ユーザーロールに応じてメニューを動的に生成
  const menuItems: MenuItem[] = useMemo(() => {
    const baseMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: <Home className="w-5 h-5" />,
      path: 'dashboard',
    },
    {
      id: 'engineers',
      label: 'エンジニア管理',
      icon: <Users className="w-5 h-5" />,
      path: 'engineers',
      badge: 5,
    },
    {
      id: 'skill-sheets',
      label: 'スキルシート',
      icon: <FileText className="w-5 h-5" />,
      path: 'skill-sheets',
    },
    {
      id: 'projects',
      label: 'プロジェクト',
      icon: <FolderOpen className="w-5 h-5" />,
      path: 'projects',
    },
    {
      id: 'approaches',
      label: 'アプローチ',
      icon: <Send className="w-5 h-5" />,
      path: 'approaches',
    },
    {
      id: 'clients',
      label: '取引先管理',
      icon: <Building className="w-5 h-5" />,
      path: 'clients',
    },
    {
      id: 'offers',
      label: 'オファー管理',
      icon: <Target className="w-5 h-5" />,
      path: 'offers',
    },
    {
      id: 'contracts',
      label: '契約管理',
      icon: <Briefcase className="w-5 h-5" />,
      path: 'contracts',
    },
    {
      id: 'billing',
      label: '請求管理',
      icon: <DollarSign className="w-5 h-5" />,
      path: 'billing',
    },
    {
      id: 'calendar',
      label: 'カレンダー',
      icon: <Calendar className="w-5 h-5" />,
      path: 'calendar',
    },
    {
      id: 'analytics',
      label: '分析・レポート',
      icon: <BarChart3 className="w-5 h-5" />,
      path: 'analytics',
    },
  ]

    // ロールに応じてメニューをフィルタリング
    if (userRole === 'admin' || userRole === 'company_admin') {
      // 管理者は全メニューにアクセス可能
      return baseMenuItems
    } else if (userRole === 'engineer') {
      // エンジニアはダッシュボード、スキルシート、プロジェクト、カレンダーのみ
      return baseMenuItems.filter(item => 
        ['dashboard', 'skill-sheets', 'projects', 'calendar'].includes(item.id)
      )
    } else if (userRole === 'client') {
      // 取引先はダッシュボード、エンジニア管理、オファー管理のみ
      return baseMenuItems.filter(item => 
        ['dashboard', 'engineers', 'offers'].includes(item.id)
      )
    } else {
      // ゲストユーザーはダッシュボードのみ
      return baseMenuItems.filter(item => item.id === 'dashboard')
    }
  }, [userRole])

  const systemMenuItems: MenuItem[] = useMemo(() => {
    const baseSystemMenuItems: MenuItem[] = [
    {
      id: 'admin',
      label: '管理者設定',
      icon: <Shield className="w-5 h-5" />,
      path: 'admin',
    },
    {
      id: 'settings',
      label: '設定',
      icon: <Settings className="w-5 h-5" />,
      path: 'settings',
    },
  ]

    // ロールに応じてシステムメニューをフィルタリング
    if (userRole === 'admin' || userRole === 'company_admin') {
      return baseSystemMenuItems
    } else {
      // 管理者以外は設定メニューのみ
      return baseSystemMenuItems.filter(item => item.id === 'settings')
    }
  }, [userRole])

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.path)

    return (
      <NavLink
        key={item.id}
        to={item.path}
        className={`
          flex items-center justify-between px-3 py-2 rounded-lg transition-colors
          ${active 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        <div className="flex items-center space-x-3">
          <span className={active ? 'text-blue-600' : 'text-gray-500'}>
            {item.icon}
          </span>
          {!collapsed && (
            <span className="text-sm font-medium">{item.label}</span>
          )}
        </div>
        {!collapsed && item.badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
            {item.badge}
          </span>
        )}
        {!collapsed && item.children && (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </NavLink>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* モバイル用クローズボタン */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">メニュー</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* メインメニュー */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>

        {/* システムメニュー */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              システム
            </h3>
          )}
          <div className="space-y-1">
            {systemMenuItems.map(renderMenuItem)}
          </div>
        </div>
      </nav>

      {/* フッター情報 */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>バージョン: 1.0.0</div>
            <div>© 2024 SES Corp.</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar