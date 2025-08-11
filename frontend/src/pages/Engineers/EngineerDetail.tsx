import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Tabs,
  Timeline,
  Table,
  Space,
  Avatar,
  Row,
  Col,
  Progress,
  Statistic,
  Rate,
  Badge,
  Divider,
  Empty,
  Typography,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  FileTextOutlined,
  StarOutlined,
  DollarOutlined,
  TeamOutlined,
  SafetyOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;

interface ProjectHistory {
  key: string;
  projectName: string;
  client: string;
  period: string;
  role: string;
  technologies: string[];
  teamSize: number;
  description: string;
}

interface Skill {
  key: string;
  category: string;
  name: string;
  level: number;
  experience: string;
  lastUsed: string;
}

interface Certification {
  key: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
}

const EngineerDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  // ダミーデータ
  const engineerData = {
    engineerId: 'ENG001',
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    age: 32,
    gender: '男性',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    address: '東京都港区',
    nearestStation: '品川駅',
    status: 'available',
    joinDate: '2020/04/01',
    experience: 8,
    unitPrice: 650000,
    availability: '即日',
    contractType: '準委任契約',
    workLocation: 'リモート可',
    workTime: '140-180h',
    education: '情報工学部卒',
    selfPR: 'フロントエンドからバックエンドまで幅広い経験があります。特にReactとNode.jsを使用した開発が得意です。',
  };

  const projectHistory: ProjectHistory[] = [
    {
      key: '1',
      projectName: 'ECサイトリニューアル',
      client: 'ABC商事株式会社',
      period: '2023/06 - 現在',
      role: 'フロントエンドリード',
      technologies: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
      teamSize: 8,
      description: 'ECサイトのフルリニューアルプロジェクト。フロントエンドチームのリードとして、アーキテクチャ設計から実装まで担当。',
    },
    {
      key: '2',
      projectName: '在庫管理システム開発',
      client: 'XYZ物流株式会社',
      period: '2022/10 - 2023/05',
      role: 'フルスタックエンジニア',
      technologies: ['Vue.js', 'Node.js', 'PostgreSQL', 'Docker'],
      teamSize: 5,
      description: '物流会社向けの在庫管理システムの新規開発。フロントエンドとバックエンドの両方を担当。',
    },
    {
      key: '3',
      projectName: '社内業務システム改修',
      client: 'DEF製造株式会社',
      period: '2022/01 - 2022/09',
      role: 'バックエンドエンジニア',
      technologies: ['Java', 'Spring Boot', 'MySQL', 'AWS'],
      teamSize: 12,
      description: '既存の社内業務システムの大規模改修プロジェクト。マイクロサービス化を推進。',
    },
  ];

  const skills: Skill[] = [
    { key: '1', category: 'フロントエンド', name: 'React', level: 5, experience: '5年', lastUsed: '2024/01' },
    { key: '2', category: 'フロントエンド', name: 'TypeScript', level: 4, experience: '3年', lastUsed: '2024/01' },
    { key: '3', category: 'フロントエンド', name: 'Vue.js', level: 3, experience: '2年', lastUsed: '2023/05' },
    { key: '4', category: 'バックエンド', name: 'Node.js', level: 4, experience: '4年', lastUsed: '2024/01' },
    { key: '5', category: 'バックエンド', name: 'Java', level: 3, experience: '3年', lastUsed: '2022/09' },
    { key: '6', category: 'データベース', name: 'PostgreSQL', level: 4, experience: '5年', lastUsed: '2023/05' },
    { key: '7', category: 'データベース', name: 'MySQL', level: 4, experience: '4年', lastUsed: '2022/09' },
    { key: '8', category: 'インフラ', name: 'AWS', level: 3, experience: '3年', lastUsed: '2023/12' },
    { key: '9', category: 'インフラ', name: 'Docker', level: 4, experience: '3年', lastUsed: '2024/01' },
  ];

  const certifications: Certification[] = [
    { key: '1', name: '応用情報技術者', issuer: 'IPA', date: '2020/10' },
    { key: '2', name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2022/03', expiryDate: '2025/03' },
    { key: '3', name: 'Java Silver', issuer: 'Oracle', date: '2019/06' },
  ];

  const projectColumns: ColumnsType<ProjectHistory> = [
    {
      title: 'プロジェクト名',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'クライアント',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: '期間',
      dataIndex: 'period',
      key: 'period',
      render: (period) => (
        <Space>
          <CalendarOutlined />
          {period}
        </Space>
      ),
    },
    {
      title: '役割',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: '使用技術',
      dataIndex: 'technologies',
      key: 'technologies',
      render: (techs: string[]) => (
        <>
          {techs.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'チーム規模',
      dataIndex: 'teamSize',
      key: 'teamSize',
      render: (size) => `${size}名`,
    },
  ];

  const skillColumns: ColumnsType<Skill> = [
    {
      title: 'カテゴリ',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: 'スキル名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'レベル',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Rate disabled defaultValue={level} />,
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
    },
    {
      title: '最終使用',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
  ];

  const certificationColumns: ColumnsType<Certification> = [
    {
      title: '資格名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <SafetyOutlined className="text-green-500" />
          <span className="font-medium">{name}</span>
        </Space>
      ),
    },
    {
      title: '発行元',
      dataIndex: 'issuer',
      key: 'issuer',
    },
    {
      title: '取得日',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '有効期限',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => date || '無期限',
    },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: '基本情報',
      icon: <UserOutlined />,
      children: (
        <div>
          <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="エンジニアID">{engineerData.engineerId}</Descriptions.Item>
            <Descriptions.Item label="氏名">{engineerData.name}</Descriptions.Item>
            <Descriptions.Item label="フリガナ">{engineerData.nameKana}</Descriptions.Item>
            <Descriptions.Item label="年齢">{engineerData.age}歳</Descriptions.Item>
            <Descriptions.Item label="性別">{engineerData.gender}</Descriptions.Item>
            <Descriptions.Item label="経験年数">{engineerData.experience}年</Descriptions.Item>
            <Descriptions.Item label="メールアドレス">
              <Space>
                <MailOutlined />
                {engineerData.email}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="電話番号">
              <Space>
                <PhoneOutlined />
                {engineerData.phone}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="最寄駅">{engineerData.nearestStation}</Descriptions.Item>
            <Descriptions.Item label="入社日">{engineerData.joinDate}</Descriptions.Item>
            <Descriptions.Item label="学歴">{engineerData.education}</Descriptions.Item>
            <Descriptions.Item label="契約形態">{engineerData.contractType}</Descriptions.Item>
            <Descriptions.Item label="単価">
              <span className="text-lg font-bold text-blue-600">
                ¥{engineerData.unitPrice.toLocaleString()}/月
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="稼働可能日">{engineerData.availability}</Descriptions.Item>
            <Descriptions.Item label="稼働時間">{engineerData.workTime}</Descriptions.Item>
            <Descriptions.Item label="勤務地">{engineerData.workLocation}</Descriptions.Item>
            <Descriptions.Item label="自己PR" span={3}>
              <Paragraph>{engineerData.selfPR}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: '2',
      label: 'プロジェクト履歴',
      icon: <ProjectOutlined />,
      children: (
        <div>
          <Table
            columns={projectColumns}
            dataSource={projectHistory}
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <Paragraph className="m-0">{record.description}</Paragraph>
              ),
            }}
          />
        </div>
      ),
    },
    {
      key: '3',
      label: 'スキル',
      icon: <TrophyOutlined />,
      children: (
        <div>
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="総スキル数"
                  value={skills.length}
                  prefix={<StarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="平均レベル"
                  value={3.8}
                  precision={1}
                  suffix="/ 5.0"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="主要スキル"
                  value="React"
                  valueStyle={{ fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="最新技術"
                  value="TypeScript"
                  valueStyle={{ fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>
          <Table
            columns={skillColumns}
            dataSource={skills}
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: '4',
      label: '資格',
      icon: <SafetyOutlined />,
      children: (
        <Table
          columns={certificationColumns}
          dataSource={certifications}
          pagination={false}
        />
      ),
    },
    {
      key: '5',
      label: 'タイムライン',
      icon: <ClockCircleOutlined />,
      children: (
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <>
                  <p className="font-medium">ECサイトリニューアルプロジェクト開始</p>
                  <p className="text-gray-500">2023/06/01</p>
                </>
              ),
            },
            {
              color: 'blue',
              children: (
                <>
                  <p className="font-medium">AWS認定資格取得</p>
                  <p className="text-gray-500">2022/03/15</p>
                </>
              ),
            },
            {
              children: (
                <>
                  <p className="font-medium">在庫管理システム開発プロジェクト参画</p>
                  <p className="text-gray-500">2022/10/01</p>
                </>
              ),
            },
            {
              children: (
                <>
                  <p className="font-medium">入社</p>
                  <p className="text-gray-500">2020/04/01</p>
                </>
              ),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
          戻る
        </Button>
      </div>

      <Card className="mb-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6} className="text-center">
            <Avatar size={120} icon={<UserOutlined />} className="mb-4" />
            <Title level={3}>{engineerData.name}</Title>
            <Text type="secondary">{engineerData.engineerId}</Text>
            <div className="mt-4">
              <Badge
                status={engineerData.status === 'available' ? 'success' : 'processing'}
                text={engineerData.status === 'available' ? '稼働可能' : 'アサイン中'}
              />
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title="経験年数"
                    value={engineerData.experience}
                    suffix="年"
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title="単価"
                    value={engineerData.unitPrice}
                    prefix="¥"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title="プロジェクト数"
                    value={projectHistory.length}
                    suffix="件"
                    prefix={<ProjectOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title="評価"
                    value={4.5}
                    suffix="/ 5.0"
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            <Divider />
            <Space size="middle" wrap>
              <Button type="primary" icon={<EditOutlined />}>
                編集
              </Button>
              <Button icon={<FileTextOutlined />}>
                スキルシート生成
              </Button>
              <Button icon={<DownloadOutlined />}>
                PDFダウンロード
              </Button>
              <Button icon={<PrinterOutlined />}>
                印刷
              </Button>
              <Button icon={<MailOutlined />}>
                メール送信
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default EngineerDetail;