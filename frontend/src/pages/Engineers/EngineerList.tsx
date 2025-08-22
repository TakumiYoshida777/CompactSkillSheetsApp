import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, message, Spin, Alert } from 'antd';
import { UserAddOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { EngineerSearchTable } from '../../components/EngineerSearch/EngineerSearchTable';
import type { Engineer } from '../../components/EngineerSearch/EngineerSearchTable';
import { useEngineers, useDeleteEngineer, useBulkExport } from '../../hooks/useEngineers';
import { engineerApi } from '../../api/engineers/engineerApi';
import { useAuthStore } from '../../stores/authStore';
import type { EngineerFilterParams } from '../../types/engineer';

const EngineerList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EngineerFilterParams>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // TanStack Query でエンジニアデータを取得
  const { data: response, isLoading, error, refetch } = useEngineers(filters);
  const deleteEngineerMutation = useDeleteEngineer();
  const bulkExportMutation = useBulkExport();

  // デバッグ用ログ
  React.useEffect(() => {
    console.log('=== EngineerList Debug ===');
    console.log('Filters:', filters);
    console.log('Loading:', isLoading);
    console.log('Error:', error);
    console.log('Response:', response);
    console.log('Response Data:', response?.data);
    console.log('Response Meta:', response?.meta);
  }, [filters, isLoading, error, response]);

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
      skills.push(...(Array.isArray(skillSheet.programmingLanguages) 
        ? skillSheet.programmingLanguages.map((s: any) => s.name || s)
        : []));
    }
    if (skillSheet.frameworks) {
      skills.push(...(Array.isArray(skillSheet.frameworks)
        ? skillSheet.frameworks.map((s: any) => s.name || s)
        : []));
    }
    if (skillSheet.databases) {
      skills.push(...(Array.isArray(skillSheet.databases)
        ? skillSheet.databases.map((s: any) => s.name || s)
        : []));
    }
    
    return skills.slice(0, 5); // 最大5つまで表示
  };

  // ステータスマッピング
  const mapStatus = (status?: string): 'available' | 'assigned' | 'waiting' | 'waiting_scheduled' | 'leave' => {
    switch (status?.toUpperCase()) {
      case 'WAITING':
        return 'waiting';
      case 'AVAILABLE':
        return 'available';
      case 'ASSIGNED':
      case 'WORKING':
        return 'assigned';
      case 'UPCOMING':
      case 'PENDING':
        return 'waiting_scheduled';
      case 'INACTIVE':
      case 'OFF':
        return 'leave';
      default:
        return 'available';
    }
  };

  // APIレスポンスをコンポーネントの形式に変換
  const engineers: Engineer[] = React.useMemo(() => {
    if (!response?.data) {
      console.log('No response data, returning empty array');
      return [];
    }
    
    console.log('Transforming engineers data:', response.data);
    return response.data.map((eng: any) => ({
      key: eng.id,
      engineerId: eng.id,
      name: eng.name,
      age: eng.age || calculateAge(eng.birthDate),
      skills: extractSkills(eng.skillSheet),
      experience: eng.yearsOfExperience || eng.skillSheet?.totalExperienceYears || 0,
      status: mapStatus(eng.currentStatus),
      availableDate: eng.availableDate,
      currentProject: eng.currentProject?.name,
      projectEndDate: eng.currentProject?.endDate,
      lastUpdated: eng.updatedAt,
      email: eng.email,
      phone: eng.phone,
    }));
  }, [response]);

  const totalCount = response?.meta?.pagination?.total || 0;


  // エンジニア新規登録
  const handleAddEngineer = () => {
    navigate('/engineers/register');
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

  // エンジニア削除処理
  const handleDelete = async (engineerId: string) => {
    deleteEngineerMutation.mutate(engineerId);
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

  // 一括エクスポート処理
  const handleBulkExport = async (engineerIds: string[]) => {
    bulkExportMutation.mutate({ engineerIds, format: 'excel' });
  };

  // フィルター変更ハンドラ
  const handleFilterChange = (newFilters: Partial<EngineerFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // リフレッシュ処理
  const handleRefresh = () => {
    refetch();
    message.info('データを更新しました');
  };

  // デバッグ用：直接APIを呼び出す
  const testDirectApiCall = async () => {
    console.log('=== Direct API Call Test ===');
    
    // Zustandストアから認証情報を取得
    const authState = useAuthStore.getState();
    console.log('Auth State:', {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      token: authState.token ? 'Token exists' : 'No token',
      tokenLength: authState.token?.length
    });
    
    try {
      const token = authState.token || localStorage.getItem('token');
      console.log('Token from store/localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/engineers?page=1&limit=20&sortBy=updatedAt&sortOrder=desc`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error('API Error:', data);
      }
    } catch (err) {
      console.error('Direct API call failed:', err);
    }
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
        loading={isLoading}
      >
        エクスポート
      </Button>
      <Button
        icon={<ReloadOutlined />}
        size="large"
        onClick={handleRefresh}
        loading={isLoading}
      >
        更新
      </Button>
      {/* デバッグ用ボタン */}
      <Button
        danger
        onClick={testDirectApiCall}
      >
        API Debug
      </Button>
    </Space>
  );

  // エラー表示
  if (error && process.env.NODE_ENV !== 'development') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Alert
          message="データ取得エラー"
          description={(error as any)?.response?.data?.message || 'エンジニアデータの取得に失敗しました'}
          type="error"
          showIcon
        />
        <Button
          style={{ marginTop: 16 }}
          onClick={() => refetch()}
        >
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0px', background: '#fff', height: '100%' }}>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <span>エンジニア一覧</span>
        <CustomActions />
      </div>

      {error && (
        <Alert
          message="エラー"
          description={(error as any)?.response?.data?.message || 'エンジニアデータの取得に失敗しました'}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="データを読み込み中..." />
        </div>
      ) : (
        <EngineerSearchTable
          engineers={engineers}
          onRowClick={handleEngineerClick}
          onFilterChange={handleFilterChange}
          customActions={
            <Space>
              <Button onClick={() => handleEditEngineer(engineers[0]?.engineerId)}>編集</Button>
              <Button danger onClick={() => handleDelete(engineers[0]?.engineerId)}>削除</Button>
            </Space>
          }
        />
      )}
    </div>
  );
};

export default EngineerList;