import React from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Select,
  DatePicker,
  Row,
  Col,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Slider,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  CalendarOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ResponsiveTable from '../ResponsiveTable';
import useResponsive from '../../hooks/useResponsive';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ロール経験の型定義
export interface RoleExperience {
  role: string; // PM、PL、SE、PGなど
  years: number; // 経験年数
}

// 業務経験の型定義
export interface WorkExperience {
  task: string; // 要件定義、基本設計、詳細設計など
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'; // 習熟度
}

export interface Engineer {
  key: string;
  engineerId: string;
  name: string;
  age: number;
  skills: string[];
  experience: number;
  status: 'available' | 'assigned' | 'waiting' | 'waiting_scheduled' | 'leave';
  currentProject?: string;
  availableDate?: string;
  projectEndDate?: string;
  lastUpdated: string;
  email: string;
  phone: string;
  rate?: {
    min: number;
    max: number;
  };
  companyName?: string; // SES企業名（クライアント企業用）
  roleExperiences?: RoleExperience[]; // ロール経験
  workExperiences?: WorkExperience[]; // 業務経験
}

interface EngineerSearchTableProps {
  engineers: Engineer[];
  showActions?: boolean; // クライアント企業用のアクション表示
  onSendOffer?: (engineerIds: string[]) => void; // オファー送信
  showCompanyColumn?: boolean; // SES企業名列の表示
  title?: string;
  description?: string;
  customActions?: React.ReactNode; // SES企業用のカスタムアクション
  onRowClick?: (engineer: Engineer) => void; // 行クリック時の処理
  onFilterChange?: (filters: any) => void; // フィルター変更時の処理
}

