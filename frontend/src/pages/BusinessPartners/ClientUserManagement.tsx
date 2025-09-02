import { errorLog } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Tooltip,
  Switch,
  Popconfirm,
  Alert,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessPartnerStore } from '../../stores/useBusinessPartnerStore';
import type { ClientUser, CreateClientUserDto, UpdateClientUserDto } from '../../services/businessPartnerService';
import { createValidationRules } from '../../utils/validation';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientUserManagement: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const {
    currentPartner,
    clientUsers,
    isLoading,
    error,
    fetchBusinessPartner,
    fetchClientUsers,
    createClientUser,
    updateClientUser,
    deleteClientUser,
    resetClientUserPassword,
    clearError,
  } = useBusinessPartnerStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [passwordForm] = Form.useForm();

  // データ読み込み
  useEffect(() => {
    if (partnerId) {
      loadData();
    }
  }, [partnerId]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchBusinessPartner(partnerId!),
        fetchClientUsers(partnerId!),
      ]);
    } catch (error) {
      message.error('データの読み込みに失敗しました');
    }
  };

  // エラー表示
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  // モーダルを開く
  const showModal = (user?: ClientUser) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        position: user.position,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // ユーザー作成・更新
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // 更新
        const updateData: UpdateClientUserDto = {
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          department: values.department,
          position: values.position,
          role: values.role,
        };
        await updateClientUser(partnerId!, editingUser.id, updateData);
        message.success('ユーザー情報を更新しました');
      } else {
        // 新規作成
        const createData: Omit<CreateClientUserDto, 'businessPartnerId'> = {
          name: values.name,
          email: values.email,
          password: values.password,
          phoneNumber: values.phoneNumber,
          department: values.department,
          position: values.position,
          role: values.role,
        };
        await createClientUser(partnerId!, createData);
        message.success('ユーザーを作成しました');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error: any) {
      errorLog('保存エラー:', error);
      message.error(error.response?.data?.message || '保存に失敗しました');
    }
  };

  // ユーザー削除
  const handleDelete = async (userId: string) => {
    try {
      await deleteClientUser(partnerId!, userId);
      message.success('ユーザーを削除しました');
    } catch (error: any) {
      message.error(error.response?.data?.message || '削除に失敗しました');
    }
  };

  // パスワードリセット
  const handlePasswordReset = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (!selectedUserId) {
        message.error('ユーザーが選択されていません');
        return;
      }
      await resetClientUserPassword(partnerId!, selectedUserId, values.newPassword);
      message.success('パスワードをリセットしました');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      setSelectedUserId(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'パスワードリセットに失敗しました');
    }
  };

  // ユーザーのアクティブ/非アクティブ切り替え
  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await updateClientUser(partnerId!, userId, { isActive });
      message.success(`ユーザーを${isActive ? 'アクティブ' : '非アクティブ'}にしました`);
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新に失敗しました');
    }
  };

  const columns: ColumnsType<ClientUser> = [
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ClientUser) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
          {record.role === 'admin' && (
            <Tag color="gold">管理者</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'メールアドレス',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: '部署',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '役職',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '電話番号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone ? (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ) : '-',
    },
    {
      title: 'ステータス',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: ClientUser) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          checkedChildren="有効"
          unCheckedChildren="無効"
        />
      ),
    },
    {
      title: '最終ログイン',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ja-JP') : '未ログイン',
    },
    {
      title: 'アクション',
      key: 'action',
      width: 200,
      render: (_, record: ClientUser) => (
        <Space>
          <Tooltip title="編集">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="パスワードリセット">
            <Button
              size="small"
              icon={<KeyOutlined />}
              onClick={() => {
                setSelectedUserId(record.id);
                setPasswordModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="ユーザーを削除しますか？"
            description="この操作は取り消せません"
            onConfirm={() => handleDelete(record.id)}
            okText="削除"
            cancelText="キャンセル"
          >
            <Tooltip title="削除">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <TeamOutlined /> 取引先ユーザー管理
            </Title>
            {currentPartner && (
              <Text type="secondary">
                {currentPartner.partner.companyName}
              </Text>
            )}
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => showModal()}
            >
              新規ユーザー作成
            </Button>
          </Col>
        </Row>

        <Alert
          message="ユーザー管理について"
          description="取引先企業のユーザーアカウントを管理します。管理者権限を持つユーザーは、他のユーザーの管理やエンジニア情報の閲覧権限設定が可能です。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={clientUsers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
        />
      </Card>

      {/* ユーザー作成・編集モーダル */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            {editingUser ? 'ユーザー編集' : '新規ユーザー作成'}
          </Space>
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        width={600}
        confirmLoading={isLoading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="氏名"
                rules={createValidationRules.required('氏名')}
              >
                <Input placeholder="山田 太郎" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="権限"
                rules={createValidationRules.required('権限')}
              >
                <Select placeholder="選択してください">
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
          </Row>

          <Form.Item
            name="email"
            label="メールアドレス"
            rules={createValidationRules.email}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="yamada@example.com"
            />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="初期パスワード"
              rules={[
                ...createValidationRules.required('パスワード'),
                ...createValidationRules.minLength(8, 'パスワード'),
              ]}
              extra="8文字以上で設定してください"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="パスワード"
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部署"
              >
                <Input placeholder="営業部" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="役職"
              >
                <Input placeholder="課長" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phoneNumber"
            label="電話番号"
            rules={createValidationRules.phone}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="03-1234-5678"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* パスワードリセットモーダル */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            パスワードリセット
          </Space>
        }
        open={passwordModalVisible}
        onOk={handlePasswordReset}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
          setSelectedUserId(null);
        }}
        width={400}
      >
        <Alert
          message="新しいパスワードを設定します"
          description="ユーザーには新しいパスワードがメールで通知されます"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="新しいパスワード"
            rules={[
              ...createValidationRules.required('パスワード'),
              ...createValidationRules.minLength(8, 'パスワード'),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="新しいパスワード"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="パスワード確認"
            dependencies={['newPassword']}
            rules={[
              ...createValidationRules.required('パスワード確認'),
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
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="パスワード確認"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientUserManagement;