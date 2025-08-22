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
  Result,
  Steps,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Link: AntLink } = Typography;
const { Step } = Steps;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const steps = [
    {
      title: 'メール送信',
      icon: <MailOutlined />,
    },
    {
      title: '認証コード入力',
      icon: <SafetyCertificateOutlined />,
    },
    {
      title: 'パスワード再設定',
      icon: <LockOutlined />,
    },
    {
      title: '完了',
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleSendEmail = async (values: { email: string }) => {
    try {
      setIsLoading(true);
      await axios.post('auth/forgot-password', { email: values.email });
      setEmail(values.email);
      setCurrentStep(1);
      message.success('認証コードをメールで送信しました');
      form.resetFields();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || 'メール送信に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (values: { code: string }) => {
    try {
      setIsLoading(true);
      const response = await axios.post('auth/verify-reset-code', {
        email,
        code: values.code,
      });
      setResetToken(response.data.token);
      setCurrentStep(2);
      form.resetFields();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || '認証コードが無効です'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setIsLoading(true);
      await axios.post('auth/reset-password', {
        token: resetToken,
        password: values.password,
      });
      setCurrentStep(3);
      message.success('パスワードが正常にリセットされました');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          'パスワードのリセットに失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            name="sendEmail"
            onFinish={handleSendEmail}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item>
              <Text type="secondary">
                登録されているメールアドレスを入力してください。パスワードリセット用の認証コードをお送りします。
              </Text>
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: 'メールアドレスを入力してください',
                },
                {
                  type: 'email',
                  message: '有効なメールアドレスを入力してください',
                },
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
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                icon={<MailOutlined />}
              >
                認証コードを送信
              </Button>
            </Form.Item>
          </Form>
        );

      case 1:
        return (
          <Form
            form={form}
            name="verifyCode"
            onFinish={handleVerifyCode}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item>
              <Text type="secondary">
                {email} に送信された6桁の認証コードを入力してください。
              </Text>
            </Form.Item>
            <Form.Item
              name="code"
              rules={[
                {
                  required: true,
                  message: '認証コードを入力してください',
                },
                {
                  pattern: /^\d{6}$/,
                  message: '6桁の数字を入力してください',
                },
              ]}
            >
              <Input
                prefix={<SafetyCertificateOutlined />}
                placeholder="認証コード（6桁）"
                size="large"
                maxLength={6}
              />
            </Form.Item>
            <Form.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                >
                  認証する
                </Button>
                <Button
                  type="link"
                  onClick={() => {
                    setCurrentStep(0);
                    form.resetFields();
                  }}
                  style={{ padding: 0 }}
                >
                  別のメールアドレスを使用
                </Button>
              </Space>
            </Form.Item>
          </Form>
        );

      case 2:
        return (
          <Form
            form={form}
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item>
              <Text type="secondary">
                新しいパスワードを設定してください。
              </Text>
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'パスワードを入力してください',
                },
                {
                  min: 8,
                  message: 'パスワードは8文字以上である必要があります',
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: '大文字、小文字、数字を含む必要があります',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="新しいパスワード"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'パスワードを再入力してください',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('パスワードが一致しません')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="パスワード（確認）"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                icon={<CheckCircleOutlined />}
              >
                パスワードを変更
              </Button>
            </Form.Item>
          </Form>
        );

      case 3:
        return (
          <Result
            status="success"
            title="パスワードのリセットが完了しました"
            subTitle="新しいパスワードでログインできます。"
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate('login')}
                size="large"
              >
                ログインページへ
              </Button>,
            ]}
          />
        );

      default:
        return null;
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
          maxWidth: '480px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.16)',
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* ヘッダー */}
          {currentStep < 3 && (
            <div>
              <Link to="/login">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  style={{ padding: '4px 8px' }}
                >
                  ログインに戻る
                </Button>
              </Link>
            </div>
          )}

          {/* タイトル */}
          {currentStep < 3 && (
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ marginBottom: 8 }}>
                パスワードリセット
              </Title>
            </div>
          )}

          {/* ステップ表示 */}
          {currentStep < 3 && (
            <Steps current={currentStep} size="small">
              {steps.slice(0, 3).map((item) => (
                <Step key={item.title} title={item.title} icon={item.icon} />
              ))}
            </Steps>
          )}

          {/* コンテンツ */}
          {renderStepContent()}

          {/* ヘルプテキスト */}
          {currentStep === 1 && (
            <Card
              size="small"
              style={{
                backgroundColor: '#f0f2f5',
                marginTop: '16px',
              }}
            >
              <Space direction="vertical" size="small">
                <Text strong>認証コードが届かない場合:</Text>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>迷惑メールフォルダをご確認ください</li>
                  <li>メールアドレスが正しいか確認してください</li>
                  <li>数分待ってから再度お試しください</li>
                </ul>
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ForgotPassword;