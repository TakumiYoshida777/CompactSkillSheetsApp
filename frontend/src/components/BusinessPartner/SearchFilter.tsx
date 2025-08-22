import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Collapse,
  Switch,
  InputNumber,
  Slider,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { BusinessPartnerSearchParams } from '../../services/businessPartnerService';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface SearchFilterProps {
  onSearch: (params: BusinessPartnerSearchParams) => void;
  onReset: () => void;
  loading?: boolean;
  showAdvanced?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onReset,
  loading = false,
  showAdvanced = true,
}) => {
  const [form] = Form.useForm();
  const [expandAdvanced, setExpandAdvanced] = useState(false);

  // 業界カテゴリ
  const industryOptions = [
    { value: 'it', label: 'IT・通信' },
    { value: 'finance', label: '金融・保険' },
    { value: 'manufacturing', label: '製造業' },
    { value: 'retail', label: '小売・流通' },
    { value: 'medical', label: '医療・福祉' },
    { value: 'education', label: '教育' },
    { value: 'government', label: '官公庁・自治体' },
    { value: 'construction', label: '建設・不動産' },
    { value: 'service', label: 'サービス業' },
    { value: 'other', label: 'その他' },
  ];

  // 企業規模
  const companySizeOptions = [
    { value: 'startup', label: 'スタートアップ（〜50名）' },
    { value: 'small', label: '中小企業（51〜300名）' },
    { value: 'medium', label: '中堅企業（301〜1000名）' },
    { value: 'large', label: '大企業（1001名〜）' },
  ];

  // 契約タイプ
  const contractTypeOptions = [
    { value: 'ses', label: 'SES契約' },
    { value: 'contract', label: '請負契約' },
    { value: 'dispatch', label: '派遣契約' },
    { value: 'outsourcing', label: '業務委託' },
    { value: 'permanent', label: '正社員紹介' },
  ];

  // 都道府県
  const prefectureOptions = [
    { value: 'tokyo', label: '東京都' },
    { value: 'osaka', label: '大阪府' },
    { value: 'aichi', label: '愛知県' },
    { value: 'kanagawa', label: '神奈川県' },
    { value: 'fukuoka', label: '福岡県' },
    { value: 'hokkaido', label: '北海道' },
    { value: 'miyagi', label: '宮城県' },
    { value: 'hiroshima', label: '広島県' },
    { value: 'kyoto', label: '京都府' },
    { value: 'hyogo', label: '兵庫県' },
  ];

  const handleSearch = () => {
    form.validateFields().then(values => {
      const params: BusinessPartnerSearchParams = {
        keyword: values.keyword,
        companyName: values.companyName,
        industry: values.industry,
        status: values.status,
        prefecture: values.prefecture,
        contractType: values.contractType,
        companySize: values.companySize,
        minEmployeeCount: values.employeeRange?.[0],
        maxEmployeeCount: values.employeeRange?.[1],
        registeredFrom: values.registeredDateRange?.[0]?.format('YYYY-MM-DD'),
        registeredTo: values.registeredDateRange?.[1]?.format('YYYY-MM-DD'),
        hasActiveContract: values.hasActiveContract,
        tags: values.tags,
      };
      
      // 空の値を除外
      const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key as keyof BusinessPartnerSearchParams] = value;
        }
        return acc;
      }, {} as BusinessPartnerSearchParams);
      
      onSearch(filteredParams);
    });
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
      >
        {/* 基本検索 */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="keyword"
              label="キーワード検索"
            >
              <Input
                placeholder="会社名、担当者名など"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="companyName"
              label="会社名"
            >
              <Input
                placeholder="会社名で検索"
                prefix={<TeamOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="industry"
              label="業界"
            >
              <Select
                placeholder="業界を選択"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {industryOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="status"
              label="ステータス"
            >
              <Select
                placeholder="ステータス"
                allowClear
              >
                <Option value="active">
                  <Tag color="success">アクティブ</Tag>
                </Option>
                <Option value="inactive">
                  <Tag color="default">非アクティブ</Tag>
                </Option>
                <Option value="pending">
                  <Tag color="processing">審査中</Tag>
                </Option>
                <Option value="suspended">
                  <Tag color="error">停止中</Tag>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 詳細検索 */}
        {showAdvanced && (
          <Collapse
            ghost
            activeKey={expandAdvanced ? ['advanced'] : []}
            onChange={(keys) => setExpandAdvanced(keys.includes('advanced'))}
          >
            <Panel
              header={
                <Space>
                  <FilterOutlined />
                  詳細条件
                </Space>
              }
              key="advanced"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="prefecture"
                    label="所在地"
                  >
                    <Select
                      placeholder="都道府県を選択"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      mode="multiple"
                    >
                      {prefectureOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          <Space>
                            <EnvironmentOutlined />
                            {option.label}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="contractType"
                    label="契約タイプ"
                  >
                    <Select
                      placeholder="契約タイプを選択"
                      allowClear
                      mode="multiple"
                    >
                      {contractTypeOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="companySize"
                    label="企業規模"
                  >
                    <Select
                      placeholder="企業規模を選択"
                      allowClear
                    >
                      {companySizeOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="employeeRange"
                    label="稼働エンジニア数"
                  >
                    <Slider
                      range
                      min={0}
                      max={100}
                      marks={{
                        0: '0',
                        25: '25',
                        50: '50',
                        75: '75',
                        100: '100+',
                      }}
                      tipFormatter={(value) => `${value}名`}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="registeredDateRange"
                    label="登録期間"
                  >
                    <RangePicker
                      style={{ width: '100%' }}
                      placeholder={['開始日', '終了日']}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="hasActiveContract"
                    label="契約状態"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="契約中のみ"
                      unCheckedChildren="全て"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24}>
                  <Form.Item
                    name="tags"
                    label="タグ"
                  >
                    <Select
                      mode="tags"
                      placeholder="タグを入力（Enterで追加）"
                      style={{ width: '100%' }}
                    >
                      <Option value="priority">優先取引先</Option>
                      <Option value="large_scale">大規模案件</Option>
                      <Option value="long_term">長期契約</Option>
                      <Option value="new_client">新規取引先</Option>
                      <Option value="remote">リモート可</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        )}

        {/* 検索ボタン */}
        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button
              onClick={handleReset}
              icon={<ClearOutlined />}
            >
              クリア
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              検索
            </Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
};

export default SearchFilter;