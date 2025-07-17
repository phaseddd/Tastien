import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, message } from 'antd';
import { useUser, useLoading } from '@/hooks';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import HomePage from '@/pages/Home';
import ProfilePage from '@/pages/Profile';
import TeamsPage from '@/pages/Teams';
import StatisticsPage from '@/pages/Statistics';

const { Content } = Layout;

const App: React.FC = () => {
  const { user, isLoggedIn } = useUser();
  const { error, clearError } = useLoading();

  // 显示错误消息
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
          <Header />
          <Layout style={{ background: 'transparent' }}>
            {isLoggedIn && <Sidebar />}
            <Content style={{ background: 'transparent' }}>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    isLoggedIn ? <Navigate to="/teams" replace /> : <HomePage />
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    isLoggedIn ? <ProfilePage /> : <Navigate to="/" replace />
                  } 
                />
                <Route 
                  path="/teams" 
                  element={
                    isLoggedIn ? <TeamsPage /> : <Navigate to="/" replace />
                  } 
                />
                <Route 
                  path="/statistics" 
                  element={
                    isLoggedIn ? <StatisticsPage /> : <Navigate to="/" replace />
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </div>
    </div>
  );
};

export default App;