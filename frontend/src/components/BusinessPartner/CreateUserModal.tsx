import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Space,
  Alert,
  Checkbox,
  Typography,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { createValidationRules } from '../../utils/validation';

const { Option } = Select;
const { Text } = Typography;

interface CreateUserModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onOk,
  onCancel,
  loading = false,
  isEdit = false,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [sendWelcomeEmail, setSendWelcomeEmail] = React.useState(true);

  React.useEffect(() => {
    if (visible) {
      if (initialValues && isEdit) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        setSendWelcomeEmail(true);
      }
    }
  }, [visible, initialValues, isEdit, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onOk({ ...values, sendWelcomeEmail });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {isEdit ? 'ユーザー情報編集' : '新規ユーザー作成'}
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={700}
      confirmLoading={loading}
      okText={isEdit ? '更新' : '作成'}
      cancelText="キャンセル"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: 'user',
          isActive: true,
        }}
      >
        <Alert
          message={isEdit ? 'ユーザー情報の更新' : '新規ユーザーアカウントの作成'}
          description={
            isEdit
              ? 'ユーザーの基本情報と権限を更新できます。パスワードの変更は別途行ってください。'
              : '取引先企業のユーザーアカウントを作成します。作成後、ログイン情報がメールで送信されます。'
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="氏名"
              rules={createValidationRules.required('氏名')}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="山田 太郎"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nameKana"
              label="氏名（カナ）"
              rules={createValidationRules.katakana}
            >
              <Input
                placeholder="ヤマダ タロウ"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="メールアドレス"
              rules={createValidationRules.email}
              extra={!isEdit && 'このメールアドレスがログインIDになります'}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="yamada@example.com"
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="電話番号"
              rules={createValidationRules.phone}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="03-1234-5678"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="department"
              label="部署"
            >
              <Input
                placeholder="営業部"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="position"
              label="役職"
            >
              <Input
                placeholder="課長"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="初期パスワード"
                rules={[
                  ...createValidationRules.required('パスワード'),
                  ...createValidationRules.minLength(8, 'パスワード'),
                  {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                    message: '英字と数字を含む8文字以上で設定してください',
                  },
                ]}
                extra="英字と数字を含む8文字以上"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="初期パスワード"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="パスワード確認"
                dependencies={['password']}
                rules={[
                  ...createValidationRules.required('パスワード確認'),
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
                  placeholder="パスワード確認"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role"
              label="権限"
              rules={createValidationRules.required('権限')}
              extra="管理者は他のユーザーの管理や設定変更が可能です"
            >
              <Select placeholder="選択してください" size="large">
                <Option value="admin">
                  <Space>
                    <SafetyOutlined />
                    管理者
                  </Space>
                </Option>
                <Option value="user">
                  <Space>
                    <UserOutlined />
                    一般ユーザー
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="アカウント状態"
              valuePropName="checked"
            >
              <Select placeholder="選択してください" size="large">
                <Option value={true}>有効</Option>
                <Option value={false}>無効</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="備考"
        >
          <Input.TextArea
            rows={3}
            placeholder="特記事項があれば入力してください"
          />
        </Form.Item>

        {!isEdit && (
          <>
            <Form.Item>
              <Checkbox
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
              >
                <Space>
                  <Text>ウェルカムメールを送信する</Text>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Space>
              </Checkbox>
            </Form.Item>

            <Alert
              message="メール送信について"
              description={
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                  <li>ログイン情報（メールアドレスと初期パスワード）が送信されます</li>
                  <li>初回ログイン時にパスワード変更を促されます</li>
                  <li>システムの利用方法に関する案内も含まれます</li>
                </ul>
              }
              type="info"
              showIcon={false}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreateUserModal;