import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import { lazy, Suspense, useEffect } from 'react';
import './App.css';

// レイアウトコンポーネント（常に必要なので通常インポート）
import MainLayout from './layouts/MainLayout';
import EngineerLayout from './layouts/EngineerLayout';
import ClientLayout from './layouts/ClientLayout';

// ガードコンポーネント
import AuthGuard from './components/guards/AuthGuard';
import AdminGuard from './components/guards/AdminGuard';
import CompanyGuard from './components/guards/CompanyGuard';

// 認証ストア
import { useAuthStore } from './stores/authStore';

// Axios設定
import axios from 'axios';

// APIベースURLの設定（/api/v1を削除）
axios.defaults.baseURL = 'http://localhost:8000';

// 認証ページ
const Login = lazy(() => import('./pages/auth/Login'));
const ClientLogin = lazy(() => import('./pages/auth/ClientLogin'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Test = lazy(() => import('./pages/Test'));

// ページコンポーネントを動的インポート
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const EngineerList = lazy(() => import('./pages/Engineers/EngineerList'));
const EngineerDetail = lazy(() => import('./pages/Engineers/EngineerDetail'));
const EngineerRegister = lazy(() => import('./pages/Engineers/EngineerRegister'));
const SkillSheetEdit = lazy(() => import('./pages/engineer/SkillSheet'));
const SkillSheetPreview = lazy(() => import('./pages/engineer/SkillSheetPreview'));
const EngineerDashboard = lazy(() => import('./pages/engineer/Dashboard'));
const EngineerLogin = lazy(() => import('./pages/engineer/Login'));
const EngineerSignup = lazy(() => import('./pages/engineer/Register'));
const BusinessPartnerRegister = lazy(() => import('./pages/BusinessPartners/BusinessPartnerRegister'));
const BusinessPartnerList = lazy(() => import('./pages/BusinessPartners/BusinessPartnerList'));
const BusinessPartnerDetail = lazy(() => import('./pages/BusinessPartners/BusinessPartnerDetail'));
const ApproachHistory = lazy(() => import('./pages/Approaches/ApproachHistory'));
const ApproachCreate = lazy(() => import('./pages/Approaches/ApproachCreate'));
const UserProfile = lazy(() => import('./pages/Profile/UserProfile'));
// const ProjectList = lazy(() => import('./pages/Projects/ProjectList')); // 一時的にコメントアウト

// 取引先企業向けページコンポーネント
const OfferBoard = lazy(() => import('./pages/Client/OfferBoard'));
const OfferManagement = lazy(() => import('./pages/Client/OfferManagement'));
const OfferHistory = lazy(() => import('./pages/Client/OfferHistory'));
const ClientEngineerSearch = lazy(() => import('./pages/Client/EngineerSearch'));
const ClientTestPage = lazy(() => import('./pages/Client/TestPage'));
const ClientDebug = lazy(() => import('./pages/Client/Debug'));
const ClientApiTest = lazy(() => import('./pages/Client/ApiTest'));

// ローディングコンポーネント
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="読み込み中..." />
  </div>
);

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // アプリケーション起動時に認証状態をチェック
    // Zustandのpersistがロード完了後、トークンがある場合のみチェック
    // ユーザー情報もロードされていることを確認（userTypeの判定のため）
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return (
    <ConfigProvider locale={jaJP}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* テストページ */}
            <Route path="/test" element={
              <Suspense fallback={<PageLoader />}>
                <Test />
              </Suspense>
            } />
            
            {/* 認証ページ（ガードなし） */}
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/client/login" element={
              <Suspense fallback={<PageLoader />}>
                <ClientLogin />
              </Suspense>
            } />
            <Route path="/client/test-noauth" element={
              <Suspense fallback={<PageLoader />}>
                <ClientTestPage />
              </Suspense>
            } />
            <Route path="/client/debug" element={
              <Suspense fallback={<PageLoader />}>
                <ClientDebug />
              </Suspense>
            } />
            <Route path="/client/api-test" element={
              <Suspense fallback={<PageLoader />}>
                <ClientApiTest />
              </Suspense>
            } />
            <Route path="/unauthorized" element={
              <Suspense fallback={<PageLoader />}>
                <Unauthorized />
              </Suspense>
            } />

            {/* SES企業向け画面（設計書準拠） - 認証必須 */}
            <Route path="/" element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              {/* DASH001 - ダッシュボード */}
              <Route path="dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              } />
              
              {/* エンジニア管理 */}
              <Route path="engineers">
                {/* ENG001 - エンジニア一覧 */}
                <Route path="list" element={
                  <Suspense fallback={<PageLoader />}>
                    <EngineerList />
                  </Suspense>
                } />
                {/* ENG002 - エンジニア詳細 */}
                <Route path=":id" element={
                  <Suspense fallback={<PageLoader />}>
                    <EngineerDetail />
                  </Suspense>
                } />
                {/* ENG003 - エンジニア登録・編集 */}
                <Route path="new" element={
                  <Suspense fallback={<PageLoader />}>
                    <EngineerRegister />
                  </Suspense>
                } />
                <Route path="edit/:id" element={<div>エンジニア編集（開発中）</div>} />
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
                <Route path="history" element={
                  <Suspense fallback={<PageLoader />}>
                    <ApproachHistory />
                  </Suspense>
                } />
                {/* APP002 - アプローチ作成 */}
                <Route path="create" element={
                  <Suspense fallback={<PageLoader />}>
                    <ApproachCreate />
                  </Suspense>
                } />
              </Route>
              
              {/* 取引先管理 */}
              <Route path="business-partners">
                <Route path="list" element={
                  <Suspense fallback={<PageLoader />}>
                    <BusinessPartnerList />
                  </Suspense>
                } />
                <Route path=":id" element={
                  <Suspense fallback={<PageLoader />}>
                    <BusinessPartnerDetail />
                  </Suspense>
                } />
                <Route path="new" element={
                  <Suspense fallback={<PageLoader />}>
                    <BusinessPartnerRegister />
                  </Suspense>
                } />
                <Route path="edit/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <BusinessPartnerRegister />
                  </Suspense>
                } />
              </Route>
              
              
              {/* SET001 - 設定画面 */}
              <Route path="settings" element={<div>設定画面（開発中）</div>} />
              
              {/* プロフィール画面 */}
              <Route path="profile" element={
                <Suspense fallback={<PageLoader />}>
                  <UserProfile />
                </Suspense>
              } />
            </Route>

            {/* エンジニア認証画面（レイアウトなし） */}
            <Route path="/engineer/login" element={
              <Suspense fallback={<PageLoader />}>
                <EngineerLogin />
              </Suspense>
            } />
            <Route path="/engineer/register" element={
              <Suspense fallback={<PageLoader />}>
                <EngineerSignup />
              </Suspense>
            } />

            {/* エンジニア個人用画面（専用レイアウト付き） - 認証必鞈 */}
            <Route path="/engineer" element={<EngineerLayout />}>
              <Route index element={<Navigate to="/engineer/dashboard" replace />} />
              <Route path="dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <EngineerDashboard />
                </Suspense>
              } />
              <Route path="skill-sheet" element={
                <Suspense fallback={<PageLoader />}>
                  <SkillSheetEdit />
                </Suspense>
              } />
              <Route path="skill-sheet/preview" element={
                <Suspense fallback={<PageLoader />}>
                  <SkillSheetPreview />
                </Suspense>
              } />
              <Route path="profile" element={<div>エンジニアプロフィール編集（開発中）</div>} />
              <Route path="approach-history" element={<div>アプローチ履歴（開発中）</div>} />
              <Route path="settings" element={<div>エンジニア設定（開発中）</div>} />
            </Route>

            {/* 取引先企業向け画面（専用レイアウト付き） - 認証必須 */}
            <Route path="/client" element={
              <AuthGuard requireRoles={['client_admin', 'client_user']} redirectTo="/client/login">
                <ClientLayout />
              </AuthGuard>
            }>
              <Route index element={<Navigate to="/client/offer-board" replace />} />
              {/* テストページ（デバッグ用） */}
              <Route path="test" element={
                <Suspense fallback={<PageLoader />}>
                  <ClientTestPage />
                </Suspense>
              } />
              {/* CLI001 - オファーボード */}
              <Route path="offer-board" element={
                <Suspense fallback={<PageLoader />}>
                  <OfferBoard />
                </Suspense>
              } />
              {/* CLI004 - オファー管理 */}
              <Route path="offer-management" element={
                <Suspense fallback={<PageLoader />}>
                  <OfferManagement />
                </Suspense>
              } />
              {/* CLI005 - オファー履歴 */}
              <Route path="offer-history" element={
                <Suspense fallback={<PageLoader />}>
                  <OfferHistory />
                </Suspense>
              } />
              {/* CLI002 - エンジニア検索（取引先用） */}
              <Route path="engineers/search" element={
                <Suspense fallback={<PageLoader />}>
                  <ClientEngineerSearch />
                </Suspense>
              } />
              {/* CLI003 - エンジニア詳細（取引先用） */}
              <Route path="engineers/:id" element={<div>エンジニア詳細（開発中）</div>} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
}

export default App;