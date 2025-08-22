import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isClientUser } = useAuthStore();

  return (
    <Card style={{ margin: 20 }}>
      <Title level={3}>取引先企業テストページ</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>認証状態: {isAuthenticated ? '認証済み' : '未認証'}</Text>
        <Text>クライアントユーザー: {isClientUser() ? 'はい' : 'いいえ'}</Text>
        <Text>ユーザー名: {user?.name || '未設定'}</Text>
        <Text>メール: {user?.email || '未設定'}</Text>
        <Text>会社名: {user?.clientCompany?.name || user?.company?.name || '未設定'}</Text>
        
        <Space>
          <Button type="primary" onClick={() => navigate('client/login')}>
            ログインページへ
          </Button>
          <Button onClick={() => navigate('client/offer-board')}>
            オファーボードへ
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default TestPage;