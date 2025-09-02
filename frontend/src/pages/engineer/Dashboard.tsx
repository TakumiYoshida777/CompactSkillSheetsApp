import { debugLog, errorLog } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Progress,
  Timeline,
  Tag,
  Button,
  Space,
  Typography,
  Alert,
  List,
  Spin,
  message,
} from 'antd';
import {
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
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEngineerStore } from '../../stores/engineerStore';
import './Dashboard.css';

const { Title, Text, Paragraph } = Typography;

const EngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    engineerData,
    skillSheetCompletion,
    currentProject,
    upcomingProjects,
    isLoading,
    error,
    fetchEngineerData,
    clearError,
  } = useEngineerStore();
  
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // データの取得
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 実際のAPIを呼び出す
      await fetchEngineerData();
    } catch (err) {
      errorLog('Failed to fetch dashboard data:', err);
      // エラーの場合はモックデータを使用
      message.info('デモモードで表示しています');
    } finally {
      setLocalLoading(false);
    }
  };

  // スキルシート完成度の計算
  const calculateCompletionRate = () => {
    return skillSheetCompletion || 75;
  };

  // デモ用のデフォルトデータ
  const displayData = engineerData || {
    name: 'テストエンジニア',
    currentStatus: 'working' as const,
    availableDate: '2024-04-01',
    isPublic: true
  };
  
  const displayProject = currentProject || 'サンプルプロジェクト';
  const displayProjects = upcomingProjects || [];

  // ステータスに応じたタグの色を返す
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'processing';
      case 'waiting': return 'warning';
      case 'waiting_soon': return 'default';
      default: return 'default';
    }
  };

  // ステータスの表示名を取得
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'working': return '稼働中';
      case 'waiting': return '待機中';
      case 'waiting_soon': return '稼働予定';
      default: return '不明';
    }
  };

  // ローディング中の表示
  if (localLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="データを読み込み中..." />
      </div>
    );
  }

  const statusCards = [
    {
      title: '現在のステータス',
      value: getStatusDisplay(displayData.currentStatus),
      icon: displayData.currentStatus === 'working' ? <SyncOutlined spin /> : <ClockCircleOutlined />,
      color: displayData.currentStatus === 'working' ? '#52c41a' : '#faad14',
      suffix: displayProject,
    },
    {
      title: '稼働可能日',
      value: displayData.availableDate ? new Date(displayData.availableDate).toLocaleDateString('ja-JP') : '未設定',
      icon: <CalendarOutlined />,
      color: '#1890ff',
      suffix: displayData.availableDate ? `まで ${Math.ceil((new Date(displayData.availableDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日` : '',
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
            onClick={() => navigate('engineer/skill-sheet')}
          >
            スキルシート編集
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => debugLog('Export PDF')}
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
            <Button size="small" type="primary" onClick={() => navigate('engineer/skill-sheet')}>
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
            <Card hoverable loading={isLoading}>
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
            extra={<Button type="link" onClick={() => navigate('engineer/skill-sheet')}>詳細</Button>}
            loading={isLoading}
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
            loading={isLoading}
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

        {/* スキルシート更新履歴 */}
        <Col xs={24} lg={8}>
          <Card
            title="スキルシート更新履歴"
            loading={isLoading}
          >
            <Timeline>
              <Timeline.Item color="green">
                <div className="timeline-content">
                  <div className="timeline-header">
                    <Text strong>スキルシート更新</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      2024/01/15
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    技術スキルを更新しました
                  </Text>
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <div className="timeline-content">
                  <div className="timeline-header">
                    <Text strong>プロフィール更新</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      2024/01/10
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    自己PRを更新しました
                  </Text>
                </div>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <div className="timeline-content">
                  <div className="timeline-header">
                    <Text strong>初回登録</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      2024/01/01
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    スキルシートを作成しました
                  </Text>
                </div>
              </Timeline.Item>
            </Timeline>
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
              onClick={() => navigate('engineer/skill-sheet')}
            >
              スキルシート編集
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<ProjectOutlined />}
              onClick={() => navigate('engineer/projects')}
            >
              プロジェクト管理
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<UserOutlined />}
              onClick={() => navigate('engineer/profile')}
            >
              プロフィール更新
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              size="large"
              icon={<ExportOutlined />}
              onClick={() => debugLog('Export')}
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