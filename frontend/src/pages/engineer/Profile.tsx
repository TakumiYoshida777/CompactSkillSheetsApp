import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  Upload,
  Avatar,
  Typography,
  Space,
  Divider,
  Alert,
  Switch,
  Radio,
  message,
  Tabs,
  Modal,
  List,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CameraOutlined,
  SaveOutlined,
  LockOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  LinkOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import './Profile.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface ProfileData {
  name: string;
  nameKana: string;
  email: string;
  personalEmail?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  nearestStation?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  currentStatus?: string;
  availableDate?: string;
  isPublic?: boolean;
}

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [activeTab, setActiveTab] = useState('basic');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    projectUpdate: true,
    approachNotification: true,
    systemNotification: true,
    newsletter: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // APIからプロフィールデータを取得（仮実装）
      const profileData = {
        name: '田中 太郎',
        nameKana: 'タナカ タロウ',
        email: 'tanaka@example.com',
        personalEmail: 'personal@example.com',
        phone: '090-1234-5678',
        birthDate: '1990-01-01',
        gender: 'male',
        address: '東京都渋谷区',
        nearestStation: '渋谷駅',
        githubUrl: 'https://github.com/tanaka',
        bio: 'フルスタックエンジニアとして5年の経験があります。',
        currentStatus: 'working',
        availableDate: '2024-04-01',
        isPublic: true,
      };
      form.setFieldsValue({
        ...profileData,
        birthDate: profileData.birthDate ? dayjs(profileData.birthDate) : undefined,
        availableDate: profileData.availableDate ? dayjs(profileData.availableDate) : undefined,
      });
    } catch (error) {
      message.error('プロフィールの読み込みに失敗しました');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const profileData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined,
        availableDate: values.availableDate ? values.availableDate.format('YYYY-MM-DD') : undefined,
      };
      
      await updateProfile(profileData);
      message.success('プロフィールを更新しました');
    } catch (error) {
      message.error('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('新しいパスワードが一致しません');
        return;
      }
      // パスワード変更API呼び出し（仮実装）
      message.success('パスワードを変更しました');
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('パスワード変更に失敗しました');
    }
  };

  const handleImageUpload = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // 画像URLを設定（仮実装）
      setImageUrl('https://via.placeholder.com/150');
      setLoading(false);
      message.success('プロフィール画像を更新しました');
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('JPGまたはPNG形式の画像をアップロードしてください');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('画像サイズは2MB以下にしてください');
    }
    return isJpgOrPng && isLt2M;
  };

  const renderBasicInfo = () => (
    <Card title="基本情報" className="profile-card">
      <Row gutter={16}>
        <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="/api/upload"
            beforeUpload={beforeUpload}
            onChange={handleImageUpload}
          >
            {imageUrl ? (
              <Avatar size={100} src={imageUrl} />
            ) : (
              <Avatar size={100} icon={<UserOutlined />} />
            )}
            <div className="upload-overlay">
              <CameraOutlined />
              <div>写真を変更</div>
            </div>
          </Upload>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="氏名"
            rules={[{ required: true, message: '氏名を入力してください' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="田中 太郎" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="nameKana"
            label="氏名（カナ）"
            rules={[{ required: true, message: '氏名（カナ）を入力してください' }]}
          >
            <Input placeholder="タナカ タロウ" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="メールアドレス（会社）"
            rules={[
              { required: true, message: 'メールアドレスを入力してください' },
              { type: 'email', message: '有効なメールアドレスを入力してください' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@company.com" disabled />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="personalEmail"
            label="メールアドレス（個人）"
            rules={[
              { type: 'email', message: '有効なメールアドレスを入力してください' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="personal@example.com" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="電話番号"
          >
            <Input prefix={<PhoneOutlined />} placeholder="090-1234-5678" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="birthDate"
            label="生年月日"
          >
            <DatePicker style={{ width: '100%' }} placeholder="生年月日を選択" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="gender"
            label="性別"
          >
            <Radio.Group>
              <Radio value="male">男性</Radio>
              <Radio value="female">女性</Radio>
              <Radio value="other">その他</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="nearestStation"
            label="最寄り駅"
          >
            <Input prefix={<HomeOutlined />} placeholder="例: 渋谷駅" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="住所"
      >
        <Input.TextArea rows={2} placeholder="例: 東京都渋谷区..." />
      </Form.Item>

      <Form.Item
        name="bio"
        label="自己紹介"
      >
        <Input.TextArea
          rows={4}
          placeholder="あなたのキャリアや強みについて記入してください"
          maxLength={500}
          showCount
        />
      </Form.Item>
    </Card>
  );

  const renderWorkStatus = () => (
    <Card title="稼働状況" className="profile-card">
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="currentStatus"
            label="現在の状況"
          >
            <Select placeholder="選択してください">
              <Option value="working">稼働中</Option>
              <Option value="waiting">待機中</Option>
              <Option value="waiting_soon">待機予定</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="availableDate"
            label="稼働可能日"
          >
            <DatePicker style={{ width: '100%' }} placeholder="稼働可能日を選択" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="isPublic"
        label="プロフィール公開設定"
        valuePropName="checked"
      >
        <Switch checkedChildren="公開" unCheckedChildren="非公開" />
      </Form.Item>

      <Alert
        message="公開設定について"
        description="プロフィールを公開すると、取引先企業があなたの情報を閲覧できるようになります。"
        type="info"
        showIcon
      />
    </Card>
  );

  const renderSocialLinks = () => (
    <Card title="ソーシャルリンク" className="profile-card">
      <Form.Item
        name="githubUrl"
        label="GitHub"
      >
        <Input
          prefix={<GithubOutlined />}
          placeholder="https://github.com/username"
        />
      </Form.Item>

      <Form.Item
        name="linkedinUrl"
        label="LinkedIn"
      >
        <Input
          prefix={<LinkedinOutlined />}
          placeholder="https://linkedin.com/in/username"
        />
      </Form.Item>

      <Form.Item
        name="twitterUrl"
        label="Twitter"
      >
        <Input
          prefix={<TwitterOutlined />}
          placeholder="https://twitter.com/username"
        />
      </Form.Item>

      <Form.Item
        name="portfolioUrl"
        label="ポートフォリオ"
      >
        <Input
          prefix={<LinkOutlined />}
          placeholder="https://portfolio.example.com"
        />
      </Form.Item>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card title="セキュリティ設定" className="profile-card">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>パスワード</Title>
          <Paragraph type="secondary">
            定期的にパスワードを変更することをお勧めします
          </Paragraph>
          <Button
            icon={<LockOutlined />}
            onClick={() => setIsPasswordModalVisible(true)}
          >
            パスワードを変更
          </Button>
        </div>

        <Divider />

        <div>
          <Title level={5}>二段階認証</Title>
          <Paragraph type="secondary">
            アカウントのセキュリティを強化します
          </Paragraph>
          <Space>
            <Switch defaultChecked />
            <Text>有効</Text>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>ログイン履歴</Title>
          <List
            size="small"
            dataSource={[
              { time: '2024/01/15 10:30', ip: '192.168.1.1', device: 'Chrome on Windows' },
              { time: '2024/01/14 15:20', ip: '192.168.1.2', device: 'Safari on Mac' },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.time}
                  description={`${item.ip} - ${item.device}`}
                />
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card title="通知設定" className="profile-card">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong>メール通知</Text>
              <br />
              <Text type="secondary">重要な通知をメールで受け取る</Text>
            </div>
            <Switch
              checked={notificationSettings.emailNotification}
              onChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, emailNotification: checked })
              }
            />
          </Space>
        </div>

        <Divider />

        <div>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong>プロジェクト更新</Text>
              <br />
              <Text type="secondary">プロジェクトの状況変更時に通知</Text>
            </div>
            <Switch
              checked={notificationSettings.projectUpdate}
              onChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, projectUpdate: checked })
              }
            />
          </Space>
        </div>

        <Divider />

        <div>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong>アプローチ通知</Text>
              <br />
              <Text type="secondary">新しいアプローチがあった時に通知</Text>
            </div>
            <Switch
              checked={notificationSettings.approachNotification}
              onChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, approachNotification: checked })
              }
            />
          </Space>
        </div>

        <Divider />

        <div>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong>システム通知</Text>
              <br />
              <Text type="secondary">メンテナンスなどのシステム通知</Text>
            </div>
            <Switch
              checked={notificationSettings.systemNotification}
              onChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, systemNotification: checked })
              }
            />
          </Space>
        </div>

        <Divider />

        <div>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong>ニュースレター</Text>
              <br />
              <Text type="secondary">新機能やアップデート情報を受け取る</Text>
            </div>
            <Switch
              checked={notificationSettings.newsletter}
              onChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, newsletter: checked })
              }
            />
          </Space>
        </div>
      </Space>
    </Card>
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Title level={2}>プロフィール設定</Title>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          保存
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本情報" key="basic">
            {renderBasicInfo()}
          </TabPane>
          <TabPane tab="稼働状況" key="status">
            {renderWorkStatus()}
          </TabPane>
          <TabPane tab="ソーシャル" key="social">
            {renderSocialLinks()}
          </TabPane>
          <TabPane tab="セキュリティ" key="security">
            {renderSecuritySettings()}
          </TabPane>
          <TabPane tab="通知設定" key="notification">
            {renderNotificationSettings()}
          </TabPane>
        </Tabs>
      </Form>

      {/* パスワード変更モーダル */}
      <Modal
        title="パスワード変更"
        visible={isPasswordModalVisible}
        onOk={handlePasswordChange}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        okText="変更"
        cancelText="キャンセル"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="現在のパスワード"
            rules={[{ required: true, message: '現在のパスワードを入力してください' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新しいパスワード"
            rules={[
              { required: true, message: '新しいパスワードを入力してください' },
              { min: 12, message: 'パスワードは12文字以上である必要があります' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="新しいパスワード（確認）"
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
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;