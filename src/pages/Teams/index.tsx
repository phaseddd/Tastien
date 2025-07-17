import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Space, 
  Row, 
  Col, 
  Typography,
  Empty,
  Spin,
  message,
  Pagination
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { useRooms, useUser, useMatching } from '@/hooks';
import { TeamRoom } from '@/types';
import RoomCard from '@/components/common/RoomCard';
import UserCard from '@/components/common/UserCard';
import CreateRoomModal from './CreateRoomModal';
import RoomDetailModal from './RoomDetailModal';
import RoomFilters, { FilterOptions } from './RoomFilters';

const { Content } = Layout;
const { Title, Text } = Typography;

const Teams: React.FC = () => {
  const { user } = useUser();
  const { rooms, loading, refreshRooms, joinRoom, leaveRoom } = useRooms();
  const { getRecommendedRooms } = useMatching();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<TeamRoom | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    activity: '',
    difficulty: '',
    mode: '',
    status: '',
    profession: '',
    playerType: '',
    minCombatPower: 0,
    maxCombatPower: 0,
    hasSlots: false,
    isFlexibleTime: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // 页面加载时获取房间数据
  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  // 搜索过滤
  const searchedRooms = filteredRooms.filter(room =>
    room.title.toLowerCase().includes(searchText.toLowerCase()) ||
    room.activity.name.toLowerCase().includes(searchText.toLowerCase()) ||
    room.leader.gameId.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom(roomId);
      message.success('成功加入房间！');
    } catch (error) {
      message.error('加入房间失败');
    }
  };

  const handleViewRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      Modal.info({
        title: room.title,
        width: 600,
        content: (
          <div>
            <p><strong>活动：</strong>{room.activity.name} - {room.difficulty}</p>
            <p><strong>队长：</strong>{room.leader.gameId}</p>
            <p><strong>人数：</strong>{room.members.length}/{room.maxMembers}</p>
            <p><strong>战力要求：</strong>{room.requirements.minCombatPower}+</p>
            <p><strong>模式：</strong>{room.mode === 'carry' ? '大佬带队' : '平等组队'}</p>
            {room.members.length > 0 && (
              <div>
                <p><strong>队员列表：</strong></p>
                {room.members.map((member, index) => (
                  <div key={index} style={{ marginLeft: 16 }}>
                    • {member.user.gameId} ({member.user.profession})
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      });
    }
  };

  if (!user) {
    return <div>用户信息加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24}>
        {/* 左侧边栏 */}
        <Col xs={24} lg={6}>
          <div style={{ position: 'sticky', top: 24 }}>
            {/* 用户信息卡片 */}
            <UserCard user={user} />

            {/* 推荐房间 */}
            {recommendations.length > 0 && (
              <Card 
                title="🎯 推荐房间" 
                size="small"
                className="glass-card"
                style={{ marginBottom: 16 }}
              >
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {recommendations.slice(0, 3).map(room => (
                    <div 
                      key={room.id}
                      style={{ 
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewRoom(room.id)}
                    >
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {room.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {room.activity.name} • {room.members.length}/{room.maxMembers}人
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 快速操作 */}
            <Card 
              title="⚡ 快速操作" 
              size="small"
              className="glass-card"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  block
                  onClick={() => setCreateModalVisible(true)}
                >
                  创建房间
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  loading={refreshing}
                  block
                  onClick={refreshRooms}
                >
                  刷新房间
                </Button>
              </Space>
            </Card>
          </div>
        </Col>

        {/* 主内容区 */}
        <Col xs={24} lg={18}>
          {/* 页面标题和操作栏 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 16 
            }}>
              <Title level={3} style={{ margin: 0 }}>
                🏟️ 组队大厅
              </Title>
              <Text type="secondary">
                共 {searchedRooms.length} 个房间
              </Text>
            </div>

            {/* 搜索和筛选 */}
            <Row gutter={16}>
              <Col flex="auto">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="搜索房间标题、活动或队长..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  筛选
                </Button>
              </Col>
            </Row>

            {/* 筛选器 */}
            {showFilters && (
              <Card size="small" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Select
                      placeholder="活动类型"
                      value={filters.activity || undefined}
                      onChange={(value) => setFilters({ ...filters, activity: value || '' })}
                      allowClear
                      style={{ width: '100%' }}
                    >
                      <Option value="dungeon">副本</Option>
                      <Option value="beast_trial">圣兽试炼</Option>
                      <Option value="tower_climb">双人爬塔</Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="房间状态"
                      value={filters.status || undefined}
                      onChange={(value) => setFilters({ ...filters, status: value || '' })}
                      allowClear
                      style={{ width: '100%' }}
                    >
                      <Option value="recruiting">招募中</Option>
                      <Option value="full">已满员</Option>
                      <Option value="in_progress">进行中</Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="组队模式"
                      value={filters.mode || undefined}
                      onChange={(value) => setFilters({ ...filters, mode: value || '' })}
                      allowClear
                      style={{ width: '100%' }}
                    >
                      <Option value="carry">大佬带队</Option>
                      <Option value="equal">平等组队</Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Button 
                      type="link" 
                      onClick={() => setFilters({
                        activity: '',
                        status: '',
                        mode: '',
                        minCombatPower: 0,
                        maxCombatPower: 999999
                      })}
                    >
                      清除筛选
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          </div>

          {/* 房间列表 */}
          <Spin spinning={refreshing}>
            {searchedRooms.length === 0 ? (
              <Empty
                description="暂无房间"
                style={{ padding: '60px 0' }}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  创建第一个房间
                </Button>
              </Empty>
            ) : (
              <div>
                {searchedRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    currentUserId={user.id}
                    onJoin={handleJoinRoom}
                    onView={handleViewRoom}
                  />
                ))}
              </div>
            )}
          </Spin>
        </Col>
      </Row>

      {/* 创建房间弹窗 */}
      <CreateRoomModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          refreshRooms();
        }}
      />
    </div>
  );
};

export default TeamsPage;