export const EngineerSearchTable: React.FC<EngineerSearchTableProps> = ({
  engineers,
  showActions = false,
  onSendOffer,
  showCompanyColumn = false,
  title = 'エンジニア一覧',
  description = '登録されているエンジニアの管理',
  customActions,
  onRowClick,
  onFilterChange,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [filterSkills, setFilterSkills] = React.useState<string[]>([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = React.useState(false);
  const [experienceRange, setExperienceRange] = React.useState<[number, number]>([0, 20]);
  const [ageRange, setAgeRange] = React.useState<[number, number]>([20, 60]);
  const [rateRange, setRateRange] = React.useState<[number, number]>([0, 200]);
  const [filterRoles, setFilterRoles] = React.useState<{ role: string; minYears: number }[]>([]);
  const [filterTasks, setFilterTasks] = React.useState<string[]>([]);
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();

  const getStatusColor = (status: Engineer['status']) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'assigned':
        return 'blue';
      case 'waiting':
        return 'orange';
      case 'waiting_scheduled':
        return 'gold';
      case 'leave':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Engineer['status']) => {
    switch (status) {
      case 'available':
        return '稼働可能';
      case 'assigned':
        return 'アサイン中';
      case 'waiting':
        return '待機中';
      case 'waiting_scheduled':
        return '待機予定';
      case 'leave':
        return '休職中';
      default:
        return status;
    }
  };

  // フィルタリング処理
  const filteredEngineers = React.useMemo(() => {
    debugLog('[EngineerSearchTable] Input engineers:', engineers);
    debugLog('[EngineerSearchTable] Engineers count:', engineers.length);
    
    let filtered = [...engineers];

    // テキスト検索
    if (searchText) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(searchText.toLowerCase()) ||
        e.skills.some(skill =>
          skill.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // ステータスフィルター
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // スキルフィルター
    if (filterSkills.length > 0) {
      filtered = filtered.filter(e =>
        filterSkills.some(skill => e.skills.includes(skill))
      );
    }

    // 経験年数フィルター（経験年数がない場合はフィルターをスキップ）
    filtered = filtered.filter(e => {
      if (e.experience === undefined || e.experience === null) {
        // 経験年数データがない場合はフィルターをパス
        return true;
      }
      return e.experience >= experienceRange[0] && e.experience <= experienceRange[1];
    });
    debugLog('[EngineerSearchTable] After experience filter:', filtered.length);

    // 年齢フィルター（年齢がない場合はフィルターをスキップ）
    filtered = filtered.filter(e => {
      if (e.age === undefined || e.age === null || e.age === 0) {
        // 年齢データがない場合はフィルターをパス
        return true;
      }
      return e.age >= ageRange[0] && e.age <= ageRange[1];
    });
    debugLog('[EngineerSearchTable] After age filter:', filtered.length);

    // 単価フィルター
    if (showCompanyColumn) {
      filtered = filtered.filter(e => {
        if (e.rate && e.rate.min && e.rate.max) {
          return e.rate.min >= rateRange[0] && e.rate.max <= rateRange[1];
        }
        return true;
      });
    }

    // ロール経験フィルター
    if (filterRoles.length > 0) {
      filtered = filtered.filter(engineer => {
        // roleExperiencesがない場合はスキップ（フィルタリングしない）
        if (!engineer.roleExperiences || engineer.roleExperiences.length === 0) {
          debugLog('[EngineerSearchTable] Engineer has no roleExperiences, skipping role filter for:', engineer.name);
          return true;
        }
        return filterRoles.every(filterRole => {
          const roleExp = engineer.roleExperiences?.find(
            exp => exp.role.toLowerCase() === filterRole.role.toLowerCase()
          );
          return roleExp && roleExp.years >= filterRole.minYears;
        });
      });
    }
    debugLog('[EngineerSearchTable] After role filter:', filtered.length);

    // 業務経験フィルター
    if (filterTasks.length > 0) {
      filtered = filtered.filter(engineer => {
        // workExperiencesがない場合はスキップ（フィルタリングしない）
        if (!engineer.workExperiences || engineer.workExperiences.length === 0) {
          debugLog('[EngineerSearchTable] Engineer has no workExperiences, skipping task filter for:', engineer.name);
          return true;
        }
        return filterTasks.every(task => 
          engineer.workExperiences?.some(
            exp => exp.task.toLowerCase().includes(task.toLowerCase())
          )
        );
      });
    }
    debugLog('[EngineerSearchTable] After task filter:', filtered.length);

    debugLog('[EngineerSearchTable] Final filtered result:', filtered);
    debugLog('[EngineerSearchTable] Final filtered count:', filtered.length);
    return filtered;
  }, [engineers, searchText, filterStatus, filterSkills, experienceRange, ageRange, rateRange, showCompanyColumn, filterRoles, filterTasks]);

  const columns: ColumnsType<Engineer> = [
    {
      title: 'ID',
      dataIndex: 'engineerId',
      key: 'engineerId',
      width: 80,
      fixed: 'left',
    },
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    ...(showCompanyColumn ? [{
      title: 'SES企業',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 150,
      render: (text: string) => text || '-',
    }] : []),
    {
      title: '年齢',
      dataIndex: 'age',
      key: 'age',
      width: 70,
      sorter: (a, b) => (a.age || 0) - (b.age || 0),
      render: (age) => age ? `${age}歳` : '-',
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      width: 300,
      render: (skills: string[]) => {
        if (!skills || skills.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <>
            {skills.slice(0, 3).map((skill) => (
              <Tag key={skill} color="blue">
                {skill}
              </Tag>
            ))}
            {skills.length > 3 && (
              <Tag>+{skills.length - 3}</Tag>
            )}
          </>
        );
      },
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      sorter: (a, b) => (a.experience || 0) - (b.experience || 0),
      render: (exp) => exp !== undefined && exp !== null ? `${exp}年` : '-',
    },
    {
      title: '単価',
      dataIndex: 'rate',
      key: 'rate',
      width: 150,
      render: (rate) => {
        if (rate && rate.min && rate.max) {
          return `¥${rate.min}〜${rate.max}万/月`;
        }
        return '-';
      },
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '稼働可能', value: 'available' },
        { text: 'アサイン中', value: 'assigned' },
        { text: '待機中', value: 'waiting' },
        { text: '待機予定', value: 'waiting_scheduled' },
        { text: '休職中', value: 'leave' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: Engineer['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '稼働開始可能日',
      dataIndex: 'availableDate',
      key: 'availableDate',
      width: 120,
      render: (date, record) => {
        if (record.status === 'waiting_scheduled' && record.projectEndDate) {
          return (
            <Tooltip title={`プロジェクト終了後: ${record.projectEndDate}`}>
              <Space>
                <CalendarOutlined />
                {date || '未定'}
              </Space>
            </Tooltip>
          );
        }
        return date ? (
          <Space>
            <CalendarOutlined />
            {date}
          </Space>
        ) : '-';
      },
    },
    {
      title: '最終更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      sorter: (a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleSendOffer = () => {
    const selectedEngineers = filteredEngineers
      .filter(e => selectedRowKeys.includes(e.key))
      .map(e => e.engineerId);
    
    if (onSendOffer) {
      onSendOffer(selectedEngineers);
    }
  };

  // 利用可能なスキル一覧を取得
  const allSkills = React.useMemo(() => {
    const skillSet = new Set<string>();
    engineers.forEach(e => e.skills.forEach(skill => skillSet.add(skill)));
    return Array.from(skillSet).sort();
  }, [engineers]);

  // 詳細フィルターのリセット
  const handleResetAdvancedFilter = () => {
    setExperienceRange([0, 20]);
    setAgeRange([20, 60]);
    setRateRange([0, 200]);
    form.resetFields();
  };

  // 詳細フィルターの適用
  const handleApplyAdvancedFilter = () => {
    const values = form.getFieldsValue();
    if (values.experienceRange) {
      setExperienceRange(values.experienceRange);
    }
    if (values.ageRange) {
      setAgeRange(values.ageRange);
    }
    if (values.rateRange) {
      setRateRange(values.rateRange);
    }
    setShowAdvancedFilter(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>

      {/* 検索・フィルター */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Search
              placeholder="名前、スキルで検索"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={setSearchText}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="ステータス"
              style={{ width: '100%' }}
              size="large"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">すべて</Option>
              <Option value="available">稼働可能</Option>
              <Option value="assigned">アサイン中</Option>
              <Option value="waiting">待機中</Option>
              <Option value="waiting_scheduled">待機予定</Option>
              <Option value="leave">休職中</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              mode="multiple"
              placeholder="スキルで絞り込み"
              style={{ width: '100%' }}
              size="large"
              value={filterSkills}
              onChange={setFilterSkills}
            >
              {allSkills.map(skill => (
                <Option key={skill} value={skill}>{skill}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="ロール経験で検索"
              style={{ width: '100%' }}
              size="large"
              allowClear
              onChange={(value) => {
                if (value) {
                  // 簡易的なロールフィルター（詳細は詳細フィルターで）
                  setFilterRoles([{ role: value, minYears: 1 }]);
                } else {
                  setFilterRoles([]);
                }
              }}
            >
              <Option value="PM">PM（プロジェクトマネージャー）</Option>
              <Option value="PL">PL（プロジェクトリーダー）</Option>
              <Option value="SE">SE（システムエンジニア）</Option>
              <Option value="PG">PG（プログラマー）</Option>
              <Option value="アーキテクト">アーキテクト</Option>
              <Option value="コンサルタント">コンサルタント</Option>
              <Option value="テストエンジニア">テストエンジニア</Option>
              <Option value="インフラエンジニア">インフラエンジニア</Option>
              <Option value="データベースエンジニア">データベースエンジニア</Option>
              <Option value="セキュリティエンジニア">セキュリティエンジニア</Option>
              <Option value="データサイエンティスト">データサイエンティスト</Option>
              <Option value="AIエンジニア">AIエンジニア</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <RangePicker
              placeholder={['稼働開始日', '〜まで']}
              style={{ width: '100%' }}
              size="large"
            />
          </Col>
        </Row>
        {(showActions || customActions) && (
          <Row className="mt-4">
            <Col span={24}>
              <Space>
                {customActions}
                <Tooltip title="詳細フィルター">
                  <Button
                    icon={<FilterOutlined />}
                    size="large"
                    onClick={() => setShowAdvancedFilter(true)}
                  >
                    詳細フィルター
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* 統計情報 */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEngineers.length}
              </div>
              <div className="text-gray-600 text-sm">検索結果</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredEngineers.filter(e => e.status === 'available').length}
              </div>
              <div className="text-gray-600 text-sm">稼働可能</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEngineers.filter(e => e.status === 'assigned').length}
              </div>
              <div className="text-gray-600 text-sm">アサイン中</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredEngineers.filter(e => e.status === 'waiting').length}
              </div>
              <div className="text-gray-600 text-sm">待機中</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredEngineers.filter(e => e.status === 'waiting_scheduled').length}
              </div>
              <div className="text-gray-600 text-sm">待機予定</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredEngineers.map(e => e.companyName)).size}
              </div>
              <div className="text-gray-600 text-sm">SES企業数</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* テーブル */}
      <Card className="overflow-hidden">
        <div className="mb-4">
          {selectedRowKeys.length > 0 && (
            <Space wrap>
              <span>{selectedRowKeys.length}件選択中</span>
              {showActions && onSendOffer && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendOffer}
                >
                  選択したエンジニアにオファー送信
                </Button>
              )}
            </Space>
          )}
        </div>
        <ResponsiveTable
          rowSelection={!isMobile ? rowSelection : undefined}
          columns={columns}
          dataSource={filteredEngineers}
          scroll={{ x: 1500 }}
          onRow={(record) => ({
            onClick: () => onRowClick && onRowClick(record),
            style: { cursor: onRowClick ? 'pointer' : 'default' },
          })}
          pagination={{
            total: filteredEngineers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
          mobileRenderItem={(engineer) => (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <div className="font-semibold text-base">{engineer.name}</div>
                    <div className="text-gray-500 text-sm">{engineer.engineerId}</div>
                    {showCompanyColumn && engineer.companyName && (
                      <div className="text-gray-500 text-xs">{engineer.companyName}</div>
                    )}
                  </div>
                </Space>
                <Tag color={getStatusColor(engineer.status)}>
                  {getStatusText(engineer.status)}
                </Tag>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {engineer.skills.slice(0, 3).map((skill) => (
                  <Tag key={skill} color="blue" className="text-xs">
                    {skill}
                  </Tag>
                ))}
                {engineer.skills.length > 3 && (
                  <Tag className="text-xs">+{engineer.skills.length - 3}</Tag>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>経験: {engineer.experience}年</div>
                {engineer.rate && (
                  <div>単価: ¥{engineer.rate.min}〜{engineer.rate.max}万/月</div>
                )}
                {engineer.availableDate && (
                  <div>稼働開始可能日: {engineer.availableDate}</div>
                )}
              </div>

              {showActions && onSendOffer && (
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => onSendOffer([engineer.engineerId])}
                  block
                >
                  オファーを送信
                </Button>
              )}
            </div>
          )}
        />
      </Card>

      {/* 詳細フィルターモーダル */}
      <Modal
        title="詳細フィルター"
        open={showAdvancedFilter}
        onOk={handleApplyAdvancedFilter}
        onCancel={() => setShowAdvancedFilter(false)}
        width={600}
        footer={[
          <Button key="reset" onClick={handleResetAdvancedFilter}>
            リセット
          </Button>,
          <Button key="cancel" onClick={() => setShowAdvancedFilter(false)}>
            キャンセル
          </Button>,
          <Button key="submit" type="primary" onClick={handleApplyAdvancedFilter}>
            適用
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            experienceRange,
            ageRange,
            rateRange,
          }}
        >
          <Form.Item label="経験年数" name="experienceRange">
            <Slider
              range
              min={0}
              max={20}
              marks={{
                0: '0年',
                5: '5年',
                10: '10年',
                15: '15年',
                20: '20年',
              }}
              tooltip={{ formatter: (value) => `${value}年` }}
            />
          </Form.Item>

          <Form.Item label="年齢" name="ageRange">
            <Slider
              range
              min={20}
              max={60}
              marks={{
                20: '20歳',
                30: '30歳',
                40: '40歳',
                50: '50歳',
                60: '60歳',
              }}
              tooltip={{ formatter: (value) => `${value}歳` }}
            />
          </Form.Item>

          {showCompanyColumn && (
            <Form.Item label="単価（万円/月）" name="rateRange">
              <Slider
                range
                min={0}
                max={200}
                marks={{
                  0: '0',
                  50: '50万',
                  100: '100万',
                  150: '150万',
                  200: '200万',
                }}
                tooltip={{ formatter: (value) => `${value}万円` }}
              />
            </Form.Item>
          )}

          <Form.Item label="ロール経験">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <Select
                    placeholder="PM経験"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'PM');
                      if (value) newRoles.push({ role: 'PM', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                    <Option value={10}>10年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="PL経験"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'PL');
                      if (value) newRoles.push({ role: 'PL', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={2}>2年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="SE経験"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'SE');
                      if (value) newRoles.push({ role: 'SE', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                    <Option value={10}>10年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="PG経験"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'PG');
                      if (value) newRoles.push({ role: 'PG', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                    <Option value={10}>10年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="アーキテクト"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'アーキテクト');
                      if (value) newRoles.push({ role: 'アーキテクト', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="コンサルタント"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'コンサルタント');
                      if (value) newRoles.push({ role: 'コンサルタント', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="テストエンジニア"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'テストエンジニア');
                      if (value) newRoles.push({ role: 'テストエンジニア', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="インフラエンジニア"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'インフラエンジニア');
                      if (value) newRoles.push({ role: 'インフラエンジニア', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="データベースエンジニア"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'データベースエンジニア');
                      if (value) newRoles.push({ role: 'データベースエンジニア', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="セキュリティエンジニア"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'セキュリティエンジニア');
                      if (value) newRoles.push({ role: 'セキュリティエンジニア', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="データサイエンティスト"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'データサイエンティスト');
                      if (value) newRoles.push({ role: 'データサイエンティスト', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="AIエンジニア"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => {
                      const newRoles = filterRoles.filter(r => r.role !== 'AIエンジニア');
                      if (value) newRoles.push({ role: 'AIエンジニア', minYears: value });
                      setFilterRoles(newRoles);
                    }}
                  >
                    <Option value={1}>1年以上</Option>
                    <Option value={3}>3年以上</Option>
                    <Option value={5}>5年以上</Option>
                  </Select>
                </Col>
              </Row>
            </Space>
          </Form.Item>

          <Form.Item label="業務経験">
            <Select
              mode="multiple"
              placeholder="要件定義、基本設計などを選択"
              style={{ width: '100%' }}
              value={filterTasks}
              onChange={setFilterTasks}
            >
              <Option value="要件定義">要件定義書作成</Option>
              <Option value="基本設計">基本設計書作成</Option>
              <Option value="詳細設計">詳細設計書作成</Option>
              <Option value="実装">実装・コーディング</Option>
              <Option value="テスト設計">テスト設計</Option>
              <Option value="テスト実施">テスト実施</Option>
              <Option value="結合テスト">結合テスト</Option>
              <Option value="総合テスト">総合テスト</Option>
              <Option value="受入テスト">受入テスト</Option>
              <Option value="性能テスト">性能テスト</Option>
              <Option value="セキュリティテスト">セキュリティテスト</Option>
              <Option value="運用保守">運用保守</Option>
              <Option value="顧客折衝">顧客折衝</Option>
              <Option value="チームマネジメント">チームマネジメント</Option>
              <Option value="プロジェクト管理">プロジェクト管理</Option>
              <Option value="予算管理">予算管理</Option>
              <Option value="品質管理">品質管理</Option>
              <Option value="リスク管理">リスク管理</Option>
              <Option value="スケジュール管理">スケジュール管理</Option>
              <Option value="要員管理">要員管理</Option>
              <Option value="ベンダー管理">ベンダー管理</Option>
              <Option value="インフラ構築">インフラ構築</Option>
              <Option value="クラウド構築">クラウド構築</Option>
              <Option value="データベース設計">データベース設計</Option>
              <Option value="データベース構築">データベース構築</Option>
              <Option value="ネットワーク設計">ネットワーク設計</Option>
              <Option value="ネットワーク構築">ネットワーク構築</Option>
              <Option value="セキュリティ設計">セキュリティ設計</Option>
              <Option value="セキュリティ監査">セキュリティ監査</Option>
              <Option value="性能チューニング">性能チューニング</Option>
              <Option value="障害対応">障害対応</Option>
              <Option value="ドキュメント作成">ドキュメント作成</Option>
              <Option value="教育・研修">教育・研修</Option>
              <Option value="技術調査">技術調査</Option>
              <Option value="技術選定">技術選定</Option>
              <Option value="アーキテクチャ設計">アーキテクチャ設計</Option>
              <Option value="API設計">API設計</Option>
              <Option value="UI/UX設計">UI/UX設計</Option>
              <Option value="フロントエンド開発">フロントエンド開発</Option>
              <Option value="バックエンド開発">バックエンド開発</Option>
              <Option value="モバイルアプリ開発">モバイルアプリ開発</Option>
              <Option value="AI/機械学習開発">AI/機械学習開発</Option>
              <Option value="データ分析">データ分析</Option>
              <Option value="BI開発">BI開発</Option>
              <Option value="RPA開発">RPA開発</Option>
              <Option value="IoT開発">IoT開発</Option>
              <Option value="ブロックチェーン開発">ブロックチェーン開発</Option>
              <Option value="DevOps">DevOps</Option>
              <Option value="CI/CD構築">CI/CD構築</Option>
              <Option value="コンテナ化">コンテナ化</Option>
              <Option value="マイクロサービス設計">マイクロサービス設計</Option>
            </Select>
          </Form.Item>

          <Form.Item label="稼働可能時期">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="除外するスキル">
            <Select
              mode="multiple"
              placeholder="除外したいスキルを選択"
              style={{ width: '100%' }}
            >
              {allSkills.map(skill => (
                <Option key={skill} value={skill}>{skill}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EngineerSearchTable;