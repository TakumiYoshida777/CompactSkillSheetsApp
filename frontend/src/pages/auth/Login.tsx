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
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LoginOutlined,
  TeamOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuthStore();
  const [form] = Form.useForm();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // 認証コード送信
  const handleSendCode = async () => {
    try {
      const values = await form.validateFields(['email']);
      setSendingCode(true);

      const response = await fetch('http://localhost:8000/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('認証コードをメールで送信しました');
        setEmail(values.email);
        setIsCodeSent(true);
      } else {
        message.error(data.error?.message || '認証コードの送信に失敗しました');
      }
    } catch (error) {
      message.error('認証コードの送信に失敗しました');
    } finally {
      setSendingCode(false);
    }
  };

  // 認証コード検証
  const handleVerifyCode = async (values: { code: string }) => {
    try {
      setVerifyingCode(true);

      const response = await fetch('http://localhost:8000/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: values.code
        }),
      });

      const data = await response.json();

      if (data.success) {
        // トークンを保存
        const authStore = useAuthStore.getState();
        authStore.setAuth({
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        });

        // ユーザーのロールに応じてリダイレクト
        if (data.data.user?.roles?.includes('engineer')) {
          navigate('/engineer/dashboard');
        } else if (data.data.user?.roles?.includes('admin')) {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }

        message.success('ログインに成功しました');
      } else {
        message.error(data.error?.message || '認証に失敗しました');
      }
    } catch (error) {
      message.error('認証に失敗しました');
    } finally {
      setVerifyingCode(false);
    }
  };

  // 再送信
  const handleResendCode = async () => {
    setIsCodeSent(false);
    form.setFieldsValue({ code: '' });
    await handleSendCode();
  };

  // 別のメールアドレスで試す
  const handleChangeEmail = () => {
    setIsCodeSent(false);
    setEmail('');
    form.resetFields();
  };

  // デモアカウントでログイン
  const handleDemoLogin = () => {
    form.setFieldsValue({
      email: 'admin@demo-ses.example.com',
    });
    message.info('デモアカウントのメールアドレスを入力しました。「認証コードを送信」をクリックしてください。');
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
              {isCodeSent
                ? '認証コードを入力してください'
                : 'メールアドレスを入力してください'}
            </Text>
          </div>

          {/* ログインフォーム */}
          <Form
            form={form}
            name="login"
            onFinish={isCodeSent ? handleVerifyCode : undefined}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
          >
            {!isCodeSent ? (
              <>
                {/* メールアドレス入力 */}
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'メールアドレスを入力してください' },
                    { type: 'email', message: '有効なメールアドレスを入力してください' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="メールアドレス"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={sendingCode}
                    icon={<MailOutlined />}
                    onClick={handleSendCode}
                  >
                    認証コードを送信
                  </Button>
                </Form.Item>
              </>
            ) : (
              <>
                {/* 認証コード入力 */}
                <Form.Item style={{ marginBottom: 12 }}>
                  <Text type="secondary">
                    {email} に認証コードを送信しました
                  </Text>
                </Form.Item>

                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: '認証コードを入力してください' },
                    { len: 6, message: '認証コードは6桁です' },
                    { pattern: /^[0-9]+$/, message: '認証コードは数字のみです' },
                  ]}
                >
                  <Input
                    placeholder="6桁の認証コード"
                    size="large"
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={verifyingCode}
                    icon={<LoginOutlined />}
                  >
                    ログイン
                  </Button>
                </Form.Item>

                <Form.Item>
                  <Row justify="space-between">
                    <Col>
                      <Button type="link" onClick={handleResendCode} disabled={sendingCode}>
                        認証コードを再送信
                      </Button>
                    </Col>
                    <Col>
                      <Button type="link" onClick={handleChangeEmail}>
                        別のメールアドレスで試す
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </>
            )}
          </Form>

          <Divider>または</Divider>

          {/* デモアカウント */}
          <Button
            size="large"
            block
            icon={<TeamOutlined />}
            onClick={handleDemoLogin}
            disabled={isCodeSent}
          >
            管理者デモアカウントでログイン
          </Button>

          {/* その他のリンク */}
          <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
            <div>
              <Text type="secondary">エンジニアの方は </Text>
              <Link to="/engineer/login">
                <Button type="link" style={{ padding: 0 }}>
                  エンジニアログイン
                </Button>
              </Link>
            </div>

            <div>
              <Text type="secondary">取引先企業の方は </Text>
              <Link to="/client/login">
                <Button type="link" style={{ padding: 0 }}>
                  取引先ログイン
                </Button>
              </Link>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">アカウントをお持ちでない方は </Text>
              <Link to="/register">
                <Button type="link" style={{ padding: 0 }}>
                  <strong>新規登録</strong>
                </Button>
              </Link>
            </div>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default Login;