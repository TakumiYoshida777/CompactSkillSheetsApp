import { errorLog } from '../../utils/logger';
import { useState, useEffect, ChangeEvent } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Upload,
  Space,
  Typography,
  Divider,
  Alert,
  Tag,
  Steps,
  message,
  Descriptions,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadProps, UploadFile } from 'antd';
import dayjs from 'dayjs';
import { engineerApi } from '../../api/engineers/engineerApi';
import { useAuthStore } from '../../stores/authStore';
import type { EngineerCreateRequest, EngineerStatus } from '../../types/engineer';
import type { FormSubmitHandler } from '../../types/event.types';
import { isAxiosError, getErrorMessage } from '../../types/error.types';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import debounce from 'lodash/debounce';
import axios from '../../lib/axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SkillItem {
  name: string;
  level: number;
  experience: number;
}

const EngineerRegister: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { canCreateEngineer } = usePermissionCheck();
  const [currentStep, setCurrentStep] = useState(0);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{resume?: UploadFile, skillSheet?: UploadFile}>({});

  // 権限チェック
  useEffect(() => {
    
    if (user && !canCreateEngineer()) {
      message.error('この機能にアクセスする権限がありません');
      navigate('/dashboard');
    }
  }, [user, navigate, canCreateEngineer]);

  // スキルレベルの選択肢
  const skillLevels = [
    { value: 1, label: '初級' },
    { value: 2, label: '中級' },
    { value: 3, label: '上級' },
    { value: 4, label: 'エキスパート' },
    { value: 5, label: 'マスター' },
  ];

  // 契約形態の選択肢
  const contractTypes = [
    '正社員',
    '契約社員',
    'フリーランス',
    '業務委託',
    'SES契約',
  ];

  // 稼働可能な作業場所
  const workLocations = [
    'リモート可',
    'オンサイト',
    'ハイブリッド',
    '要相談',
  ];

  // フォームのステップ
  const steps = [
    {
      title: '基本情報',
      description: '氏名・連絡先',
    },
    {
      title: '経歴情報',
      description: '経験・スキル',
    },
    {
      title: '契約情報',
      description: '稼働条件',
    },
    {
      title: '確認',
      description: '登録内容確認',
    },
  ];

  // スキル追加
  const handleAddSkill = () => {
    const newSkill: SkillItem = {
      name: '',
      level: 3,
      experience: 1,
    };
    setSkills([...skills, newSkill]);
  };

  // スキル削除
  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  // スキル更新
  const handleSkillChange = (index: number, field: keyof SkillItem, value: string | number) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  // ファイルアップロード設定
  const uploadProps: UploadProps = {
    name: 'file',
    action: 'upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} アップロード完了`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} アップロード失敗`);
      }
    },
  };

  // メールアドレス重複チェック（デバウンス処理）
  const checkEmailAvailability = debounce(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const response = await axios.get(`/api/v1/engineers/check-email`, {
        params: { email }
      });
      setEmailAvailable(response.data.available);
      if (!response.data.available) {
        form.setFields([
          {
            name: 'email',
            errors: ['このメールアドレスは既に登録されています'],
          },
        ]);
      }
    } catch (error) {
      errorLog('Email check failed:', error);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  }, 500);

  // フォーム送信
  interface EngineerFormValues {
    lastName: string;
    firstName: string;
    lastNameKana?: string;
    firstNameKana?: string;
    email: string;
    phone?: string;
    contractType?: string;
    status?: string;
    availableDate?: dayjs.Dayjs;
    nearestStation?: string;
    birthDate?: dayjs.Dayjs;
    gender?: 'male' | 'female' | 'other';
    githubUrl?: string;
    portfolioUrl?: string;
    joinDate?: dayjs.Dayjs;
    contractPrice?: number;
    contractPeriod?: number;
    workLocation?: string;
    japanese?: string;
    english?: string;
    chinese?: string;
    qualifications?: string[];
    introduction?: string;
    prHistory?: string;
    remarks?: string;
  }

  const handleSubmit: FormSubmitHandler<EngineerFormValues> = async (values) => {
    // メールアドレスが利用不可の場合は送信しない
    if (emailAvailable === false) {
      message.error('メールアドレスが既に使用されています');
      return;
    }

    // スキルが0件の場合は警告
    if (skills.length === 0) {
      const confirmed = await new Promise((resolve) => {
        message.warning({
          content: 'スキル情報が登録されていません。このまま登録しますか？',
          duration: 0,
          key: 'skill-warning',
          onClick: () => {
            message.destroy('skill-warning');
            resolve(true);
          },
        });
        setTimeout(() => {
          message.destroy('skill-warning');
          resolve(false);
        }, 5000);
      });
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      // データ整形
      const engineerData: EngineerCreateRequest = {
        name: `${values.lastName} ${values.firstName}`,
        nameKana: values.lastNameKana && values.firstNameKana 
          ? `${values.lastNameKana} ${values.firstNameKana}` 
          : undefined,
        email: values.email,
        phone: values.phone,
        engineerType: values.contractType === 'フリーランス' ? 'freelance' : 
                      values.contractType === '業務委託' ? 'partner' : 'employee',
        currentStatus: mapStatusToEnum(values.status),
        availableDate: values.availableDate?.format('YYYY-MM-DD'),
        nearestStation: values.nearestStation,
        birthDate: values.birthDate?.format('YYYY-MM-DD'),
        gender: values.gender,
        githubUrl: values.githubUrl,
        portfolioUrl: values.portfolioUrl,
        joinDate: values.joinDate?.format('YYYY-MM-DD'),
        yearsOfExperience: values.totalExperience,
        tags: [],
      };

      // エンジニア登録
      const engineer = await engineerApi.create(engineerData);

      // スキル情報の登録
      if (skills.length > 0 && engineer.id) {
        await updateEngineerSkills(engineer.id, skills);
      }

      // 追加情報の更新（自己PR、対応可能ロール等）
      if (values.selfPR || values.availableRoles || values.availablePhases) {
        await updateAdditionalInfo(engineer.id, {
          selfPR: values.selfPR,
          availableRoles: values.availableRoles,
          availablePhases: values.availablePhases,
          workLocation: values.workLocation,
          workTime: values.workTime,
          currentProject: values.currentProject,
          projectEndDate: values.projectEndDate?.format('YYYY-MM-DD'),
          notes: values.notes,
          isPublic: values.isPublic !== false, // デフォルトは公開
        });
      }

      // ファイルアップロード
      if (uploadedFiles.resume || uploadedFiles.skillSheet) {
        await uploadDocuments(engineer.id, uploadedFiles);
      }

      message.success('エンジニア情報を正常に登録しました');
      
      // localStorageのクリア
      localStorage.removeItem('engineer_register_draft');
      
      // 詳細画面へ遷移
      navigate(`/engineers/${engineer.id}`);
    } catch (error) {
      errorLog('Registration failed:', error);
      const errorMessage = getErrorMessage(error);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ステータスのマッピング
  const mapStatusToEnum = (status: string): EngineerStatus => {
    const statusMap: Record<string, EngineerStatus> = {
      'available': 'waiting',
      'assigned': 'working',
      'waiting': 'waiting',
      'waiting_scheduled': 'waiting_soon',
      'leave': 'leaving',
    };
    return statusMap[status] || 'waiting';
  };

  // スキル情報の更新
  const updateEngineerSkills = async (engineerId: string, skillList: SkillItem[]) => {
    try {
      const skillData = {
        programmingLanguages: skillList
          .filter(s => s.name && isLanguage(s.name))
          .map(s => ({ name: s.name, level: s.level, experience: s.experience })),
        frameworks: skillList
          .filter(s => s.name && isFramework(s.name))
          .map(s => ({ name: s.name, level: s.level, experience: s.experience })),
        databases: skillList
          .filter(s => s.name && isDatabase(s.name))
          .map(s => ({ name: s.name, level: s.level, experience: s.experience })),
        tools: skillList
          .filter(s => s.name && !isLanguage(s.name) && !isFramework(s.name) && !isDatabase(s.name))
          .map(s => ({ name: s.name, level: s.level, experience: s.experience })),
      };
      
      await axios.put(`/api/v1/engineers/${engineerId}/skill-sheet`, skillData);
    } catch (error) {
      errorLog('Failed to update skills:', error);
      throw error;
    }
  };

  // 追加情報の更新
  interface AdditionalInfo {
    japanese?: string;
    english?: string;
    chinese?: string;
    qualifications?: string[];
    introduction?: string;
    prHistory?: string;
    remarks?: string;
  }

  const updateAdditionalInfo = async (engineerId: string, info: AdditionalInfo) => {
    try {
      await axios.patch(`/api/v1/engineers/${engineerId}`, info);
    } catch (error) {
      errorLog('Failed to update additional info:', error);
      // エラーは握りつぶす（メインの登録は成功しているため）
    }
  };

  // ドキュメントアップロード
  interface DocumentFiles {
    resume?: UploadFile;
    skillSheet?: UploadFile;
  }

  const uploadDocuments = async (engineerId: string, files: DocumentFiles) => {
    const promises = [];
    if (files.resume) {
      promises.push(
        axios.post(`/api/v1/engineers/${engineerId}/documents`, {
          type: 'resume',
          file: files.resume,
        })
      );
    }
    if (files.skillSheet) {
      promises.push(
        axios.post(`/api/v1/engineers/${engineerId}/documents`, {
          type: 'skill_sheet',
          file: files.skillSheet,
        })
      );
    }
    try {
      await Promise.all(promises);
    } catch (error) {
      errorLog('Failed to upload documents:', error);
      // エラーは握りつぶす
    }
  };

  // スキル分類ヘルパー関数
  const isLanguage = (skill: string): boolean => {
    const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'Scala'];
    return languages.some(lang => skill.toLowerCase().includes(lang.toLowerCase()));
  };

  const isFramework = (skill: string): boolean => {
    const frameworks = ['React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'Express', 'Django', 'Flask', 'Spring', 'Rails', 'Laravel', '.NET'];
    return frameworks.some(fw => skill.toLowerCase().includes(fw.toLowerCase()));
  };

  const isDatabase = (skill: string): boolean => {
    const databases = ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'DynamoDB', 'Elasticsearch'];
    return databases.some(db => skill.toLowerCase().includes(db.toLowerCase()));
  };

  // フォームデータの一時保存（localStorage）
  const saveDraft = () => {
    const formData = form.getFieldsValue();
    const draft = {
      formData,
      skills,
      currentStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('engineer_register_draft', JSON.stringify(draft));
    message.info('入力内容を一時保存しました');
  };

  // 一時保存データの復元
  useEffect(() => {
    const draft = localStorage.getItem('engineer_register_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const savedDate = new Date(parsed.savedAt);
        const hoursSince = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);
        
        // 24時間以内のデータのみ復元
        if (hoursSince < 24) {
          message.info({
            content: '前回の入力内容を復元しますか？',
            duration: 0,
            key: 'restore-draft',
            btn: (
              <Space>
                <Button 
                  size="small" 
                  onClick={() => {
                    message.destroy('restore-draft');
                    localStorage.removeItem('engineer_register_draft');
                  }}
                >
                  破棄
                </Button>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => {
                    form.setFieldsValue(parsed.formData);
                    setSkills(parsed.skills || []);
                    setCurrentStep(parsed.currentStep || 0);
                    message.destroy('restore-draft');
                    message.success('入力内容を復元しました');
                  }}
                >
                  復元
                </Button>
              </Space>
            ),
          });
        } else {
          // 24時間以上経過したデータは削除
          localStorage.removeItem('engineer_register_draft');
        }
      } catch (error) {
        errorLog('Failed to restore draft:', error);
        localStorage.removeItem('engineer_register_draft');
      }
    }
  }, [form]);

  // ステップごとのコンテンツ
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title level={4}>基本情報</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="姓"
                  rules={[{ required: true, message: '姓を入力してください' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="田中" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label="名"
                  rules={[{ required: true, message: '名を入力してください' }]}
                >
                  <Input placeholder="太郎" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastNameKana"
                  label="姓（カナ）"
                  rules={[{ required: true, message: '姓（カナ）を入力してください' }]}
                >
                  <Input placeholder="タナカ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstNameKana"
                  label="名（カナ）"
                  rules={[{ required: true, message: '名（カナ）を入力してください' }]}
                >
                  <Input placeholder="タロウ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="メールアドレス"
                  rules={[
                    { required: true, message: 'メールアドレスを入力してください' },
                    { type: 'email', message: '有効なメールアドレスを入力してください' },
                  ]}
                  validateStatus={emailChecking ? 'validating' : emailAvailable === false ? 'error' : ''}
                  help={emailChecking ? '確認中...' : emailAvailable === false ? 'このメールアドレスは既に登録されています' : ''}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="tanaka@example.com"
                    onChange={(e) => checkEmailAvailability(e.target.value)}
                    suffix={emailChecking ? <Spin size="small" /> : null}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="電話番号"
                  rules={[{ required: true, message: '電話番号を入力してください' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="090-1234-5678" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="birthDate"
                  label="生年月日"
                  rules={[{ required: true, message: '生年月日を選択してください' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="生年月日を選択"
                    format="YYYY/MM/DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gender"
                  label="性別"
                  rules={[{ required: true, message: '性別を選択してください' }]}
                >
                  <Select placeholder="性別を選択">
                    <Option value="male">男性</Option>
                    <Option value="female">女性</Option>
                    <Option value="other">その他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="住所"
                  rules={[{ required: true, message: '住所を入力してください' }]}
                >
                  <Input prefix={<HomeOutlined />} placeholder="東京都港区..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nearestStation"
                  label="最寄駅"
                  rules={[{ required: true, message: '最寄駅を入力してください' }]}
                >
                  <Input placeholder="品川駅" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="education"
                  label="最終学歴"
                >
                  <Input placeholder="○○大学 情報工学部卒" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      
      case 1:
        return (
          <div>
            <Title level={4}>経歴・スキル情報</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="totalExperience"
                  label="総経験年数"
                  rules={[{ required: true, message: '経験年数を入力してください' }]}
                >
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: '100%' }}
                    placeholder="5"
                    suffix="年"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="joinDate"
                  label="入社日"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="入社日を選択"
                    format="YYYY/MM/DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="selfPR"
                  label="自己PR"
                  rules={[{ required: true, message: '自己PRを入力してください' }]}
                >
                  <TextArea
                    rows={4}
                    maxLength={2000}
                    showCount
                    placeholder="これまでの経験や強みについて記載してください"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={5}>技術スキル</Title>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddSkill}
                >
                  スキル追加
                </Button>
              </div>
              
              {skills.length === 0 ? (
                <Alert
                  message="スキルが登録されていません"
                  description="「スキル追加」ボタンからスキルを追加してください"
                  type="info"
                  showIcon
                />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {skills.map((skill, index) => (
                    <Card key={index} size="small">
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8}>
                          <Input
                            placeholder="スキル名（例: JavaScript）"
                            value={skill.name}
                            onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col xs={24} sm={6}>
                          <Select
                            style={{ width: '100%' }}
                            placeholder="レベル"
                            value={skill.level}
                            onChange={(value) => handleSkillChange(index, 'level', value)}
                          >
                            {skillLevels.map((level) => (
                              <Option key={level.value} value={level.value}>
                                {level.label}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col xs={24} sm={6}>
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={50}
                            placeholder="経験年数"
                            value={skill.experience}
                            onChange={(value) => handleSkillChange(index, 'experience', value)}
                            suffix="年"
                          />
                        </Col>
                        <Col xs={24} sm={4}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveSkill(index)}
                          >
                            削除
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              )}
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="availableRoles"
                  label="対応可能ロール"
                >
                  <Select
                    mode="multiple"
                    placeholder="対応可能なロールを選択"
                    style={{ width: '100%' }}
                  >
                    <Option value="pg">プログラマー (PG)</Option>
                    <Option value="se">システムエンジニア (SE)</Option>
                    <Option value="pl">プロジェクトリーダー (PL)</Option>
                    <Option value="pm">プロジェクトマネージャー (PM)</Option>
                    <Option value="consultant">コンサルタント</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="availablePhases"
                  label="対応可能フェーズ"
                >
                  <Select
                    mode="multiple"
                    placeholder="対応可能なフェーズを選択"
                    style={{ width: '100%' }}
                  >
                    <Option value="requirement">要件定義</Option>
                    <Option value="basic_design">基本設計</Option>
                    <Option value="detailed_design">詳細設計</Option>
                    <Option value="implementation">実装・開発</Option>
                    <Option value="test">テスト</Option>
                    <Option value="release">リリース</Option>
                    <Option value="maintenance">保守・運用</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      
      case 2:
        return (
          <div>
            <Title level={4}>契約・稼働情報</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contractType"
                  label="契約形態"
                  rules={[{ required: true, message: '契約形態を選択してください' }]}
                >
                  <Select placeholder="契約形態を選択">
                    {contractTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="workLocation"
                  label="勤務地"
                  rules={[{ required: true, message: '勤務地を選択してください' }]}
                >
                  <Select placeholder="勤務地を選択">
                    {workLocations.map((location) => (
                      <Option key={location} value={location}>
                        {location}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="workTime"
                  label="稼働時間"
                  rules={[{ required: true, message: '稼働時間を入力してください' }]}
                >
                  <Input placeholder="140-180h" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="availableDate"
                  label="稼働開始可能日"
                  rules={[{ required: true, message: '稼働開始可能日を選択してください' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="稼働開始可能日を選択"
                    format="YYYY/MM/DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="現在の状態"
                  rules={[{ required: true, message: '状態を選択してください' }]}
                >
                  <Select placeholder="状態を選択" onChange={(value) => {
                    // アサイン中または待機予定を選択した場合、プロジェクト情報入力を有効化
                    const showProjectFields = value === 'assigned' || value === 'waiting_scheduled';
                    form.setFieldsValue({ showProjectFields });
                  }}>
                    <Option value="available">稼働可能</Option>
                    <Option value="assigned">アサイン中</Option>
                    <Option value="waiting">待機中</Option>
                    <Option value="waiting_scheduled">待機予定</Option>
                    <Option value="leave">休職中</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              {/* プロジェクト情報（アサイン中・待機予定の場合のみ表示） */}
              <Col xs={24} md={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.status !== currentValues.status
                  }
                >
                  {({ getFieldValue }) => {
                    const status = getFieldValue('status');
                    return (status === 'assigned' || status === 'waiting_scheduled') ? (
                      <Form.Item
                        name="currentProject"
                        label="現在のプロジェクト"
                        rules={[{ required: true, message: 'プロジェクト名を入力してください' }]}
                      >
                        <Input placeholder="プロジェクト名を入力" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.status !== currentValues.status
                  }
                >
                  {({ getFieldValue }) => {
                    const status = getFieldValue('status');
                    return (status === 'assigned' || status === 'waiting_scheduled') ? (
                      <Form.Item
                        name="projectEndDate"
                        label="案件終了日"
                        rules={[{ required: true, message: '案件終了日を選択してください' }]}
                        extra={status === 'waiting_scheduled' ? '3ヶ月以内の日付を選択してください' : null}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder="案件終了日を選択"
                          format="YYYY/MM/DD"
                          disabledDate={(current) => {
                            // 待機予定の場合、3ヶ月後までの日付のみ選択可能
                            if (status === 'waiting_scheduled') {
                              const threeMonthsLater = dayjs().add(3, 'month');
                              return current && (current < dayjs().startOf('day') || current > threeMonthsLater);
                            }
                            // アサイン中の場合、過去日は選択不可
                            return current && current < dayjs().startOf('day');
                          }}
                        />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>関連書類アップロード</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="resume"
                  label="履歴書"
                >
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>履歴書をアップロード</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="skillSheet"
                  label="スキルシート"
                >
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>スキルシートをアップロード</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="notes"
                  label="備考"
                >
                  <TextArea
                    rows={3}
                    placeholder="その他特記事項があれば記載してください"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="isPublic"
                  label="公開設定"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="公開" unCheckedChildren="非公開" />
                  <Text type="secondary" className="ml-2">
                    取引先企業への情報公開
                  </Text>
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      
      case 3:
        return (
          <div>
            <Title level={4}>登録内容確認</Title>
            <Alert
              message="以下の内容で登録します"
              description="内容に誤りがないか確認してください。修正が必要な場合は「戻る」ボタンで前のステップに戻ってください。"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Card title="基本情報" className="mb-4">
              <Descriptions column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="氏名">
                  {form.getFieldValue('lastName')} {form.getFieldValue('firstName')}
                </Descriptions.Item>
                <Descriptions.Item label="フリガナ">
                  {form.getFieldValue('lastNameKana')} {form.getFieldValue('firstNameKana')}
                </Descriptions.Item>
                <Descriptions.Item label="メールアドレス">
                  {form.getFieldValue('email')}
                </Descriptions.Item>
                <Descriptions.Item label="電話番号">
                  {form.getFieldValue('phone')}
                </Descriptions.Item>
                <Descriptions.Item label="生年月日">
                  {form.getFieldValue('birthDate')?.format('YYYY/MM/DD')}
                </Descriptions.Item>
                <Descriptions.Item label="性別">
                  {form.getFieldValue('gender') === 'male' ? '男性' : 
                   form.getFieldValue('gender') === 'female' ? '女性' : 'その他'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="経歴・スキル" className="mb-4">
              <Descriptions column={1}>
                <Descriptions.Item label="総経験年数">
                  {form.getFieldValue('totalExperience')}年
                </Descriptions.Item>
                <Descriptions.Item label="自己PR">
                  {form.getFieldValue('selfPR')}
                </Descriptions.Item>
              </Descriptions>
              {skills.length > 0 && (
                <div className="mt-4">
                  <Text strong>技術スキル：</Text>
                  <div className="mt-2">
                    {skills.map((skill, index) => (
                      <Tag key={index} color="blue">
                        {skill.name} (Lv.{skill.level}, {skill.experience}年)
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card title="契約・稼働情報">
              <Descriptions column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="契約形態">
                  {form.getFieldValue('contractType')}
                </Descriptions.Item>
                <Descriptions.Item label="勤務地">
                  {form.getFieldValue('workLocation')}
                </Descriptions.Item>
                <Descriptions.Item label="稼働時間">
                  {form.getFieldValue('workTime')}
                </Descriptions.Item>
                <Descriptions.Item label="稼働開始可能日">
                  {form.getFieldValue('availableDate')?.format('YYYY/MM/DD')}
                </Descriptions.Item>
                {form.getFieldValue('currentProject') && (
                  <Descriptions.Item label="現在のプロジェクト">
                    {form.getFieldValue('currentProject')}
                  </Descriptions.Item>
                )}
                {form.getFieldValue('projectEndDate') && (
                  <Descriptions.Item label="案件終了日">
                    {form.getFieldValue('projectEndDate')?.format('YYYY/MM/DD')}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="現在の状態">
                  {form.getFieldValue('status')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };


  // 権限がない場合の表示
  if (user && !canCreateEngineer()) {
    return (
      <Card className="text-center" style={{ maxWidth: 600, margin: '100px auto' }}>
        <LockOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 24 }} />
        <Title level={3}>アクセス権限がありません</Title>
        <Text type="secondary">
          エンジニア登録機能は管理者または営業担当者のみ利用可能です。
        </Text>
        <div style={{ marginTop: 24 }}>
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (skills.length > 0 || form.getFieldsValue().email) {
                saveDraft();
              }
              navigate('engineers/list');
            }}
          >
            戻る
          </Button>
          <Button
            onClick={saveDraft}
            disabled={!form.getFieldsValue().email}
          >
            一時保存
          </Button>
        </Space>
      </div>

      <Card>
        <Title level={2}>
          <UserOutlined className="mr-2" />
          エンジニア新規登録
        </Title>
        
        <Steps
          current={currentStep}
          items={steps}
          className="mb-8"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {renderStepContent()}

          <Divider />

          <Row justify="space-between">
            <Col>
              {currentStep > 0 && (
                <Button
                  size="large"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  戻る
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button
                  size="large"
                  onClick={() => {
                    form.resetFields();
                    setSkills([]);
                    setCurrentStep(0);
                  }}
                >
                  リセット
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      form
                        .validateFields()
                        .then(() => {
                          setCurrentStep(currentStep + 1);
                        })
                        .catch((info) => {
                        });
                    }}
                  >
                    次へ
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                  >
                    登録する
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EngineerRegister;