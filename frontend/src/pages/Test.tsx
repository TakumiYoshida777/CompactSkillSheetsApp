import React from 'react';

const Test: React.FC = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>テストページ</h1>
      <p>このページが表示されればReactは正常に動作しています。</p>
      <a href="/login">ログインページへ</a>
    </div>
  );
};

export default Test;