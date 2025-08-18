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

interface HeaderProps {
  onMenuClick: () => void
  onMobileMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onMobileMenuClick }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  
  // TODO: 認証担当者が実装後、実際のユーザー情報を取得
  const currentUser = {
    name: 'テストユーザー',
    email: 'test@example.com',
    company: 'テスト企業',
    role: 'admin',
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 検索処理の実装
    console.log('Search:', searchQuery)
  }

  const handleLogout = () => {
    // TODO: 認証担当者が実装
    console.log('Logout')
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* 左側：メニューボタンとロゴ */}
        <div className="flex items-center space-x-4">
          {/* デスクトップ用メニューボタン */}
          <button
            onClick={onMenuClick}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="メニュー切替"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* モバイル用メニューボタン */}
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="モバイルメニュー"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* ロゴ・システム名 */}
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              エンジニアスキルシート管理
            </h1>
          </div>
        </div>

        {/* 中央：検索バー（デスクトップのみ） */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* 右側：通知・ユーザーメニュー */}
        <div className="flex items-center space-x-2">
          {/* 通知アイコン */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="通知"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {/* 未読バッジ */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 通知ドロップダウン */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">通知</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 text-sm text-gray-500">
                    新しい通知はありません
                  </div>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-1">
                    すべての通知を見る
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ユーザーメニュー */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.company}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* ユーザードロップダウン */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-gray-500">{currentUser.email}</div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>プロフィール</span>
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>設定</span>
                  </button>
                  <button
                    onClick={() => navigate('/help')}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>ヘルプ</span>
                  </button>
                </div>
                <div className="py-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header