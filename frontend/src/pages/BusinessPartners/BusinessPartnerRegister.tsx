import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  Steps,
  Alert,
  Checkbox,
  InputNumber,
  DatePicker,
  Upload,
  Modal,
  Tag,
  Tooltip,
  Switch,
  Radio,
  Table,
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  UserOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  RobotOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

interface ContactPerson {
  key: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

const BusinessPartnerRegister: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [emailPreviewVisible, setEmailPreviewVisible] = useState(false);
  const [contactForm] = Form.useForm();

  // 業界リスト
  const industries = [
    'IT・通信', '金融・保険', '製造業', '小売・流通', '医療・福祉',
    '建設・不動産', '運輸・物流', 'サービス業', '教育', '官公庁・公共',
    'エネルギー', 'メディア・広告', 'コンサルティング', 'その他'
  ];

  // 従業員規模
  const employeeSizes = [
    '1-50名', '51-100名', '101-300名', '301-500名', 
    '501-1000名', '1001-5000名', '5000名以上'
  ];

  // 契約形態
  const contractTypes = [
    '準委任契約', '派遣契約', '請負契約', '業務委託契約', 'その他'
  ];

  const steps = [
    {
      title: '基本情報',
      icon: <BankOutlined />,
    },
    {
      title: '担当者情報',
      icon: <UserOutlined />,
    },
    {
      title: '取引条件',
      icon: <FileTextOutlined />,
    },
    {
      title: '営業設定',
      icon: <MailOutlined />,
    },
  ];

  const handleAddContact = () => {
    contactForm.resetFields();
    setEditingContact(null);
    setContactModalVisible(true);
  };

  const handleEditContact = (contact: ContactPerson) => {
    setEditingContact(contact);
    contactForm.setFieldsValue(contact);
    setContactModalVisible(true);
  };

  const handleDeleteContact = (key: string) => {
    setContacts(contacts.filter(c => c.key !== key));
  };

  const handleContactSubmit = () => {
    contactForm.validateFields().then(values => {
      if (editingContact) {
        setContacts(contacts.map(c => 
          c.key === editingContact.key ? { ...c, ...values } : c
        ));
      } else {
        const newContact: ContactPerson = {
          key: Date.now().toString(),
          ...values,
          isPrimary: contacts.length === 0,
        };
        setContacts([...contacts, newContact]);
      }
      setContactModalVisible(false);
      contactForm.resetFields();
    });
  };

  const handleSetPrimary = (key: string) => {
    setContacts(contacts.map(c => ({
      ...c,
      isPrimary: c.key === key,
    })));
  };

