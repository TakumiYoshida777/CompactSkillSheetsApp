import React, { useState, useEffect } from 'react';
import {
  Modal,
  Transfer,
  Input,
  Tag,
  Space,
  Avatar,
  List,
  Typography,
  Alert,
  Spin,
  Badge,
  Tooltip,
  Row,
  Col,
  Select,
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  StarFilled,
  CodeOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { TransferProps } from 'antd';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export interface Engineer {
  id: string;
  name: string;
  skills: string[];
  status: 'available' | 'waiting' | 'working';
  experience: number;
  location?: string;
  rating?: number;
  currentProject?: string;
  availableFrom?: string;
}

interface EngineerSelectorProps {
  visible: boolean;
  onOk: (selectedIds: string[]) => void;
  onCancel: () => void;
  initialSelectedIds?: string[];
  mode?: 'single' | 'multiple';
  title?: string;
  filterByStatus?: boolean;
}

const EngineerSelector: React.FC<EngineerSelectorProps> = ({
  visible,
  onOk,
  onCancel,
  initialSelectedIds = [],
  mode = 'multiple',
  title = 'エンジニア選択',
  filterByStatus = false,
}) => {
  const [targetKeys, setTargetKeys] = useState<string[]>(initialSelectedIds);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // モックデータ（実際のAPIから取得する）
  const [engineers] = useState<Engineer[]>([
    {
      id: '1',
      name: '山田 太郎',
      skills: ['React', 'TypeScript', 'Node.js'],
      status: 'available',
      experience: 5,
      location: '東京',
      rating: 4.5,
    },
    {
      id: '2',
      name: '佐藤 花子',
      skills: ['Java', 'Spring Boot', 'AWS'],
      status: 'working',
      experience: 7,
      location: '大阪',
      rating: 4.8,
      currentProject: 'ECサイト開発',
      availableFrom: '2024-03-01',
    },
    {
      id: '3',
      name: '鈴木 一郎',
      skills: ['Python', 'Django', 'Docker'],
      status: 'waiting',
      experience: 3,
      location: '名古屋',
      rating: 4.2,
    },
    {
      id: '4',
      name: '田中 次郎',
      skills: ['Vue.js', 'PHP', 'Laravel'],
      status: 'available',
      experience: 4,
      location: 'リモート',
      rating: 4.6,
    },
    {
      id: '5',
      name: '伊藤 三郎',
      skills: ['C#', '.NET', 'Azure'],
      status: 'working',
      experience: 8,
      location: '福岡',
      rating: 4.7,
      currentProject: '業務システム改修',
      availableFrom: '2024-04-01',
    },
    {
      id: '6',
      name: '高橋 四郎',
      skills: ['Go', 'Kubernetes', 'GCP'],
      status: 'available',
      experience: 6,
      location: '札幌',
      rating: 4.4,
    },
  ]);

  // 全スキルリストを取得
  const allSkills = Array.from(
    new Set(engineers.flatMap(e => e.skills))
  ).sort();

  useEffect(() => {
    setTargetKeys(initialSelectedIds);
  }, [initialSelectedIds]);

  const handleChange: TransferProps['onChange'] = (nextTargetKeys) => {
    if (mode === 'single' && nextTargetKeys.length > 1) {
      // シングルモードの場合、最後に選択した1つのみ保持
      setTargetKeys([nextTargetKeys[nextTargetKeys.length - 1]]);
    } else {
      setTargetKeys(nextTargetKeys as string[]);
    }
  };

  const handleSelectChange: TransferProps['onSelectChange'] = (
    sourceSelectedKeys,
    targetSelectedKeys
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const handleOk = () => {
    onOk(targetKeys);
  };

  // フィルタリング
  const filteredEngineers = engineers.filter(engineer => {
    // テキスト検索
    if (searchText && !engineer.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !engineer.skills.some(skill => skill.toLowerCase().includes(searchText.toLowerCase()))) {
      return false;
    }
    
    // ステータスフィルタ
    if (statusFilter !== 'all' && engineer.status !== statusFilter) {
      return false;
    }
    
    // スキルフィルタ
    if (skillFilter.length > 0 && !skillFilter.some(skill => engineer.skills.includes(skill))) {
      return false;
    }
    
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'waiting':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'working':
        return <StopOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '即稼働可';
      case 'waiting':
        return '待機中';
      case 'working':
        return '稼働中';
      default:
        return status;
    }
  };

  const renderItem = (engineer: Engineer) => {
    return (
      <List.Item.Meta
        avatar={
          <Badge
            dot
            status={
              engineer.status === 'available' ? 'success' :
              engineer.status === 'waiting' ? 'warning' : 'default'
            }
          >
            <Avatar icon={<UserOutlined />} />
          </Badge>
        }
        title={
          <Space>
            <Text strong>{engineer.name}</Text>
            {engineer.rating && (
              <Tooltip title={`評価: ${engineer.rating}`}>
                <Space size={0}>
                  <StarFilled style={{ color: '#faad14', fontSize: 12 }} />
                  <Text style={{ fontSize: 12 }}>{engineer.rating}</Text>
                </Space>
              </Tooltip>
            )}
          </Space>
        }
        description={
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Space size={4}>
              {getStatusIcon(engineer.status)}
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getStatusText(engineer.status)}
              </Text>
              {engineer.currentProject && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({engineer.currentProject})
                </Text>
              )}
              {engineer.availableFrom && (
                <Text type="success" style={{ fontSize: 12 }}>
                  {engineer.availableFrom}〜
                </Text>
              )}
            </Space>
            <Space size={4} wrap>
              <CodeOutlined style={{ fontSize: 12 }} />
              {engineer.skills.slice(0, 3).map(skill => (
                <Tag key={skill} style={{ fontSize: 11 }}>{skill}</Tag>
              ))}
              {engineer.skills.length > 3 && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  +{engineer.skills.length - 3}
                </Text>
              )}
            </Space>
            <Space size={4}>
              <EnvironmentOutlined style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {engineer.location} | {engineer.experience}年
              </Text>
            </Space>
          </Space>
        }
      />
    );
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {title}
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={900}
      okText="選択"
      cancelText="キャンセル"
    >
      <Alert
        message={mode === 'single' ? '1名のエンジニアを選択してください' : '表示を許可するエンジニアを選択してください'}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="名前やスキルで検索"
            allowClear
            onSearch={setSearchText}
            style={{ width: '100%' }}
          />
        </Col>
        {filterByStatus && (
          <Col span={8}>
            <Select
              placeholder="ステータス"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">すべて</Option>
              <Option value="available">
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  即稼働可
                </Space>
              </Option>
              <Option value="waiting">
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  待機中
                </Space>
              </Option>
              <Option value="working">
                <Space>
                  <StopOutlined style={{ color: '#ff4d4f' }} />
                  稼働中
                </Space>
              </Option>
            </Select>
          </Col>
        )}
        <Col span={8}>
          <Select
            mode="multiple"
            placeholder="スキルで絞り込み"
            style={{ width: '100%' }}
            value={skillFilter}
            onChange={setSkillFilter}
          >
            {allSkills.map(skill => (
              <Option key={skill} value={skill}>{skill}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Transfer
          dataSource={filteredEngineers.map(e => ({
            key: e.id,
            ...e,
          }))}
          titles={['選択可能', '選択済み']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          render={renderItem}
          listStyle={{
            width: 400,
            height: 400,
          }}
          showSearch={false} // カスタム検索を使用
        />
      </Spin>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          選択済み: {targetKeys.length} 名
          {mode === 'single' && targetKeys.length > 0 && ' (シングル選択モード)'}
        </Text>
      </div>
    </Modal>
  );
};

export default EngineerSelector;