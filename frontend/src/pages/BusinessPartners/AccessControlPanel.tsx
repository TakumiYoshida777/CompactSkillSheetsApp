import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  Radio,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  message,
  Row,
  Col,
  Tag,
  Select,
  Transfer,
  Spin,
  Tabs,
  List,
  Avatar,
} from 'antd';
import {
  LockOutlined,
  UnlockOutlined,
  TeamOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  SafetyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessPartnerStore } from '../../stores/useBusinessPartnerStore';
import type { UpdateAccessPermissionDto } from '../../services/businessPartnerService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface EngineerItem {
  key: string;
  title: string;
  description?: string;
  chosen?: boolean;
  disabled?: boolean;
}

const AccessControlPanel: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const {
    currentPartner,
    accessPermission,
    isLoading,
    error,
    fetchBusinessPartner,
    fetchAccessPermissions,
    updateAccessPermissions,
    updateAllowedEngineers,
    clearError,
  } = useBusinessPartnerStore();

  const [saving, setSaving] = useState(false);
  const [displayMode, setDisplayMode] = useState<'all' | 'waiting' | 'available' | 'custom'>('all');
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  
  // モックデータ（実際のエンジニアデータに置き換える）
  const [allEngineers] = useState<EngineerItem[]>([
    { key: '1', title: '山田 太郎', description: 'React, TypeScript' },
    { key: '2', title: '佐藤 花子', description: 'Java, Spring Boot' },
    { key: '3', title: '鈴木 一郎', description: 'Python, Django' },
    { key: '4', title: '田中 次郎', description: 'AWS, DevOps' },
    { key: '5', title: '伊藤 三郎', description: 'Vue.js, Node.js' },
    { key: '6', title: '高橋 四郎', description: 'C#, .NET' },
  ]);

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
        fetchAccessPermissions(partnerId!),
      ]);
    } catch (error) {
      message.error('データの読み込みに失敗しました');
    }
  };

  // 権限設定の初期値設定
  useEffect(() => {
    if (accessPermission) {
      setDisplayMode(accessPermission.engineerDisplayMode || 'all');
      setTargetKeys(accessPermission.allowedEngineerIds || []);
      form.setFieldsValue({
        canViewAllEngineers: accessPermission.canViewAllEngineers,
        canViewWaitingEngineers: accessPermission.canViewWaitingEngineers,
        canViewAvailableEngineers: accessPermission.canViewAvailableEngineers,
        engineerDisplayMode: accessPermission.engineerDisplayMode,
      });
    }
  }, [accessPermission, form]);

  // エラー表示
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  // 権限設定を保存
  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const updateData: UpdateAccessPermissionDto = {
        canViewAllEngineers: values.canViewAllEngineers,
        canViewWaitingEngineers: values.canViewWaitingEngineers,
        canViewAvailableEngineers: values.canViewAvailableEngineers,
        engineerDisplayMode: displayMode,
      };

      await updateAccessPermissions(partnerId!, updateData);
      
      if (displayMode === 'custom') {
        await updateAllowedEngineers(partnerId!, targetKeys);
      }
      
      message.success('アクセス権限を更新しました');
    } catch (error: any) {
      console.error('保存エラー:', error);
      message.error(error.response?.data?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // Transfer コンポーネントの変更ハンドラ
  const handleTransferChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
  };

  const handleTransferSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  if (isLoading && !currentPartner) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="読み込み中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>
          <LockOutlined /> アクセス権限設定
        </Title>
        {currentPartner && (
          <Text type="secondary">
            {currentPartner.partner.companyName}
          </Text>
        )}
        
        <Divider />

        <Alert
          message="アクセス権限について"
          description={
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>取引先企業がアクセスできるエンジニア情報を制限できます</li>
              <li>表示モードとエンジニアの公開範囲を細かく設定可能です</li>
              <li>NGリストに登録されたエンジニアは自動的に非表示になります</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane
              tab={
                <span>
                  <EyeOutlined />
                  基本設定
                </span>
              }
              key="basic"
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="canViewAllEngineers"
                    valuePropName="checked"
                  >
                    <Space>
                      <Switch />
                      <div>
                        <Text strong>全エンジニア情報の閲覧を許可</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            すべてのエンジニアのプロフィールとスキル情報を閲覧できるようになります
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="canViewWaitingEngineers"
                    valuePropName="checked"
                  >
                    <Space>
                      <Switch />
                      <div>
                        <Text strong>待機中エンジニアの閲覧を許可</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            現在待機中のエンジニア情報のみ閲覧できるようになります
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="canViewAvailableEngineers"
                    valuePropName="checked"
                  >
                    <Space>
                      <Switch />
                      <div>
                        <Text strong>稼働可能エンジニアの閲覧を許可</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            今後稼働可能になるエンジニア情報を閲覧できるようになります
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item label="エンジニア表示モード">
                <Radio.Group
                  value={displayMode}
                  onChange={(e) => setDisplayMode(e.target.value)}
                >
                  <Space direction="vertical">
                    <Radio value="all">
                      <Space>
                        <TeamOutlined />
                        <div>
                          <Text>全エンジニア表示</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              すべてのエンジニアを表示します
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Radio>
                    <Radio value="waiting">
                      <Space>
                        <CloseCircleOutlined />
                        <div>
                          <Text>待機中のみ</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              現在待機中のエンジニアのみ表示します
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Radio>
                    <Radio value="available">
                      <Space>
                        <CheckCircleOutlined />
                        <div>
                          <Text>稼働可能のみ</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              稼働可能なエンジニアのみ表示します
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Radio>
                    <Radio value="custom">
                      <Space>
                        <SafetyOutlined />
                        <div>
                          <Text>カスタム選択</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              表示するエンジニアを個別に選択します
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  エンジニア個別設定
                </span>
              }
              key="engineers"
              disabled={displayMode !== 'custom'}
            >
              {displayMode === 'custom' ? (
                <>
                  <Alert
                    message="表示するエンジニアを選択"
                    description="左側のリストから、この取引先に表示を許可するエンジニアを選択して右側に移動してください"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Transfer
                    dataSource={allEngineers}
                    titles={['非表示', '表示許可']}
                    targetKeys={targetKeys}
                    selectedKeys={selectedKeys}
                    onChange={handleTransferChange}
                    onSelectChange={handleTransferSelectChange}
                    render={(item) => (
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <div>
                          <div>{item.title}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.description}
                          </Text>
                        </div>
                      </Space>
                    )}
                    listStyle={{
                      width: 350,
                      height: 400,
                    }}
                    showSearch
                    filterOption={(inputValue, option) =>
                      option.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    }
                  />
                  
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      選択済み: {targetKeys.length} 名
                    </Text>
                  </div>
                </>
              ) : (
                <Alert
                  message="カスタム選択モードが無効です"
                  description="エンジニア表示モードで「カスタム選択」を選択すると、個別にエンジニアを選択できます"
                  type="warning"
                  showIcon
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <WarningOutlined />
                  制限事項
                </span>
              }
              key="restrictions"
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    title: '個人情報の保護',
                    description: 'エンジニアの個人連絡先（電話番号、個人メールアドレス）は表示されません',
                    icon: <LockOutlined style={{ color: '#ff4d4f' }} />,
                  },
                  {
                    title: '料金情報',
                    description: '単価や料金に関する情報は営業担当者を通じてのみ開示されます',
                    icon: <EyeInvisibleOutlined style={{ color: '#faad14' }} />,
                  },
                  {
                    title: 'NGリスト',
                    description: 'NGリストに登録されたエンジニアは設定に関わらず非表示となります',
                    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                  },
                  {
                    title: 'データ更新',
                    description: 'エンジニア情報は毎日更新されます。最新情報は翌日反映されます',
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>

          <Divider />

          <Row justify="end">
            <Space>
              <Button
                size="large"
                onClick={() => navigate(`/business-partners/${partnerId}`)}
              >
                キャンセル
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={saving || isLoading}
                htmlType="submit"
              >
                設定を保存
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AccessControlPanel;