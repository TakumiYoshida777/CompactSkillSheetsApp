import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Timeline,
  Tag,
  Button,
  Space,
  Typography,
  Alert,
  List,
  Avatar,
  Badge,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TrophyOutlined,
  CalendarOutlined,
  EditOutlined,
  ExportOutlined,
  WarningOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEngineerStore } from '../../stores/engineerStore';
import './Dashboard.css';

const { Title, Text, Paragraph } = Typography;

const EngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  // 認証を一時的に無効化するため、モックデータを使用
  const engineerData = {
    name: 'テストエンジニア',
    currentStatus: 'working' as const,
    availableDate: '2024-04-01',
    isPublic: true
  };
  const skillSheetCompletion = 75;
  const currentProject = 'サンプルプロジェクト';
  const upcomingProjects: any[] = [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // データの取得
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // APIからデータ取得（仮実装）
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  // スキルシート完成度の計算
  const calculateCompletionRate = () => {
    return skillSheetCompletion || 75;
  };

  // ステータスに応じたタグの色を返す
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'processing';
      case 'waiting': return 'warning';
      case 'waiting_soon': return 'default';
      default: return 'default';
    }
  };

  const statusCards = [
    {
      title: '現在のステータス',
      value: '稼働中',
      icon: <SyncOutlined spin />,
      color: '#52c41a',
      suffix: currentProject ? `${currentProject}` : 'プロジェクトA',
    },
    {
      title: '稼働可能日',
      value: '2024/04/01',
      icon: <CalendarOutlined />,
      color: '#1890ff',
      suffix: 'まで 45日',
    },
    {
      title: 'スキルシート完成度',
      value: calculateCompletionRate(),
      icon: <FileTextOutlined />,
      color: '#faad14',
      suffix: '%',
      isProgress: true,
    },
    {
      title: '総プロジェクト数',
      value: 12,
      icon: <ProjectOutlined />,
      color: '#722ed1',
      suffix: '件',
    },
  ];

  const recentActivities = [
    {
      title: 'スキルシート更新',
      time: '2024/01/15 10:30',
      status: 'success',
      description: 'JavaScriptスキルを追加しました',
    },
    {
      title: 'プロジェクト完了',
      time: '2024/01/10 18:00',
      status: 'info',
      description: 'ECサイト開発プロジェクトが完了しました',
    },
    {
      title: '新規アプローチ',
      time: '2024/01/08 14:20',
      status: 'processing',
      description: '新規案件のオファーがあります',
    },
  ];

  const skillSummary = [
    { skill: 'JavaScript', level: 4, years: 5 },
    { skill: 'React', level: 4, years: 3 },
    { skill: 'TypeScript', level: 3, years: 2 },
    { skill: 'Node.js', level: 3, years: 3 },
    { skill: 'Python', level: 2, years: 1 },
  ];

  return (
    <div className="engineer-dashboard">
      <div className="dashboard-header">
        <Title level={2}>ダッシュボード</Title>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate('/engineer/skill-sheet')}
          >
            スキルシート編集
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => console.log('Export PDF')}
          >
            PDF出力
          </Button>
        </Space>
      </div>

      {/* アラート表示 */}
      {calculateCompletionRate() < 80 && (
        <Alert
          message="スキルシートの入力を完了してください"
          description="スキルシートの完成度が80%未満です。全ての項目を入力することで、より多くの案件にマッチする可能性が高まります。"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => navigate('/engineer/skill-sheet')}>
              入力を続ける
            </Button>
          }
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* ステータスカード */}
      <Row gutter={[16, 16]} className="status-cards">
        {statusCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable loading={loading}>
              <div className="status-card-content">
                <div className="status-icon" style={{ color: card.color }}>
                  {card.icon}
                </div>
                <div className="status-info">
                  <Text type="secondary">{card.title}</Text>
                  {card.isProgress ? (
                    <Progress
                      percent={card.value}
                      strokeColor={card.color}
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  ) : (
                    <div className="status-value">
                      <span className="value">{card.value}</span>
                      <span className="suffix">{card.suffix}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* スキルサマリー */}
        <Col xs={24} lg={8}>
          <Card
            title="スキルサマリー"
            extra={<Button type="link" onClick={() => navigate('/engineer/skill-sheet')}>詳細</Button>}
            loading={loading}
          >
            <List
              dataSource={skillSummary}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text>{item.skill}</Text>
                        <Tag color="blue">{item.years}年</Tag>
                      </Space>
                    }
                    description={
                      <Progress
                        percent={item.level * 20}
                        strokeColor="#1890ff"
                        showInfo={false}
                        size="small"
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近のアクティビティ */}
        <Col xs={24} lg={8}>
          <Card
            title="最近のアクティビティ"
            extra={<Button type="link">すべて見る</Button>}
            loading={loading}
          >
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    activity.status === 'success' ? 'green' :
                    activity.status === 'processing' ? 'blue' : 'gray'
                  }
                >
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <Text strong>{activity.title}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {activity.time}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {activity.description}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* プロジェクト予定 */}
        <Col xs={24} lg={8}>
          <Card
            title="今後のプロジェクト予定"
            extra={<Button type="link" onClick={() => navigate('/engineer/projects')}>管理</Button>}
            loading={loading}
          >
            <div className="project-schedule">
              {upcomingProjects?.length > 0 ? (
                <List
                  dataSource={upcomingProjects}
                  renderItem={(project: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ProjectOutlined />} />}
                        title={project.name}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">{project.client}</Text>
                            <Tag color="blue">{project.startDate} 開始予定</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="empty-state">
                  <CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Paragraph type="secondary" style={{ marginTop: 16 }}>
                    予定されているプロジェクトはありません
                  </Paragraph>
                  <Button type="primary" onClick={() => navigate('/engineer/projects')}>
                    プロジェクトを確認
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* クイックアクション */}
      <Card title="クイックアクション" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/engineer/skill-sheet')}
            >
              スキルシート編集
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<ProjectOutlined />}
              onClick={() => navigate('/engineer/projects')}
            >
              プロジェクト管理
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<UserOutlined />}
              onClick={() => navigate('/engineer/profile')}
            >
              プロフィール更新
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<ExportOutlined />}
              onClick={() => console.log('Export')}
            >
              データエクスポート
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EngineerDashboard;