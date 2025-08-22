import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Button, Drawer, message } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useResponsive from '../hooks/useResponsive';
import { useAuthStore } from '../stores/authStore';
import { normalizePath } from '../utils/navigation';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // サイドバーメニュー項目（設計書準拠）
  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'ダッシュボード', // DASH001
    },
    {
      key: 'engineers',
      icon: <TeamOutlined />,
      label: 'エンジニア管理',
      children: [
        {
          key: 'engineers/list',
          label: 'エンジニア一覧', // ENG001
        },
        {
          key: 'engineers/register',
          label: 'エンジニア登録', // ENG003
        },
      ],
    },
    // プロジェクト管理（一時的にコメントアウト）
    // {
    //   key: 'projects',
    //   icon: <ProjectOutlined />,
    //   label: 'プロジェクト管理',
    //   children: [
    //     {
    //       key: 'projects/list',
    //       label: 'プロジェクト一覧', // PRJ001
    //     },
    //     {
    //       key: 'projects/new',
    //       label: 'プロジェクト登録', // PRJ003
    //     },
    //   ],
    // },
    {
      key: 'approaches',
      icon: <SendOutlined />,
      label: 'アプローチ管理',
      children: [
        {
          key: 'approaches/history',
          label: 'アプローチ履歴', // APP001
        },
        {
          key: 'approaches/create',
          label: 'アプローチ作成', // APP002
        },
      ],
    },
    {
      key: 'business-partners',
      icon: <BankOutlined />,
      label: '取引先管理',
      children: [
        {
          key: 'business-partners/list',
          label: '取引先一覧', // BIZ001
        },
        {
          key: 'business-partners/new',
          label: '取引先登録', // BIZ002
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定', // SET001
    },
  ];

  // ユーザードロップダウンメニュー
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'プロフィール',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '個人設定',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ログアウト',
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    // パスの正規化（スラッシュの重複を防ぐ）
    const path = e.key.startsWith('/') ? e.key : `/${e.key}`;
    const normalizedPath = normalizePath(path);
    navigate(normalizedPath);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const { logout, user } = useAuthStore();

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      // ログアウト処理
      logout();
      message.success('ログアウトしました');
      navigate('/login');
    } else if (e.key === 'profile') {
      // プロフィール画面へ遷移
      navigate('/profile');
    } else if (e.key === 'settings') {
      // 個人設定画面へ遷移
      navigate('/settings');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* デスクトップ用サイドバー */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <h1 className={`text-white font-bold ${collapsed ? 'text-lg' : 'text-xl'}`}>
              {collapsed ? 'ESS' : 'SkillSheets'}
            </h1>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
      )}

      {/* モバイル用ドロワーメニュー */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        bodyStyle={{ padding: 0 }}
        width={280}
        className="md:hidden"
      >
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <h1 className="text-white font-bold text-xl">SkillSheets</h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
      
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), 
        transition: 'margin-left 0.2s' 
      }}>
        <Header className="bg-white px-3 md:px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className="text-lg min-w-[44px] min-h-[44px]"
          />
          
          <Space size={isMobile ? 'middle' : 'large'}>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                {!isMobile && <span>{user?.name || 'ユーザー'}</span>}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content className="m-3 md:m-6">
          <div className="p-3 md:p-6 bg-white rounded-lg shadow-sm min-h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;