import React, { useState } from 'react';
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
import styles from './ClientLayout.module.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ClientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // メニューアイテム
  const menuItems: MenuProps['items'] = [
    {
      key: '/client/offer-board',
      icon: <AppstoreOutlined />,
      label: 'オファーボード',
      onClick: () => navigate('/client/offer-board'),
    },
    {
      key: '/client/offer-management',
      icon: <FileSearchOutlined />,
      label: 'オファー管理',
      onClick: () => navigate('/client/offer-management'),
    },
    {
      key: '/client/offer-history',
      icon: <HistoryOutlined />,
      label: 'オファー履歴',
      onClick: () => navigate('/client/offer-history'),
    },
    {
      type: 'divider',
    },
    {
      key: '/client/engineers',
      icon: <TeamOutlined />,
      label: 'エンジニア',
      children: [
        {
          key: '/client/engineers/search',
          icon: <SearchOutlined />,
          label: 'エンジニア検索',
          onClick: () => navigate('/client/engineers/search'),
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
        // ログアウト処理
        console.log('Logout');
      },
    },
  ];

  return (
    <Layout className={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
        width={250}
      >
        <div className={styles.logo}>
          {collapsed ? (
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
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.trigger}
            />
            <Title level={5} className={styles.companyName}>
              株式会社ABC商事
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
                  <Avatar icon={<UserOutlined />} />
                  <span className={styles.userName}>取引先担当者</span>
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