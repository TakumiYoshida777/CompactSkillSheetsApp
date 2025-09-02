import { debugLog } from '../../utils/logger';
import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  Space,
  Button,
  Rate,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  EditOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const SkillSheetPreview: React.FC = () => {
  const navigate = useNavigate();

  // モックデータ（実際にはストアから取得）
  const skillData = {
    name: 'テスト エンジニア',
    summary: 'フルスタックエンジニアとして5年以上の経験があります。React、Node.js、AWSを使用した大規模Webアプリケーションの開発に従事してきました。',
    totalExperience: 5,
    education: '大学卒業',
    certifications: ['基本情報技術者', 'AWS認定ソリューションアーキテクト'],
    programmingLanguages: [
      { name: 'JavaScript', level: 5, years: 5 },
      { name: 'TypeScript', level: 4, years: 3 },
      { name: 'Python', level: 3, years: 2 },
    ],
    frameworks: [
      { name: 'React', level: 5, years: 4 },
      { name: 'Node.js', level: 4, years: 3 },
      { name: 'Express', level: 4, years: 3 },
    ],
    databases: [
      { name: 'PostgreSQL', level: 4, years: 3 },
      { name: 'MongoDB', level: 3, years: 2 },
      { name: 'Redis', level: 3, years: 2 },
    ],
    cloudServices: [
      { name: 'AWS', level: 4, years: 3 },
      { name: 'Docker', level: 4, years: 3 },
    ],
    possibleRoles: ['SE', 'PL'],
    possiblePhases: ['requirement', 'basic_design', 'development', 'testing'],
  };

  const handleEdit = () => {
    navigate('engineer/skill-sheet');
  };

  const handleDownload = () => {
    // PDF出力処理
    debugLog('Download PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const roleLabels: { [key: string]: string } = {
    'PG': 'プログラマー',
    'SE': 'システムエンジニア',
    'PL': 'プロジェクトリーダー',
    'PM': 'プロジェクトマネージャー',
    'EM': 'エンジニアリングマネージャー',
    'TL': 'テックリード',
  };

  const phaseLabels: { [key: string]: string } = {
    'requirement': '要件定義',
    'basic_design': '基本設計',
    'detailed_design': '詳細設計',
    'development': '開発・実装',
    'testing': 'テスト',
    'deployment': 'リリース',
    'maintenance': '保守・運用',
    'support': 'サポート',
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 112px)' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('engineer/skill-sheet')}
          >
            編集に戻る
          </Button>
          <Title level={2} style={{ margin: 0 }}>スキルシートプレビュー</Title>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            編集
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            印刷
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            PDF出力
          </Button>
        </Space>
      </div>

      {/* メインコンテンツ */}
      <Card className="skill-sheet-preview-card">
        {/* 基本情報 */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>基本情報</Title>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Text type="secondary">氏名</Text>
              <div><Text strong style={{ fontSize: 16 }}>{skillData.name}</Text></div>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">総経験年数</Text>
              <div><Text strong style={{ fontSize: 16 }}>{skillData.totalExperience}年</Text></div>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">最終学歴</Text>
              <div><Text strong>{skillData.education}</Text></div>
            </Col>
            <Col xs={24} md={12}>
              <Text type="secondary">保有資格</Text>
              <div>
                <Space wrap>
                  {skillData.certifications.map(cert => (
                    <Tag key={cert} color="blue">{cert}</Tag>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">自己PR</Text>
            <Paragraph style={{ marginTop: 8 }}>
              {skillData.summary}
            </Paragraph>
          </div>
        </div>

        <Divider />

        {/* 技術スキル */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>技術スキル</Title>
          
          {/* プログラミング言語 */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>プログラミング言語</Title>
            <Row gutter={[16, 16]}>
              {skillData.programmingLanguages.map((lang) => (
                <Col xs={24} sm={12} md={8} key={lang.name}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{lang.name}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Rate disabled value={lang.level} />
                        <Tag>{lang.years}年</Tag>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* フレームワーク */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>フレームワーク・ライブラリ</Title>
            <Row gutter={[16, 16]}>
              {skillData.frameworks.map((fw) => (
                <Col xs={24} sm={12} md={8} key={fw.name}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{fw.name}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Rate disabled value={fw.level} />
                        <Tag>{fw.years}年</Tag>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* データベース */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>データベース</Title>
            <Row gutter={[16, 16]}>
              {skillData.databases.map((db) => (
                <Col xs={24} sm={12} md={8} key={db.name}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{db.name}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Rate disabled value={db.level} />
                        <Tag>{db.years}年</Tag>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* クラウドサービス */}
          <div>
            <Title level={4}>クラウドサービス・インフラ</Title>
            <Row gutter={[16, 16]}>
              {skillData.cloudServices.map((cloud) => (
                <Col xs={24} sm={12} md={8} key={cloud.name}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{cloud.name}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Rate disabled value={cloud.level} />
                        <Tag>{cloud.years}年</Tag>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        <Divider />

        {/* 対応可能ロール・フェーズ */}
        <div>
          <Title level={3}>対応可能ロール・フェーズ</Title>
          
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">対応可能ロール</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {skillData.possibleRoles.map(role => (
                  <Tag key={role} color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {roleLabels[role] || role}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>

          <div>
            <Text type="secondary">対応可能フェーズ</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {skillData.possiblePhases.map(phase => (
                  <Tag key={phase} color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {phaseLabels[phase] || phase}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SkillSheetPreview;