import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, message, Spin, Alert } from 'antd';
import { UserAddOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import EngineerSearchTable from '../../components/EngineerSearch/EngineerSearchTable';
import type { Engineer } from '../../components/EngineerSearch/EngineerSearchTable';
import { engineerApi } from '../../api/engineers/engineerApi';
import { useAuthStore } from '../../stores/authStore';
import type { EngineerFilterParams } from '../../types/engineer';

const EngineerList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EngineerFilterParams>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const [totalCount, setTotalCount] = useState(0);

  // API からエンジニアデータを取得
  const fetchEngineers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await engineerApi.fetchList(filters);
      
      // APIレスポンスをコンポーネントの形式に変換
      const transformedEngineers: Engineer[] = response.data.map((eng: any) => ({
        key: eng.id,
        engineerId: eng.id,
        name: eng.name,
        age: eng.age || calculateAge(eng.birthDate),
        skills: extractSkills(eng.skillSheet),
        experience: eng.yearsOfExperience || 0,
        status: mapStatus(eng.currentStatus),
        availableDate: eng.availableDate,
        currentProject: eng.currentProject?.name,
        projectEndDate: eng.currentProject?.endDate,
        lastUpdated: eng.updatedAt,
        email: eng.email,
        phone: eng.phone,
      }));
      
      setEngineers(transformedEngineers);
      setTotalCount(response.meta?.pagination?.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch engineers:', err);
      setError(err.response?.data?.message || 'エンジニアデータの取得に失敗しました');
      
      // エラー時はフォールバックデータを表示（デバッグ用）
      if (process.env.NODE_ENV === 'development') {
        setEngineers(getMockEngineers());
        message.warning('エラーのためモックデータを表示しています');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 初回ロード時にデータ取得
  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  // 年齢計算ヘルパー
  const calculateAge = (birthDate?: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // スキル抽出ヘルパー
  const extractSkills = (skillSheet?: any): string[] => {
    if (!skillSheet) return [];
    const skills: string[] = [];
    
    if (skillSheet.programmingLanguages) {
      skills.push(...skillSheet.programmingLanguages.map((s: any) => s.name || s));
    }
    if (skillSheet.frameworks) {
      skills.push(...skillSheet.frameworks.map((s: any) => s.name || s));
    }
    if (skillSheet.databases) {
      skills.push(...skillSheet.databases.map((s: any) => s.name || s));
    }
    
    return skills.slice(0, 5); // 最大5つまで表示
  };

  // ステータスマッピング
  const mapStatus = (status?: string): string => {
    const statusMap: Record<string, string> = {
      'working': 'assigned',
      'waiting': 'waiting',
      'waiting_soon': 'waiting_scheduled',
      'leaving': 'unavailable',
    };
    return statusMap[status || ''] || 'available';
  };

  // モックデータ（フォールバック用）
  const getMockEngineers = (): Engineer[] => [
    {
      key: '1',
      engineerId: 'ENG001',
      name: '田中太郎',
      age: 32,
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      experience: 8,
      status: 'available',
      availableDate: '2024/02/01',
      lastUpdated: '2024/01/10',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
    },
    {
      key: '2',
      engineerId: 'ENG002',
      name: '佐藤花子',
      age: 28,
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      experience: 5,
      status: 'assigned',
      currentProject: 'ECサイトリニューアル',
      projectEndDate: '2024/04/30',
      lastUpdated: '2024/01/08',
      email: 'sato@example.com',
      phone: '090-2345-6789',
    },
    {
      key: '3',
      engineerId: 'ENG003',
      name: '鈴木一郎',
      age: 35,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
      experience: 10,
      status: 'waiting',
      availableDate: '2024/03/01',
      lastUpdated: '2024/01/05',
      email: 'suzuki@example.com',
      phone: '090-3456-7890',
    },
  ];

  // エンジニア新規登録
  const handleAddEngineer = () => {
    navigate('engineers/new');
  };

  // エンジニア詳細表示
  const handleEngineerClick = (engineer: Engineer) => {
    navigate(`/engineers/${engineer.engineerId}`);
  };

  // エンジニア編集
  const handleEditEngineer = (engineerId: string) => {
    navigate(`/engineers/edit/${engineerId}`);
    message.info(`エンジニア ${engineerId} の編集画面へ遷移`);
  };

  // エクスポート処理
  const handleExport = async (engineerIds?: string[]) => {
    try {
      const blob = await engineerApi.export('excel', {
        ...filters,
        // engineerIdsが指定されている場合は、それらのみエクスポート
        ...(engineerIds && { ids: engineerIds }),
      });
      
      // ファイルダウンロード
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `engineers_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (engineerIds && engineerIds.length > 0) {
        message.success(`${engineerIds.length}名のエンジニアデータをエクスポートしました`);
      } else {
        message.success('すべてのエンジニアデータをエクスポートしました');
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      message.error('エクスポートに失敗しました');
    }
  };

  // フィルター変更ハンドラ
  const handleFilterChange = (newFilters: Partial<EngineerFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // リフレッシュ処理
  const handleRefresh = () => {
    fetchEngineers();
    message.info('データを更新しました');
  };

  // カスタムアクションコンポーネント
  const CustomActions = () => (
    <Space>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        size="large"
        onClick={handleAddEngineer}
      >
        新規登録
      </Button>
      <Button
        icon={<DownloadOutlined />}
        size="large"
        onClick={() => handleExport()}
        loading={loading}
      >
        エクスポート
      </Button>
      <Button
        icon={<ReloadOutlined />}
        size="large"
        onClick={handleRefresh}
        loading={loading}
      >
        更新
      </Button>
    </Space>
  );

  // エラー表示
  if (error && process.env.NODE_ENV !== 'development') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Alert
          message="データ取得エラー"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              再読み込み
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <Spin spinning={loading} tip="データを読み込んでいます...">
        <EngineerSearchTable
          engineers={engineers}
          showActions={false}
          showCompanyColumn={false}
          title="エンジニア一覧"
          description={`登録されているエンジニアの管理（全${totalCount}名）`}
          customActions={<CustomActions />}
          onRowClick={handleEngineerClick}
          onFilterChange={handleFilterChange}
        />
      </Spin>
    </div>
  );
};

export default EngineerList;