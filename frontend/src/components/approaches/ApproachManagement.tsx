import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Space, Badge, message, Row, Col, Statistic } from 'antd';
import { 
  PlusOutlined, 
  HistoryOutlined, 
  MailOutlined, 
  SettingOutlined,
  TeamOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { 
  useApproaches, 
  useApproachStatistics, 
  useEmailTemplates,
  usePeriodicApproaches,
  useFreelancers
} from '../../queries/approachQueries';
import { useApproachStore } from '../../stores/approachStore';
import ApproachTimeline from './ApproachTimeline';
import ApproachWizard from './ApproachWizard';
import EmailTemplateManager from './EmailTemplateManager';
import PeriodicApproachSettings from './PeriodicApproachSettings';
import FreelanceApproachManager from './FreelanceApproachManager';
import ApproachStatisticsDashboard from './ApproachStatisticsDashboard';
import { ApproachFilters } from '../../api/approaches/approachApi';

const { TabPane } = Tabs;

/**
 * アプローチ管理メインコンポーネント
 */
const ApproachManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('timeline');
  const [filters, setFilters] = useState<ApproachFilters>({});
  const [wizardVisible, setWizardVisible] = useState(false);
  const [selectedApproachId, setSelectedApproachId] = useState<string | null>(null);
  
  const { setSelectedApproach } = useApproachStore();
  const { data: approaches, isLoading: approachesLoading, refetch: refetchApproaches } = useApproaches(filters);
  const { data: statistics, isLoading: statisticsLoading } = useApproachStatistics();
  const { data: templates, isLoading: templatesLoading } = useEmailTemplates();
  const { data: periodicSettings, isLoading: periodicLoading } = usePeriodicApproaches();
  const { data: freelancers, isLoading: freelancersLoading } = useFreelancers();

  useEffect(() => {
    // 初回読み込み
    refetchApproaches();
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleFilterChange = (newFilters: ApproachFilters) => {
    setFilters(newFilters);
  };

  const handleApproachSelect = (approachId: string) => {
    setSelectedApproachId(approachId);
    const approach = approaches?.find(a => a.id === approachId);
    if (approach) {
      setSelectedApproach(approach);
    }
  };

  const handleCreateApproach = () => {
    setWizardVisible(true);
  };

  const handleApproachCreated = () => {
    setWizardVisible(false);
    refetchApproaches();
    message.success('アプローチを送信しました');
  };

  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="総送信数"
              value={statistics.totalSent}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="開封率"
              value={statistics.openRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: statistics.openRate > 30 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="返信率"
              value={statistics.replyRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: statistics.replyRate > 10 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成約率"
              value={statistics.acceptRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: statistics.acceptRate > 5 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'timeline':
        return (
          <ApproachTimeline
            approaches={approaches || []}
            loading={approachesLoading}
            onApproachSelect={handleApproachSelect}
            onFilterChange={handleFilterChange}
          />
        );
      case 'templates':
        return (
          <EmailTemplateManager
            templates={templates || []}
            loading={templatesLoading}
            onTemplateUpdate={() => message.success('テンプレートを更新しました')}
          />
        );
      case 'periodic':
        return (
          <PeriodicApproachSettings
            periodicSettings={periodicSettings || []}
            loading={periodicLoading}
            onSettingUpdate={() => message.success('定期アプローチ設定を更新しました')}
          />
        );
      case 'freelance':
        return (
          <FreelanceApproachManager
            freelancers={freelancers || []}
            loading={freelancersLoading}
            onApproachSent={() => {
              refetchApproaches();
              message.success('フリーランスにアプローチしました');
            }}
          />
        );
      case 'statistics':
        return (
          <ApproachStatisticsDashboard
            statistics={statistics}
            approaches={approaches || []}
            loading={statisticsLoading || approachesLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="approach-management">
      <Card
        title="アプローチ管理"
        extra={
          <Space>
            <Badge count={periodicSettings?.filter(p => p.isActive && !p.isPaused).length || 0}>
              <Button icon={<SettingOutlined />}>
                定期設定
              </Button>
            </Badge>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateApproach}
            >
              新規アプローチ
            </Button>
          </Space>
        }
      >
        {/* 統計カード */}
        {renderStatisticsCards()}

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                アプローチ履歴
              </span>
            }
            key="timeline"
          />
          <TabPane
            tab={
              <span>
                <MailOutlined />
                メールテンプレート
              </span>
            }
            key="templates"
          />
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                定期アプローチ
                {periodicSettings && periodicSettings.length > 0 && (
                  <Badge 
                    count={periodicSettings.filter(p => p.isActive).length} 
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            }
            key="periodic"
          />
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                フリーランス
              </span>
            }
            key="freelance"
          />
          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                統計・分析
              </span>
            }
            key="statistics"
          />
        </Tabs>

        <div className="tab-content" style={{ marginTop: 16 }}>
          {renderContent()}
        </div>
      </Card>

      {/* アプローチ作成ウィザード */}
      <ApproachWizard
        visible={wizardVisible}
        onCancel={() => setWizardVisible(false)}
        onSuccess={handleApproachCreated}
        templates={templates || []}
      />
    </div>
  );
};

export default ApproachManagement;