import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const ClientLoginSimple: React.FC = () => {
  return (
    <div style={{ padding: 50 }}>
      <Card>
        <Title>取引先企業ログインページ（テスト）</Title>
        <p>このページが表示されていれば、ルーティングは正常です。</p>
      </Card>
    </div>
  );
};

export default ClientLoginSimple;