  const generateAutoEmail = () => {
    const values = form.getFieldsValue();
    const companyName = values.companyName || '貴社';
    
    return `
${companyName} ご担当者様

お世話になっております。
[自社名]の営業担当でございます。

この度は、弊社のエンジニアスキルシート管理システムにご登録いただき、
誠にありがとうございます。

弊社では、優秀なエンジニアを多数抱えており、
${companyName}のプロジェクトにマッチする人材をご提案させていただきます。

【弊社の強み】
✓ 経験豊富なエンジニア ${Math.floor(Math.random() * 50) + 100}名以上在籍
✓ 最新技術に精通したスペシャリスト多数
✓ 迅速な人材マッチング（最短即日対応）
✓ 柔軟な契約形態に対応

【主な対応可能分野】
- Webアプリケーション開発
- モバイルアプリ開発
- AI・機械学習
- クラウドインフラ構築
- セキュリティ対策

ご要望に応じて、詳細な人材情報をご提供いたします。
まずは貴社のご要望をお聞かせください。

お忙しいところ恐れ入りますが、
ご検討のほど、よろしくお願いいたします。

━━━━━━━━━━━━━━━━━━━━
[自社名]
営業部
TEL: 03-XXXX-XXXX
Email: sales@example.com
━━━━━━━━━━━━━━━━━━━━
    `.trim();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // デモ用の処理
      console.log('Registration data:', {
        ...values,
        contacts,
        autoEmailEnabled,
      });

      // 自動営業メール送信の確認
      if (autoEmailEnabled && contacts.length > 0) {
        Modal.confirm({
          title: '自動営業メール送信確認',
          content: (
            <div>
              <p>以下の担当者に自動営業メールを送信します：</p>
              <ul>
                {contacts.map(contact => (
                  <li key={contact.key}>
                    {contact.name} ({contact.email})
                    {contact.isPrimary && <Tag color="blue" style={{ marginLeft: 8 }}>主担当</Tag>}
                  </li>
                ))}
              </ul>
              <Alert
                message="メールは登録完了後、自動的に送信されます"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </div>
          ),
          onOk: () => {
            message.success('取引先を登録しました');
            message.success('自動営業メールを送信しました', 3);
            setTimeout(() => {
              navigate('/business-partners/list');
            }, 1000);
          },
        });
      } else {
        message.success('取引先を登録しました');
        setTimeout(() => {
          navigate('/business-partners/list');
        }, 1000);
      }
    } catch (error) {
      message.error('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const contactColumns = [
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ContactPerson) => (
        <Space>
          {text}
          {record.isPrimary && <Tag color="blue">主担当</Tag>}
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
      title: 'メールアドレス',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '電話番号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'アクション',
      key: 'action',
      render: (_: any, record: ContactPerson) => (
        <Space>
          {!record.isPrimary && (
            <Button size="small" onClick={() => handleSetPrimary(record.key)}>
              主担当に設定
            </Button>
          )}
          <Button size="small" onClick={() => handleEditContact(record)}>
            編集
          </Button>
          <Button size="small" danger onClick={() => handleDeleteContact(record.key)}>
            削除
          </Button>
        </Space>
      ),
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 基本情報
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="企業名"
                  rules={[{ required: true, message: '企業名を入力してください' }]}
                >
                  <Input 
                    prefix={<BankOutlined />} 
                    placeholder="株式会社〇〇"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="companyNameKana"
                  label="企業名（カナ）"
                  rules={[{ required: true, message: '企業名（カナ）を入力してください' }]}
                >
                  <Input 
                    placeholder="カブシキガイシャ〇〇"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="industry"
                  label="業界"
                  rules={[{ required: true, message: '業界を選択してください' }]}
                >
                  <Select placeholder="選択してください" size="large">
                    {industries.map(ind => (
                      <Option key={ind} value={ind}>{ind}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="employeeSize"
                  label="従業員規模"
                >
                  <Select placeholder="選択してください" size="large">
                    {employeeSizes.map(size => (
                      <Option key={size} value={size}>{size}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Webサイト"
                >
                  <Input 
                    prefix={<GlobalOutlined />} 
                    placeholder="https://example.com"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="代表電話番号"
                  rules={[{ required: true, message: '電話番号を入力してください' }]}
                >
                  <Input 
                    prefix={<PhoneOutlined />} 
                    placeholder="03-1234-5678"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="所在地"
              rules={[{ required: true, message: '所在地を入力してください' }]}
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="東京都千代田区〇〇"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="businessDescription"
              label="事業内容"
            >
              <TextArea 
                rows={4} 
                placeholder="主な事業内容を入力してください"
              />
            </Form.Item>
          </>
        );

      case 1: // 担当者情報
        return (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddContact}
              >
                担当者を追加
              </Button>
            </div>

            {contacts.length === 0 ? (
              <Alert
                message="担当者を登録してください"
                description="自動営業メールを送信するには、少なくとも1名の担当者情報が必要です。"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Table
                columns={contactColumns}
                dataSource={contacts}
                pagination={false}
                size="small"
              />
            )}

            <Divider />

            <Alert
              message="担当者情報について"
              description={
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                  <li>主担当者には重要な連絡が優先的に送信されます</li>
                  <li>複数の担当者を登録できます</li>
                  <li>後から担当者の追加・変更が可能です</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </>
        );

      case 2: // 取引条件
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contractType"
                  label="希望契約形態"
                  rules={[{ required: true, message: '契約形態を選択してください' }]}
                >
                  <Select 
                    mode="multiple"
                    placeholder="選択してください（複数選択可）"
                    size="large"
                  >
                    {contractTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paymentTerms"
                  label="支払いサイト"
                >
                  <Select placeholder="選択してください" size="large">
                    <Option value="15">15日</Option>
                    <Option value="30">30日</Option>
                    <Option value="45">45日</Option>
                    <Option value="60">60日</Option>
                    <Option value="other">その他</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="budgetMin"
                  label="予算下限（月額）"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    step={10}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\¥\s?|(,*)/g, '') as any}
                    placeholder="300,000"
                    addonAfter="円"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="budgetMax"
                  label="予算上限（月額）"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    step={10}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\¥\s?|(,*)/g, '') as any}
                    placeholder="1,000,000"
                    addonAfter="円"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="preferredSkills"
              label="求めるスキル・技術"
            >
              <Select
                mode="tags"
                placeholder="例: React, AWS, Python など"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="preferredIndustries"
              label="希望する業界経験"
            >
              <Select
                mode="multiple"
                placeholder="選択してください"
                size="large"
              >
                {industries.map(ind => (
                  <Option key={ind} value={ind}>{ind}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="requirements"
              label="その他要望・条件"
            >
              <TextArea 
                rows={4} 
                placeholder="リモート勤務可能、フルタイム常駐必須など"
              />
            </Form.Item>
          </>
        );

      case 3: // 営業設定
        return (
          <>
            <Form.Item>
              <Space align="center" size="large">
                <Switch
                  checked={autoEmailEnabled}
                  onChange={setAutoEmailEnabled}
                />
                <div>
                  <Text strong>自動営業メールを送信する</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      登録完了後、担当者に営業メールを自動送信します
                    </Text>
                  </div>
                </div>
              </Space>
            </Form.Item>

            {autoEmailEnabled && (
              <>
                <Divider />
                
                <Alert
                  message={
                    <Space>
                      <RobotOutlined />
                      <span>AI営業アシスタント機能</span>
                    </Space>
                  }
                  description="企業情報と求めるスキルを分析し、最適な営業メールを自動生成・送信します"
                  type="info"
                  showIcon={false}
                  style={{ marginBottom: 16 }}
                />

                <Form.Item
                  name="emailTemplate"
                  label="メールテンプレート"
                >
                  <Radio.Group defaultValue="auto">
                    <Space direction="vertical">
                      <Radio value="auto">
                        <Space>
                          <Text>自動生成テンプレート（推奨）</Text>
                          <Tooltip title="AIが企業情報を分析して最適なメールを生成">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      </Radio>
                      <Radio value="standard">標準テンプレート</Radio>
                      <Radio value="custom">カスタムテンプレート</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="emailTiming"
                  label="送信タイミング"
                >
                  <Radio.Group defaultValue="immediate">
                    <Space direction="vertical">
                      <Radio value="immediate">登録完了後すぐに送信</Radio>
                      <Radio value="scheduled">
                        <Space>
                          <span>指定日時に送信</span>
                          <DatePicker 
                            showTime 
                            placeholder="送信日時を選択"
                            disabled={form.getFieldValue('emailTiming') !== 'scheduled'}
                          />
                        </Space>
                      </Radio>
                      <Radio value="businessHours">次の営業時間内に送信（平日9-18時）</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <div style={{ marginTop: 24 }}>
                  <Button 
                    type="dashed" 
                    icon={<EyeOutlined />}
                    onClick={() => setEmailPreviewVisible(true)}
                  >
                    メールプレビューを確認
                  </Button>
                </div>

                <Divider />

                <Form.Item
                  name="followUpEnabled"
                  valuePropName="checked"
                >
                  <Checkbox>
                    <Space>
                      <Text>自動フォローアップを有効にする</Text>
                      <Tooltip title="返信がない場合、3日後と7日後に自動でフォローアップメールを送信">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>


              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>
          <BankOutlined /> 取引先企業登録
        </Title>
        
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {renderStepContent()}

          <Divider />

          <Row justify="space-between">
            <Col>
              {currentStep > 0 && (
                <Button
                  size="large"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  前へ
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button
                  size="large"
                  onClick={() => navigate('/business-partners/list')}
                >
                  キャンセル
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      form.validateFields().then(() => {
                        setCurrentStep(currentStep + 1);
                      }).catch(() => {
                        message.error('必須項目を入力してください');
                      });
                    }}
                  >
                    次へ
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                  >
                    登録する
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 担当者追加・編集モーダル */}
      <Modal
        title={editingContact ? '担当者編集' : '担当者追加'}
        open={contactModalVisible}
        onOk={handleContactSubmit}
        onCancel={() => {
          setContactModalVisible(false);
          contactForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={contactForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="氏名"
                rules={[{ required: true, message: '氏名を入力してください' }]}
              >
                <Input placeholder="山田 太郎" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部署"
                rules={[{ required: true, message: '部署を入力してください' }]}
              >
                <Input placeholder="人事部" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="役職"
              >
                <Input placeholder="課長" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="メールアドレス"
                rules={[
                  { required: true, message: 'メールアドレスを入力してください' },
                  { type: 'email', message: '有効なメールアドレスを入力してください' },
                ]}
              >
                <Input placeholder="yamada@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="電話番号"
            rules={[{ required: true, message: '電話番号を入力してください' }]}
          >
            <Input placeholder="03-1234-5678" />
          </Form.Item>
        </Form>
      </Modal>

      {/* メールプレビューモーダル */}
      <Modal
        title="自動営業メール プレビュー"
        open={emailPreviewVisible}
        onCancel={() => setEmailPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setEmailPreviewVisible(false)}>
            閉じる
          </Button>,
        ]}
        width={700}
      >
        <Alert
          message="このメールが登録完了後に自動送信されます"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>件名: </Text>
            <Text>【ご案内】優秀なエンジニアのご紹介について - [自社名]</Text>
          </div>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>
            {generateAutoEmail()}
          </div>
        </Card>

        <Alert
          message="カスタマイズについて"
          description="メール内容は企業情報に基づいて自動的にカスタマイズされます。送信前に内容の確認・編集も可能です。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default BusinessPartnerRegister;