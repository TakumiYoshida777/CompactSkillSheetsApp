import { errorLog } from '../../utils/logger';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, InputNumber } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { engineerAuthService } from '../../services/engineer/authService';

const { Title, Text } = Typography;

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber?: string;
  experienceYears?: number;
}

const EngineerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: RegisterForm) => {
    try {
      setLoading(true);
      const response = await engineerAuthService.register({
        email: values.email,
        password: values.password,
        name: values.name,
        phoneNumber: values.phoneNumber,
        experienceYears: values.experienceYears,
      });

      if (response.success) {
        // 認証情報を保存
        setAuth({
          user: response.data.user,
          tokens: response.data.tokens,
        });

        message.success('登録に成功しました');
        navigate('engineer/skill-sheet');
      }
    } catch (error: any) {
      errorLog('Register error:', error);
      message.error(error.response?.data?.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={2}>エンジニア新規登録</Title>
          <Text type="secondary">スキルシート管理システム</Text>
        </div>

        <Form
          form={form}
          name="engineer-register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="氏名"
            rules={[
              { required: true, message: '氏名を入力してください' },
              { min: 2, message: '氏名は2文字以上必要です' },
              { max: 100, message: '氏名は100文字以内で入力してください' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="山田 太郎"
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
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'パスワードは大文字、小文字、数字を含む必要があります',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="パスワード"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="パスワード（確認）"
            dependencies={['password']}
            rules={[
              { required: true, message: 'パスワード（確認）を入力してください' },
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
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="電話番号（任意）"
            rules={[
              {
                pattern: /^[0-9-]+$/,
                message: '電話番号は数字とハイフンのみ使用できます',
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="090-1234-5678"
            />
          </Form.Item>

          <Form.Item
            name="experienceYears"
            label="経験年数（任意）"
            rules={[
              { type: 'number', min: 0, message: '経験年数は0以上を入力してください' },
              { type: 'number', max: 50, message: '経験年数は50年以下を入力してください' },
            ]}
          >
            <InputNumber
              prefix={<CalendarOutlined />}
              placeholder="5"
              style={{ width: '100%' }}
              min={0}
              max={50}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-blue-600 hover:bg-blue-700"
            >
              登録する
            </Button>
          </Form.Item>

          <div className="text-center space-y-2">
            <div>
              <Link to="/engineer/login" className="text-blue-600 hover:text-blue-800">
                既にアカウントをお持ちの方
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link to="/register" className="text-gray-600 hover:text-gray-800 text-sm">
                企業アカウントで登録
              </Link>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EngineerRegister;