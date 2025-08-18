import React, { useState, useCallback } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import './styles.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

export interface EngineerSearchCriteria {
  keyword?: string;
  skills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  availableFrom?: string;
  availableTo?: string;
  status?: ('AVAILABLE' | 'PENDING' | 'ASSIGNED')[];
  roles?: string[];
  phases?: string[];
}

interface EngineerSearchProps {
  onSearch: (criteria: EngineerSearchCriteria) => void;
  loading?: boolean;
  showAdvanced?: boolean;
  initialValues?: EngineerSearchCriteria;
  availableSkills?: string[];
  availableRoles?: string[];
  availablePhases?: string[];
}

const defaultSkills = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Java', 'Spring', 'Python', 'Django', 'Ruby', 'Rails',
  'PHP', 'Laravel', 'C#', '.NET', 'Go', 'Rust',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
];

const defaultRoles = ['PG', 'PL', 'PM', 'EM', 'アーキテクト', 'リードエンジニア'];

const defaultPhases = [
  '要件定義', '基本設計', '詳細設計', 'DB設計', 
  '開発', 'テスト', '運用保守', 'インフラ構築'
];

export const EngineerSearch: React.FC<EngineerSearchProps> = ({
  onSearch,
  loading = false,
  showAdvanced = true,
  initialValues = {},
  availableSkills = defaultSkills,
  availableRoles = defaultRoles,
  availablePhases = defaultPhases,
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  const handleSearch = useCallback((values: any) => {
    const criteria: EngineerSearchCriteria = {
      keyword: values.keyword,
      skills: values.skills,
      experienceMin: values.experienceRange?.[0],
      experienceMax: values.experienceRange?.[1],
      availableFrom: values.availablePeriod?.[0]?.format('YYYY-MM-DD'),
      availableTo: values.availablePeriod?.[1]?.format('YYYY-MM-DD'),
      status: values.status,
      roles: values.roles,
      phases: values.phases,
    };
    
    Object.keys(criteria).forEach(key => {
      if (criteria[key as keyof EngineerSearchCriteria] === undefined || 
          (Array.isArray(criteria[key as keyof EngineerSearchCriteria]) && 
           (criteria[key as keyof EngineerSearchCriteria] as any[]).length === 0)) {
        delete criteria[key as keyof EngineerSearchCriteria];
      }
    });

    onSearch(criteria);
  }, [onSearch]);

  const handleReset = useCallback(() => {
    form.resetFields();
    onSearch({});
  }, [form, onSearch]);

  return (
    <Card className="engineer-search">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="keyword" label="キーワード検索">
              <Input
                placeholder="名前、プロジェクト名など"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="skills" label="技術スキル">
              <Select
                mode="multiple"
                placeholder="スキルを選択"
                allowClear
                showSearch
                maxTagCount="responsive"
              >
                {availableSkills.map(skill => (
                  <Option key={skill} value={skill}>
                    {skill}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="status" label="稼働状況">
              <Select
                mode="multiple"
                placeholder="状況を選択"
                allowClear
              >
                <Option value="AVAILABLE">待機中</Option>
                <Option value="PENDING">待機予定</Option>
                <Option value="ASSIGNED">稼働中</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {showAdvanced && (
          <>
            <div className="search-advanced-toggle">
              <Button
                type="link"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '詳細検索を閉じる' : '詳細検索を開く'}
              </Button>
            </div>

            {expanded && (
              <Row gutter={16}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="experienceRange" label="経験年数">
                    <Select
                      mode="multiple"
                      placeholder="経験年数を選択"
                      allowClear
                    >
                      <Option value={[0, 2]}>0-2年</Option>
                      <Option value={[3, 5]}>3-5年</Option>
                      <Option value={[6, 10]}>6-10年</Option>
                      <Option value={[11, null]}>11年以上</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="availablePeriod" label="稼働可能時期">
                    <RangePicker
                      style={{ width: '100%' }}
                      placeholder={['開始日', '終了日']}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item name="roles" label="対応可能ロール">
                    <Select
                      mode="multiple"
                      placeholder="ロールを選択"
                      allowClear
                    >
                      {availableRoles.map(role => (
                        <Option key={role} value={role}>
                          {role}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24}>
                  <Form.Item name="phases" label="対応可能フェーズ">
                    <Select
                      mode="multiple"
                      placeholder="フェーズを選択"
                      allowClear
                      maxTagCount="responsive"
                    >
                      {availablePhases.map(phase => (
                        <Option key={phase} value={phase}>
                          {phase}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </>
        )}

        <Row gutter={16} className="search-actions">
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              検索
            </Button>
          </Col>
          <Col>
            <Button
              onClick={handleReset}
              icon={<ReloadOutlined />}
            >
              リセット
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};