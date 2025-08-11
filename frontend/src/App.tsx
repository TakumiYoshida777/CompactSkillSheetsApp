import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import MainLayout from './layouts/MainLayout';
import EngineerLayout from './layouts/EngineerLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import EngineerList from './pages/Engineers/EngineerList';
import EngineerDetail from './pages/Engineers/EngineerDetail';
import EngineerRegister from './pages/Engineers/EngineerRegister';
import SkillSheetEdit from './pages/Engineer/SkillSheet';
import SkillSheetPreview from './pages/Engineer/SkillSheetPreview';
import EngineerDashboard from './pages/Engineer/Dashboard';
import UserProfile from './pages/Profile/UserProfile';
// import ProjectList from './pages/Projects/ProjectList'; // 一時的にコメントアウト
import './App.css';

function App() {
  return (
    <ConfigProvider locale={jaJP}>
      <Router>
        <Routes>
          {/* SES企業向け画面（設計書準拠） */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            {/* DASH001 - ダッシュボード */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* エンジニア管理 */}
            <Route path="engineers">
              {/* ENG001 - エンジニア一覧 */}
              <Route path="list" element={<EngineerList />} />
              {/* ENG002 - エンジニア詳細 */}
              <Route path=":id" element={<EngineerDetail />} />
              {/* ENG003 - エンジニア登録・編集 */}
              <Route path="new" element={<EngineerRegister />} />
              <Route path="edit/:id" element={<div>エンジニア編集（開発中）</div>} />
              {/* 待機エンジニア管理（ダッシュボードの一部機能） */}
              <Route path="waiting" element={<div>待機中エンジニア（開発中）</div>} />
            </Route>
            
            {/* スキルシート管理 */}
            <Route path="skillsheets">
              {/* SKL001 - スキルシート一覧 */}
              <Route path="list" element={<div>スキルシート一覧（開発中）</div>} />
              {/* SKL002 - スキルシート詳細・編集 */}
              <Route path=":id" element={<div>スキルシート詳細（開発中）</div>} />
              <Route path="edit/:id" element={<div>スキルシート編集（開発中）</div>} />
            </Route>
            
            {/* プロジェクト管理（一時的にコメントアウト） */}
            {/* <Route path="projects">
              <Route path="list" element={<ProjectList />} />
              <Route path=":id" element={<div>プロジェクト詳細（開発中）</div>} />
              <Route path="new" element={<div>プロジェクト登録（開発中）</div>} />
              <Route path="edit/:id" element={<div>プロジェクト編集（開発中）</div>} />
            </Route> */}
            
            {/* アプローチ管理 */}
            <Route path="approaches">
              {/* APP001 - アプローチ履歴 */}
              <Route path="history" element={<div>アプローチ履歴（開発中）</div>} />
              {/* APP002 - アプローチ作成 */}
              <Route path="create" element={<div>アプローチ作成（開発中）</div>} />
            </Route>
            
            {/* 取引先管理（一時的にコメントアウト） */}
            {/* <Route path="business-partners">
              <Route path="list" element={<div>取引先管理（開発中）</div>} />
              <Route path=":id" element={<div>取引先詳細（開発中）</div>} />
            </Route> */}
            
            {/* SRC001 - エンジニア検索 */}
            <Route path="search" element={<div>エンジニア検索（開発中）</div>} />
            
            {/* SET001 - 設定画面 */}
            <Route path="settings" element={<div>設定画面（開発中）</div>} />
            
            {/* プロフィール画面 */}
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* エンジニア個人用画面（専用レイアウト付き） */}
          <Route path="/engineer" element={<EngineerLayout />}>
            <Route index element={<Navigate to="/engineer/dashboard" replace />} />
            <Route path="dashboard" element={<EngineerDashboard />} />
            <Route path="skill-sheet" element={<SkillSheetEdit />} />
            <Route path="skill-sheet/preview" element={<SkillSheetPreview />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;