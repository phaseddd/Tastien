import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Typography,
  Select,
  Button,
  Empty
} from 'antd';
import { 
  TrophyOutlined, 
  TeamOutlined, 
  ClockCircleOutlined,
  StarOutlined,
  BarChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useUser, useRooms } from '@/hooks';
import { TeamRoom } from '@/types';
import { PROFESSION_CONFIG, PLAYER_TYPE_CONFIG, ACTIVITIES } from '@/constants';
import { formatTime, getStatusColor, getStatusText } from '@/utils';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { Option } = Select;

interface StatisticsData {
  totalRooms: number;
  completedRooms: number;
  leaderRooms: number;
  averageRating: number;
  favoriteActivity: string;
  totalPlayTime: number;
  recentRooms: TeamRoom[];
}

const Statistics: React.FC = () => {
  const { user } = useUser();
  const { rooms, loading, refreshRooms } = useRooms();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalRooms: 0,
    completedRooms: 0,
    leaderRooms: 0,
    averageRating: 0,
    favoriteActivity: '',
    totalPlayTime: 0,
    recentRooms: []
  });

  useEffect(() => {
    if (user && rooms.length > 0) {
      calculateStatistics();
    }
  }, [user, rooms, timeRange]);

  const calculateStatistics = () => {
    if (!user) return;

    // 筛选用户参与的房间
    const userRooms = rooms.filter(room => 
      room.leader.id === user.id || 
      room.members.some(member => member.user.id === user.id)
    );

    // 根据时间范围筛选
    const now = new Date();
    const filteredRooms = userRooms.filter(room => {
      const roomDate = new Date(room.createdAt);
      switch (timeRange) {
        case 'week':
          return now.getTime() - roomDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now.getTime() - roomDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    const completedRooms = filteredRooms.filter(room => room.status === 'completed');
    const leaderRooms = filteredRooms.filter(room => room.leader.id === user.id);

    // 计算最喜欢的活动
    const activityCount: Record<string, number> = {};
    filteredRooms.forEach(room => {
      activityCount[room.activity.id] = (activityCount[room.activity.id] || 0) + 1;
    });
    const favoriteActivity = Object.keys(activityCount).reduce((a, b) => 
      activityCount[a] > activityCount[b] ? a : b, ''
    );

    // 计算总游戏时间（估算）
    const totalPlayTime = completedRooms.reduce((total, room) => 
      total + room.activity.duration, 0
    );

    setStatistics({
      totalRooms: filteredRooms.length,
      completedRooms: completedRooms.length,
      leaderRooms: leaderRooms.length,
      averageRating: user.reputation.overall,
      favoriteActivity,
      totalPlayTime,
      recentRooms: filteredRooms.slice(0, 10)
    });
  };

  const columns: ColumnsType<TeamRoom> = [
    {
      title: '房间标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>
    },
    {
      title: '活动',
      dataIndex: 'activity',
      key: 'activity',
      render: (activity) => (
        <Space>
          <Text>{activity.name}</Text>
        </Space>
      )
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => (
        <Tag color="blue">{difficulty}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '角色',
      key: 'role',
      render: (_, record) => (
        <Tag color={record.leader.id === user?.id ? 'gold' : 'green'}>
          {record.leader.id === user?.id ? '队长' : '队员'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => formatTime(time)
    }
  ];

  if (!user) {
    return (
      <Card>
        <Empty description="请先登录查看统计数据" />
      </Card>
    );
  }

  const favoriteActivityConfig = ACTIVITIES.find(a => a.id === statistics.favoriteActivity);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <BarChartOutlined />
            数据统计
          </Space>
        }
        extra={
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="week">最近一周</Option>
              <Option value="month">最近一月</Option>
              <Option value="all">全部时间</Option>
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshRooms}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="参与房间"
                value={statistics.totalRooms}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="完成房间"
                value={statistics.completedRooms}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="带队次数"
                value={statistics.leaderRooms}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="游戏时长"
                value={statistics.totalPlayTime}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 详细信息 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card size="small" title="个人信息">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">游戏ID: </Text>
                  <Text strong>{user.gameId}</Text>
                </div>
                <div>
                  <Text type="secondary">职业: </Text>
                  <Tag color={PROFESSION_CONFIG[user.profession].color}>
                    <Space size={4}>
                      <span>{PROFESSION_CONFIG[user.profession].icon}</span>
                      <span>{PROFESSION_CONFIG[user.profession].name}</span>
                    </Space>
                  </Tag>
                </div>
                <div>
                  <Text type="secondary">玩家类型: </Text>
                  <Tag color={PLAYER_TYPE_CONFIG[user.playerType].color}>
                    {PLAYER_TYPE_CONFIG[user.playerType].name}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary">战力: </Text>
                  <Text strong>{user.combatPower.toLocaleString()}</Text>
                </div>
                <div>
                  <Text type="secondary">信誉评分: </Text>
                  <Text strong style={{ color: '#1890ff' }}>
                    {user.reputation.overall.toFixed(1)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card size="small" title="游戏偏好">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">最喜欢的活动: </Text>
                  <Text strong>
                    {favoriteActivityConfig?.name || '暂无数据'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">完成率: </Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {statistics.totalRooms > 0 
                      ? ((statistics.completedRooms / statistics.totalRooms) * 100).toFixed(1)
                      : 0
                    }%
                  </Text>
                </div>
                <div>
                  <Text type="secondary">带队率: </Text>
                  <Text strong style={{ color: '#fa8c16' }}>
                    {statistics.totalRooms > 0 
                      ? ((statistics.leaderRooms / statistics.totalRooms) * 100).toFixed(1)
                      : 0
                    }%
                  </Text>
                </div>
                <div>
                  <Text type="secondary">偏好时间: </Text>
                  <Tag color={user.preferences?.isFlexibleTime ? 'green' : 'orange'}>
                    {user.preferences?.isFlexibleTime ? '时间灵活' : '固定时间'}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 最近参与的房间 */}
        <Card size="small" title="最近参与的房间">
          <Table
            columns={columns}
            dataSource={statistics.recentRooms}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: false
            }}
            loading={loading}
            locale={{
              emptyText: '暂无参与记录'
            }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default Statistics;