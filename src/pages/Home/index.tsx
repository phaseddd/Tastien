import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Typography, 
  Space,
  Divider,
  Alert
} from 'antd';
import { UserOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks';
import { UserProfile, Profession, PlayerType } from '@/types';
import { PROFESSION_CONFIG, PLAYER_TYPE_CONFIG } from '@/constants';
import { generateId, getBJTime, validateUserProfile } from '@/utils';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // 验证用户信息
      const errors = validateUserProfile(values);
      if (errors.length > 0) {
        form.setFields(errors.map(error => ({
          name: '',
          errors: [error]
        })));
        return;
      }

      // 根据战力自动判断玩家类型
      let playerType: PlayerType = PlayerType.NEWBIE;
      if (values.combatPower >= PLAYER_TYPE_CONFIG.master.minCombatPower) {
        playerType = PlayerType.MASTER;
      } else if (values.combatPower >= PLAYER_TYPE_CONFIG.normal.minCombatPower) {
        playerType = PlayerType.NORMAL;
      }

      // 创建用户资料
      const userProfile: UserProfile = {
        id: generateId(),
        gameId: values.gameId.trim(),
        profession: values.profession,
        combatPower: values.combatPower,
        playerType,
        availableTime: [], // 稍后在个人资料页面设置
        preferences: {
          autoJoin: false,
          notifications: true,
          preferredActivities: []
        },
        reputation: {
          overall: 75, // 新用户默认75分
          punctuality: 75,
          skillMatch: 75,
          teamwork: 75,
          carryCount: 0,
          participationCount: 0
        },
        createdAt: getBJTime().toISOString(),
        lastActive: getBJTime().toISOString()
      };

      setUser(userProfile);
      navigate('/teams');
    } catch (error) {
      console.error('创建用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Card 
        className="glass-card"
        style={{ 
          width: '100%', 
          maxWidth: 500,
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            🎮 欢迎来到 Tastien
          </Title>
          <Paragraph type="secondary">
            高效的游戏组队系统，让你快速找到合适的队友
          </Paragraph>
        </div>

        <Alert
          message="开始使用"
          description="请填写您的游戏信息，系统将根据您的战力自动分配玩家类型"
          type="info"
          showIcon
          style={{ marginBottom: 24, textAlign: 'left' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="gameId"
            label="游戏ID"
            rules={[
              { required: true, message: '请输入游戏ID' },
              { min: 2, message: '游戏ID至少2个字符' },
              { max: 20, message: '游戏ID最多20个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="请输入您的游戏ID"
            />
          </Form.Item>

          <Form.Item
            name="profession"
            label="职业"
            rules={[{ required: true, message: '请选择职业' }]}
          >
            <Select placeholder="请选择您的职业">
              {Object.entries(PROFESSION_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    <span>{config.icon}</span>
                    <span>{config.name}</span>
                    <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                      {config.description}
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="combatPower"
            label="当前战力"
            rules={[
              { required: true, message: '请输入战力' },
              { type: 'number', min: 1, message: '战力必须大于0' }
            ]}
          >
            <InputNumber
              prefix={<TrophyOutlined />}
              placeholder="请输入您的战力"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Paragraph type="secondary" style={{ fontSize: '12px' }}>
              玩家类型将根据战力自动分配：
            </Paragraph>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {Object.entries(PLAYER_TYPE_CONFIG).map(([key, config]) => (
                <div key={key} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#8c8c8c'
                }}>
                  <span style={{ color: config.color }}>
                    {config.name}
                  </span>
                  <span>
                    {config.minCombatPower > 0 
                      ? `${config.minCombatPower.toLocaleString()}+ 战力`
                      : '新手玩家'
                    }
                  </span>
                </div>
              ))}
            </Space>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ width: '100%' }}
            >
              开始组队之旅
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default HomePage;