import React from 'react';
import { Card, Avatar, Tag, Typography, Space, Divider } from 'antd';
import { UserProfile } from '@/types';
import { PROFESSION_CONFIG, PLAYER_TYPE_CONFIG } from '@/constants';
import { formatNumber } from '@/utils';

const { Text, Title } = Typography;

interface UserCardProps {
  user: UserProfile;
  compact?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, compact = false }) => {
  const professionConfig = PROFESSION_CONFIG[user.profession];
  const playerTypeConfig = PLAYER_TYPE_CONFIG[user.playerType];

  if (compact) {
    return (
      <Space>
        <Avatar size="small">
          {professionConfig.icon}
        </Avatar>
        <Text strong>{user.gameId}</Text>
        <Tag color={playerTypeConfig.color}>
          {playerTypeConfig.name}
        </Tag>
      </Space>
    );
  }

  return (
    <Card className="glass-card" style={{ marginBottom: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Avatar size={64} style={{ backgroundColor: professionConfig.color }}>
          {professionConfig.icon}
        </Avatar>
        <Title level={4} style={{ margin: '8px 0 4px' }}>
          {user.gameId}
        </Title>
        <Space>
          <Tag color={professionConfig.color}>
            {professionConfig.name}
          </Tag>
          <Tag color={playerTypeConfig.color}>
            {playerTypeConfig.name}
          </Tag>
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text type="secondary">战力</Text>
          <Text strong style={{ color: '#1890ff' }}>
            {formatNumber(user.combatPower)}
          </Text>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text type="secondary">信誉评分</Text>
          <Text strong style={{ color: user.reputation.overall >= 80 ? '#52c41a' : '#faad14' }}>
            {user.reputation.overall}分
          </Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text type="secondary">参与次数</Text>
          <Text>{user.reputation.participationCount}次</Text>
        </div>

        {user.playerType === 'master' && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">带队次数</Text>
            <Text>{user.reputation.carryCount}次</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserCard;