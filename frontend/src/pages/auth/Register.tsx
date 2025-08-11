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
  Select,
  Row,
  Col,
  Steps,
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  GoogleOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text, Link: AntLink } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface RegisterFormData {
  companyName?: string;
  companyCode?: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: string;
  agreeToTerms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RegisterFormData>>({});

  const steps = [
    {
      title: 'アカウント種別',
      content: 'AccountType',
    },
    {
      title: '基本情報',
      content: 'BasicInfo',
    },
    {
      title: '認証情報',
      content: 'Credentials',
    },
    {
      title: '確認',
      content: 'Confirmation',
    },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('必須項目を入力してください');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const finalData = { ...formData, ...values };
      
      await register(finalData);
      message.success('登録に成功しました');
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    message.info(`${provider}登録は現在開発中です`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form.Item
            name="role"
            label="アカウント種別"
            rules={[{ required: true, message: 'アカウント種別を選択してください' }]}
          >
            <Select placeholder="選択してください" size="large">
              <Option value="engineer">エンジニア</Option>
              <Option value="company">SES企業担当者</Option>
              <Option value="client">クライアント企業担当者</Option>
            </Select>
          </Form.Item>
        );

      case 1:
        return (
          <>
            {form.getFieldValue('role') === 'company' && (
              <>
                <Form.Item
                  name="companyName"
                  label="企業名"
                  rules={[{ required: true, message: '企業名を入力してください' }]}
                >
                  <Input
                    prefix={<ApartmentOutlined />}
                    placeholder="株式会社〇〇"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="companyCode"
                  label="企業コード"
                  tooltip="管理者から提供された企業コードを入力してください"
                >
                  <Input
                    placeholder="企業コード（任意）"
                    size="large"
                  />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="name"
              label="氏名"
              rules={[{ required: true, message: '氏名を入力してください' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="山田 太郎"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="メールアドレス"
              rules={[
                { required: true, message: 'メールアドレスを入力してください' },
                { type: 'email', message: '有効なメールアドレスを入力してください' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="example@email.com"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="phone"
              label="電話番号"
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="090-1234-5678"
                size="large"
              />
            </Form.Item>
          </>
        );

      case 2:
        return (
          <>
            <Form.Item
              name="password"
              label="パスワード"
              rules={[
                { required: true, message: 'パスワードを入力してください' },
                { min: 8, message: 'パスワードは8文字以上である必要があります' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: '大文字、小文字、数字を含む必要があります',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="パスワード"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="パスワード（確認）"
              dependencies={['password']}
              rules={[
                { required: true, message: 'パスワードを再入力してください' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('パスワードが一致しません'));
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
          </>
        );

      case 3:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card size="small" style={{ backgroundColor: '#f0f2f5' }}>
              <Space direction="vertical" size="small">
                <Text strong>登録内容の確認:</Text>
                <Text>アカウント種別: {formData.role}</Text>
                {formData.companyName && <Text>企業名: {formData.companyName}</Text>}
                <Text>氏名: {formData.name}</Text>
                <Text>メールアドレス: {formData.email}</Text>
                {formData.phone && <Text>電話番号: {formData.phone}</Text>}
              </Space>
            </Card>
            <Form.Item
              name="agreeToTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error('利用規約に同意してください')),
                },
              ]}
            >
              <Checkbox>
                <Link to="/terms" target="_blank">
                  利用規約
                </Link>
                および
                <Link to="/privacy" target="_blank">
                  プライバシーポリシー
                </Link>
                に同意します
              </Checkbox>
            </Form.Item>
          </Space>
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
          maxWidth: '600px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.16)',
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* タイトル */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              新規アカウント登録
            </Title>
            <Text type="secondary">
              必要な情報を入力してアカウントを作成してください
            </Text>
          </div>

          {/* ステップ表示 */}
          <Steps current={currentStep} size="small">
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          {/* フォーム */}
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            requiredMark={false}
            initialValues={formData}
          >
            {renderStepContent()}
          </Form>

          {/* ボタン */}
          <Row gutter={16}>
            {currentStep > 0 && (
              <Col span={12}>
                <Button size="large" block onClick={handlePrev}>
                  戻る
                </Button>
              </Col>
            )}
            <Col span={currentStep > 0 ? 12 : 24}>
              {currentStep < steps.length - 1 ? (
                <Button type="primary" size="large" block onClick={handleNext}>
                  次へ
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isLoading}
                  onClick={handleRegister}
                  icon={<CheckCircleOutlined />}
                >
                  登録する
                </Button>
              )}
            </Col>
          </Row>

          {currentStep === 0 && (
            <>
              <Divider>または</Divider>

              {/* ソーシャル登録 */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                  size="large"
                  block
                  icon={<GoogleOutlined />}
                  onClick={() => handleSocialRegister('Google')}
                >
                  Googleで登録
                </Button>
                <Button
                  size="large"
                  block
                  icon={<GithubOutlined />}
                  onClick={() => handleSocialRegister('GitHub')}
                >
                  GitHubで登録
                </Button>
              </Space>
            </>
          )}

          {/* ログインリンク */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              既にアカウントをお持ちの方は{' '}
              <Link to="/login">
                <AntLink strong>ログイン</AntLink>
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Register;