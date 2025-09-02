import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Space,
  Table,
  Tag,
  message,
  Modal,
  Alert,
  Divider,
  Radio,
  Checkbox,
  TimePicker,
  Upload,
  Badge,
  Steps,
  Result,
  Tabs,
} from 'antd';
import {
  SendOutlined,
  SaveOutlined,
  UserAddOutlined,
  DeleteOutlined,
  TeamOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

interface Engineer {
  id: string;
  name: string;
  skillMatch: number;
  status: string;
  experience: number;
  skills: string[];
  unitPrice: number;
  availableFrom: string;
}

interface Company {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  lastContactDate: string;
  status: string;
}

interface ApproachTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

const ApproachCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [sendSchedule, setSendSchedule] = useState<'now' | 'scheduled'>('now');
  const [attachments, setAttachments] = useState<any[]>([]);

  // ダミーデータ：エンジニア
  const engineers: Engineer[] = [
    {
      id: '1',
      name: '山田太郎',
      skillMatch: 95,
      status: '待機中',
      experience: 8,
      skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
      unitPrice: 650000,
      availableFrom: '2024/02/01',
    },
    {
      id: '2',
      name: '鈴木花子',
      skillMatch: 88,
      status: '待機予定',
      experience: 5,
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      unitPrice: 550000,
      availableFrom: '2024/03/01',
    },
    {
      id: '3',
      name: '佐藤次郎',
      skillMatch: 82,
      status: '待機中',
      experience: 10,
      skills: ['Python', 'Django', 'Machine Learning', 'GCP'],
      unitPrice: 750000,
      availableFrom: '2024/02/15',
    },
  ];

  // ダミーデータ：取引先企業
  const companies: Company[] = [
    {
      id: '1',
      name: '株式会社テック',
      contactPerson: '田中部長',
      email: 'tanaka@tech.co.jp',
      phone: '03-1234-5678',
      lastContactDate: '2024/01/10',
      status: 'アクティブ',
    },
    {
      id: '2',
      name: 'ソフトウェア開発株式会社',
      contactPerson: '佐藤課長',
      email: 'sato@software.co.jp',
      phone: '03-2345-6789',
      lastContactDate: '2024/01/05',
      status: 'アクティブ',
    },
    {
      id: '3',
      name: 'デジタルソリューション株式会社',
      contactPerson: '鈴木マネージャー',
      email: 'suzuki@digital.co.jp',
      phone: '03-3456-7890',
      lastContactDate: '2023/12/20',
      status: 'アクティブ',
    },
  ];

  // ダミーデータ：アプローチテンプレート
  const approachTemplates: ApproachTemplate[] = [
    {
      id: '1',
      name: '初回提案テンプレート',
      subject: '【ご提案】優秀なエンジニアのご紹介',
      content: `お世話になっております。
ABC人材サービスの〇〇です。

貴社のプロジェクトに最適なエンジニアをご紹介させていただきます。

【エンジニア情報】
{engineer_details}

ご検討のほど、よろしくお願いいたします。`,
      category: '新規提案',
    },
    {
      id: '2',
      name: 'フォローアップテンプレート',
      subject: '【再度ご提案】先日ご紹介したエンジニアについて',
      content: `お世話になっております。
先日ご提案させていただいたエンジニアの件について、
その後いかがでしょうか。

追加でご質問等ございましたら、お気軽にお問い合わせください。`,
      category: 'フォローアップ',
    },
    {
      id: '3',
      name: '複数エンジニア提案',
      subject: '【複数名ご提案】プロジェクト要員のご紹介',
      content: `お世話になっております。
貴社のプロジェクト拡大に伴い、複数名のエンジニアをご提案させていただきます。

それぞれ異なる強みを持つエンジニアですので、
チーム構成に合わせてご検討いただければ幸いです。`,
      category: '複数提案',
    },
  ];

  // エンジニアテーブルのカラム定義
  const engineerColumns: ColumnsType<Engineer> = [
    {
      title: '選択',
      dataIndex: 'id',
      key: 'select',
      width: 60,
      render: (id) => (
        <Checkbox
          checked={selectedEngineers.includes(id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEngineers([...selectedEngineers, id]);
            } else {
              setSelectedEngineers(selectedEngineers.filter(eId => eId !== id));
            }
          }}
        />
      ),
    },
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <UserAddOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },

    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === '待機中' ? 'success' : 'warning'}
          text={status}
        />
      ),
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      render: (years) => `${years}年`,
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills) => (
        <Space wrap>
          {skills.slice(0, 3).map((skill: string) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
          {skills.length > 3 && <Tag>+{skills.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '単価',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `¥${price.toLocaleString()}/月`,
    },
    {
      title: '稼働可能日',
      dataIndex: 'availableFrom',
      key: 'availableFrom',
    },
  ];

  // 取引先テーブルのカラム定義
  const companyColumns: ColumnsType<Company> = [
    {
      title: '選択',
      dataIndex: 'id',
      key: 'select',
      width: 60,
      render: (id) => (
        <Checkbox
          checked={selectedCompanies.includes(id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCompanies([...selectedCompanies, id]);
            } else {
              setSelectedCompanies(selectedCompanies.filter(cId => cId !== id));
            }
          }}
        />
      ),
    },
    {
      title: '企業名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <BankOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '担当者',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'メール',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          <Text copyable>{email}</Text>
        </Space>
      ),
    },
    {
      title: '電話番号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: '最終コンタクト',
      dataIndex: 'lastContactDate',
      key: 'lastContactDate',
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'アクティブ' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
  ];

  // ファイルアップロード設定
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: 'upload',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} アップロード完了`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} アップロード失敗`);
      }
    },
    onRemove(file) {
      setAttachments(attachments.filter(f => f.uid !== file.uid));
    },
  };

  // ステップコンテンツの取得
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div>
            <Alert
              message="エンジニア選択"
              description="アプローチに含めるエンジニアを選択してください。稼働可能日を確認して最適な人材を選びましょう。"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <div className="mb-4">
              <Space>
                <Input.Search
                  placeholder="エンジニア名で検索"
                  style={{ width: 300 }}
                />
                <Select placeholder="ステータス" style={{ width: 120 }}>
                  <Option value="all">すべて</Option>
                  <Option value="waiting">待機中</Option>
                  <Option value="waiting-soon">待機予定</Option>
                </Select>
                <Select placeholder="スキル" style={{ width: 120 }}>
                  <Option value="java">Java</Option>
                  <Option value="react">React</Option>
                  <Option value="python">Python</Option>
                </Select>
              </Space>
            </div>

            <Table
              columns={engineerColumns}
              dataSource={engineers}
              rowKey="id"
              pagination={false}
            />
            
            <div className="mt-4">
              <Text type="secondary">
                選択中: {selectedEngineers.length}名
              </Text>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <Alert
              message="送信先選択"
              description="アプローチを送信する取引先企業を選択してください。複数選択可能です。"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <div className="mb-4">
              <Space>
                <Input.Search
                  placeholder="企業名で検索"
                  style={{ width: 300 }}
                />
                <Select placeholder="ステータス" style={{ width: 120 }}>
                  <Option value="all">すべて</Option>
                  <Option value="active">アクティブ</Option>
                  <Option value="inactive">非アクティブ</Option>
                </Select>
              </Space>
            </div>

            <Table
              columns={companyColumns}
              dataSource={companies}
              rowKey="id"
              pagination={false}
            />
            
            <div className="mt-4">
              <Text type="secondary">
                選択中: {selectedCompanies.length}社
              </Text>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <Alert
              message="メッセージ作成"
              description="送信するメッセージを作成してください。テンプレートを使用することもできます。"
              type="info"
              showIcon
              className="mb-4"
            />

            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="テンプレート選択">
                    <Space>
                      <Select
                        placeholder="テンプレートを選択"
                        style={{ width: 300 }}
                        value={selectedTemplate}
                        onChange={setSelectedTemplate}
                      >
                        {approachTemplates.map(template => (
                          <Option key={template.id} value={template.id}>
                            {template.name}
                          </Option>
                        ))}
                      </Select>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => setIsTemplateModalVisible(true)}
                      >
                        テンプレート管理
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="件名"
                    name="subject"
                    rules={[{ required: true, message: '件名を入力してください' }]}
                  >
                    <Input placeholder="例：【ご提案】優秀なエンジニアのご紹介" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="本文"
                    name="content"
                    rules={[{ required: true, message: '本文を入力してください' }]}
                  >
                    <TextArea
                      rows={12}
                      placeholder="メッセージ本文を入力してください"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="添付ファイル">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>
                        ファイルを選択
                      </Button>
                    </Upload>
                    <Text type="secondary" className="mt-2">
                      スキルシートやポートフォリオを添付できます（PDF, Word形式）
                    </Text>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="送信タイミング">
                    <Radio.Group
                      value={sendSchedule}
                      onChange={(e) => setSendSchedule(e.target.value)}
                    >
                      <Radio value="now">即時送信</Radio>
                      <Radio value="scheduled">予約送信</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                {sendSchedule === 'scheduled' && (
                  <>
                    <Col span={12}>
                      <Form.Item
                        label="送信日"
                        name="sendDate"
                        rules={[{ required: true, message: '送信日を選択してください' }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="送信時刻"
                        name="sendTime"
                        rules={[{ required: true, message: '送信時刻を選択してください' }]}
                      >
                        <TimePicker style={{ width: '100%' }} format="HH:mm" />
                      </Form.Item>
                    </Col>
                  </>
                )}

                <Col span={24}>
                  <Form.Item label="送信オプション">
                    <Checkbox.Group>
                      <Row>
                        <Col span={12}>
                          <Checkbox value="attachSkillSheet">
                            スキルシートを自動添付
                          </Checkbox>
                        </Col>
                        <Col span={12}>
                          <Checkbox value="ccToMe">
                            自分にもCCで送信
                          </Checkbox>
                        </Col>
                        <Col span={12}>
                          <Checkbox value="trackOpen">
                            開封確認を有効化
                          </Checkbox>
                        </Col>
                        <Col span={12}>
                          <Checkbox value="followUp">
                            自動フォローアップを設定
                          </Checkbox>
                        </Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        );

      case 3:
        return (
          <div>
            <Result
              status="info"
              title="送信内容の確認"
              subTitle="以下の内容でアプローチを送信します"
            />

            <Card title="送信概要" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">選択エンジニア数:</Text>
                  <br />
                  <Text strong>{selectedEngineers.length}名</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">送信先企業数:</Text>
                  <br />
                  <Text strong>{selectedCompanies.length}社</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">送信タイミング:</Text>
                  <br />
                  <Text strong>
                    {sendSchedule === 'now' ? '即時送信' : '予約送信'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">添付ファイル数:</Text>
                  <br />
                  <Text strong>{attachments.length}件</Text>
                </Col>
              </Row>
            </Card>

            <Card title="選択したエンジニア" className="mb-4">
              <Space wrap>
                {engineers
                  .filter(e => selectedEngineers.includes(e.id))
                  .map(engineer => (
                    <Tag key={engineer.id} icon={<UserAddOutlined />}>
                      {engineer.name}
                    </Tag>
                  ))}
              </Space>
            </Card>

            <Card title="送信先企業" className="mb-4">
              <Space wrap>
                {companies
                  .filter(c => selectedCompanies.includes(c.id))
                  .map(company => (
                    <Tag key={company.id} icon={<BankOutlined />}>
                      {company.name}
                    </Tag>
                  ))}
              </Space>
            </Card>

            <Card title="メッセージプレビュー">
              <div className="p-4 bg-gray-50 rounded">
                <Text strong>件名: </Text>
                <Text>{form.getFieldValue('subject') || '（未入力）'}</Text>
                <Divider />
                <Paragraph>
                  {form.getFieldValue('content') || '（メッセージ未入力）'}
                </Paragraph>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // 送信処理
  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      // TODO: 実際のアプローチ送信処理を実装
      
      message.success('アプローチを送信しました');
      
      // リセット
      form.resetFields();
      setSelectedEngineers([]);
      setSelectedCompanies([]);
      setCurrentStep(0);
    } catch (error) {
      message.error('送信に失敗しました');
    }
  };

  // 下書き保存
  const handleSaveDraft = () => {
    const values = form.getFieldsValue();
    // TODO: 実際の下書き保存処理を実装
    message.success('下書きを保存しました');
  };

  const steps = [
    {
      title: 'エンジニア選択',
      icon: <TeamOutlined />,
    },
    {
      title: '送信先選択',
      icon: <BankOutlined />,
    },
    {
      title: 'メッセージ作成',
      icon: <EditOutlined />,
    },
    {
      title: '確認・送信',
      icon: <SendOutlined />,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={2}>アプローチ作成</Title>
        <Paragraph type="secondary">
          エンジニアを選択し、取引先企業へアプローチメールを送信します
        </Paragraph>
      </div>

      <Card>
        <Steps current={currentStep} className="mb-8">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              icon={step.icon}
            />
          ))}
        </Steps>

        <div className="step-content">
          {getStepContent(currentStep)}
        </div>

        <Divider />

        <Row justify="space-between">
          <Col>
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                戻る
              </Button>
            )}
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
              >
                下書き保存
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={() => {
                    if (currentStep === 0 && selectedEngineers.length === 0) {
                      message.warning('エンジニアを選択してください');
                      return;
                    }
                    if (currentStep === 1 && selectedCompanies.length === 0) {
                      message.warning('送信先企業を選択してください');
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                >
                  次へ
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                >
                  送信
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* テンプレート管理モーダル */}
      <Modal
        title="テンプレート管理"
        open={isTemplateModalVisible}
        onCancel={() => setIsTemplateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="テンプレート一覧" key="1">
            <Space direction="vertical" style={{ width: '100%' }}>
              {approachTemplates.map(template => (
                <Card
                  key={template.id}
                  size="small"
                  title={template.name}
                  extra={
                    <Space>
                      <Button size="small" icon={<EditOutlined />}>
                        編集
                      </Button>
                      <Button size="small" icon={<CopyOutlined />}>
                        複製
                      </Button>
                      <Button size="small" danger icon={<DeleteOutlined />}>
                        削除
                      </Button>
                    </Space>
                  }
                >
                  <Text type="secondary">カテゴリ: {template.category}</Text>
                  <br />
                  <Text strong>件名: {template.subject}</Text>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {template.content}
                  </Paragraph>
                </Card>
              ))}
            </Space>
          </Tabs.TabPane>
          <Tabs.TabPane tab="新規作成" key="2">
            <Form layout="vertical">
              <Form.Item label="テンプレート名" required>
                <Input placeholder="例：初回提案テンプレート" />
              </Form.Item>
              <Form.Item label="カテゴリ">
                <Select placeholder="カテゴリを選択">
                  <Option value="new">新規提案</Option>
                  <Option value="follow">フォローアップ</Option>
                  <Option value="multiple">複数提案</Option>
                </Select>
              </Form.Item>
              <Form.Item label="件名" required>
                <Input placeholder="メールの件名" />
              </Form.Item>
              <Form.Item label="本文" required>
                <TextArea rows={8} placeholder="メール本文のテンプレート" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>
                  テンプレート保存
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default ApproachCreate;