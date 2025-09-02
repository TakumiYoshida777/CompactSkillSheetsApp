import { errorLog } from '../../utils/logger';
import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Input, message } from 'antd';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('admin@example-client-a.local');
  const [password, setPassword] = useState('Admin123!');

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      
      const response = await axios.post('client/auth/login', {
        email,
        password
      });
      
      setResult(response.data);
      message.success('ログイン成功！');
    } catch (err: any) {
      errorLog('Login error:', err);
      setError(err.response?.data?.error || err.message);
      message.error('ログイン失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="API接続テスト" style={{ margin: 20 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>取引先企業ログインAPIテスト</Title>
        
        <div>
          <Text>API Base URL: </Text>
          <Paragraph code>{axios.defaults.baseURL || 'Not set'}</Paragraph>
        </div>
        
        <div>
          <Text>エンドポイント: </Text>
          <Paragraph code>/api/client/auth/login</Paragraph>
        </div>
        
        <Input
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        
        <Input.Password
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <Button type="primary" onClick={testLogin} loading={loading}>
          ログインテスト
        </Button>
        
        {error && (
          <Alert
            message="エラー"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
        
        {result && (
          <Alert
            message="成功"
            description={
              <pre style={{ fontSize: 12 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            }
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Space>
    </Card>
  );
};

export default ApiTest;