import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Space,
  Divider,
  Checkbox,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  GoogleOutlined,
  GithubOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text, Link: AntLink } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password, rememberMe);
      
      // ユーザーのロールに応じてリダイレクト
      const user = useAuthStore.getState().user;
      if (user?.roles.includes('engineer')) {
        navigate('/engineer/dashboard');
      } else if (user?.roles.includes('admin')) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      message.success('ログインに成功しました');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ログインに失敗しました');
    }
  };

  const handleSocialLogin = (provider: string) => {
    message.info(`${provider}ログインは現在開発中です`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.16)',
        }}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* ロゴ・タイトル */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              スキルシート管理システム
            </Title>
            <Text type="secondary">
              アカウントにログインしてください
            </Text>
          </div>

          {/* ログインフォーム */}
          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'メールアドレスを入力してください' },
                { type: 'email', message: '有効なメールアドレスを入力してください' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="メールアドレス"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'パスワードを入力してください' },
                { min: 8, message: 'パスワードは8文字以上である必要があります' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="パスワード"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Row justify="space-between" align="middle">
                <Col>
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    ログイン情報を記憶する
                  </Checkbox>
                </Col>
                <Col>
                  <Link to="/forgot-password">
                    パスワードを忘れた方
                  </Link>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                icon={<LoginOutlined />}
              >
                ログイン
              </Button>
            </Form.Item>
          </Form>

          <Divider>または</Divider>

          {/* ソーシャルログイン */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              size="large"
              block
              icon={<GoogleOutlined />}
              onClick={() => handleSocialLogin('Google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Googleでログイン
            </Button>

            <Button
              size="large"
              block
              icon={<GithubOutlined />}
              onClick={() => handleSocialLogin('GitHub')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              GitHubでログイン
            </Button>
          </Space>

          {/* アカウント作成リンク */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              アカウントをお持ちでない方は{' '}
            </Text>
            <Link to="/register">
              <Button type="link" style={{ padding: 0 }}>
                <strong>新規登録</strong>
              </Button>
            </Link>
          </div>

          {/* 取引先企業向けログインリンク */}
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <Link to="/client/login">
              <Button type="link" icon={<TeamOutlined />}>
                取引先企業の方はこちら
              </Button>
            </Link>
          </div>

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
                onClick={() => {
                  form.setFieldsValue({
                    email: 'admin@demo-ses.co.jp',
                    password: 'password123'
                  });
                }}
              >
                管理者でログイン
              </Button>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                デモ用: admin@demo-ses.co.jp / password123
              </Text>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default Login;