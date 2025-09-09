import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Statistic,
  Rate,
  Badge,
  Divider,
  Typography,
  Spin,
  message,
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
  ClockCircleOutlined,
  ProjectOutlined,
  FileTextOutlined,
  StarOutlined,
  TeamOutlined,
  SafetyOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEngineerDetail } from '../../hooks/useEngineerDetail';

const { Title, Text, Paragraph } = Typography;

// Engineerデータ型を拡張（バックエンドとの整合性のため）
interface ExtendedEngineer {
  id: string;
  name: string;
  nameKana?: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  nearestStation?: string;
  joinDate?: string;
  experience?: number;
  education?: string;
  contractType?: string;
  unitPrice?: number;
  availability?: string;
  workTime?: string;
  workLocation?: string;
  selfPR?: string;
  profileImageUrl?: string;
  status?: string;
  rating?: number;
  skillSheet?: {
    programmingLanguages?: any;
    frameworks?: any;
    databases?: any;
    cloudServices?: any;
    tools?: any;
    certifications?: any;
    summary?: string;
    totalExperienceYears?: number;
    possibleRoles?: any;
    possiblePhases?: any;
    educationBackground?: any;
    careerSummary?: string;
    specialSkills?: string;
    isCompleted?: boolean;
    [key: string]: unknown;
  };
  engineerProjects?: any[];
  [key: string]: unknown;
}

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const [projectHistory, setProjectHistory] = useState<ProjectHistory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // TanStack Queryを使用してデータを取得
  const { data, isLoading, error } = useEngineerDetail(id);
  const engineerData = data?.data as ExtendedEngineer | undefined;

  console.log("Fetch  Engineer Data", data);
  console.log("Engineer Detail", engineerData);
  
  // プロジェクト履歴APIは未実装のため、engineerDataから直接取得

  useEffect(() => {
    if (engineerData) {
      console.log("Processing engineer data:", engineerData);
      console.log("SkillSheet data:", engineerData.skillSheet);
      
      // スキルシートからプログラミング言語、フレームワーク、データベース等を整形してスキルとして表示
      const allSkills: Skill[] = [];
      let skillIndex = 1;
      
      // プログラミング言語
      if (engineerData.skillSheet?.programmingLanguages) {
        try {
          const languages = engineerData.skillSheet.programmingLanguages;
          if (Array.isArray(languages)) {
            languages.forEach((lang: any) => {
              allSkills.push({
                key: String(skillIndex++),
                category: 'プログラミング言語',
                name: typeof lang === 'string' ? lang : (lang.name || lang),
                level: lang.level || 3,
                experience: lang.experience || lang.years || '-',
                lastUsed: lang.lastUsed || '-',
              });
            });
          }
        } catch (error) {
          console.error('プログラミング言語のパースエラー:', error);
        }
      }
      
      // フレームワーク
      if (engineerData.skillSheet?.frameworks) {
        try {
          const frameworks = engineerData.skillSheet.frameworks;
          if (Array.isArray(frameworks)) {
            frameworks.forEach((fw: any) => {
              allSkills.push({
                key: String(skillIndex++),
                category: 'フレームワーク',
                name: typeof fw === 'string' ? fw : (fw.name || fw),
                level: fw.level || 3,
                experience: fw.experience || fw.years || '-',
                lastUsed: fw.lastUsed || '-',
              });
            });
          }
        } catch (error) {
          console.error('フレームワークのパースエラー:', error);
        }
      }
      
      // データベース
      if (engineerData.skillSheet?.databases) {
        try {
          const databases = engineerData.skillSheet.databases;
          if (Array.isArray(databases)) {
            databases.forEach((db: any) => {
              allSkills.push({
                key: String(skillIndex++),
                category: 'データベース',
                name: typeof db === 'string' ? db : (db.name || db),
                level: db.level || 3,
                experience: db.experience || db.years || '-',
                lastUsed: db.lastUsed || '-',
              });
            });
          }
        } catch (error) {
          console.error('データベースのパースエラー:', error);
        }
      }
      
      // クラウドサービス
      if (engineerData.skillSheet?.cloudServices) {
        try {
          const cloudServices = engineerData.skillSheet.cloudServices;
          if (Array.isArray(cloudServices)) {
            cloudServices.forEach((cloud: any) => {
              allSkills.push({
                key: String(skillIndex++),
                category: 'クラウド',
                name: typeof cloud === 'string' ? cloud : (cloud.name || cloud),
                level: cloud.level || 3,
                experience: cloud.experience || cloud.years || '-',
                lastUsed: cloud.lastUsed || '-',
              });
            });
          }
        } catch (error) {
          console.error('クラウドサービスのパースエラー:', error);
        }
      }
      
      // ツール
      if (engineerData.skillSheet?.tools) {
        try {
          const tools = engineerData.skillSheet.tools;
          if (Array.isArray(tools)) {
            tools.forEach((tool: any) => {
              allSkills.push({
                key: String(skillIndex++),
                category: 'ツール',
                name: typeof tool === 'string' ? tool : (tool.name || tool),
                level: tool.level || 3,
                experience: tool.experience || tool.years || '-',
                lastUsed: tool.lastUsed || '-',
              });
            });
          }
        } catch (error) {
          console.error('ツールのパースエラー:', error);
        }
      }
      
      setSkills(allSkills);
      console.log("Formatted skills:", allSkills);
      
      // 資格情報を整形
      if (engineerData.skillSheet?.certifications) {
        try {
          const certsData = engineerData.skillSheet.certifications;
          
          if (Array.isArray(certsData)) {
            const formattedCerts = certsData.map((cert: any, index: number) => ({
              key: String(index + 1),
              name: typeof cert === 'string' ? cert : (cert.name || cert.certificationName || cert || '不明'),
              issuer: cert.issuer || '-',
              date: cert.date || cert.acquisitionDate || '-',
              expiryDate: cert.expiryDate,
            }));
            setCertifications(formattedCerts);
            console.log("Formatted certifications:", formattedCerts);
          }
        } catch (error) {
          console.error('資格情報のパースエラー:', error);
        }
      }
      
      // プロジェクト履歴を整形（engineerDataから取得）
      if (engineerData.engineerProjects && Array.isArray(engineerData.engineerProjects)) {
        const formattedProjects = engineerData.engineerProjects.map((ep: any, index: number) => ({
          key: String(index + 1),
          projectName: ep.project?.name || '不明',
          client: ep.project?.clientCompany || '不明',
          period: `${ep.startDate || ep.project?.startDate || ''} - ${ep.endDate || ep.project?.endDate || '現在'}`,
          role: ep.role || '不明',
          technologies: ep.technologies || ep.skills || [],
          teamSize: ep.teamSize || ep.project?.teamSize || 0,
          description: ep.description || ep.project?.description || '',
        }));
        setProjectHistory(formattedProjects);
        console.log("Formatted projects:", formattedProjects);
      }
    }
  }, [engineerData]);


  useEffect(() => {
    if (error) {
      console.error('エンジニアデータの取得に失敗しました:', error);
      message.error('データの取得に失敗しました');
    }
  }, [error]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '待機中';
      case 'working':
        return '稼働中';
      case 'pending':
        return '調整中';
      default:
        return status || '不明';
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="読み込み中..." />
      </div>
    );
  }

  if (!engineerData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text>エンジニア情報が見つかりません</Text>
            <br />
            <Button type="primary" onClick={() => navigate('/engineers/list')} style={{ marginTop: '20px' }}>
              一覧に戻る
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
      render: (size) => size ? `${size}名` : '-',
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
            <Descriptions.Item label="エンジニアID">{engineerData.id || '-'}</Descriptions.Item>
            <Descriptions.Item label="氏名">{engineerData.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="フリガナ">{engineerData.nameKana || '-'}</Descriptions.Item>
            <Descriptions.Item label="年齢">{engineerData.age ? `${engineerData.age}歳` : '-'}</Descriptions.Item>
            <Descriptions.Item label="性別">{engineerData.gender || '-'}</Descriptions.Item>
            <Descriptions.Item label="経験年数">{engineerData.experience ? `${engineerData.experience}年` : '-'}</Descriptions.Item>
            <Descriptions.Item label="メールアドレス">
              <Space>
                <MailOutlined />
                {engineerData.email || '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="電話番号">
              <Space>
                <PhoneOutlined />
                {engineerData.phone || '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="最寄駅">{engineerData.nearestStation || '-'}</Descriptions.Item>
            <Descriptions.Item label="入社日">{engineerData.joinDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="学歴">{engineerData.education || '-'}</Descriptions.Item>
            <Descriptions.Item label="契約形態">{engineerData.contractType || '-'}</Descriptions.Item>
            <Descriptions.Item label="単価">
              <span className="text-lg font-bold text-blue-600">
                ¥{(engineerData.unitPrice || 0).toLocaleString()}/月
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="稼働可能日">{engineerData.availability || '-'}</Descriptions.Item>
            <Descriptions.Item label="稼働時間">{engineerData.workTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="勤務地">{engineerData.workLocation || '-'}</Descriptions.Item>
            <Descriptions.Item label="自己PR" span={3}>
              <Paragraph>{engineerData.selfPR || '自己PR情報なし'}</Paragraph>
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
          {projectHistory.length > 0 ? (
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
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">プロジェクト履歴がありません</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: 'スキル',
      icon: <TrophyOutlined />,
      children: (
        <div>
          {skills.length > 0 ? (
            <>
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
                      value={skills.reduce((acc, skill) => acc + skill.level, 0) / skills.length || 0}
                      precision={1}
                      suffix="/ 5.0"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="主要スキル"
                      value={skills[0]?.name || '-'}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="最新技術"
                      value={skills.find(s => s.lastUsed === '2024/01')?.name || '-'}
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
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">スキル情報がありません</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '4',
      label: '資格',
      icon: <SafetyOutlined />,
      children: (
        <div>
          {certifications.length > 0 ? (
            <Table
              columns={certificationColumns}
              dataSource={certifications}
              pagination={false}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">資格情報がありません</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '5',
      label: 'タイムライン',
      icon: <ClockCircleOutlined />,
      children: (
        <Timeline
          items={[
            ...(projectHistory.map((project, index) => ({
              color: index === 0 ? 'green' : 'blue',
              children: (
                <>
                  <p className="font-medium">{project.projectName}プロジェクト</p>
                  <p className="text-gray-500">{project.period}</p>
                </>
              ),
            }))),
            ...(certifications.map(cert => ({
              color: 'gray',
              children: (
                <>
                  <p className="font-medium">{cert.name}取得</p>
                  <p className="text-gray-500">{cert.date}</p>
                </>
              ),
            }))),
            {
              children: (
                <>
                  <p className="font-medium">入社</p>
                  <p className="text-gray-500">{engineerData.joinDate || '不明'}</p>
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engineers/list')}>
          戻る
        </Button>
      </div>

      <Card className="mb-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6} className="text-center">
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              src={engineerData.profileImageUrl}
              className="mb-4" 
            />
            <Title level={3}>{engineerData.name || '-'}</Title>
            <Text type="secondary">{engineerData.id || '-'}</Text>
            <div className="mt-4">
              <Badge
                status={engineerData.status === 'available' ? 'success' : 'processing'}
                text={getStatusText(engineerData.status || 'pending')}
              />
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title="経験年数"
                    value={engineerData.experience || 0}
                    suffix="年"
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title="単価"
                    value={engineerData.unitPrice || 0}
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
                    value={engineerData.rating || 0}
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