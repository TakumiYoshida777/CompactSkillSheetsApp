import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Upload,
  Space,
  Typography,
  Divider,
  Alert,
  Tag,
  Steps,
  message,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface SkillItem {
  name: string;
  level: number;
  experience: number;
}

const EngineerRegister: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(false);

  // スキルレベルの選択肢
  const skillLevels = [
    { value: 1, label: '初級' },
    { value: 2, label: '中級' },
    { value: 3, label: '上級' },
    { value: 4, label: 'エキスパート' },
    { value: 5, label: 'マスター' },
  ];

  // 契約形態の選択肢
  const contractTypes = [
    '正社員',
    '契約社員',
    'フリーランス',
    '業務委託',
    'SES契約',
  ];

  // 稼働可能な作業場所
  const workLocations = [
    'リモート可',
    'オンサイト',
    'ハイブリッド',
    '要相談',
  ];

  // フォームのステップ
  const steps = [
    {
      title: '基本情報',
      description: '氏名・連絡先',
    },
    {
      title: '経歴情報',
      description: '経験・スキル',
    },
    {
      title: '契約情報',
      description: '単価・稼働条件',
    },
    {
      title: '確認',
      description: '登録内容確認',
    },
  ];

  // スキル追加
  const handleAddSkill = () => {
    const newSkill: SkillItem = {
      name: '',
      level: 3,
      experience: 1,
    };
    setSkills([...skills, newSkill]);
  };

  // スキル削除
  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  // スキル更新
  const handleSkillChange = (index: number, field: keyof SkillItem, value: any) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  // ファイルアップロード設定
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} アップロード完了`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} アップロード失敗`);
      }
    },
  };

  // フォーム送信
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // APIコール（仮）
      console.log('Form values:', values);
      console.log('Skills:', skills);
      
      message.success('エンジニア情報を登録しました');
      navigate('/engineers/list');
    } catch (error) {
      message.error('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ステップごとのコンテンツ
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title level={4}>基本情報</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="姓"
                  rules={[{ required: true, message: '姓を入力してください' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="田中" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label="名"
                  rules={[{ required: true, message: '名を入力してください' }]}
                >
                  <Input placeholder="太郎" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastNameKana"
                  label="姓（カナ）"
                  rules={[{ required: true, message: '姓（カナ）を入力してください' }]}
                >
                  <Input placeholder="タナカ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstNameKana"
                  label="名（カナ）"
                  rules={[{ required: true, message: '名（カナ）を入力してください' }]}
                >
                  <Input placeholder="タロウ" />
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
                  <Input prefix={<MailOutlined />} placeholder="tanaka@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="電話番号"
                  rules={[{ required: true, message: '電話番号を入力してください' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="090-1234-5678" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="birthDate"
                  label="生年月日"
                  rules={[{ required: true, message: '生年月日を選択してください' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="生年月日を選択"
                    format="YYYY/MM/DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gender"
                  label="性別"
                  rules={[{ required: true, message: '性別を選択してください' }]}
                >
                  <Select placeholder="性別を選択">
                    <Option value="male">男性</Option>
                    <Option value="female">女性</Option>
                    <Option value="other">その他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="住所"
                  rules={[{ required: true, message: '住所を入力してください' }]}
                >
                  <Input prefix={<HomeOutlined />} placeholder="東京都港区..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nearestStation"
                  label="最寄駅"
                  rules={[{ required: true, message: '最寄駅を入力してください' }]}
                >
                  <Input placeholder="品川駅" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="education"
                  label="最終学歴"
                >
                  <Input placeholder="○○大学 情報工学部卒" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      
      case 1:
        return (
          <div>
            <Title level={4}>経歴・スキル情報</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="totalExperience"
                  label="総経験年数"
                  rules={[{ required: true, message: '経験年数を入力してください' }]}
                >
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: '100%' }}
                    placeholder="5"
                    suffix="年"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="joinDate"
                  label="入社日"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="入社日を選択"
                    format="YYYY/MM/DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="selfPR"
                  label="自己PR"
                  rules={[{ required: true, message: '自己PRを入力してください' }]}
                >
                  <TextArea
                    rows={4}
                    maxLength={2000}
                    showCount
                    placeholder="これまでの経験や強みについて記載してください"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={5}>技術スキル</Title>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddSkill}
                >
                  スキル追加
                </Button>
              </div>
              
              {skills.length === 0 ? (
                <Alert
                  message="スキルが登録されていません"
                  description="「スキル追加」ボタンからスキルを追加してください"
                  type="info"
                  showIcon
                />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {skills.map((skill, index) => (
                    <Card key={index} size="small">
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8}>
                          <Input
                            placeholder="スキル名（例: JavaScript）"
                            value={skill.name}
                            onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col xs={24} sm={6}>
                          <Select
                            style={{ width: '100%' }}
                            placeholder="レベル"
                            value={skill.level}
                            onChange={(value) => handleSkillChange(index, 'level', value)}
                          >
                            {skillLevels.map((level) => (
                              <Option key={level.value} value={level.value}>
                                {level.label}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col xs={24} sm={6}>
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={50}
                            placeholder="経験年数"
                            value={skill.experience}
                            onChange={(value) => handleSkillChange(index, 'experience', value)}
                            suffix="年"
                          />
                        </Col>
                        <Col xs={24} sm={4}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveSkill(index)}
                          >
                            削除
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              )}
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="availableRoles"
                  label="対応可能ロール"
                >
                  <Select
                    mode="multiple"
                    placeholder="対応可能なロールを選択"
                    style={{ width: '100%' }}
                  >
                    <Option value="pg">プログラマー (PG)</Option>
                    <Option value="se">システムエンジニア (SE)</Option>
                    <Option value="pl">プロジェクトリーダー (PL)</Option>
                    <Option value="pm">プロジェクトマネージャー (PM)</Option>
                    <Option value="consultant">コンサルタント</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="availablePhases"
                  label="対応可能フェーズ"
                >
                  <Select
                    mode="multiple"
                    placeholder="対応可能なフェーズを選択"
                    style={{ width: '100%' }}
                  >
                    <Option value="requirement">要件定義</Option>
                    <Option value="basic_design">基本設計</Option>
                    <Option value="detailed_design">詳細設計</Option>
                    <Option value="implementation">実装・開発</Option>
                    <Option value="test">テスト</Option>
                    <Option value="release">リリース</Option>
                    <Option value="maintenance">保守・運用</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      
      case 2:
        return (
          <div>
            <Title level={4}>契約・稼働情報</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contractType"
                  label="契約形態"
                  rules={[{ required: true, message: '契約形態を選択してください' }]}
                >
                  <Select placeholder="契約形態を選択">
                    {contractTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="unitPrice"
                  label="希望単価"
                  rules={[{ required: true, message: '希望単価を入力してください' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={2000000}
                    step={10000}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\¥\s?|(,*)/g, '')}
                    placeholder="650000"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="workLocation"
                  label="勤務地"
                  rules={[{ required: true, message: '勤務地を選択してください' }]}
                >
                  <Select placeholder="勤務地を選択">
                    {workLocations.map((location) => (
                      <Option key={location} value={location}>
                        {location}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="workTime"
                  label="稼働時間"
                  rules={[{ required: true, message: '稼働時間を入力してください' }]}
                >
                  <Input placeholder="140-180h" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="availableDate"
                  label="稼働可能日"
                  rules={[{ required: true, message: '稼働可能日を選択してください' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="稼働可能日を選択"
                    format="YYYY/MM/DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="現在の状態"
                  rules={[{ required: true, message: '状態を選択してください' }]}
                >
                  <Select placeholder="状態を選択">
                    <Option value="available">稼働可能</Option>
                    <Option value="assigned">アサイン中</Option>
                    <Option value="waiting">待機中</Option>
                    <Option value="leave">休職中</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>関連書類アップロード</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="resume"
                  label="履歴書"
                >
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>履歴書をアップロード</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="skillSheet"
                  label="スキルシート"
                >
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>スキルシートをアップロード</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="notes"
                  label="備考"
                >
                  <TextArea
                    rows={3}
                    placeholder="その他特記事項があれば記載してください"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="isPublic"
                  label="公開設定"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="公開" unCheckedChildren="非公開" />
                  <Text type="secondary" className="ml-2">
                    取引先企業への情報公開
                  </Text>
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      
      case 3:
        return (
          <div>
            <Title level={4}>登録内容確認</Title>
            <Alert
              message="以下の内容で登録します"
              description="内容に誤りがないか確認してください。修正が必要な場合は「戻る」ボタンで前のステップに戻ってください。"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Card title="基本情報" className="mb-4">
              <Descriptions column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="氏名">
                  {form.getFieldValue('lastName')} {form.getFieldValue('firstName')}
                </Descriptions.Item>
                <Descriptions.Item label="フリガナ">
                  {form.getFieldValue('lastNameKana')} {form.getFieldValue('firstNameKana')}
                </Descriptions.Item>
                <Descriptions.Item label="メールアドレス">
                  {form.getFieldValue('email')}
                </Descriptions.Item>
                <Descriptions.Item label="電話番号">
                  {form.getFieldValue('phone')}
                </Descriptions.Item>
                <Descriptions.Item label="生年月日">
                  {form.getFieldValue('birthDate')?.format('YYYY/MM/DD')}
                </Descriptions.Item>
                <Descriptions.Item label="性別">
                  {form.getFieldValue('gender') === 'male' ? '男性' : 
                   form.getFieldValue('gender') === 'female' ? '女性' : 'その他'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="経歴・スキル" className="mb-4">
              <Descriptions column={1}>
                <Descriptions.Item label="総経験年数">
                  {form.getFieldValue('totalExperience')}年
                </Descriptions.Item>
                <Descriptions.Item label="自己PR">
                  {form.getFieldValue('selfPR')}
                </Descriptions.Item>
              </Descriptions>
              {skills.length > 0 && (
                <div className="mt-4">
                  <Text strong>技術スキル：</Text>
                  <div className="mt-2">
                    {skills.map((skill, index) => (
                      <Tag key={index} color="blue">
                        {skill.name} (Lv.{skill.level}, {skill.experience}年)
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card title="契約・稼働情報">
              <Descriptions column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="契約形態">
                  {form.getFieldValue('contractType')}
                </Descriptions.Item>
                <Descriptions.Item label="希望単価">
                  ¥{form.getFieldValue('unitPrice')?.toLocaleString()}/月
                </Descriptions.Item>
                <Descriptions.Item label="勤務地">
                  {form.getFieldValue('workLocation')}
                </Descriptions.Item>
                <Descriptions.Item label="稼働時間">
                  {form.getFieldValue('workTime')}
                </Descriptions.Item>
                <Descriptions.Item label="稼働可能日">
                  {form.getFieldValue('availableDate')?.format('YYYY/MM/DD')}
                </Descriptions.Item>
                <Descriptions.Item label="現在の状態">
                  {form.getFieldValue('status')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Descriptionsコンポーネントのインポート追加
  const { Descriptions } = Typography;

  return (
    <div>
      <div className="mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/engineers/list')}
        >
          戻る
        </Button>
      </div>

      <Card>
        <Title level={2}>
          <UserOutlined className="mr-2" />
          エンジニア新規登録
        </Title>
        
        <Steps
          current={currentStep}
          items={steps}
          className="mb-8"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
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
                  戻る
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button
                  size="large"
                  onClick={() => {
                    form.resetFields();
                    setSkills([]);
                    setCurrentStep(0);
                  }}
                >
                  リセット
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      form
                        .validateFields()
                        .then(() => {
                          setCurrentStep(currentStep + 1);
                        })
                        .catch((info) => {
                          console.log('Validate Failed:', info);
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
                    htmlType="submit"
                    loading={loading}
                  >
                    登録する
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EngineerRegister;