import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Card, 
  Space, 
  Typography,
  message,
  Row,
  Col,
  Divider,
  Tag
} from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks';
import { UserProfile, Profession, PlayerType } from '@/types';
import { PROFESSION_CONFIG, PLAYER_TYPE_CONFIG } from '@/constants';
import { validateUserProfile } from '@/utils';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user, updateUser } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        gameId: user.gameId,
        profession: user.profession,
        combatPower: user.combatPower,
        playerType: user.playerType,
        preferences: {
          preferredActivities: user.preferences.preferredActivities,
          preferredTimeSlots: user.preferences.preferredTimeSlots,
          preferredDifficulties: user.preferences.preferredDifficulties,
          isFlexibleTime: user.preferences.isFlexibleTime
        }
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 根据战力自动分配玩家类型
      let playerType: PlayerType = 'normal';
      if (values.combatPower >= 150000) {
        playerType = 'master';
      } else if (values.combatPower < 80000) {
        playerType = 'newbie';
      }

      const profileData: Partial<UserProfile> = {
        gameId: values.gameId,
        profession: values.profession,
        combatPower: values.combatPower,
        playerType,
        preferences: {
          preferredActivities: values.preferences?.preferredActivities || [],
          preferredTimeSlots: values.preferences?.preferredTimeSlots || [],
          preferredDifficulties: values.preferences?.preferredDifficulties || [],
          isFlexibleTime: values.preferences?.isFlexibleTime || true
        }
      };

      // 验证用户信息
      const errors = validateUserProfile(profileData as UserProfile);
      if (errors.length > 0) {
        message.error(errors[0]);
        return;
      }

      await updateUser(profileData);
      message.success('个人资料更新成功！');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      message.error('更新个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <div>请先登录</div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <UserOutlined />
            个人资料
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            preferences: {
              isFlexibleTime: true
            }
          }}
        >
          <Title level={4}>基本信息</Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gameId"
                label="游戏ID"
                rules={[
                  { required: true, message: '请输入游戏ID' },
                  { min: 2, max: 20, message: '游戏ID长度为2-20个字符' }
                ]}
              >
                <Input placeholder="请输入您的游戏ID" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="profession"
                label="职业"
                rules={[{ required: true, message: '请选择职业' }]}
              >
                <Select placeholder="选择您的职业">
                  {Object.entries(PROFESSION_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Space>
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="combatPower"
                label="战力"
                rules={[
                  { required: true, message: '请输入战力' },
                  { type: 'number', min: 1, message: '战力必须大于0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入您的战力"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item label="玩家类型">
                <div>
                  <Tag color={PLAYER_TYPE_CONFIG[user.playerType].color}>
                    {PLAYER_TYPE_CONFIG[user.playerType].name}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    (根据战力自动分配)
                  </Text>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>游戏偏好</Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name={['preferences', 'preferredActivities']}
                label="偏好活动"
              >
                <Select
                  mode="multiple"
                  placeholder="选择您偏好的活动类型"
                  allowClear
                >
                  <Option value="normal_dungeon">普通副本</Option>
                  <Option value="beast_trial">圣兽试炼</Option>
                  <Option value="duo_tower">双人爬塔</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name={['preferences', 'preferredDifficulties']}
                label="偏好难度"
              >
                <Select
                  mode="multiple"
                  placeholder="选择您偏好的难度等级"
                  allowClear
                >
                  <Option value="简单">简单</Option>
                  <Option value="普通">普通</Option>
                  <Option value="困难">困难</Option>
                  <Option value="地狱">地狱</Option>
                  <Option value="噩梦">噩梦</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name={['preferences', 'preferredTimeSlots']}
                label="偏好时间段"
              >
                <Select
                  mode="multiple"
                  placeholder="选择您的游戏时间段"
                  allowClear
                >
                  <Option value="morning">上午 (9:00-12:00)</Option>
                  <Option value="afternoon">下午 (12:00-18:00)</Option>
                  <Option value="evening">晚上 (18:00-22:00)</Option>
                  <Option value="night">深夜 (22:00-2:00)</Option>
                  <Option value="dawn">凌晨 (2:00-9:00)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>统计信息</Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {user.reputation.score.toFixed(1)}
                  </div>
                  <div style={{ color: '#666' }}>信誉评分</div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {user.reputation.totalGames}
                  </div>
                  <div style={{ color: '#666' }}>参与次数</div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {user.reputation.leaderGames}
                  </div>
                  <div style={{ color: '#666' }}>带队次数</div>
                </div>
              </Card>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              保存资料
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;