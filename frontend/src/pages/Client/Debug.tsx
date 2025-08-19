import React from 'react';

const Debug: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>デバッグページ</h1>
      <p>このページが表示されていれば、Reactアプリケーションは正常に動作しています。</p>
      <p>現在のURL: {window.location.href}</p>
      <p>現在の時刻: {new Date().toLocaleString('ja-JP')}</p>
      <div>
        <h2>リンク</h2>
        <ul>
          <li><a href="/client/login">取引先企業ログイン</a></li>
          <li><a href="/client/offer-board">オファーボード（要認証）</a></li>
          <li><a href="/login">通常ログイン</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Debug;