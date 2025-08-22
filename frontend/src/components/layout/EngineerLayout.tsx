import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Button } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './EngineerLayout.css';

const { Header, Sider, Content } = Layout;

const EngineerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    {
      key: 'engineer/dashboard',
      icon: <DashboardOutlined />,
      label: 'ダッシュボード',
    },
    {
      key: 'engineer/profile',
      icon: <UserOutlined />,
      label: 'プロフィール編集',
    },
    {
      key: 'engineer/skill-sheet',
      icon: <FileTextOutlined />,
      label: 'スキルシート編集',
    },
    {
      key: 'engineer/approach-history',
      icon: <HistoryOutlined />,
      label: 'アプローチ履歴',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'プロフィール',
      onClick: () => navigate('engineer/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定',
      onClick: () => navigate('engineer/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ログアウト',
      onClick: () => {
        logout();
        navigate('login');
      },
    },
  ];

  return (
    <Layout className="engineer-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="layout-sider"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
      >
        <div className="logo">
          <h3>{collapsed ? 'ES' : 'Engineer Skill'}</h3>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header className="layout-header">
          <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-button"
            />
            
            <Space size="middle">
              <Badge count={3} dot>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => navigate('engineer/notifications')}
                />
              </Badge>
              
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Space className="user-info" style={{ cursor: 'pointer' }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{user?.name || 'エンジニア'}</span>
                </Space>
              </Dropdown>
            </Space>
          </Space>
        </Header>
        
        <Content className="layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default EngineerLayout;