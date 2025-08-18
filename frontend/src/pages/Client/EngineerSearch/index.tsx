import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import EngineerSearchTable from '@/components/EngineerSearch/EngineerSearchTable';
import type { Engineer } from '@/components/EngineerSearch/EngineerSearchTable';

const ClientEngineerSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // モックデータ（複数のSES企業のエンジニアを含む）
  const mockEngineers: Engineer[] = [
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
      rate: { min: 60, max: 80 },
      companyName: '株式会社テックソリューション',
    },
    {
      key: '2',
      engineerId: 'ENG002',
      name: '佐藤花子',
      age: 28,
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      experience: 5,
      status: 'available',
      availableDate: '2024/02/15',
      lastUpdated: '2024/01/08',
      email: 'sato@example.com',
      phone: '090-2345-6789',
      rate: { min: 55, max: 70 },
      companyName: '株式会社デジタルイノベーション',
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
      rate: { min: 70, max: 90 },
      companyName: '株式会社テックソリューション',
    },
    {
      key: '4',
      engineerId: 'ENG004',
      name: '山田次郎',
      age: 30,
      skills: ['C#', '.NET Core', 'Azure', 'SQL Server'],
      experience: 7,
      status: 'waiting_scheduled',
      currentProject: '在庫管理システム',
      projectEndDate: '2024/03/31',
      availableDate: '2024/04/01',
      lastUpdated: '2024/01/12',
      email: 'yamada@example.com',
      phone: '090-4567-8901',
      rate: { min: 65, max: 85 },
      companyName: 'SESパートナーズ株式会社',
    },
    {
      key: '5',
      engineerId: 'ENG005',
      name: '伊藤美咲',
      age: 26,
      skills: ['Vue.js', 'Nuxt.js', 'Firebase', 'GraphQL'],
      experience: 4,
      status: 'available',
      availableDate: '2024/01/20',
      lastUpdated: '2024/01/09',
      email: 'ito@example.com',
      phone: '090-5678-9012',
      rate: { min: 50, max: 65 },
      companyName: '株式会社デジタルイノベーション',
    },
    {
      key: '6',
      engineerId: 'ENG006',
      name: '高橋健一',
      age: 33,
      skills: ['Go', 'Kubernetes', 'gRPC', 'Redis'],
      experience: 9,
      status: 'available',
      availableDate: '2024/02/01',
      lastUpdated: '2024/01/11',
      email: 'takahashi@example.com',
      phone: '090-6789-0123',
      rate: { min: 70, max: 95 },
      companyName: '株式会社クラウドテック',
    },
    {
      key: '7',
      engineerId: 'ENG007',
      name: '小林明美',
      age: 29,
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      experience: 6,
      status: 'available',
      availableDate: '2024/02/10',
      lastUpdated: '2024/01/13',
      email: 'kobayashi@example.com',
      phone: '090-7890-1234',
      rate: { min: 60, max: 75 },
      companyName: 'SESパートナーズ株式会社',
    },
    {
      key: '8',
      engineerId: 'ENG008',
      name: '渡辺大輔',
      age: 34,
      skills: ['PHP', 'Laravel', 'Vue.js', 'MySQL'],
      experience: 8,
      status: 'waiting',
      availableDate: '2024/02/20',
      lastUpdated: '2024/01/14',
      email: 'watanabe@example.com',
      phone: '090-8901-2345',
      rate: { min: 55, max: 70 },
      companyName: '株式会社システムプロ',
    },
    {
      key: '9',
      engineerId: 'ENG009',
      name: '中村優子',
      age: 31,
      skills: ['Angular', 'RxJS', 'NestJS', 'MongoDB'],
      experience: 7,
      status: 'available',
      availableDate: '2024/01/25',
      lastUpdated: '2024/01/15',
      email: 'nakamura@example.com',
      phone: '090-9012-3456',
      rate: { min: 65, max: 80 },
      companyName: '株式会社テックソリューション',
    },
    {
      key: '10',
      engineerId: 'ENG010',
      name: '加藤剛',
      age: 36,
      skills: ['Ruby', 'Ruby on Rails', 'PostgreSQL', 'Redis'],
      experience: 11,
      status: 'available',
      availableDate: '2024/02/05',
      lastUpdated: '2024/01/16',
      email: 'kato@example.com',
      phone: '090-0123-4567',
      rate: { min: 75, max: 100 },
      companyName: '株式会社クラウドテック',
    },
  ];

  const handleSendOffer = (engineerIds: string[]) => {
    setIsLoading(true);
    
    // オファー送信処理をシミュレート
    setTimeout(() => {
      message.success(`${engineerIds.length}名のエンジニアにオファーを送信しました`);
      setIsLoading(false);
      
      // オファーボード画面に遷移
      navigate('/client/offer-board');
    }, 1000);
  };

  return (
    <EngineerSearchTable
      engineers={mockEngineers}
      showActions={true}
      onSendOffer={handleSendOffer}
      showCompanyColumn={true}
      title="エンジニア検索"
      description="複数のSES企業から最適なエンジニアを検索"
    />
  );
};

export default ClientEngineerSearch;