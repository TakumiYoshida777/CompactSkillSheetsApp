/**
 * メインレイアウトコンポーネント
 */

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Breadcrumb } from './Breadcrumb'
import { NotificationContainer } from '../common/NotificationContainer'
import { Toaster } from 'react-hot-toast'

interface MainLayoutProps {
  children?: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast通知 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />

      {/* ヘッダー */}
      <Header
        onMenuClick={toggleSidebar}
        onMobileMenuClick={toggleMobileMenu}
      />

      <div className="flex h-[calc(100vh-64px)] pt-16">
        {/* サイドバー - デスクトップ */}
        <aside
          className={`
            hidden lg:block fixed left-0 top-16 h-[calc(100vh-64px)]
            bg-white border-r border-gray-200 transition-all duration-300 z-20
            ${sidebarOpen ? 'w-64' : 'w-20'}
          `}
        >
          <Sidebar collapsed={!sidebarOpen} />
        </aside>

        {/* サイドバー - モバイル */}
        {mobileMenuOpen && (
          <>
            {/* オーバーレイ */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={toggleMobileMenu}
            />
            {/* サイドバー */}
            <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 z-40 lg:hidden">
              <Sidebar collapsed={false} onClose={toggleMobileMenu} />
            </aside>
          </>
        )}

        {/* メインコンテンツ */}
        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          `}
        >
          <div className="h-full overflow-auto">
            {/* パンくず */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <Breadcrumb />
            </div>

            {/* コンテンツエリア */}
            <div className="p-6">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>

      {/* 通知コンテナ */}
      <NotificationContainer />
    </div>
  )
}

export default MainLayout