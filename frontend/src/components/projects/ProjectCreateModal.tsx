import { errorLog } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  ProjectOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import axios from '../../lib/axios';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ProjectCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (project: any) => void;
}

interface ProjectFormData {
  name: string;
  clientCompany: string;
  projectScale: string;
  businessType: string;
  systemType: string;
  startDate: Dayjs;
  endDate?: Dayjs;
  contractAmount?: number;
  salesAmount?: number;
  costAmount?: number;
  teamSize?: number;
  description?: string;
  developmentMethodology?: string;
  requiredSkills?: string[];
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profitAmount, setProfitAmount] = useState<number>(0);
  const [profitRate, setProfitRate] = useState<number>(0);

  // プロジェクト規模の選択肢
  const projectScales = [
    { value: 'SMALL', label: '小規模（〜5名）' },
    { value: 'MEDIUM', label: '中規模（6〜20名）' },
    { value: 'LARGE', label: '大規模（21〜50名）' },
    { value: 'EXTRA_LARGE', label: '超大規模（51名〜）' },
  ];

  // 業務種別の選択肢
  const businessTypes = [
    '金融・保険',
    '製造業',
    '流通・小売',
    '情報通信',
    'エネルギー・インフラ',
    '医療・ヘルスケア',
    '教育',
    '公共・官公庁',
    'その他',
  ];

  // システム種別の選択肢
  const systemTypes = [
    'Webアプリケーション',
    'モバイルアプリケーション',
    '業務システム',
    'ECサイト',
    '基幹システム',
    'AI・機械学習',
    'IoT',
    'ブロックチェーン',
    'インフラ構築',
    'その他',
  ];

  // 開発手法の選択肢
  const methodologies = [
    'ウォーターフォール',
    'アジャイル（スクラム）',
    'アジャイル（カンバン）',
    'DevOps',
    'ハイブリッド',
    'その他',
  ];

  // 必要スキルの選択肢
  const skillOptions = [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Python',
    'Django',
    'Java',
    'Spring',
    'C#',
    '.NET',
    'PHP',
    'Laravel',
    'Ruby',
    'Rails',
    'Go',
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
  ];

  // 利益計算
  useEffect(() => {
    const salesAmount = form.getFieldValue('salesAmount') || 0;
    const costAmount = form.getFieldValue('costAmount') || 0;
    const profit = salesAmount - costAmount;
    const rate = salesAmount > 0 ? (profit / salesAmount) * 100 : 0;
    
    setProfitAmount(profit);
    setProfitRate(Math.round(rate * 10) / 10);
  }, [form.getFieldValue('salesAmount'), form.getFieldValue('costAmount')]);

  // フォーム送信
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // データ整形
      const projectData = {
        name: values.name,
        clientCompany: values.clientCompany,
        projectScale: values.projectScale,
        businessType: values.businessType,
        systemType: values.systemType,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        contractAmount: values.contractAmount,
        salesAmount: values.salesAmount,
        costAmount: values.costAmount,
        profitAmount: profitAmount,
        profitRate: profitRate,
        teamSize: values.teamSize,
        description: values.description,
        developmentMethodology: values.developmentMethodology,
        requiredSkills: values.requiredSkills,
        isActive: true,
      };

      // API呼び出し
      const response = await axios.post('v1/projects', projectData);
      
      message.success('プロジェクトを作成しました');
      form.resetFields();
      onSuccess(response.data);
    } catch (error) {
      errorLog('Project creation failed:', error);
      const errorMessage = error.response?.data?.message || 
                          'プロジェクトの作成に失敗しました';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // モーダルクローズ時の処理
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 金額フィールドの変更ハンドラ
  const handleAmountChange = () => {
    const salesAmount = form.getFieldValue('salesAmount') || 0;
    const costAmount = form.getFieldValue('costAmount') || 0;
    const profit = salesAmount - costAmount;
    const rate = salesAmount > 0 ? (profit / salesAmount) * 100 : 0;
    
    setProfitAmount(profit);
    setProfitRate(Math.round(rate * 10) / 10);
  };

  return (
    <Modal
      title={
        <Space>
          <ProjectOutlined />
          <span>新規プロジェクト作成</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          キャンセル
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          作成
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Divider orientation="left">基本情報</Divider>
        
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="プロジェクト名"
              rules={[{ required: true, message: 'プロジェクト名を入力してください' }]}
            >
              <Input placeholder="例：ECサイトリニューアルプロジェクト" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="clientCompany"
              label="クライアント企業"
              rules={[{ required: true, message: 'クライアント企業を入力してください' }]}
            >
              <Input placeholder="例：株式会社ABC" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="projectScale"
              label="プロジェクト規模"
              rules={[{ required: true, message: 'プロジェクト規模を選択してください' }]}
            >
              <Select placeholder="規模を選択">
                {projectScales.map(scale => (
                  <Option key={scale.value} value={scale.value}>
                    {scale.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="businessType"
              label="業務種別"
              rules={[{ required: true, message: '業務種別を選択してください' }]}
            >
              <Select placeholder="業務種別を選択">
                {businessTypes.map(type => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="systemType"
              label="システム種別"
              rules={[{ required: true, message: 'システム種別を選択してください' }]}
            >
              <Select placeholder="システム種別を選択">
                {systemTypes.map(type => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">プロジェクト期間</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="dateRange"
              label="プロジェクト期間"
              rules={[{ required: true, message: 'プロジェクト期間を選択してください' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['開始日', '終了日']}
                format="YYYY/MM/DD"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="teamSize"
              label="チーム規模（人数）"
            >
              <InputNumber
                min={1}
                max={999}
                style={{ width: '100%' }}
                placeholder="10"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="developmentMethodology"
              label="開発手法"
            >
              <Select placeholder="選択">
                {methodologies.map(method => (
                  <Option key={method} value={method}>
                    {method}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">予算・売上情報</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="contractAmount"
              label="契約金額（円）"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                placeholder="10,000,000"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="salesAmount"
              label="売上金額（円）"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                placeholder="12,000,000"
                onChange={handleAmountChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="costAmount"
              label="原価金額（円）"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                placeholder="8,000,000"
                onChange={handleAmountChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="利益額（自動計算）">
              <Input
                value={`¥ ${profitAmount.toLocaleString()}`}
                disabled
                style={{
                  color: profitAmount >= 0 ? '#52c41a' : '#ff4d4f',
                  fontWeight: 'bold',
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="利益率（自動計算）">
              <Input
                value={`${profitRate}%`}
                disabled
                style={{
                  color: profitRate >= 20 ? '#52c41a' : profitRate >= 10 ? '#faad14' : '#ff4d4f',
                  fontWeight: 'bold',
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">詳細情報</Divider>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="requiredSkills"
              label="必要スキル"
            >
              <Select
                mode="multiple"
                placeholder="必要なスキルを選択"
                style={{ width: '100%' }}
              >
                {skillOptions.map(skill => (
                  <Option key={skill} value={skill}>
                    {skill}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="description"
              label="プロジェクト概要"
            >
              <TextArea
                rows={4}
                placeholder="プロジェクトの概要、背景、目的などを記載してください"
                maxLength={2000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProjectCreateModal;