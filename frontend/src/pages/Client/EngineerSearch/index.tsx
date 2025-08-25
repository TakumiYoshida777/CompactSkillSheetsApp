import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import EngineerSearchTable from '@/components/EngineerSearch/EngineerSearchTable';
import type { Engineer } from '@/components/EngineerSearch/EngineerSearchTable';
import { useEngineers } from '@/hooks/useEngineers';
import type { EngineerFilterParams } from '@/types/engineer';

const ClientEngineerSearch: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EngineerFilterParams>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // データベースからエンジニアデータを取得
  const { data: response, isLoading, error, refetch } = useEngineers(filters);

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
      return [];
    }
    
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
      // 取引先企業向けには企業名も表示
      companyName: eng.company?.name || 'テックソリューション株式会社',
      // 取引先企業向けの追加フィールド（将来的に実装）
      rate: undefined, // TODO: 単価情報をAPIから取得
      roleExperiences: undefined, // TODO: ロール経験をAPIから取得
      workExperiences: undefined, // TODO: 業務経験をAPIから取得
    }));
  }, [response]);

  const handleSendOffer = (engineerIds: string[]) => {
    // オファー送信処理
    message.info('オファー送信機能は開発中です');
    setTimeout(() => {
      message.success(`${engineerIds.length}名のエンジニアを選択しました`);
      // オファーボード画面に遷移
      navigate('/client/offer-board');
    }, 1000);
  };

  // フィルター変更ハンドラ
  const handleFilterChange = (newFilters: Partial<EngineerFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>エンジニアデータの取得に失敗しました</p>
        <button onClick={() => refetch()}>再試行</button>
      </div>
    );
  }

  return (
    <EngineerSearchTable
      engineers={engineers}
      showActions={true}
      onSendOffer={handleSendOffer}
      showCompanyColumn={true}
      title="エンジニア検索"
      description="複数のSES企業から最適なエンジニアを検索"
      onFilterChange={handleFilterChange}
    />
  );
};

export default ClientEngineerSearch;