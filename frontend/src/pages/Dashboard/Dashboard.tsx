import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Space, Button, List, Avatar } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
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

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: React.ReactNode;
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

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'project',
      description: '新規プロジェクト「ECサイト構築」が開始されました',
      time: '2時間前',
      icon: <ProjectOutlined className="text-blue-500" />,
    },
    {
      id: '2',
      type: 'engineer',
      description: '山田太郎さんのステータスが「待機中」に変更されました',
      time: '3時間前',
      icon: <UserOutlined className="text-green-500" />,
    },
    {
      id: '3',
      type: 'approach',
      description: 'ABC株式会社へのアプローチメールが送信されました',
      time: '5時間前',
      icon: <SendOutlined className="text-purple-500" />,
    },
    {
      id: '4',
      type: 'skillsheet',
      description: '5名のスキルシートが更新されました',
      time: '1日前',
      icon: <TeamOutlined className="text-orange-500" />,
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
      title: '稼働可能日',
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
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="成約率"
              value={20}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={20} strokeColor="#52c41a" showInfo={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待機中エンジニア一覧 */}
        <Col xs={24} lg={16}>
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

        {/* 最新アクティビティ */}
        <Col xs={24} lg={8}>
          <Card title="最新アクティビティ">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={<span className="text-sm">{item.description}</span>}
                    description={<span className="text-xs text-gray-500">{item.time}</span>}
                  />
                </List.Item>
              )}
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
              <Button icon={<ProjectOutlined />} size="large">
                プロジェクト作成
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