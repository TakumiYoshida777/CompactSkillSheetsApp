import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  Alert,
  Tag,
  Divider,
  Row,
  Col,
  Typography,
  message,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  ProjectOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useCreateOffer } from '@/hooks/useOfferMutations';
import type { Engineer } from '@/types/offer';
import styles from './OfferBoard.module.css';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

interface OfferDialogProps {
  visible: boolean;
  onClose: () => void;
  selectedEngineers: string[];
  engineers: Engineer[];
}

export const OfferDialog: React.FC<OfferDialogProps> = ({
  visible,
  onClose,
  selectedEngineers,
  engineers,
}) => {
  const [form] = Form.useForm();
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const createOfferMutation = useCreateOffer();

  const requiredSkills = [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'Java',
    'AWS',
    'Docker',
    'Kubernetes',
    'PostgreSQL',
    'MongoDB',
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const offerData = {
        engineer_ids: selectedEngineers,
        project_name: values.projectName,
        project_period_start: values.projectPeriod[0].format('YYYY-MM-DD'),
        project_period_end: values.projectPeriod[1].format('YYYY-MM-DD'),
        required_skills: values.requiredSkills,
        project_description: values.projectDescription,
        location: values.location,
        rate_min: values.rateMin,
        rate_max: values.rateMax,
        remarks: values.remarks,
        send_email: sendEmail,
      };

      await createOfferMutation.mutateAsync(offerData);
      message.success('オファーを送信しました');
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('オファーの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SendOutlined />
          オファー送信
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          キャンセル
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          オファー送信
        </Button>,
      ]}
      data-testid="offer-dialog"
    >
      <div className={styles.offerDialog}>
        <Alert
          message={`選択したエンジニア: ${selectedEngineers.length}名`}
          type="info"
          showIcon
          className={styles.selectedInfo}
        />

        <div className={styles.selectedEngineers}>
          {engineers.map((engineer) => (
            <Tag key={engineer.id} icon={<UserOutlined />}>
              {engineer.name}
            </Tag>
          ))}
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            location: '東京',
          }}
        >
          <Title level={5}>
            <ProjectOutlined /> 案件情報
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="案件名"
                name="projectName"
                rules={[{ required: true, message: '案件名を入力してください' }]}
              >
                <Input
                  placeholder="ECサイトリニューアルプロジェクト"
                  prefix={<ProjectOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="案件期間"
                name="projectPeriod"
                rules={[{ required: true, message: '案件期間を選択してください' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['開始日', '終了日']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="必要スキル"
            name="requiredSkills"
            rules={[{ required: true, message: '必要スキルを選択してください' }]}
          >
            <Select
              mode="multiple"
              placeholder="必要なスキルを選択"
              style={{ width: '100%' }}
            >
              {requiredSkills.map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="案件詳細"
            name="projectDescription"
            rules={[{ required: true, message: '案件詳細を入力してください' }]}
          >
            <TextArea
              rows={4}
              placeholder="案件の詳細な説明を入力してください。&#10;・開発内容&#10;・技術要件&#10;・チーム構成&#10;・その他特記事項"
            />
          </Form.Item>

          <Divider />

          <Title level={5}>
            <DollarOutlined /> 条件
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="勤務地"
                name="location"
                rules={[{ required: true, message: '勤務地を入力してください' }]}
              >
                <Input
                  placeholder="東京都渋谷区"
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="最低単価（万円/月）"
                name="rateMin"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={200}
                  placeholder="50"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="最高単価（万円/月）"
                name="rateMax"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={200}
                  placeholder="80"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="備考"
            name="remarks"
          >
            <TextArea
              rows={3}
              placeholder="その他、エンジニアに伝えたい情報があれば入力してください"
            />
          </Form.Item>

          <Divider />

          <div className={styles.emailOption}>
            <Space>
              <MailOutlined />
              <Text>メール通知を送信する</Text>
              <Switch
                checked={sendEmail}
                onChange={setSendEmail}
              />
            </Space>
            {sendEmail && (
              <Alert
                message="選択したエンジニアの登録メールアドレスにオファー通知が送信されます"
                type="info"
                showIcon
                className={styles.emailAlert}
              />
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
};