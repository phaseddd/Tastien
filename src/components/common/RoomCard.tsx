import React from 'react';
import { Card, Button, Tag, Space, Typography, Avatar, Tooltip } from 'antd';
import { 
  UserOutlined, 
  EyeOutlined, 
  TeamOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { TeamRoom } from '@/types';
import { PROFESSION_CONFIG } from '@/constants';
import { getStatusColor, getStatusText, formatNumber, formatTime } from '@/utils';
import UserCard from './UserCard';

const { Text, Title } = Typography;

interface RoomCardProps {
  room: TeamRoom;
  onJoin?: (roomId: string) => void;
  onView?: (roomId: string) => void;
  currentUserId?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onJoin, 
  onView, 
  currentUserId 
}) => {
  const canJoin = room.members.length < room.maxMembers && 
                  room.status === 'recruiting' &&
                  !room.members.some(m => m.user.id === currentUserId);

  const isLeader = room.leader.id === currentUserId;
  const isMember = room.members.some(m => m.user.id === currentUserId);

  return (
    <Card 
      className="room-card glass-card"
      style={{ marginBottom: 16 }}
      hoverable
    >
      <div className="room-header">
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
            {room.title}
          </Title>
          <Space size="small">
            <Tag color="blue">{room.activity.name}</Tag>
            <Tag color="orange">{room.difficulty}</Tag>
            <Tag color={room.mode === 'carry' ? 'gold' : 'green'}>
              {room.mode === 'carry' ? '大佬带队' : '平等组队'}
            </Tag>
          </Space>
        </div>
        <Tag color={getStatusColor(room.status)}>
          {getStatusText(room.status)}
        </Tag>
      </div>

      <div className="room-info">
        <div style={{ marginBottom: 12 }}>
          <Space>
            <UserCard user={room.leader} compact />
            <Text type="secondary">(队长)</Text>
          </Space>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text type="secondary">
              <TeamOutlined /> 队伍人数
            </Text>
            <Text strong>
              {room.members.length}/{room.maxMembers}
            </Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text type="secondary">战力要求</Text>
            <Text>{formatNumber(room.requirements.minCombatPower)}+</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text type="secondary">
              <ClockCircleOutlined /> 创建时间
            </Text>
            <Text>{formatTime(room.createdAt, 'MM-DD HH:mm')}</Text>
          </div>
        </div>

        {room.members.length > 1 && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              队员列表:
            </Text>
            <Avatar.Group maxCount={4} size="small">
              {room.members.slice(1).map((member, index) => {
                const professionConfig = PROFESSION_CONFIG[member.user.profession];
                return (
                  <Tooltip 
                    key={index}
                    title={`${member.user.gameId} (${professionConfig.name})`}
                  >
                    <Avatar 
                      style={{ backgroundColor: professionConfig.color }}
                      size="small"
                    >
                      {professionConfig.icon}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </Avatar.Group>
          </div>
        )}

        {room.requirements.preferredProfessions?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>
              偏好职业:
            </Text>
            <Space size="small">
              {room.requirements.preferredProfessions.map(profession => {
                const config = PROFESSION_CONFIG[profession];
                return (
                  <Tag key={profession} color={config.color}>
                    {config.icon} {config.name}
                  </Tag>
                );
              })}
            </Space>
          </div>
        )}
      </div>

      <div className="room-actions">
        <Button 
          icon={<EyeOutlined />}
          onClick={() => onView?.(room.id)}
        >
          查看详情
        </Button>
        
        {canJoin && (
          <Button 
            type="primary" 
            icon={<UserOutlined />}
            onClick={() => onJoin?.(room.id)}
          >
            加入队伍
          </Button>
        )}

        {isMember && !isLeader && (
          <Button danger>
            离开队伍
          </Button>
        )}

        {isLeader && (
          <Button type="primary" ghost>
            管理房间
          </Button>
        )}
      </div>
    </Card>
  );
};

export default RoomCard;