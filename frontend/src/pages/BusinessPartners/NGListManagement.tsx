import { errorLog } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Tooltip,
  Popconfirm,
  Alert,
  Row,
  Col,
  DatePicker,
  Empty,
  Badge,
  Avatar,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  StopOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessPartnerStore } from '../../stores/useBusinessPartnerStore';
import EngineerSelector from '../../components/BusinessPartner/EngineerSelector';
import type { Engineer } from '../../components/BusinessPartner/EngineerSelector';
import type { NGListEntry, CreateNGListEntryDto } from '../../services/businessPartnerService';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NGListManagement: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const {
    currentPartner,
    ngList,
    isLoading,
    error,
    fetchBusinessPartner,
    fetchNGList,
    addToNGList,
    removeFromNGList,
    clearError,
  } = useBusinessPartnerStore();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [engineerSelectorVisible, setEngineerSelectorVisible] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<NGListEntry[]>([]);

  // データ読み込み
  useEffect(() => {
    if (partnerId) {
      loadData();
    }
  }, [partnerId]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchBusinessPartner(partnerId!),
        fetchNGList(partnerId!),
      ]);
    } catch (error) {
      message.error('データの読み込みに失敗しました');
    }
  };

  // エラー表示
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  // 検索フィルタリング
  useEffect(() => {
    if (ngList) {
      const filtered = ngList.filter(entry => 
        entry.engineerName.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.reasonDetail?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [ngList, searchText]);

  // エンジニア選択後の処理
  const handleEngineerSelect = (engineerIds: string[]) => {
    if (engineerIds.length > 0) {
      // モックエンジニアデータから選択されたエンジニアを取得
      const mockEngineers: Engineer[] = [
        { id: '1', name: '山田 太郎', skills: ['React', 'TypeScript'], status: 'available', experience: 5 },
        { id: '2', name: '佐藤 花子', skills: ['Java', 'Spring Boot'], status: 'working', experience: 7 },
        { id: '3', name: '鈴木 一郎', skills: ['Python', 'Django'], status: 'waiting', experience: 3 },
        { id: '4', name: '田中 次郎', skills: ['Vue.js', 'PHP'], status: 'available', experience: 4 },
        { id: '5', name: '伊藤 三郎', skills: ['C#', '.NET'], status: 'working', experience: 8 },
        { id: '6', name: '高橋 四郎', skills: ['Go', 'Kubernetes'], status: 'available', experience: 6 },
      ];
      
      const selected = mockEngineers.find(e => e.id === engineerIds[0]);
      if (selected) {
        setSelectedEngineer(selected);
        form.setFieldValue('engineerName', selected.name);
      }
    }
    setEngineerSelectorVisible(false);
  };

  // NGリストに追加
  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      
      const data: CreateNGListEntryDto = {
        engineerId: selectedEngineer?.id || values.engineerId,
        engineerName: values.engineerName,
        reason: values.reason,
        reasonDetail: values.reasonDetail,
        blockedDate: values.blockedDate ? values.blockedDate.format('YYYY-MM-DD') : undefined,
        blockedBy: 'current_user', // 実際のユーザー名を設定
      };
      
      await addToNGList(partnerId!, data);
      message.success('NGリストに追加しました');
      setAddModalVisible(false);
      form.resetFields();
      setSelectedEngineer(null);
    } catch (error) {
      if (error.errorFields) {
        errorLog('Validation failed:', error);
      } else {
        message.error(error.response?.data?.message || 'NGリストへの追加に失敗しました');
      }
    }
  };

  // NGリストから削除
  const handleRemove = async (entryId: string) => {
    try {
      await removeFromNGList(partnerId!, entryId);
      message.success('NGリストから削除しました');
    } catch (error) {
      message.error(error.response?.data?.message || '削除に失敗しました');
    }
  };

  // NG理由のカテゴリ
  const ngReasonOptions = [
    { value: 'skill_mismatch', label: 'スキル不一致' },
    { value: 'communication_issue', label: 'コミュニケーション問題' },
    { value: 'performance_issue', label: 'パフォーマンス問題' },
    { value: 'attitude_issue', label: '勤務態度問題' },
    { value: 'health_issue', label: '健康上の理由' },
    { value: 'contract_violation', label: '契約違反' },
    { value: 'client_request', label: 'クライアント要請' },
    { value: 'other', label: 'その他' },
  ];

  const getReasonTagColor = (reason: string) => {
    const colorMap: Record<string, string> = {
      skill_mismatch: 'blue',
      communication_issue: 'orange',
      performance_issue: 'red',
      attitude_issue: 'volcano',
      health_issue: 'green',
      contract_violation: 'magenta',
      client_request: 'purple',
      other: 'default',
    };
    return colorMap[reason] || 'default';
  };

  const getReasonLabel = (reason: string) => {
    const option = ngReasonOptions.find(opt => opt.value === reason);
    return option?.label || reason;
  };

  const columns: ColumnsType<NGListEntry> = [
    {
      title: 'エンジニア',
      dataIndex: 'engineerName',
      key: 'engineerName',
      width: 200,
      render: (name: string, record: NGListEntry) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.engineerId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'NG理由',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => (
        <Tag color={getReasonTagColor(reason)}>
          {getReasonLabel(reason)}
        </Tag>
      ),
    },
    {
      title: '詳細理由',
      dataIndex: 'reasonDetail',
      key: 'reasonDetail',
      ellipsis: true,
      render: (detail: string) => (
        <Tooltip title={detail}>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ margin: 0, maxWidth: 300 }}
          >
            {detail || '-'}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: '登録日',
      dataIndex: 'blockedDate',
      key: 'blockedDate',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {date ? new Date(date).toLocaleDateString('ja-JP') : '-'}
        </Space>
      ),
    },
    {
      title: '登録者',
      dataIndex: 'blockedBy',
      key: 'blockedBy',
      width: 120,
      render: (user: string) => (
        <Space>
          <UserOutlined />
          <Text>{user}</Text>
        </Space>
      ),
    },
    {
      title: 'アクション',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record: NGListEntry) => (
        <Popconfirm
          title="NGリストから削除"
          description={`${record.engineerName}をNGリストから削除しますか？`}
          onConfirm={() => handleRemove(record.id)}
          okText="削除"
          cancelText="キャンセル"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="NGリストから削除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <StopOutlined /> NGリスト管理
            </Title>
            {currentPartner && (
              <Text type="secondary">
                {currentPartner.partner.companyName}
              </Text>
            )}
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="エンジニア名や理由で検索"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                NGリストに追加
              </Button>
            </Space>
          </Col>
        </Row>

        <Alert
          message="NGリストについて"
          description={
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>NGリストに登録されたエンジニアは、取引先企業に表示されません</li>
              <li>過去のトラブルや相性の問題などを理由に登録できます</li>
              <li>NGリストは取引先企業ごとに個別管理されます</li>
              <li>登録理由は社内管理用で、エンジニア本人には通知されません</li>
            </ul>
          }
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        {filteredData.length === 0 && !searchText ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="NGリストは空です"
            style={{ padding: '40px 0' }}
          >
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              最初のエントリを追加
            </Button>
          </Empty>
        ) : (
          <>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Badge
                  count={filteredData.length}
                  style={{ backgroundColor: '#ff4d4f' }}
                >
                  <Text strong>NG登録エンジニア</Text>
                </Badge>
              </Col>
              <Col>
                <Text type="secondary">
                  {searchText && `検索結果: ${filteredData.length} 件`}
                </Text>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={isLoading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `全 ${total} 件`,
                defaultPageSize: 10,
              }}
              scroll={{ x: 1000 }}
            />
          </>
        )}
      </Card>

      {/* NGリスト追加モーダル */}
      <Modal
        title={
          <Space>
            <StopOutlined />
            NGリストに追加
          </Space>
        }
        open={addModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
          setSelectedEngineer(null);
        }}
        width={600}
        confirmLoading={isLoading}
        okText="追加"
        cancelText="キャンセル"
      >
        <Alert
          message="NGリスト登録の注意事項"
          description="一度NGリストに登録すると、該当エンジニアは取引先企業の画面に表示されなくなります。慎重に判断してください。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="エンジニア選択"
            required
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<UserOutlined />}
                onClick={() => setEngineerSelectorVisible(true)}
                block
              >
                エンジニアを選択
              </Button>
              {selectedEngineer && (
                <Alert
                  message={`選択中: ${selectedEngineer.name}`}
                  type="info"
                  showIcon={false}
                  closable
                  onClose={() => {
                    setSelectedEngineer(null);
                    form.setFieldValue('engineerName', '');
                  }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name="engineerName"
            label="エンジニア名"
            rules={[{ required: true, message: 'エンジニア名を入力してください' }]}
            hidden={!!selectedEngineer}
          >
            <Input
              placeholder="手動でエンジニア名を入力"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="engineerId"
            label="エンジニアID"
            hidden={!!selectedEngineer}
          >
            <Input
              placeholder="エンジニアID（オプション）"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="NG理由カテゴリ"
            rules={[{ required: true, message: 'NG理由を選択してください' }]}
          >
            <Select placeholder="理由を選択してください">
              {ngReasonOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="reasonDetail"
            label="詳細理由"
            rules={[{ required: true, message: '詳細理由を入力してください' }]}
          >
            <TextArea
              rows={4}
              placeholder="NGリストに登録する詳細な理由を記入してください。
例：プロジェクト中の度重なる遅刻、技術的な問題でクライアントからクレーム等"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="blockedDate"
            label="発生日"
            initialValue={dayjs()}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="問題が発生した日付"
            />
          </Form.Item>

          <Alert
            message={
              <Space>
                <HistoryOutlined />
                履歴管理
              </Space>
            }
            description="NGリストへの登録履歴は自動的に記録され、後から確認できます"
            type="info"
            showIcon={false}
          />
        </Form>
      </Modal>

      {/* エンジニア選択モーダル */}
      <EngineerSelector
        visible={engineerSelectorVisible}
        onOk={handleEngineerSelect}
        onCancel={() => setEngineerSelectorVisible(false)}
        mode="single"
        title="NGリストに追加するエンジニアを選択"
      />
    </div>
  );
};

export default NGListManagement;