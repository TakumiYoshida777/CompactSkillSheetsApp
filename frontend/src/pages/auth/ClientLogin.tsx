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
  Alert,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import useClientAuthStore from '../../stores/clientAuthStore';

const { Title, Text, Link: AntLink } = Typography;

const ClientLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useClientAuthStore();
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);

  // デモアカウント情報
  const demoAccounts = [
    {
      email: 'admin@client-a.co.jp',
      password: 'Admin123!',
      description: '株式会社クライアントA（全エンジニア閲覧可能）'
    },
    {
      email: 'user@client-b.co.jp',
      password: 'Admin123!',
      description: '株式会社クライアントB（待機中のみ閲覧可能）'
    }
  ];

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    form.setFieldsValue({
      email: account.email,
      password: account.password,
    });
    message.info(`デモアカウント: ${account.description}`);
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password, rememberMe);
      
      // 取引先企業ユーザーのダッシュボードへリダイレクト
      navigate('/client/offer-board');
      
      message.success('ログインに成功しました');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'ログインに失敗しました';
      message.error(errorMessage);
      
      // アカウントロックの場合の処理
      if (error.response?.status === 423) {
        const lockedUntil = error.response?.data?.lockedUntil;
        if (lockedUntil) {
          message.warning(`アカウントがロックされています。解除予定時刻: ${new Date(lockedUntil).toLocaleString('ja-JP')}`);
        }
      }
    }
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
              取引先企業向けログイン
            </Title>
            <Text type="secondary">
              SES企業から提供されたアカウントでログインしてください
            </Text>
          </div>

          <Alert
            message="取引先企業の方へ"
            description="このページは取引先企業専用のログインページです。SES企業のアカウントをお持ちの方は通常のログインページをご利用ください。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* ログインフォーム */}
          <Form
            form={form}
            name="client-login"
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
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    パスワードをお忘れの場合は、
                    <br />
                    SES企業の担当者にお問い合わせください
                  </Text>
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
              <Row gutter={8}>
                <Col span={12}>
                  <Button
                    size="small"
                    block
                    onClick={() => handleDemoLogin(demoAccounts[0])}
                  >
                    クライアントA
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="small"
                    block
                    onClick={() => handleDemoLogin(demoAccounts[1])}
                  >
                    クライアントB
                  </Button>
                </Col>
              </Row>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  クライアントA: 全エンジニア閲覧可能
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  クライアントB: 待機中のみ閲覧可能
                </Text>
              </div>
            </Space>
          </Card>

          <Divider>または</Divider>

          {/* 通常ログインへのリンク */}
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <Link to="/login">
                <Button icon={<ArrowLeftOutlined />} type="link">
                  SES企業・エンジニアの方はこちら
                </Button>
              </Link>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                初めてご利用の方は、SES企業の担当者にお問い合わせください
              </Text>
            </Space>
          </div>

          {/* セキュリティ注意事項 */}
          <Alert
            message="セキュリティに関する注意"
            description={
              <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                <li>ログイン情報は第三者に共有しないでください</li>
                <li>10回連続でログインに失敗するとアカウントがロックされます</li>
                <li>定期的にパスワードを変更することをお勧めします</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ fontSize: '12px' }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ClientLogin;