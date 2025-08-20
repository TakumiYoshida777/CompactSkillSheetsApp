import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Typography, Alert, Descriptions, Tag } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import axios from 'axios';

const { Title, Text } = Typography;

const AuthDebug: React.FC = () => {
  const authStore = useAuthStore();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // localStorageのデータを取得
    const storageData = localStorage.getItem('auth-storage');
    if (storageData) {
      try {
        const parsed = JSON.parse(storageData);
        setLocalStorageData(parsed);
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }

    // デバッグ情報を収集
    setDebugInfo({
      axiosHeaders: axios.defaults.headers.common['Authorization'] || 'Not set',
      currentTime: new Date().toISOString(),
    });
  }, []);

  const testClientMeEndpoint = async () => {
    try {
      const response = await axios.get('client/auth/me');
      alert('Client /me endpoint success: ' + JSON.stringify(response.data));
    } catch (error: any) {
      alert('Client /me endpoint failed: ' + error.response?.status + ' ' + error.response?.data?.error);
    }
  };

  const testAuthMeEndpoint = async () => {
    try {
      const response = await axios.get('auth/me');
      alert('Auth /me endpoint success: ' + JSON.stringify(response.data));
    } catch (error: any) {
      alert('Auth /me endpoint failed: ' + error.response?.status + ' ' + error.response?.data?.error);
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('auth-storage');
    authStore.logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>認証デバッグ情報</Title>
      
      <Card title="現在のAuth Store状態" style={{ marginBottom: 20 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="isAuthenticated">
            <Tag color={authStore.isAuthenticated ? 'green' : 'red'}>
              {authStore.isAuthenticated ? 'YES' : 'NO'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="isLoading">
            <Tag>{authStore.isLoading ? 'YES' : 'NO'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Token">
            {authStore.token ? `${authStore.token.substring(0, 20)}...` : 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="User ID">
            {authStore.user?.id || 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="User Email">
            {authStore.user?.email || 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="User Type">
            <Tag color={authStore.user?.userType === 'client' ? 'blue' : 'green'}>
              {authStore.user?.userType || 'NULL'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="User Roles">
            {Array.isArray(authStore.user?.roles) ? authStore.user.roles.join(', ') : 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="isClientUser()">
            <Tag color={authStore.isClientUser() ? 'blue' : 'default'}>
              {authStore.isClientUser() ? 'YES' : 'NO'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="LocalStorage内容" style={{ marginBottom: 20 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="State Version">
            {localStorageData?.state?.version || 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="Stored User ID">
            {localStorageData?.state?.user?.id || 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="Stored User Type">
            {localStorageData?.state?.user?.userType || 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="Stored Token">
            {localStorageData?.state?.token ? `${localStorageData.state.token.substring(0, 20)}...` : 'NULL'}
          </Descriptions.Item>
          <Descriptions.Item label="Stored isAuthenticated">
            {localStorageData?.state?.isAuthenticated ? 'YES' : 'NO'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Axios設定" style={{ marginBottom: 20 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Authorization Header">
            {debugInfo.axiosHeaders || 'Not set'}
          </Descriptions.Item>
          <Descriptions.Item label="Base URL">
            {axios.defaults.baseURL || 'Not set'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="テストアクション" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={testClientMeEndpoint} type="primary">
            /api/client/auth/me をテスト
          </Button>
          <Button onClick={testAuthMeEndpoint}>
            /api/auth/me をテスト
          </Button>
          <Button onClick={() => authStore.checkAuth()}>
            checkAuth() を実行
          </Button>
          <Button onClick={clearAuthStorage} danger>
            認証情報をクリア
          </Button>
        </Space>
      </Card>

      <Alert
        message="デバッグ手順"
        description={
          <ol>
            <li>取引先企業アカウントでログインする</li>
            <li>このページで状態を確認する</li>
            <li>ページをリロードして再度状態を確認する</li>
            <li>各テストボタンでエンドポイントの動作を確認する</li>
          </ol>
        }
        type="info"
        showIcon
      />
    </div>
  );
};

export default AuthDebug;