import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Button,
  Typography,
  Drawer,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  TeamOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import useClientAuthStore from '../stores/clientAuthStore';
import styles from './ClientLayout.module.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ClientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isClientAdmin } = useClientAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  // メニューアイテム
  const menuItems: MenuProps['items'] = [
    {
      key: 'client/offer-board',
      icon: <AppstoreOutlined />,
      label: 'オファーボード',
      onClick: () => handleMenuClick('/client/offer-board'),
    },
    {
      key: 'client/offer-management',
      icon: <FileSearchOutlined />,
      label: 'オファー管理',
      onClick: () => handleMenuClick('/client/offer-management'),
    },
    {
      key: 'client/offer-history',
      icon: <HistoryOutlined />,
      label: 'オファー履歴',
      onClick: () => handleMenuClick('/client/offer-history'),
    },
    {
      type: 'divider',
    },
    {
      key: 'client/engineers',
      icon: <TeamOutlined />,
      label: 'エンジニア',
      children: [
        {
          key: 'client/engineers/search',
          icon: <SearchOutlined />,
          label: 'エンジニア検索',
          onClick: () => handleMenuClick('/client/engineers/search'),
        },
      ],
    },
  ];

  // ユーザーメニュー
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'プロフィール',
      onClick: () => navigate('/client/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定',
      onClick: () => navigate('/client/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ログアウト',
      danger: true,
      onClick: () => {
        logout();
        message.success('ログアウトしました');
        navigate('/client/login');
      },
    },
  ];

  const sidebarContent = (
    <>
      <div className={styles.logo}>
        {(collapsed && !isMobile) ? (
          <Title level={4} className={styles.logoText}>
            OB
          </Title>
        ) : (
          <Title level={4} className={styles.logoText}>
            Offer Board
          </Title>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className={styles.menu}
      />
    </>
  );

  return (
    <Layout className={styles.layout}>
      {/* デスクトップ用サイドバー */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className={styles.sider}
          width={250}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* モバイル用ドロワー */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          className={styles.mobileDrawer}
          width={250}
          styles={{
            body: { padding: 0, background: '#001529' },
            wrapper: { background: '#001529' }
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => isMobile ? setMobileDrawerVisible(!mobileDrawerVisible) : setCollapsed(!collapsed)}
              className={styles.trigger}
            />
            <Title level={5} className={styles.companyName} style={{ color: '#fff' }}>
              {user?.clientCompany?.name || user?.company?.name || '取引先企業'}
            </Title>
          </div>
          <div className={styles.headerRight}>
            <Space size="large">
              <Badge count={5} className={styles.notification}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => navigate('/client/notifications')}
                />
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Space className={styles.userInfo}>
                  <Avatar 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                    src={user?.avatarUrl}
                  />
                  <span className={styles.userName}>{user?.name || '取引先担当者'}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClientLayout;