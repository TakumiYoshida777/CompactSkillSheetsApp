import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Button } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  BankOutlined,
  MailOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // サイドバーメニュー項目（設計書準拠）
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'ダッシュボード', // DASH001
    },
    {
      key: '/engineers',
      icon: <TeamOutlined />,
      label: 'エンジニア管理',
      children: [
        {
          key: '/engineers/list',
          label: 'エンジニア一覧', // ENG001
        },
        {
          key: '/engineers/waiting',
          label: '待機中エンジニア', // 待機状況管理
        },
        {
          key: '/engineers/new',
          label: 'エンジニア登録', // ENG003
        },
      ],
    },
    {
      key: '/skillsheets',
      icon: <FileTextOutlined />,
      label: 'スキルシート管理',
      children: [
        {
          key: '/skillsheets/list',
          label: 'スキルシート一覧', // SKL001
        },
      ],
    },
    // プロジェクト管理（一時的にコメントアウト）
    // {
    //   key: '/projects',
    //   icon: <ProjectOutlined />,
    //   label: 'プロジェクト管理',
    //   children: [
    //     {
    //       key: '/projects/list',
    //       label: 'プロジェクト一覧', // PRJ001
    //     },
    //     {
    //       key: '/projects/new',
    //       label: 'プロジェクト登録', // PRJ003
    //     },
    //   ],
    // },
    {
      key: '/approaches',
      icon: <SendOutlined />,
      label: 'アプローチ管理',
      children: [
        {
          key: '/approaches/history',
          label: 'アプローチ履歴', // APP001
        },
        {
          key: '/approaches/create',
          label: 'アプローチ作成', // APP002
        },
      ],
    },
    // 取引先管理（一時的にコメントアウト）
    // {
    //   key: '/business-partners',
    //   icon: <BankOutlined />,
    //   label: '取引先管理',
    //   children: [
    //     {
    //       key: '/business-partners/list',
    //       label: '取引先一覧', // BIZ001
    //     },
    //   ],
    // },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: 'エンジニア検索', // SRC001
    },
    {
      key: '/settings',
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
    navigate(e.key);
  };

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      // ログアウト処理
      console.log('Logout');
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
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          
          <Space size="large">
            <Badge count={5}>
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-lg"
              />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <span>田中太郎</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content className="m-6">
          <div className="p-6 bg-white rounded-lg shadow-sm min-h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;