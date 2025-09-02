/**
 * ヘッダーコンポーネント
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Menu, 
  Search, 
  User, 
  ChevronDown,
  Settings,
  LogOut,
  HelpCircle,
  Building2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { errorLog } from '@/utils/logger'

interface HeaderProps {
  onMenuClick: () => void
  onMobileMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onMobileMenuClick }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  
  // 認証ストアからユーザー情報を取得
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  
  const currentUser = user ? {
    name: user.name || 'ユーザー',
    email: user.email,
    company: user.companyName || '未設定',
    role: user.role || 'user',
  } : {
    name: 'ゲストユーザー',
    email: 'guest@example.com',
    company: '未設定',
    role: 'guest',
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 検索処理の実装が必要
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      errorLog('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* モバイルメニューボタン */}
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* デスクトップメニューボタン */}
          <button
            onClick={onMenuClick}
            className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* 検索バー */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="検索..."
                />
              </div>
            </form>
          </div>

          {/* 右側のボタン群 */}
          <div className="flex items-center space-x-3">
            {/* 通知 */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Bell className="h-6 w-6" />
                {/* 通知バッジ */}
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              {notificationOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">通知</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">新しいオファーが届きました</p>
                        <p className="text-xs text-gray-500 mt-1">5分前</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-900">スキルシートが更新されました</p>
                        <p className="text-xs text-gray-500 mt-1">1時間前</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t">
                      <button className="text-sm text-indigo-600 hover:text-indigo-500">
                        すべての通知を見る
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ヘルプ */}
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <HelpCircle className="h-6 w-6" />
            </button>

            {/* ユーザーメニュー */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.company}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>プロフィール</span>
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => navigate('/company-settings')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>企業設定</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>設定</span>
                    </button>
                    <div className="border-t">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>ログアウト</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header