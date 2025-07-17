import React from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AntHeader 
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div 
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <Title 
          level={3} 
          style={{ 
            margin: 0, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          🎮 Tastien
        </Title>
      </div>

      {isLoggedIn && user && (
        <Space>
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => navigate('/profile')}
          >
            {user.gameId}
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            danger
          >
            退出
          </Button>
        </Space>
      )}
    </AntHeader>
  );
};

export default Header;