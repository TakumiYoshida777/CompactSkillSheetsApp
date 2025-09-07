import { errorLog } from '../../utils/logger';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Checkbox, Typography, Space, Row, Col, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { engineerAuthService } from '../../services/engineer/authService';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const EngineerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { setAuthTokens } = useAuthStore();

  // デモアカウント情報
  const demoAccounts = [
    {
      email: 'engineer@demo.example.com',
      password: 'password123',
      description: 'エンジニア太郎',
    },
  ];

  const handleSubmit = async (values: LoginForm) => {
    try {
      setLoading(true);
      const response = await engineerAuthService.login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (response.success) {
        // 認証情報を保存
        setAuthTokens(
          response.data.user,
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );

        message.success('ログインに成功しました');
        navigate('/engineer/skill-sheet');
      }
    } catch (error) {
      errorLog('Login error:', error);
      message.error(error.response?.data?.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    form.setFieldsValue({
      email: account.email,
      password: account.password,
    });
    message.info(`デモアカウント: ${account.description}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={2}>エンジニアログイン</Title>
          <Text type="secondary">スキルシート管理システム</Text>
        </div>

        <Form
          form={form}
          name="engineer-login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{ rememberMe: true }}
        >
          <Form.Item
            name="email"
            label="メールアドレス"
            rules={[
              { required: true, message: 'メールアドレスを入力してください' },
              { type: 'email', message: '有効なメールアドレスを入力してください' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="engineer@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="パスワード"
            rules={[
              { required: true, message: 'パスワードを入力してください' },
              { min: 8, message: 'パスワードは8文字以上必要です' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="パスワード"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item name="rememberMe" valuePropName="checked">
            <Checkbox>ログイン状態を保持する</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-blue-600 hover:bg-blue-700"
              icon={<LoginOutlined />}
            >
              ログイン
            </Button>
          </Form.Item>

          <div className="text-center space-y-2">
            <div>
              <Link to="/engineer/register" className="text-blue-600 hover:text-blue-800">
                新規登録はこちら
              </Link>
            </div>
            <div>
              <Link to="/engineer/forgot-password" className="text-gray-600 hover:text-gray-800 text-sm">
                パスワードを忘れた方
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link to="/login" className="text-gray-600 hover:text-gray-800 text-sm">
                企業アカウントでログイン
              </Link>
            </div>
          </div>
        </Form>

        {/* デモアカウント情報 */}
        <Card
          size="small"
          style={{
            backgroundColor: '#f0f2f5',
            marginTop: '16px',
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>デモアカウント:</Text>
            <Button
              size="small"
              block
              onClick={() => handleDemoLogin(demoAccounts[0])}
            >
              {demoAccounts[0].description}
            </Button>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                メール: {demoAccounts[0].email}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                パスワード: {demoAccounts[0].password}
              </Text>
            </div>
          </Space>
        </Card>

        {/* セキュリティ注意事項 */}
        <Alert
          message="セキュリティに関する注意"
          description={
            <ul style={{ paddingLeft: 20, marginBottom: 0, fontSize: '12px' }}>
              <li>ログイン情報は第三者に共有しないでください</li>
              <li>定期的にパスワードを変更することをお勧めします</li>
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginTop: '16px', fontSize: '12px' }}
        />
      </Card>
    </div>
  );
};

export default EngineerLogin;