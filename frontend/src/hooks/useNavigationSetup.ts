import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * navigate関数をauthStoreに登録するフック
 * 認証エラー時にReact Routerを使った画面遷移を可能にする
 */
export const useNavigationSetup = () => {
  const navigate = useNavigate();
  const setNavigateFunction = useAuthStore((state) => state.setNavigateFunction);

  useEffect(() => {
    // navigate関数をauthStoreに登録
    setNavigateFunction(navigate);

    // クリーンアップ: コンポーネントアンマウント時にnullを設定
    return () => {
      setNavigateFunction(null);
    };
  }, [navigate, setNavigateFunction]);
};