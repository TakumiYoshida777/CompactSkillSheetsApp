import { useNavigationSetup } from '../hooks/useNavigationSetup';

/**
 * navigate関数をauthStoreに登録するためのコンポーネント
 * Router内でレンダリングする必要がある
 */
export const NavigationSetup = () => {
  useNavigationSetup();
  return null;
};