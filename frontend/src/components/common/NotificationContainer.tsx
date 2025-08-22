/**
 * 通知コンテナコンポーネント
 */

import React, { useEffect, useState } from 'react'
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { Notification } from '@/types/api.types'

// 通知のモックデータ（実際はWebSocketやAPIから取得）
const mockNotifications: Notification[] = []

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    // TODO: WebSocket接続やSSEの設定
    // 現時点では空の配列
    setNotifications(mockNotifications)
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start p-4 rounded-lg border shadow-lg
            ${getBackgroundColor(notification.type)}
            transition-all duration-300 transform
          `}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {notification.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              {notification.message}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString('ja-JP')}
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer