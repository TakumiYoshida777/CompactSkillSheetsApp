import { debugLog } from '../../utils/logger';
import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Row,
  Col,
  Typography,
  Divider,
  Upload,
  message,
  Space,
  Switch,
  Select,
  Tabs,
  Alert,
  Modal,
  List,
  Badge,
  Tag,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
  EditOutlined,
  SafetyOutlined,
  GlobalOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { TabsProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface LoginHistory {
  id: string;
  date: string;
  time: string;
  ipAddress: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
}

const UserProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // ダミーデータ：ユーザー情報
  const userData = {
    name: '田中太郎',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    role: 'SES企業管理者',
    department: '営業部',
    employeeId: 'EMP001',
    company: 'ABC人材サービス株式会社',
    joinDate: '2020/04/01',
    lastLogin: '2024/01/15 10:30',
  };

  // ダミーデータ：ログイン履歴
  const loginHistory: LoginHistory[] = [
    {
      id: '1',
      date: '2024/01/15',
      time: '10:30:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome / Windows',
      location: '東京',
      status: 'success',
    },
    {
      id: '2',
      date: '2024/01/14',
      time: '09:15:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome / Windows',
      location: '東京',
      status: 'success',
    },
    {
      id: '3',
      date: '2024/01/13',
      time: '14:20:00',
      ipAddress: '192.168.1.50',
      device: 'Safari / Mac',
      location: '大阪',
      status: 'success',
    },
    {
      id: '4',
      date: '2024/01/12',
      time: '11:45:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome / Windows',
      location: '東京',
      status: 'failed',
    },
  ];

  // プロフィール画像アップロード設定
  const uploadProps: UploadProps = {
    name: 'avatar',
    action: 'upload/avatar',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('JPGまたはPNG形式の画像をアップロードしてください');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('画像サイズは2MB以下にしてください');
      }
      return isJpgOrPng && isLt2M;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('プロフィール画像を更新しました');
      } else if (info.file.status === 'error') {
        message.error('画像のアップロードに失敗しました');
      }
    },
  };

  // プロフィール情報保存
  const handleSaveProfile = async (values: any) => {
    setLoading(true);
    try {
      debugLog('Profile values:', values);
      message.success('プロフィール情報を更新しました');
      setIsEditing(false);
    } catch (error) {
      message.error('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // パスワード変更
  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      debugLog('Password change:', values);
      message.success('パスワードを変更しました');
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('パスワードの変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 二段階認証設定
  const handle2FAToggle = (checked: boolean) => {
    if (checked) {
      Modal.confirm({
        title: '二段階認証を有効にしますか？',
        content: '二段階認証を有効にすると、ログイン時に追加の認証が必要になります。',
        okText: '有効にする',
        cancelText: 'キャンセル',
        onOk: () => {
          message.success('二段階認証を有効にしました');
        },
      });
    } else {
      Modal.confirm({
        title: '二段階認証を無効にしますか？',
        content: 'セキュリティレベルが低下する可能性があります。',
        okText: '無効にする',
        cancelText: 'キャンセル',
        okType: 'danger',
        onOk: () => {
          message.warning('二段階認証を無効にしました');
        },
      });
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          基本情報
        </span>
      ),
      children: (
        <div>
          <div className="text-center mb-6">
            <Upload {...uploadProps}>
              <Badge
                count={
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="small"
                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                  />
                }
              >
                <Avatar size={120} icon={<UserOutlined />} />
              </Badge>
            </Upload>
            <div className="mt-4">
              <Title level={4}>{userData.name}</Title>
              <Text type="secondary">{userData.role}</Text>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={userData}
            onFinish={handleSaveProfile}
            disabled={!isEditing}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="氏名"
                  rules={[{ required: true, message: '氏名を入力してください' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="employeeId"
                  label="社員ID"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="メールアドレス"
                  rules={[
                    { required: true, message: 'メールアドレスを入力してください' },
                    { type: 'email', message: '有効なメールアドレスを入力してください' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="電話番号"
                  rules={[{ required: true, message: '電話番号を入力してください' }]}
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="department"
                  label="部署"
                >
                  <Input prefix={<TeamOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label="役割"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="company"
                  label="会社名"
                >
                  <Input prefix={<BankOutlined />} disabled />
                </Form.Item>
              </Col>
            </Row>

            {isEditing && (
              <Row justify="end" gutter={[8, 8]}>
                <Col>
                  <Button onClick={() => setIsEditing(false)}>
                    キャンセル
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                  >
                    保存
                  </Button>
                </Col>
              </Row>
            )}
          </Form>

          {!isEditing && (
            <div className="text-right">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                編集
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SafetyOutlined />
          セキュリティ
        </span>
      ),
      children: (
        <div>
          <Alert
            message="セキュリティ設定"
            description="アカウントのセキュリティを強化するための設定を行います"
            type="info"
            showIcon
            className="mb-4"
          />

          <Card title="パスワード" className="mb-4">
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <Text>現在のパスワード</Text>
                  <Text type="secondary">最終変更: 30日前</Text>
                </Space>
              </Col>
              <Col>
                <Button
                  icon={<KeyOutlined />}
                  onClick={() => setIsPasswordModalVisible(true)}
                >
                  パスワード変更
                </Button>
              </Col>
            </Row>
          </Card>

          <Card title="二段階認証" className="mb-4">
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <Text>二段階認証</Text>
                  <Text type="secondary">
                    ログイン時に追加の認証コードが必要になります
                  </Text>
                </Space>
              </Col>
              <Col>
                <Switch
                  checkedChildren="有効"
                  unCheckedChildren="無効"
                  onChange={handle2FAToggle}
                />
              </Col>
            </Row>
          </Card>

          <Card title="ログイン履歴">
            <List
              dataSource={loginHistory}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.status === 'success' ? (
                        <CheckCircleOutlined className="text-green-500 text-xl" />
                      ) : (
                        <ExclamationCircleOutlined className="text-red-500 text-xl" />
                      )
                    }
                    title={
                      <Space>
                        <Text>{item.date} {item.time}</Text>
                        {item.status === 'success' ? (
                          <Tag color="success">成功</Tag>
                        ) : (
                          <Tag color="error">失敗</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">IP: {item.ipAddress}</Text>
                        <Text type="secondary">デバイス: {item.device}</Text>
                        <Text type="secondary">場所: {item.location}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <SettingOutlined />
          その他
        </span>
      ),
      children: (
        <div>
          <Card title="表示設定" className="mb-4">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row justify="space-between" align="middle">
                <Col span={18}>
                  <Space direction="vertical" size={0}>
                    <Text strong>言語</Text>
                    <Text type="secondary">
                      システムの表示言語を選択します
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Select defaultValue="ja" style={{ width: 120 }}>
                    <Option value="ja">日本語</Option>
                    <Option value="en">English</Option>
                  </Select>
                </Col>
              </Row>

              <Divider />

              <Row justify="space-between" align="middle">
                <Col span={18}>
                  <Space direction="vertical" size={0}>
                    <Text strong>タイムゾーン</Text>
                    <Text type="secondary">
                      時刻表示のタイムゾーンを設定します
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Select defaultValue="tokyo" style={{ width: 150 }}>
                    <Option value="tokyo">東京 (GMT+9)</Option>
                    <Option value="seoul">ソウル (GMT+9)</Option>
                    <Option value="singapore">シンガポール (GMT+8)</Option>
                  </Select>
                </Col>
              </Row>

              <Divider />

              <Row justify="space-between" align="middle">
                <Col span={18}>
                  <Space direction="vertical" size={0}>
                    <Text strong>日付形式</Text>
                    <Text type="secondary">
                      日付の表示形式を選択します
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Select defaultValue="yyyy/mm/dd" style={{ width: 150 }}>
                    <Option value="yyyy/mm/dd">YYYY/MM/DD</Option>
                    <Option value="dd/mm/yyyy">DD/MM/YYYY</Option>
                    <Option value="mm/dd/yyyy">MM/DD/YYYY</Option>
                  </Select>
                </Col>
              </Row>
            </Space>
          </Card>

          <Card title="アカウント管理">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="データエクスポート"
                description="アカウントに関連するすべてのデータをダウンロードできます"
                type="info"
                action={
                  <Button size="small">
                    エクスポート
                  </Button>
                }
              />
              
              <Alert
                message="アカウント削除"
                description="アカウントを削除すると、すべてのデータが失われます"
                type="error"
                action={
                  <Button size="small" danger>
                    アカウント削除
                  </Button>
                }
              />
            </Space>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Title level={2}>プロフィール設定</Title>
        <Paragraph type="secondary">
          アカウント情報とセキュリティ設定を管理します
        </Paragraph>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* パスワード変更モーダル */}
      <Modal
        title="パスワード変更"
        open={isPasswordModalVisible}
        onOk={() => passwordForm.submit()}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        confirmLoading={loading}
        okText="変更"
        cancelText="キャンセル"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="現在のパスワード"
            rules={[{ required: true, message: '現在のパスワードを入力してください' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新しいパスワード"
            rules={[
              { required: true, message: '新しいパスワードを入力してください' },
              { min: 8, message: 'パスワードは8文字以上にしてください' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="新しいパスワード（確認）"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'パスワードを再入力してください' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('パスワードが一致しません'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;