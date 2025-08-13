import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Space, Button, Avatar } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  SendOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface WaitingEngineer {
  key: string;
  name: string;
  skills: string[];
  availableDate: string;
  status: string;
}


const Dashboard: React.FC = () => {
  // ダミーデータ
  const waitingEngineers: WaitingEngineer[] = [
    {
      key: '1',
      name: '田中太郎',
      skills: ['JavaScript', 'React', 'Node.js'],
      availableDate: '2024/02/01',
      status: '待機中',
    },
    {
      key: '2',
      name: '佐藤花子',
      skills: ['Python', 'Django', 'PostgreSQL'],
      availableDate: '2024/01/15',
      status: '待機中',
    },
    {
      key: '3',
      name: '鈴木一郎',
      skills: ['Java', 'Spring', 'MySQL'],
      availableDate: '2024/02/10',
      status: '待機予定',
    },
    {
      key: '4',
      name: '山田次郎',
      skills: ['C#', '.NET', 'SQL Server'],
      availableDate: '2024/03/31',
      status: '待機予定',
    },
    {
      key: '5',
      name: '伊藤美咲',
      skills: ['Vue.js', 'Node.js', 'MongoDB'],
      availableDate: '2024/01/20',
      status: '待機中',
    },
  ];


  const columns: ColumnsType<WaitingEngineer> = [
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <>
          {skills.map((skill) => (
            <Tag key={skill} color="blue">
              {skill}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '稼働開始可能日',
      dataIndex: 'availableDate',
      key: 'availableDate',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '待機中' ? 'orange' : 'cyan'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'アクション',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} size="small">
            詳細
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">エンジニアスキルシート管理システムの概要</p>
      </div>

      {/* KPIカード */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="エンジニア総数"
              value={120}
              prefix={<TeamOutlined />}
              suffix={
                <span className="text-green-500 text-sm">
                  <ArrowUpOutlined /> 5
                </span>
              }
            />
            <Progress percent={75} strokeColor="#52c41a" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待機中"
              value={15}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={
                <span className="text-orange-500 text-sm">
                  <ArrowUpOutlined /> 3
                </span>
              }
            />
            <Progress percent={12.5} strokeColor="#faad14" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今月のアプローチ"
              value={25}
              prefix={<SendOutlined />}
              suffix={
                <span className="text-green-500 text-sm">
                  <ArrowUpOutlined /> 8
                </span>
              }
            />
            <Progress percent={83} strokeColor="#1890ff" showInfo={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待機中エンジニア一覧 */}
        <Col xs={24}>
          <Card
            title="待機中・待機予定エンジニア"
            extra={
              <Button type="link" onClick={() => console.log('View all')}>
                すべて見る
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={waitingEngineers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* クイックアクション */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="クイックアクション">
            <Space size="large" wrap>
              <Button type="primary" icon={<UserOutlined />} size="large">
                エンジニア登録
              </Button>
              <Button icon={<SendOutlined />} size="large">
                アプローチ作成
              </Button>
              <Button icon={<TeamOutlined />} size="large">
                スキルシート更新
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;