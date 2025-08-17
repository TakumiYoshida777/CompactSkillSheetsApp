import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer } from 'antd';
import useResponsive from '../hooks/useResponsive';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const EngineerLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // エンジニア用メニュー項目
  const menuItems: MenuProps['items'] = [
    {
      key: '/engineer/dashboard',
      icon: <DashboardOutlined />,
      label: 'ダッシュボード',
      onClick: () => {
        navigate('/engineer/dashboard');
        if (isMobile) setMobileMenuOpen(false);
      },
    },
    {
      key: '/engineer/skill-sheet',
      icon: <FileTextOutlined />,
      label: 'スキルシート編集',
      onClick: () => {
        navigate('/engineer/skill-sheet');
        if (isMobile) setMobileMenuOpen(false);
      },
    },
    {
      key: '/engineer/skill-sheet/preview',
      icon: <CheckCircleOutlined />,
      label: 'プレビュー',
      onClick: () => {
        navigate('/engineer/skill-sheet/preview');
        if (isMobile) setMobileMenuOpen(false);
      },
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
      {/* デスクトップ用サイドバー */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
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
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h3 style={{ margin: 0, color: '#1890ff' }}>スキルシート</h3>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Drawer>

      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), 
        transition: 'margin-left 0.2s' 
      }}>
        {/* ヘッダー */}
        <Header
          style={{
            padding: '0 12px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              minWidth: 44,
              minHeight: 44,
              height: 44,
            }}
          />

          <Space style={{ marginRight: isMobile ? 8 : 24 }} size={isMobile ? 'middle' : 'large'}>
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
                {!isMobile && <span>エンジニア</span>}
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