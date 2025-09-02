import { errorLog } from '../../utils/logger';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../../api/common/notificationApi';
import { message } from 'antd';

// クエリキー定義
export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (page: number, unreadOnly: boolean) => 
    [...notificationQueryKeys.all, 'list', page, unreadOnly] as const,
  unreadCount: () => [...notificationQueryKeys.all, 'unread-count'] as const,
  announcements: () => [...notificationQueryKeys.all, 'announcements'] as const,
};

// 通知一覧取得フック
export const useNotifications = (page = 1, limit = 20, unreadOnly = false) => {
  return useQuery({
    queryKey: notificationQueryKeys.list(page, unreadOnly),
    queryFn: () => notificationAPI.getNotifications(page, limit, unreadOnly),
    staleTime: 1 * 60 * 1000, // 1分
    gcTime: 5 * 60 * 1000,
  });
};

// 未読数取得フック
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: notificationAPI.getUnreadCount,
    staleTime: 30 * 1000, // 30秒
    gcTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // 1分ごとに自動更新
  });
};

// アナウンス取得フック
export const useAnnouncements = () => {
  return useQuery({
    queryKey: notificationQueryKeys.announcements(),
    queryFn: notificationAPI.getAnnouncements,
    staleTime: 10 * 60 * 1000, // 10分
    gcTime: 30 * 60 * 1000,
  });
};

// 既読処理フック
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      // 通知一覧と未読数を再取得
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      message.success('通知を既読にしました');
    },
    onError: (error) => {
      errorLog('既読処理エラー:', error);
      message.error('既読処理に失敗しました');
    },
  });
};

// すべて既読処理フック
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationAPI.markAllAsRead,
    onSuccess: () => {
      // 通知一覧と未読数を再取得
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      message.success('すべての通知を既読にしました');
    },
    onError: (error) => {
      errorLog('すべて既読処理エラー:', error);
      message.error('既読処理に失敗しました');
    },
  });
};

// リアルタイム通知用WebSocketフック（将来的な実装用）
export const useNotificationWebSocket = () => {
  const queryClient = useQueryClient();

  const connect = () => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        // 新しい通知が来たら、通知一覧と未読数を再取得
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
        
        // 通知をトーストで表示
        message.info(data.title);
      }
    };

    ws.onerror = (error) => {
      errorLog('WebSocketエラー:', error);
    };

    ws.onclose = () => {
      // 再接続ロジック
      setTimeout(() => connect(), 5000);
    };

    return ws;
  };

  return { connect };
};