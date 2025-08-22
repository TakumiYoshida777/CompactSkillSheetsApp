import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Space, message } from 'antd';
import { PlusOutlined, CalendarOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useProjects, useTimeline, useUtilization } from '../../queries/projectQueries';
import { useProjectStore } from '../../stores/projectStore';
import ProjectKanban from './ProjectKanban';
import ProjectList from './ProjectList';
import ProjectCalendar from './ProjectCalendar';
import ProjectDetail from './ProjectDetail';
import ProjectCreateModal from './ProjectCreateModal';
import GanttChart from './GanttChart';
import UtilizationDashboard from './UtilizationDashboard';
import { ProjectFilters } from '../../api/projects/projectApi';

const { TabPane } = Tabs;

/**
 * プロジェクト管理メインコンポーネント
 */
const ProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('kanban');
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const { viewMode, setViewMode, selectedProject, setSelectedProject } = useProjectStore();
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useProjects(filters);
  const { data: timeline, isLoading: timelineLoading } = useTimeline();
  const { data: utilization, isLoading: utilizationLoading } = useUtilization();

  useEffect(() => {
    // 初回読み込み
    refetchProjects();
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'kanban' || key === 'list' || key === 'calendar') {
      setViewMode(key as 'kanban' | 'list' | 'calendar');
    }
  };

  const handleFilterChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects?.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleProjectCreate = () => {
    setCreateModalVisible(true);
  };

  const handleProjectCreated = () => {
    setCreateModalVisible(false);
    refetchProjects();
    message.success('プロジェクトを作成しました');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'kanban':
        return (
          <ProjectKanban
            projects={projects || []}
            loading={projectsLoading}
            onProjectSelect={handleProjectSelect}
            onFilterChange={handleFilterChange}
          />
        );
      case 'list':
        return (
          <ProjectList
            projects={projects || []}
            loading={projectsLoading}
            onProjectSelect={handleProjectSelect}
            onFilterChange={handleFilterChange}
          />
        );
      case 'calendar':
        return (
          <ProjectCalendar
            projects={projects || []}
            loading={projectsLoading}
            onProjectSelect={handleProjectSelect}
          />
        );
      case 'gantt':
        return (
          <GanttChart
            timeline={timeline || []}
            loading={timelineLoading}
            onProjectSelect={handleProjectSelect}
          />
        );
      case 'utilization':
        return (
          <UtilizationDashboard
            utilization={utilization || []}
            loading={utilizationLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="project-management">
      <Card
        title="プロジェクト管理"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleProjectCreate}
            >
              新規プロジェクト
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <AppstoreOutlined />
                カンバン
              </span>
            }
            key="kanban"
          />
          <TabPane
            tab={
              <span>
                <UnorderedListOutlined />
                リスト
              </span>
            }
            key="list"
          />
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                カレンダー
              </span>
            }
            key="calendar"
          />
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                ガントチャート
              </span>
            }
            key="gantt"
          />
          <TabPane
            tab={
              <span>
                <AppstoreOutlined />
                稼働率
              </span>
            }
            key="utilization"
          />
        </Tabs>

        <div className="tab-content" style={{ marginTop: 16 }}>
          {renderContent()}
        </div>
      </Card>

      {/* プロジェクト詳細モーダル */}
      {selectedProjectId && (
        <ProjectDetail
          projectId={selectedProjectId}
          visible={!!selectedProjectId}
          onClose={() => {
            setSelectedProjectId(null);
            setSelectedProject(null);
          }}
          onUpdate={() => refetchProjects()}
        />
      )}

      {/* プロジェクト作成モーダル */}
      <ProjectCreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectManagement;