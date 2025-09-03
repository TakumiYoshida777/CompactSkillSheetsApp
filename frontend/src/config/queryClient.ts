import { QueryClient } from '@tanstack/react-query';
import { message } from 'antd';

/**
 * グローバルエラーハンドラー
 */
const onError = (error: unknown) => {
  // 401エラー（認証エラー）の場合はログイン画面へ
  if (error.response?.status === 401) {
    message.error('セッションの有効期限が切れました。再度ログインしてください。');
    // ログイン画面へリダイレクト
    window.location.href = '/login';
    return;
  }
  
  // 403エラー（権限エラー）
  if (error.response?.status === 403) {
    message.error('この操作を実行する権限がありません。');
    return;
  }
  
  // 429エラー（レート制限）
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    message.warning(`リクエスト数が制限を超えました。${retryAfter || '少し'}後に再試行してください。`);
    return;
  }
  
  // 5xx系エラー
  if (error.response?.status >= 500) {
    message.error('サーバーエラーが発生しました。しばらく待ってから再試行してください。');
    return;
  }
  
  // ネットワークエラー
  if (!error.response) {
    message.error('ネットワークエラーが発生しました。接続を確認してください。');
    return;
  }
};

/**
 * QueryClientの設定
 * TanStack Queryのデフォルト設定を活用
 */
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルトで3回リトライ、exponential backoff付き
      // retry: 3 がデフォルト値
      
      // キャッシュ設定
      staleTime: 5 * 60 * 1000, // 5分間はfreshとみなす
      gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
      
      // フォーカス時の再取得を制御
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always', // ネットワーク再接続時は常に再取得
      
      // ネットワークモード
      networkMode: 'online', // オフライン時は実行しない
    },
    mutations: {
      // ミューテーションは通常リトライしない方が良い（副作用があるため）
      retry: false,
      
      // エラーハンドリング
      onError,
      
      // ネットワークモード
      networkMode: 'online',
    },
  },
});

/**
 * 特定のクエリに対するカスタム設定
 */
export const queryOptions = {
  // リアルタイムデータ用（短いキャッシュ）
  realtime: {
    staleTime: 10 * 1000, // 10秒
    gcTime: 30 * 1000, // 30秒
    refetchInterval: 30 * 1000, // 30秒ごとに自動更新
  },
  
  // 静的データ用（長いキャッシュ）
  static: {
    staleTime: 60 * 60 * 1000, // 1時間
    gcTime: 24 * 60 * 60 * 1000, // 24時間
    refetchOnMount: false,
  },
  
  // ユーザー情報用
  user: {
    staleTime: 10 * 60 * 1000, // 10分
    gcTime: 30 * 60 * 1000, // 30分
  },
  
  // 検索結果用
  search: {
    staleTime: 2 * 60 * 1000, // 2分
    gcTime: 5 * 60 * 1000, // 5分
  },
  
  // 重要なデータ用（常に最新を取得）
  critical: {
    staleTime: 0, // 常にstale
    gcTime: 5 * 60 * 1000, // 5分
    refetchOnMount: 'always',
  },
};

/**
 * Suspense用のクエリ設定
 */
export const suspenseOptions = {
  suspense: true,
  useErrorBoundary: true, // エラーバウンダリーを使用
  // デフォルトのリトライ設定を使用（3回、exponential backoff）
};

/**
 * Infinite Query用の設定
 */
export const infiniteQueryOptions = {
  getNextPageParam: (lastPage: { nextCursor?: unknown }) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage: { prevCursor?: unknown }) => firstPage.prevCursor,
  staleTime: 2 * 60 * 1000, // 2分
  gcTime: 5 * 60 * 1000, // 5分
};