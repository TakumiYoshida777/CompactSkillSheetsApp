import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Form,
  Slider,
  Checkbox,
  DatePicker,
  Table,
  Avatar,
  Typography,
  Drawer,
  Divider,
  message,
  Tabs,
  Badge,
  Rate,
  Tooltip,
  Empty,
  Spin,
  Alert,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SaveOutlined,
  ReloadOutlined,
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  StarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { CheckableTag } = Tag;

interface EngineerSearchResult {
  id: string;
  name: string;
  age: number;
  experience: number;
  skills: string[];
  frameworks: string[];
  databases: string[];
  industries: string[];
  phases: string[];
  roles: string[];
  unitPrice: number;
  availableDate: string;
  status: 'available' | 'working' | 'upcoming';
  matchScore: number;
  lastProject?: string;
  location?: string;
  education?: string;
  certifications?: string[];
  englishLevel?: string;
  preferredContract?: string;
  remoteWork?: boolean;
}

const EngineerSearch: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<EngineerSearchResult[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerSearchResult | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // スキルタグリスト
  const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 
    'Kotlin', 'Swift', 'Rust', 'Scala', 'C++', 'C', 'Perl', 'R'
  ];
  
  const frameworks = [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Express', 'Django',
    'Spring Boot', 'Laravel', 'Ruby on Rails', '.NET', 'Flutter', 'React Native'
  ];
  
  const databases = [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
    'DynamoDB', 'Cassandra', 'Elasticsearch', 'Firebase', 'SQLite'
  ];

  const industries = [
    '金融', '製造', '小売', '物流', '医療', 'IT', '通信', '不動産', 
    '教育', 'エンターテイメント', '公共', '建設', '農業', 'エネルギー'
  ];

  const phases = [
    '要件定義', '基本設計', '詳細設計', '実装', 'テスト', 'リリース', '保守・運用'
  ];

  const roles = [
    'PG', 'SE', 'PL', 'PM', 'PMO', 'コンサルタント', 'アーキテクト', 
    'テックリード', 'スクラムマスター'
  ];

  // モックデータの生成
  useEffect(() => {
    generateMockResults();
  }, []);

  const generateMockResults = () => {
    const mockData: EngineerSearchResult[] = [
      {
        id: '1',
        name: '田中 太郎',
        age: 32,
        experience: 8,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        frameworks: ['React', 'Next.js', 'Express'],
        databases: ['PostgreSQL', 'MongoDB', 'Redis'],
        industries: ['金融', 'IT'],
        phases: ['要件定義', '基本設計', '詳細設計', '実装'],
        roles: ['SE', 'PL'],
        unitPrice: 650000,
        availableDate: '2024-02-01',
        status: 'available',
        matchScore: 95,
        lastProject: 'ECサイトリニューアル',
        location: '東京',
        education: '情報工学部卒',
        certifications: ['AWS認定ソリューションアーキテクト'],
        englishLevel: 'ビジネスレベル',
        preferredContract: '準委任',
        remoteWork: true,
      },
      {
        id: '2',
        name: '佐藤 花子',
        age: 28,
        experience: 5,
        skills: ['Python', 'Django', 'JavaScript', 'Vue.js'],
        frameworks: ['Django', 'Vue.js', 'Flask'],
        databases: ['MySQL', 'PostgreSQL'],
        industries: ['医療', '教育'],
        phases: ['実装', 'テスト'],
        roles: ['PG', 'SE'],
        unitPrice: 550000,
        availableDate: '2024-03-01',
        status: 'upcoming',
        matchScore: 88,
        lastProject: '医療系Webアプリ開発',
        location: '大阪',
        education: 'コンピュータサイエンス専攻',
        englishLevel: '日常会話レベル',
        preferredContract: '派遣',
        remoteWork: false,
      },
      {
        id: '3',
        name: '鈴木 一郎',
        age: 35,
        experience: 12,
        skills: ['Java', 'Spring Boot', 'Kotlin', 'AWS'],
        frameworks: ['Spring Boot', 'Spring Cloud'],
        databases: ['Oracle', 'SQL Server', 'DynamoDB'],
        industries: ['金融', '製造'],
        phases: ['要件定義', '基本設計', '詳細設計', '実装', 'テスト'],
        roles: ['PL', 'PM'],
        unitPrice: 750000,
        availableDate: '2024-04-01',
        status: 'working',
        matchScore: 92,
        lastProject: '銀行システム基盤構築',
        location: '東京',
        education: '工学修士',
        certifications: ['PMP', 'AWS認定プロフェッショナル'],
        englishLevel: 'ビジネスレベル',
        preferredContract: '準委任',
        remoteWork: true,
      },
    ];
    setSearchResults(mockData);
  };

  const handleSearch = async (values: any) => {
    setLoading(true);
    try {
      // API呼び出しのシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 検索結果の更新
      generateMockResults();
      message.success('検索が完了しました');
    } catch (error) {
      message.error('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    setSelectedTags(nextSelectedTags);
  };

  const handleSaveSearch = () => {
    const searchConditions = form.getFieldsValue();
    const newSearch = {
      id: Date.now().toString(),
      name: `検索条件 ${savedSearches.length + 1}`,
      conditions: searchConditions,
      createdAt: new Date().toISOString(),
    };
    setSavedSearches([...savedSearches, newSearch]);
    message.success('検索条件を保存しました');
  };

  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [approachModalVisible, setApproachModalVisible] = useState(false);
  const [selectedEngineersForApproach, setSelectedEngineersForApproach] = useState<EngineerSearchResult[]>([]);

  // 取引先リスト（モック）
  const businessPartners = [
    { id: '1', name: '株式会社ABC商事', email: 'contact@abc.com' },
    { id: '2', name: 'XYZ株式会社', email: 'hr@xyz.co.jp' },
    { id: '3', name: 'テックコーポレーション', email: 'recruit@tech-corp.jp' },
    { id: '4', name: 'グローバルシステムズ', email: 'staffing@global-sys.com' },
  ];

  const handleApproach = (engineers: EngineerSearchResult[]) => {
    setSelectedEngineersForApproach(engineers);
    setApproachModalVisible(true);
  };

  const sendApproach = () => {
    if (!selectedPartner) {
      message.error('取引先を選択してください');
      return;
    }
    
    const partner = businessPartners.find(p => p.id === selectedPartner);
    Modal.confirm({
      title: '取引先へのアプローチ送信確認',
      content: (
        <div>
          <p>以下の内容でアプローチメールを送信します：</p>
          <p><strong>送信先:</strong> {partner?.name} ({partner?.email})</p>
          <p><strong>提案エンジニア数:</strong> {selectedEngineersForApproach.length}名</p>
          <p>エンジニアのスキルシート概要を添付して送信します。</p>
        </div>
      ),
      onOk: () => {
        message.success(`${partner?.name}へアプローチメールを送信しました`);
        setApproachModalVisible(false);
        setSelectedPartner('');
        setSelectedEngineersForApproach([]);
      },
    });
  };

  const columns: ColumnsType<EngineerSearchResult> = [
    {
      title: 'マッチ度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 100,
      sorter: (a, b) => a.matchScore - b.matchScore,
      render: (score: number) => (
        <div style={{ textAlign: 'center' }}>
          <Rate disabled value={score / 20} style={{ fontSize: 14 }} />
          <div style={{ fontSize: 12, color: '#666' }}>{score}%</div>
        </div>
      ),
    },
    {
      title: 'エンジニア',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: EngineerSearchResult) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.age}歳 / 経験{record.experience}年
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      width: 300,
      render: (skills: string[]) => (
        <Space wrap>
          {skills.slice(0, 5).map(skill => (
            <Tag key={skill} color="blue">{skill}</Tag>
          ))}
          {skills.length > 5 && <Tag>+{skills.length - 5}</Tag>}
        </Space>
      ),
    },
    {
      title: '単価',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price: number) => (
        <Text strong>¥{price.toLocaleString()}</Text>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '即日可能', value: 'available' },
        { text: '稼働中', value: 'working' },
        { text: '予定あり', value: 'upcoming' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string, record: EngineerSearchResult) => {
        const config = {
          available: { color: 'success', text: '即日可能' },
          working: { color: 'processing', text: '稼働中' },
          upcoming: { color: 'warning', text: record.availableDate },
        };
        return (
          <Badge 
            status={config[status as keyof typeof config].color as any}
            text={config[status as keyof typeof config].text}
          />
        );
      },
    },
    {
      title: 'アクション',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            type="primary"
            onClick={() => {
              setSelectedEngineer(record);
              setDetailModalVisible(true);
            }}
          >
            詳細
          </Button>
          <Button 
            size="small"
            icon={<MailOutlined />}
            onClick={() => handleApproach([record])}
          >
            提案
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: EngineerSearchResult[]) => {
      console.log('Selected:', selectedRowKeys, selectedRows);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* 検索条件カード */}
        <Col span={24}>
          <Card>
            <Title level={4}>
              <SearchOutlined /> エンジニア検索
            </Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
            >
              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item name="keyword" label="キーワード検索">
                    <Search
                      placeholder="スキル、フレームワーク、プロジェクト名などを入力"
                      size="large"
                      enterButton={<SearchOutlined />}
                      onSearch={() => form.submit()}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="　">
                    <Space>
                      <Button
                        icon={<FilterOutlined />}
                        onClick={() => setFilterDrawerVisible(true)}
                      >
                        詳細条件
                      </Button>
                      <Button
                        icon={<SaveOutlined />}
                        onClick={handleSaveSearch}
                      >
                        条件保存
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          form.resetFields();
                          setSelectedTags([]);
                        }}
                      >
                        リセット
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              {/* クイックフィルター */}
              <Divider orientation="left">スキルタグ</Divider>
              <div style={{ marginBottom: 16 }}>
                <Space wrap>
                  {programmingLanguages.slice(0, 10).map(tag => (
                    <CheckableTag
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onChange={checked => handleTagChange(tag, checked)}
                    >
                      {tag}
                    </CheckableTag>
                  ))}
                  <Button type="link" onClick={() => setFilterDrawerVisible(true)}>
                    もっと見る...
                  </Button>
                </Space>
              </div>

              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Form.Item name="experienceRange" label="経験年数">
                    <Slider
                      range
                      marks={{
                        0: '0年',
                        5: '5年',
                        10: '10年',
                        20: '20年',
                      }}
                      max={20}
                      defaultValue={[3, 10]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="priceRange" label="単価範囲">
                    <Slider
                      range
                      marks={{
                        30: '30万',
                        50: '50万',
                        70: '70万',
                        100: '100万',
                      }}
                      min={30}
                      max={100}
                      defaultValue={[50, 80]}
                      tipFormatter={value => `${value}万円`}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="availableDate" label="稼働可能日">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="location" label="勤務地">
                    <Select placeholder="選択してください" allowClear>
                      <Option value="tokyo">東京</Option>
                      <Option value="osaka">大阪</Option>
                      <Option value="nagoya">名古屋</Option>
                      <Option value="fukuoka">福岡</Option>
                      <Option value="remote">リモート可</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* 検索結果 */}
        <Col span={24}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Title level={5} style={{ margin: 0 }}>
                      検索結果
                    </Title>
                    <Badge count={searchResults.length} showZero />
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button icon={<ExportOutlined />}>
                      CSV出力
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<MailOutlined />}
                      disabled={!searchResults.length}
                      onClick={() => {
                        const selectedRows = searchResults; // 本来は選択された行のみ
                        handleApproach(selectedRows);
                      }}
                    >
                      取引先へ提案
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={searchResults}
              loading={loading}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `全 ${total} 件`,
              }}
            />
          </Card>
        </Col>

        {/* 保存した検索条件 */}
        <Col span={24}>
          <Card>
            <Title level={5}>
              <SaveOutlined /> 保存した検索条件
            </Title>
            {savedSearches.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {savedSearches.map(search => (
                  <Card 
                    key={search.id} 
                    size="small"
                    hoverable
                    onClick={() => form.setFieldsValue(search.conditions)}
                  >
                    <Row justify="space-between">
                      <Col>
                        <Text strong>{search.name}</Text>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          {new Date(search.createdAt).toLocaleDateString()}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty description="保存した検索条件はありません" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 詳細フィルター ドロワー */}
      <Drawer
        title="詳細検索条件"
        placement="right"
        width={600}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
      >
        <Form layout="vertical">
          <Divider orientation="left">技術スキル</Divider>
          
          <Form.Item label="プログラミング言語">
            <Checkbox.Group
              options={programmingLanguages}
              value={selectedTags.filter(tag => programmingLanguages.includes(tag))}
              onChange={values => {
                const otherTags = selectedTags.filter(tag => !programmingLanguages.includes(tag));
                setSelectedTags([...otherTags, ...values as string[]]);
              }}
            />
          </Form.Item>

          <Form.Item label="フレームワーク">
            <Checkbox.Group
              options={frameworks}
              value={selectedTags.filter(tag => frameworks.includes(tag))}
              onChange={values => {
                const otherTags = selectedTags.filter(tag => !frameworks.includes(tag));
                setSelectedTags([...otherTags, ...values as string[]]);
              }}
            />
          </Form.Item>

          <Form.Item label="データベース">
            <Checkbox.Group
              options={databases}
              value={selectedTags.filter(tag => databases.includes(tag))}
              onChange={values => {
                const otherTags = selectedTags.filter(tag => !databases.includes(tag));
                setSelectedTags([...otherTags, ...values as string[]]);
              }}
            />
          </Form.Item>

          <Divider orientation="left">業務経験</Divider>

          <Form.Item label="業界">
            <Checkbox.Group options={industries} />
          </Form.Item>

          <Form.Item label="対応可能フェーズ">
            <Checkbox.Group options={phases} />
          </Form.Item>

          <Form.Item label="対応可能ロール">
            <Checkbox.Group options={roles} />
          </Form.Item>

          <Divider orientation="left">その他条件</Divider>

          <Form.Item label="英語力">
            <Select placeholder="選択してください">
              <Option value="native">ネイティブレベル</Option>
              <Option value="business">ビジネスレベル</Option>
              <Option value="daily">日常会話レベル</Option>
              <Option value="basic">基礎レベル</Option>
            </Select>
          </Form.Item>

          <Form.Item label="契約形態">
            <Checkbox.Group
              options={['準委任', '派遣', '請負', '正社員登用あり']}
            />
          </Form.Item>

          <Form.Item>
            <Checkbox>リモート勤務可能</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={() => {
              setFilterDrawerVisible(false);
              form.submit();
            }}>
              検索実行
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 取引先へのアプローチモーダル */}
      <Modal
        title="取引先への提案"
        open={approachModalVisible}
        onCancel={() => {
          setApproachModalVisible(false);
          setSelectedPartner('');
        }}
        onOk={sendApproach}
        okText="送信"
        cancelText="キャンセル"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>提案するエンジニア:</Text>
            <div style={{ marginTop: 8 }}>
              {selectedEngineersForApproach.map(eng => (
                <Tag key={eng.id} color="blue">
                  {eng.name} ({eng.skills.slice(0, 2).join(', ')})
                </Tag>
              ))}
            </div>
          </div>
          
          <div>
            <Text strong>送信先の取引先企業を選択:</Text>
            <Select
              placeholder="取引先を選択してください"
              style={{ width: '100%', marginTop: 8 }}
              value={selectedPartner}
              onChange={setSelectedPartner}
            >
              {businessPartners.map(partner => (
                <Option key={partner.id} value={partner.id}>
                  {partner.name} ({partner.email})
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text strong>送信内容:</Text>
            <Card size="small" style={{ marginTop: 8 }}>
              <Paragraph>
                お世話になっております。<br />
                貴社のご要望に合致する可能性のあるエンジニアをご提案させていただきます。<br />
                <br />
                【提案エンジニア数】{selectedEngineersForApproach.length}名<br />
                【主要スキル】{selectedEngineersForApproach.map(e => e.skills[0]).join(', ')}<br />
                <br />
                詳細なスキルシートを添付いたしますので、ご確認ください。<br />
                ご興味がございましたら、お気軽にお問い合わせください。
              </Paragraph>
            </Card>
          </div>
        </Space>
      </Modal>

      {/* エンジニア詳細モーダル */}
      <Modal
        title="エンジニア詳細"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            閉じる
          </Button>,
          <Button 
            key="approach" 
            type="primary" 
            icon={<MailOutlined />}
            onClick={() => {
              if (selectedEngineer) {
                handleApproach([selectedEngineer]);
                setDetailModalVisible(false);
              }
            }}
          >
            取引先へ提案
          </Button>,
        ]}
      >
        {selectedEngineer && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Avatar size={64} icon={<UserOutlined />} />
                    <Title level={4}>{selectedEngineer.name}</Title>
                    <Text type="secondary">
                      {selectedEngineer.age}歳 / 経験{selectedEngineer.experience}年
                    </Text>
                    <Badge 
                      status={
                        selectedEngineer.status === 'available' ? 'success' :
                        selectedEngineer.status === 'working' ? 'processing' : 'warning'
                      }
                      text={
                        selectedEngineer.status === 'available' ? '即日可能' :
                        selectedEngineer.status === 'working' ? '稼働中' : 
                        `${selectedEngineer.availableDate}〜`
                      }
                    />
                  </Space>
                </Card>
              </Col>
              
              <Col span={16}>
                <Tabs
                  items={[
                    {
                      key: 'skills',
                      label: 'スキル',
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>プログラミング言語:</Text>
                            <div style={{ marginTop: 8 }}>
                              {selectedEngineer.skills.map(skill => (
                                <Tag key={skill} color="blue">{skill}</Tag>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Text strong>フレームワーク:</Text>
                            <div style={{ marginTop: 8 }}>
                              {selectedEngineer.frameworks.map(fw => (
                                <Tag key={fw} color="green">{fw}</Tag>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Text strong>データベース:</Text>
                            <div style={{ marginTop: 8 }}>
                              {selectedEngineer.databases.map(db => (
                                <Tag key={db} color="orange">{db}</Tag>
                              ))}
                            </div>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      key: 'experience',
                      label: '経験',
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>業界経験:</Text>
                            <div style={{ marginTop: 8 }}>
                              {selectedEngineer.industries.map(ind => (
                                <Tag key={ind}>{ind}</Tag>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Text strong>対応可能フェーズ:</Text>
                            <div style={{ marginTop: 8 }}>
                              {selectedEngineer.phases.map(phase => (
                                <Tag key={phase}>{phase}</Tag>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Text strong>対応可能ロール:</Text>
                            <div style={{ marginTop: 8 }}>
                              {selectedEngineer.roles.map(role => (
                                <Tag key={role} color="purple">{role}</Tag>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Text strong>直近のプロジェクト:</Text>
                            <Paragraph>{selectedEngineer.lastProject}</Paragraph>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      key: 'other',
                      label: 'その他',
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <EnvironmentOutlined /> 勤務地: {selectedEngineer.location}
                          </div>
                          <div>
                            <DollarOutlined /> 単価: ¥{selectedEngineer.unitPrice.toLocaleString()}/月
                          </div>
                          <div>
                            <GlobalOutlined /> 英語力: {selectedEngineer.englishLevel}
                          </div>
                          <div>
                            <FileTextOutlined /> 契約形態: {selectedEngineer.preferredContract}
                          </div>
                          <div>
                            <TeamOutlined /> リモート勤務: {selectedEngineer.remoteWork ? '可能' : '不可'}
                          </div>
                          {selectedEngineer.certifications && (
                            <div>
                              <CheckCircleOutlined /> 資格:
                              <div style={{ marginTop: 8 }}>
                                {selectedEngineer.certifications.map(cert => (
                                  <Tag key={cert} color="gold">{cert}</Tag>
                                ))}
                              </div>
                            </div>
                          )}
                        </Space>
                      ),
                    },
                  ]}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EngineerSearch;