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
}

interface EngineerSearchTableProps {
  engineers: Engineer[];
  showActions?: boolean; // クライアント企業用のアクション表示
  onSendOffer?: (engineerIds: string[]) => void; // オファー送信
  showCompanyColumn?: boolean; // SES企業名列の表示
  title?: string;
  description?: string;
}

export const EngineerSearchTable: React.FC<EngineerSearchTableProps> = ({
  engineers,
  showActions = false,
  onSendOffer,
  showCompanyColumn = false,
  title = 'エンジニア一覧',
  description = '登録されているエンジニアの管理',
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [filterSkills, setFilterSkills] = React.useState<string[]>([]);
  const { isMobile } = useResponsive();

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

    return filtered;
  }, [engineers, searchText, filterStatus, filterSkills]);

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
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      width: 300,
      render: (skills: string[]) => (
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
      ),
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      sorter: (a, b) => a.experience - b.experience,
      render: (exp) => `${exp}年`,
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>

      {/* 検索・フィルター */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
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
          <Col xs={24} sm={12} lg={6}>
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
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              placeholder={['稼働開始可能日から', '稼働開始可能日まで']}
              style={{ width: '100%' }}
              size="large"
            />
          </Col>
        </Row>
        {showActions && (
          <Row className="mt-4">
            <Col span={24}>
              <Space>
                <Tooltip title="詳細フィルター">
                  <Button
                    icon={<FilterOutlined />}
                    size="large"
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
    </div>
  );
};

export default EngineerSearchTable;