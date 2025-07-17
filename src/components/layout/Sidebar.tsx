import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TeamOutlined, 
  UserOutlined, 
  BarChartOutlined,
  HomeOutlined 
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/teams',
      icon: <TeamOutlined />,
      label: '组队大厅'
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '数据统计'
    }
  ];

  return (
    <Sider 
      width={240}
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(0, 0, 0, 0.06)'
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ 
          background: 'transparent',
          border: 'none',
          padding: '16px 0'
        }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;