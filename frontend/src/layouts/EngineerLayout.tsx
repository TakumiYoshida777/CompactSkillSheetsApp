import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ProjectOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
  MailOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const EngineerLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // エンジニア用メニュー項目（スキルシート編集のみ）
  const menuItems: MenuProps['items'] = [
    {
      key: '/engineer/skill-sheet',
      icon: <FileTextOutlined />,
      label: 'スキルシート編集',
      onClick: () => navigate('/engineer/skill-sheet'),
    },
    {
      key: '/engineer/skill-sheet/preview',
      icon: <CheckCircleOutlined />,
      label: 'プレビュー',
      onClick: () => navigate('/engineer/skill-sheet/preview'),
    },
  ];

  // ユーザーメニュー（簡素化）
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ログアウト',
      onClick: () => {
        // ログアウト処理
        console.log('Logout');
        navigate('/login');
      },
    },
  ];

  // 通知メニュー（スキルシート関連のみ）
  const notificationItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 500 }}>スキルシートの更新リマインド</div>
          <div style={{ fontSize: 12, color: '#888' }}>未入力項目があります</div>
        </div>
      ),
      icon: <EditOutlined style={{ color: '#faad14' }} />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* サイドバー */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {!collapsed ? (
            <h3 style={{ margin: 0, color: '#1890ff' }}>スキルシート</h3>
          ) : (
            <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* ヘッダー */}
        <Header
          style={{
            padding: 0,
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Space style={{ marginRight: 24 }} size="large">
            {/* 通知 */}
            <Dropdown menu={{ items: notificationItems }} placement="bottomRight">
              <Badge count={1} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ fontSize: 18 }}
                />
              </Badge>
            </Dropdown>

            {/* ユーザー情報 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>エンジニア</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* メインコンテンツ */}
        <Content
          style={{
            margin: 0,
            minHeight: 280,
            background: '#f0f2f5',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default EngineerLayout;