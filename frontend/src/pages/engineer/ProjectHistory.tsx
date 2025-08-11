import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Timeline,
  Tabs,
  Badge,
  Tooltip,
  Dropdown,
  Menu,
  message,
  Drawer,
  Descriptions,
  InputNumber,
  Checkbox,
  Empty,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CodeOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import './ProjectHistory.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Project {
  id: string;
  name: string;
  clientCompany: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  teamSize: number;
  technologies: string[];
  phases: string[];
  description: string;
  achievements?: string;
  industry?: string;
  location?: string;
}

const ProjectHistory: React.FC = () => {
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // APIからプロジェクトデータ取得（仮実装）
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      dateRange: project.endDate 
        ? [dayjs(project.startDate), dayjs(project.endDate)]
        : [dayjs(project.startDate), null],
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'プロジェクトを削除しますか？',
      content: 'この操作は取り消せません。',
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk: async () => {
        try {
          await deleteProject(id);
          message.success('プロジェクトを削除しました');
        } catch (error) {
          message.error('削除に失敗しました');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectData = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1] ? values.dateRange[1].format('YYYY-MM-DD') : null,
      };
      delete projectData.dateRange;

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        message.success('プロジェクトを更新しました');
      } else {
        await addProject(projectData);
        message.success('プロジェクトを追加しました');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('保存に失敗しました');
    }
  };

  const handleViewDetail = (project: Project) => {
    setSelectedProject(project);
    setIsDetailVisible(true);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      ongoing: { color: 'processing', text: '進行中', icon: <SyncOutlined spin /> },
      completed: { color: 'success', text: '完了', icon: <CheckCircleOutlined /> },
      upcoming: { color: 'default', text: '予定', icon: <ClockCircleOutlined /> },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<Project> = [
    {
      title: 'プロジェクト名',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: 'クライアント',
      dataIndex: 'clientCompany',
      key: 'clientCompany',
      width: 150,
    },
    {
      title: 'ロール',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: '期間',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(record.startDate).format('YYYY/MM')}</Text>
          <Text>〜 {record.endDate ? dayjs(record.endDate).format('YYYY/MM') : '現在'}</Text>
        </Space>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '技術スタック',
      dataIndex: 'technologies',
      key: 'technologies',
      width: 300,
      render: (technologies) => (
        <Space size={[0, 8]} wrap>
          {technologies.slice(0, 3).map((tech: string) => (
            <Tag key={tech} color="geekblue">{tech}</Tag>
          ))}
          {technologies.length > 3 && (
            <Tag>+{technologies.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'チーム規模',
      dataIndex: 'teamSize',
      key: 'teamSize',
      width: 100,
      render: (size) => `${size}名`,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="詳細">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="編集">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="削除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // サンプルデータ
  const sampleProjects: Project[] = [
    {
      id: '1',
      name: 'ECサイトリニューアル',
      clientCompany: '株式会社ABC商事',
      role: 'フロントエンドリード',
      startDate: '2023-04-01',
      endDate: '2023-12-31',
      status: 'completed',
      teamSize: 8,
      technologies: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'AWS'],
      phases: ['詳細設計', '開発', 'テスト'],
      description: 'ECサイトの全面リニューアルプロジェクト。フロントエンドのアーキテクチャ設計から実装まで担当。',
      achievements: 'ページ読み込み速度を50%改善、コンバージョン率を20%向上',
      industry: '小売業',
      location: '東京',
    },
    {
      id: '2',
      name: '業務管理システム開発',
      clientCompany: 'XYZ株式会社',
      role: 'フルスタックエンジニア',
      startDate: '2024-01-01',
      status: 'ongoing',
      teamSize: 12,
      technologies: ['Vue.js', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
      phases: ['要件定義', '基本設計', '詳細設計', '開発'],
      description: '社内業務管理システムの新規開発。バックエンドAPIの設計・実装とフロントエンド開発を担当。',
      industry: '製造業',
      location: 'リモート',
    },
  ];

  const filteredProjects = sampleProjects.filter(project => {
    if (activeTab === 'all') return true;
    return project.status === activeTab;
  });

  const statistics = {
    total: sampleProjects.length,
    ongoing: sampleProjects.filter(p => p.status === 'ongoing').length,
    completed: sampleProjects.filter(p => p.status === 'completed').length,
    upcoming: sampleProjects.filter(p => p.status === 'upcoming').length,
  };

  const renderTimeline = () => (
    <Timeline mode="left">
      {sampleProjects
        .sort((a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix())
        .map(project => (
          <Timeline.Item
            key={project.id}
            label={dayjs(project.startDate).format('YYYY/MM')}
            color={
              project.status === 'ongoing' ? 'blue' :
              project.status === 'completed' ? 'green' : 'gray'
            }
          >
            <Card
              size="small"
              hoverable
              onClick={() => handleViewDetail(project)}
              className="timeline-card"
            >
              <Space direction="vertical" size="small">
                <Text strong>{project.name}</Text>
                <Text type="secondary">{project.clientCompany}</Text>
                <Space>
                  <Tag color="blue">{project.role}</Tag>
                  {getStatusTag(project.status)}
                </Space>
              </Space>
            </Card>
          </Timeline.Item>
        ))}
    </Timeline>
  );

  return (
    <div className="project-history">
      <div className="project-header">
        <Title level={2}>プロジェクト履歴</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          プロジェクト追加
        </Button>
      </div>

      {/* 統計カード */}
      <Row gutter={16} className="statistics-row">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="総プロジェクト数"
              value={statistics.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="進行中"
              value={statistics.ongoing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="完了"
              value={statistics.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="予定"
              value={statistics.upcoming}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                すべて
                <Badge count={statistics.total} style={{ marginLeft: 8 }} />
              </span>
            }
            key="all"
          >
            <Table
              columns={columns}
              dataSource={filteredProjects}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `全 ${total} 件`,
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                進行中
                <Badge count={statistics.ongoing} style={{ marginLeft: 8 }} />
              </span>
            }
            key="ongoing"
          >
            <Table
              columns={columns}
              dataSource={filteredProjects}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                完了
                <Badge count={statistics.completed} style={{ marginLeft: 8 }} />
              </span>
            }
            key="completed"
          >
            <Table
              columns={columns}
              dataSource={filteredProjects}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane tab="タイムライン" key="timeline">
            {renderTimeline()}
          </TabPane>
        </Tabs>
      </Card>

      {/* プロジェクト追加・編集モーダル */}
      <Modal
        title={editingProject ? 'プロジェクト編集' : 'プロジェクト追加'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="キャンセル"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            teamSize: 5,
            technologies: [],
            phases: [],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="プロジェクト名"
                rules={[{ required: true, message: 'プロジェクト名を入力してください' }]}
              >
                <Input placeholder="例: ECサイト開発" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="clientCompany"
                label="クライアント企業"
                rules={[{ required: true, message: 'クライアント企業を入力してください' }]}
              >
                <Input placeholder="例: 株式会社ABC" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="担当ロール"
                rules={[{ required: true, message: 'ロールを選択してください' }]}
              >
                <Select placeholder="選択してください">
                  <Option value="プログラマー">プログラマー</Option>
                  <Option value="システムエンジニア">システムエンジニア</Option>
                  <Option value="プロジェクトリーダー">プロジェクトリーダー</Option>
                  <Option value="プロジェクトマネージャー">プロジェクトマネージャー</Option>
                  <Option value="フロントエンドエンジニア">フロントエンドエンジニア</Option>
                  <Option value="バックエンドエンジニア">バックエンドエンジニア</Option>
                  <Option value="フルスタックエンジニア">フルスタックエンジニア</Option>
                  <Option value="フロントエンドリード">フロントエンドリード</Option>
                  <Option value="テックリード">テックリード</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="プロジェクト期間"
                rules={[{ required: true, message: '期間を選択してください' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['開始日', '終了日']}
                  format="YYYY/MM/DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="ステータス"
                rules={[{ required: true, message: 'ステータスを選択してください' }]}
              >
                <Select placeholder="選択してください">
                  <Option value="ongoing">進行中</Option>
                  <Option value="completed">完了</Option>
                  <Option value="upcoming">予定</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="teamSize"
                label="チーム規模"
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  suffix="名"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="industry"
                label="業界"
              >
                <Input placeholder="例: 金融業" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="technologies"
            label="使用技術"
          >
            <Select
              mode="tags"
              placeholder="技術スタックを入力（複数可）"
              style={{ width: '100%' }}
            >
              <Option value="JavaScript">JavaScript</Option>
              <Option value="TypeScript">TypeScript</Option>
              <Option value="React">React</Option>
              <Option value="Vue.js">Vue.js</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Python">Python</Option>
              <Option value="Java">Java</Option>
              <Option value="AWS">AWS</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phases"
            label="担当フェーズ"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={8}>
                  <Checkbox value="要件定義">要件定義</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="基本設計">基本設計</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="詳細設計">詳細設計</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="開発">開発</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="テスト">テスト</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="リリース">リリース</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="保守・運用">保守・運用</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="プロジェクト概要"
          >
            <TextArea
              rows={4}
              placeholder="プロジェクトの概要や担当業務について記入してください"
            />
          </Form.Item>

          <Form.Item
            name="achievements"
            label="成果・実績"
          >
            <TextArea
              rows={3}
              placeholder="プロジェクトでの成果や実績を記入してください"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* プロジェクト詳細ドロワー */}
      <Drawer
        title="プロジェクト詳細"
        placement="right"
        width={600}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
      >
        {selectedProject && (
          <div className="project-detail">
            <Descriptions title={selectedProject.name} bordered column={1}>
              <Descriptions.Item label="クライアント">
                {selectedProject.clientCompany}
              </Descriptions.Item>
              <Descriptions.Item label="担当ロール">
                <Tag color="blue">{selectedProject.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="期間">
                {dayjs(selectedProject.startDate).format('YYYY/MM/DD')} 〜{' '}
                {selectedProject.endDate
                  ? dayjs(selectedProject.endDate).format('YYYY/MM/DD')
                  : '現在'}
              </Descriptions.Item>
              <Descriptions.Item label="ステータス">
                {getStatusTag(selectedProject.status)}
              </Descriptions.Item>
              <Descriptions.Item label="チーム規模">
                {selectedProject.teamSize}名
              </Descriptions.Item>
              <Descriptions.Item label="業界">
                {selectedProject.industry || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="勤務地">
                {selectedProject.location || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="使用技術">
                <Space wrap>
                  {selectedProject.technologies.map(tech => (
                    <Tag key={tech} color="geekblue">{tech}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="担当フェーズ">
                <Space wrap>
                  {selectedProject.phases.map(phase => (
                    <Tag key={phase}>{phase}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="プロジェクト概要">
                <Paragraph>{selectedProject.description}</Paragraph>
              </Descriptions.Item>
              {selectedProject.achievements && (
                <Descriptions.Item label="成果・実績">
                  <Paragraph>{selectedProject.achievements}</Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProjectHistory;