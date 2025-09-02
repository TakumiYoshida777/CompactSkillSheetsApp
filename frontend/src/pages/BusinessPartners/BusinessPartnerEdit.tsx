import { errorLog } from '../../utils/logger';
import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  DatePicker,
  InputNumber,
  Spin,
  Alert,
  Tag,
  Switch,
} from 'antd';
import {
  SaveOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useBusinessPartnerStore } from '../../stores/useBusinessPartnerStore';
import type { UpdateBusinessPartnerDto } from '../../services/businessPartnerService';
import { createValidationRules } from '../../utils/validation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BusinessPartnerEdit: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    currentPartner,
    isLoading,
    error,
    fetchBusinessPartner,
    updateBusinessPartner,
    clearError,
  } = useBusinessPartnerStore();
  
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // 業界リスト
  const industries = [
    'IT・通信', '金融・保険', '製造業', '小売・流通', '医療・福祉',
    '建設・不動産', '運輸・物流', 'サービス業', '教育', '官公庁・公共',
    'エネルギー', 'メディア・広告', 'コンサルティング', 'その他'
  ];

  // 契約タイプ
  const contractTypes = {
    basic: 'ベーシック',
    premium: 'プレミアム',
    enterprise: 'エンタープライズ',
  };

  // データ読み込み
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      await fetchBusinessPartner(id!);
    } catch (error) {
      message.error('取引先情報の読み込みに失敗しました');
      navigate('/business-partners/list');
    }
  };

  // フォームに値を設定
  useEffect(() => {
    if (currentPartner) {
      const { partner } = currentPartner;
      form.setFieldsValue({
        companyName: partner.companyName,
        companyNameKana: partner.companyNameKana,
        address: partner.address,
        phoneNumber: partner.phoneNumber,
        email: partner.email,
        websiteUrl: partner.websiteUrl,
        establishedDate: partner.establishedDate ? dayjs(partner.establishedDate) : undefined,
        capitalStock: partner.capitalStock,
        numberOfEmployees: partner.numberOfEmployees,
        businessDescription: partner.businessDescription,
        contractType: partner.contractType,
        contractStartDate: partner.contractStartDate ? dayjs(partner.contractStartDate) : undefined,
        contractEndDate: partner.contractEndDate ? dayjs(partner.contractEndDate) : undefined,
      });
      setIsActive(partner.isActive);
    }
  }, [currentPartner, form]);

  // エラー表示
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const updateData: UpdateBusinessPartnerDto = {
        companyName: values.companyName,
        companyNameKana: values.companyNameKana,
        address: values.address,
        phoneNumber: values.phoneNumber,
        email: values.email,
        websiteUrl: values.websiteUrl,
        establishedDate: values.establishedDate ? dayjs(values.establishedDate).format('YYYY-MM-DD') : undefined,
        capitalStock: values.capitalStock,
        numberOfEmployees: values.numberOfEmployees,
        businessDescription: values.businessDescription,
        contractType: values.contractType,
        contractStartDate: values.contractStartDate ? dayjs(values.contractStartDate).format('YYYY-MM-DD') : undefined,
        contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : undefined,
        isActive,
      };

      await updateBusinessPartner(id!, updateData);
      message.success('取引先情報を更新しました');
      navigate('/business-partners/list');
    } catch (error: any) {
      errorLog('更新エラー:', error);
      message.error(error.response?.data?.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !currentPartner) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="読み込み中..." />
      </div>
    );
  }

  if (!currentPartner) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="エラー"
          description="取引先情報が見つかりません"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/business-partners/list')}
            style={{ marginBottom: 16 }}
          >
            戻る
          </Button>
          
          <Title level={3}>
            <BankOutlined /> 取引先企業編集
          </Title>
          
          <Space>
            <Text>ステータス:</Text>
            <Switch
              checked={isActive}
              onChange={setIsActive}
              checkedChildren="アクティブ"
              unCheckedChildren="非アクティブ"
            />
            {!isActive && (
              <Tag color="warning">この取引先は非アクティブです</Tag>
            )}
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider orientation="left">基本情報</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="企業名"
                rules={createValidationRules.required('企業名')}
              >
                <Input 
                  prefix={<BankOutlined />} 
                  placeholder="株式会社○○"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="companyNameKana"
                label="企業名（カナ）"
                rules={createValidationRules.katakana}
              >
                <Input 
                  placeholder="カブシキガイシャ○○"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="電話番号"
                rules={createValidationRules.phone}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="03-1234-5678"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="メールアドレス"
                rules={createValidationRules.email}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="contact@example.com"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="所在地"
            rules={createValidationRules.required('所在地')}
          >
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="東京都千代田区○○"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="websiteUrl"
                label="Webサイト"
                rules={createValidationRules.url}
              >
                <Input 
                  prefix={<GlobalOutlined />} 
                  placeholder="https://example.com"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="establishedDate"
                label="設立日"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="設立日を選択"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capitalStock"
                label="資本金（円）"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\¥\s?|(,*)/g, '') as any}
                  placeholder="10,000,000"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberOfEmployees"
                label="従業員数"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  placeholder="100"
                  addonAfter="名"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="businessDescription"
            label="事業内容"
          >
            <TextArea 
              rows={4} 
              placeholder="主な事業内容を入力してください"
            />
          </Form.Item>

          <Divider orientation="left">契約情報</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contractType"
                label="契約タイプ"
                rules={createValidationRules.required('契約タイプ')}
              >
                <Select placeholder="選択してください" size="large">
                  {Object.entries(contractTypes).map(([value, label]) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contractStartDate"
                label="契約開始日"
                rules={createValidationRules.required('契約開始日')}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="契約開始日を選択"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contractEndDate"
                label="契約終了日"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="契約終了日を選択"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end">
            <Space>
              <Button
                size="large"
                onClick={() => navigate('/business-partners/list')}
              >
                キャンセル
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={saving || isLoading}
                htmlType="submit"
              >
                更新する
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default BusinessPartnerEdit;