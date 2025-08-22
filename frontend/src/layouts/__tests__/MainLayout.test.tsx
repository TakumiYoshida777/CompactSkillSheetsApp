import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MainLayout from '../MainLayout';
import * as useResponsiveModule from '../../hooks/useResponsive';

vi.mock('../../hooks/useResponsive');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: 'dashboard' }),
    Outlet: () => <div>Outlet Content</div>,
  };
});

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMainLayout = () => {
    return render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );
  };

  describe('デスクトップ表示', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'xl',
      });
    });

    it('サイドバーが表示される', () => {
      renderMainLayout();
      expect(screen.getByText('SkillSheets')).toBeInTheDocument();
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('エンジニア管理')).toBeInTheDocument();
    });

    it('折りたたみボタンが機能する', () => {
      renderMainLayout();
      const toggleButton = screen.getByRole('button', { name: /menu/i });
      
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('ESS')).toBeInTheDocument();
    });

    it('メニュー項目クリックでナビゲーションが動作する', async () => {
      renderMainLayout();
      
      const dashboardItem = screen.getByText('ダッシュボード');
      fireEvent.click(dashboardItem);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('dashboard');
      });
    });

    it('ユーザー名が表示される', () => {
      renderMainLayout();
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
    });
  });

  describe('モバイル表示', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'xs',
      });
    });

    it('サイドバーが表示されない', () => {
      renderMainLayout();
      expect(screen.queryByText('SkillSheets')).not.toBeInTheDocument();
    });

    it('ハンバーガーメニューボタンが表示される', () => {
      renderMainLayout();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('ハンバーガーメニューをクリックするとドロワーが開く', async () => {
      renderMainLayout();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const drawer = document.querySelector('.ant-drawer-open');
        expect(drawer).toBeInTheDocument();
      });
    });

    it('モバイルでユーザー名が非表示', () => {
      renderMainLayout();
      expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
    });

    it('モバイルでも通知バッジが表示される', () => {
      renderMainLayout();
      const notificationBadge = document.querySelector('.ant-badge');
      expect(notificationBadge).toBeInTheDocument();
    });
  });

  describe('タブレット表示', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        screenSize: 'md',
      });
    });

    it('サイドバーが表示される', () => {
      renderMainLayout();
      expect(screen.getByText('SkillSheets')).toBeInTheDocument();
    });

    it('適切なスペーシングが適用される', () => {
      renderMainLayout();
      const content = document.querySelector('.m-3.md\\:m-6');
      expect(content).toBeInTheDocument();
    });
  });

  describe('ユーザーメニュー', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'xl',
      });
    });

    it('ドロップダウンメニューが開く', async () => {
      renderMainLayout();
      const userAvatar = document.querySelector('.ant-avatar');
      
      if (userAvatar) {
        fireEvent.click(userAvatar.parentElement as Element);
      }
      
      await waitFor(() => {
        expect(screen.getByText('プロフィール')).toBeInTheDocument();
        expect(screen.getByText('個人設定')).toBeInTheDocument();
        expect(screen.getByText('ログアウト')).toBeInTheDocument();
      });
    });

    it('ログアウトをクリックするとログアウト処理が実行される', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderMainLayout();
      
      const userAvatar = document.querySelector('.ant-avatar');
      if (userAvatar) {
        fireEvent.click(userAvatar.parentElement as Element);
      }
      
      await waitFor(() => {
        const logoutButton = screen.getByText('ログアウト');
        fireEvent.click(logoutButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Logout');
      consoleSpy.mockRestore();
    });
  });

  describe('レスポンシブ動作', () => {
    it('画面サイズ変更時に適切に表示が切り替わる', async () => {
      const useResponsiveSpy = vi.spyOn(useResponsiveModule, 'default');
      
      // デスクトップ -> モバイル
      useResponsiveSpy.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'xl',
      });
      
      const { rerender } = renderMainLayout();
      expect(screen.getByText('SkillSheets')).toBeInTheDocument();
      
      // モバイルに変更
      useResponsiveSpy.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'xs',
      });
      
      rerender(
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      );
      
      expect(screen.queryByText('SkillSheets')).not.toBeInTheDocument();
    });
  });
});