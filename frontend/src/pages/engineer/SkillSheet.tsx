import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Rate,
  InputNumber,
  DatePicker,
  Checkbox,
  Space,
  Typography,
  Divider,
  Alert,
  Progress,
  Tabs,
  Tag,
  Upload,
  message,
  Modal,
  AutoComplete,
  Collapse,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSkillSheetStore } from '../../stores/skillSheetStore';
import dayjs from 'dayjs';
import './SkillSheet.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface Skill {
  id: string;
  name: string;
  level: number;
  years: number;
  lastUsed?: string;
}

interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  teamSize: number;
  responsibilities: string[];
}

const SkillSheetEdit: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { skillSheet, saveSkillSheet } = useSkillSheetStore();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);
  const [skills] = useState<Skill[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  // 自動保存
  useEffect(() => {
    const timer = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30秒ごと

    return () => clearInterval(timer);
  }, []);

  // 完成度計算
  useEffect(() => {
    calculateCompletion();
  }, [form]);

  const calculateCompletion = () => {
    const values = form.getFieldsValue();
    let completed = 0;
    let total = 0;

    // 基本情報
    const basicFields = ['summary', 'totalExperience', 'education'];
    basicFields.forEach(field => {
      total++;
      if (values[field]) completed++;
    });

    // スキル
    if (skills.length > 0) completed += 2;
    total += 2;

    // その他のフィールド
    const rate = Math.round((completed / total) * 100);
    setCompletionRate(rate);
  };

  const handleAutoSave = async () => {
    setAutoSaving(true);
    const values = form.getFieldsValue();
    try {
      await saveSkillSheet(values);
      message.success('自動保存しました', 1);
    } catch (error) {
      console.error('Auto save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await saveSkillSheet(values);
      message.success('スキルシートを保存しました');
    } catch (error) {
      message.error('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const handleExport = () => {
    message.info('PDF出力機能は準備中です');
  };

  // プログラミング言語の候補
  const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
    'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
  ];

  // フレームワークの候補
  const frameworks = [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Express', 'Django',
    'Flask', 'Spring Boot', '.NET Core', 'Ruby on Rails', 'Laravel'
  ];

  // データベースの候補
  const databases = [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
    'DynamoDB', 'Cassandra', 'Elasticsearch', 'Neo4j'
  ];

  // クラウドサービスの候補
  const cloudServices = [
    'AWS', 'Azure', 'Google Cloud', 'Heroku', 'Vercel', 'Netlify',
    'Firebase', 'Supabase', 'DigitalOcean'
  ];

  const renderBasicInfo = () => (
    <Card title="基本情報" className="skill-sheet-card">
      <Form.Item
        label="自己PR・概要"
        name="summary"
        rules={[{ required: true, message: '自己PRを入力してください' }]}
      >
        <TextArea
          rows={6}
          placeholder="あなたの強み、経験、キャリア目標などを記入してください"
          maxLength={2000}
          showCount
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="総経験年数"
            name="totalExperience"
            rules={[{ required: true, message: '経験年数を入力してください' }]}
          >
            <InputNumber
              min={0}
              max={50}
              style={{ width: '100%' }}
              suffix="年"
              placeholder="例: 5"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="最終学歴"
            name="education"
          >
            <Select placeholder="選択してください">
              <Option value="high_school">高等学校卒業</Option>
              <Option value="vocational">専門学校卒業</Option>
              <Option value="junior_college">短期大学卒業</Option>
              <Option value="bachelor">大学卒業</Option>
              <Option value="master">大学院修士課程修了</Option>
              <Option value="doctor">大学院博士課程修了</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="保有資格"
        name="certifications"
      >
        <Select
          mode="tags"
          placeholder="資格名を入力してください（複数可）"
          style={{ width: '100%' }}
        >
          <Option value="基本情報技術者">基本情報技術者</Option>
          <Option value="応用情報技術者">応用情報技術者</Option>
          <Option value="AWS認定">AWS認定</Option>
          <Option value="PMP">PMP</Option>
        </Select>
      </Form.Item>
    </Card>
  );

  const renderSkills = () => (
    <Card title="技術スキル" className="skill-sheet-card">
      <Collapse defaultActiveKey={['programming', 'frameworks']}>
        <Panel header="プログラミング言語" key="programming">
          <Form.List name="programmingLanguages">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} align="middle" className="skill-row">
                    <Col xs={24} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '言語名を入力' }]}
                      >
                        <AutoComplete
                          options={programmingLanguages.map(lang => ({ value: lang }))}
                          placeholder="言語名"
                          filterOption={(inputValue, option) =>
                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'level']}
                        label="レベル"
                      >
                        <Rate />
                      </Form.Item>
                    </Col>
                    <Col xs={10} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'years']}
                        label="経験年数"
                      >
                        <InputNumber min={0} max={30} suffix="年" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={2} sm={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    プログラミング言語を追加
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Panel>

        <Panel header="フレームワーク・ライブラリ" key="frameworks">
          <Form.List name="frameworks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} align="middle" className="skill-row">
                    <Col xs={24} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'フレームワーク名を入力' }]}
                      >
                        <AutoComplete
                          options={frameworks.map(fw => ({ value: fw }))}
                          placeholder="フレームワーク名"
                          filterOption={(inputValue, option) =>
                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'level']}
                        label="レベル"
                      >
                        <Rate />
                      </Form.Item>
                    </Col>
                    <Col xs={10} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'years']}
                        label="経験年数"
                      >
                        <InputNumber min={0} max={30} suffix="年" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={2} sm={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    フレームワークを追加
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Panel>

        <Panel header="データベース" key="databases">
          <Form.List name="databases">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} align="middle" className="skill-row">
                    <Col xs={24} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'データベース名を入力' }]}
                      >
                        <AutoComplete
                          options={databases.map(db => ({ value: db }))}
                          placeholder="データベース名"
                          filterOption={(inputValue, option) =>
                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'level']}
                        label="レベル"
                      >
                        <Rate />
                      </Form.Item>
                    </Col>
                    <Col xs={10} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'years']}
                        label="経験年数"
                      >
                        <InputNumber min={0} max={30} suffix="年" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={2} sm={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    データベースを追加
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Panel>

        <Panel header="クラウドサービス" key="cloud">
          <Form.List name="cloudServices">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} align="middle" className="skill-row">
                    <Col xs={24} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'クラウドサービス名を入力' }]}
                      >
                        <AutoComplete
                          options={cloudServices.map(cs => ({ value: cs }))}
                          placeholder="クラウドサービス名"
                          filterOption={(inputValue, option) =>
                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'level']}
                        label="レベル"
                      >
                        <Rate />
                      </Form.Item>
                    </Col>
                    <Col xs={10} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'years']}
                        label="経験年数"
                      >
                        <InputNumber min={0} max={30} suffix="年" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={2} sm={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    クラウドサービスを追加
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Panel>
      </Collapse>
    </Card>
  );

  const renderRolesAndPhases = () => (
    <Card title="対応可能ロール・フェーズ" className="skill-sheet-card">
      <Form.Item
        label="対応可能ロール"
        name="possibleRoles"
      >
        <Checkbox.Group style={{ width: '100%' }}>
          <Row>
            <Col span={12}>
              <Checkbox value="PG">プログラマー（PG）</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="SE">システムエンジニア（SE）</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="PL">プロジェクトリーダー（PL）</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="PM">プロジェクトマネージャー（PM）</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="EM">エンジニアリングマネージャー（EM）</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="TL">テックリード（TL）</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </Form.Item>

      <Divider />

      <Form.Item
        label="対応可能フェーズ"
        name="possiblePhases"
      >
        <Checkbox.Group style={{ width: '100%' }}>
          <Row>
            <Col span={12}>
              <Checkbox value="requirement">要件定義</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="basic_design">基本設計</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="detailed_design">詳細設計</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="development">開発・実装</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="testing">テスト</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="deployment">リリース・デプロイ</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="maintenance">保守・運用</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="support">サポート</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </Form.Item>
    </Card>
  );

  return (
    <div className="skill-sheet-edit">
      <div className="skill-sheet-header">
        <div>
          <Title level={2}>スキルシート編集</Title>
          <Space>
            <Text type="secondary">
              最終更新: {dayjs().format('YYYY/MM/DD HH:mm')}
            </Text>
            {autoSaving && (
              <Tag icon={<SyncOutlined spin />} color="processing">
                自動保存中...
              </Tag>
            )}
          </Space>
        </div>
        <Space>
          <Button icon={<EyeOutlined />} onClick={handlePreview}>
            プレビュー
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            PDF出力
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Form
            form={form}
            layout="vertical"
            initialValues={skillSheet || {}}
            onValuesChange={() => calculateCompletion()}
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="基本情報" key="basic">
                {renderBasicInfo()}
              </TabPane>
              <TabPane tab="技術スキル" key="skills">
                {renderSkills()}
              </TabPane>
              <TabPane tab="ロール・フェーズ" key="roles">
                {renderRolesAndPhases()}
              </TabPane>
            </Tabs>
          </Form>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="入力進捗" className="progress-card">
            <Progress
              type="circle"
              percent={completionRate}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Paragraph style={{ marginTop: 16 }}>
              {completionRate < 50 && (
                <Alert
                  message="入力を進めてください"
                  description="スキルシートの完成度が低いです"
                  type="warning"
                  showIcon
                />
              )}
              {completionRate >= 50 && completionRate < 80 && (
                <Alert
                  message="もう少しです"
                  description="あと少しで完成です"
                  type="info"
                  showIcon
                />
              )}
              {completionRate >= 80 && (
                <Alert
                  message="完成間近"
                  description="スキルシートがほぼ完成しています"
                  type="success"
                  showIcon
                />
              )}
            </Paragraph>
          </Card>

          <Card title="入力のヒント" style={{ marginTop: 16 }}>
            <Space direction="vertical" size="small">
              <Text>
                <InfoCircleOutlined /> 具体的な数値や実績を含めると評価が高まります
              </Text>
              <Text>
                <InfoCircleOutlined /> 最新の技術スキルを追加しましょう
              </Text>
              <Text>
                <InfoCircleOutlined /> プロジェクト経験は詳細に記載しましょう
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* プレビューモーダル */}
      <Modal
        title="スキルシートプレビュー"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div className="skill-sheet-preview">
          {/* プレビューコンテンツ */}
          <Title level={3}>スキルシートプレビュー</Title>
          <Paragraph>プレビュー機能は準備中です</Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default SkillSheetEdit;