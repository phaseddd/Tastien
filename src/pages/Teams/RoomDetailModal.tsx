import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  List,
  Typography,
  Divider,
  message,
  Popconfirm
} from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  DeleteOutlined,
  ExitOutlined
} from '@ant-design/icons';
import { TeamRoom } from '@/types';
import { useRooms, useUser } from '@/hooks';
import { PROFESSION_CONFIG, PLAYER_TYPE_CONFIG } from '@/constants';
import { formatTime, getStatusColor, getStatusText } from '@/utils';
import UserCard from '@/components/common/UserCard';

const { Text, Title } = Typography;

interface RoomDetailModalProps {
  visible: boolean;
  room: TeamRoom | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  visible,
  room,
  onCancel,
  onSuccess
}) => {
  const { user } = useUser();
  const { joinRoom, leaveRoom, deleteRoom } = useRooms();
  const [loading, setLoading] = useState(false);

  if (!room) return null;

  const isLeader = user?.id === room.leader.id;
  const isMember = room.members.some(member => member.user.id === user?.id);
  const canJoin = user && !isMember && room.members.length < room.maxMembers && room.status === 'recruiting';
  const canLeave = user && isMember && !isLeader;

  const handleJoin = async () => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    setLoading(true);
    try {
      await joinRoom(room.id);
      message.success('成功加入队伍！');
      onSuccess();
    } catch (error) {
      console.error('加入队伍失败:', error);
      message.error('加入队伍失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await leaveRoom(room.id);
      message.success('已离开队伍');
      onSuccess();
    } catch (error) {
      console.error('离开队伍失败:', error);
      message.error('离开队伍失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRoom(room.id);
      message.success('房间已删除');
      onSuccess();
    } catch (error) {
      console.error('删除房间失败:', error);
      message.error('删除房间失败');
    } finally {
      setLoading(false);
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (canJoin) {
      buttons.push(
        <Button 
          key="join" 
          type="primary" 
          icon={<TeamOutlined />}
          onClick={handleJoin}
          loading={loading}
        >
          加入队伍
        </Button>
      );
    }

    if (canLeave) {
      buttons.push(
        <Popconfirm
          key="leave"
          title="确定要离开队伍吗？"
          onConfirm={handleLeave}
          okText="确定"
          cancelText="取消"
        >
          <Button 
            icon={<ExitOutlined />}
            loading={loading}
          >
            离开队伍
          </Button>
        </Popconfirm>
      );
    }

    if (isLeader) {
      buttons.push(
        <Popconfirm
          key="delete"
          title="确定要删除房间吗？此操作不可恢复！"
          onConfirm={handleDelete}
          okText="确定"
          cancelText="取消"
        >
          <Button 
            danger 
            icon={<DeleteOutlined />}
            loading={loading}
          >
            删除房间
          </Button>
        </Popconfirm>
      );
    }

    return buttons;
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          房间详情
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>关闭</Button>
          {getActionButtons()}
        </Space>
      }
      width={800}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Title level={4}>{room.title}</Title>
        
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="活动" span={2}>
            <Space>
              <Text strong>{room.activity.name}</Text>
              <Tag color="blue">{room.difficulty}</Tag>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(room.status)}>
              {getStatusText(room.status)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="模式">
            <Tag color={room.mode === 'carry' ? 'gold' : 'green'}>
              {room.mode === 'carry' ? '大佬带队' : '平等组队'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="人数">
            <Space>
              <UserOutlined />
              <Text>{room.members.length}/{room.maxMembers}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="战力要求">
            <Space>
              <TrophyOutlined />
              <Text>{room.requirements.minCombatPower.toLocaleString()}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="创建时间" span={2}>
            <Space>
              <ClockCircleOutlined />
              <Text>{formatTime(room.createdAt)}</Text>
            </Space>
          </Descriptions.Item>
          
          {room.requirements.preferredProfessions.length > 0 && (
            <Descriptions.Item label="偏好职业" span={2}>
              <Space wrap>
                {room.requirements.preferredProfessions.map(profession => {
                  const config = PROFESSION_CONFIG[profession];
                  return (
                    <Tag key={profession} color="blue">
                      <Space size={4}>
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </Space>
                    </Tag>
                  );
                })}
              </Space>
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="时间安排" span={2}>
            <Tag color={room.schedule.isFlexible ? 'green' : 'orange'}>
              {room.schedule.isFlexible ? '时间灵活' : '固定时间'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">队长信息</Divider>
        <UserCard user={room.leader} />

        <Divider orientation="left">队员列表 ({room.members.length}人)</Divider>
        <List
          dataSource={room.members}
          renderItem={(member) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size="large" 
                    style={{ 
                      backgroundColor: member.user.id === room.leader.id ? '#1890ff' : '#87d068' 
                    }}
                  >
                    {member.user.gameId.charAt(0)}
                  </Avatar>
                }
                title={
                  <Space>
                    <Text strong>{member.user.gameId}</Text>
                    {member.user.id === room.leader.id && (
                      <Tag color="blue">队长</Tag>
                    )}
                    <Tag color={PROFESSION_CONFIG[member.user.profession].color}>
                      <Space size={4}>
                        <span>{PROFESSION_CONFIG[member.user.profession].icon}</span>
                        <span>{PROFESSION_CONFIG[member.user.profession].name}</span>
                      </Space>
                    </Tag>
                    <Tag color={PLAYER_TYPE_CONFIG[member.user.playerType].color}>
                      {PLAYER_TYPE_CONFIG[member.user.playerType].name}
                    </Tag>
                  </Space>
                }
                description={
                  <Space>
                    <Text type="secondary">
                      战力: {member.user.combatPower.toLocaleString()}
                    </Text>
                    <Text type="secondary">
                      信誉: {member.user.reputation.overall.toFixed(1)}
                    </Text>
                    <Text type="secondary">
                      加入时间: {formatTime(member.joinedAt)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        {room.members.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>暂无队员</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RoomDetailModal;