import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Space, 
  Button, 
  Row, 
  Col,
  Checkbox,
  InputNumber,
  Typography
} from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { TeamMode, TeamStatus, Profession, PlayerType } from '@/types';
import { ACTIVITIES, PROFESSION_CONFIG, PLAYER_TYPE_CONFIG } from '@/constants';

const { Option } = Select;
const { Text } = Typography;

interface RoomFiltersProps {
  onFilter: (filters: FilterOptions) => void;
  totalRooms: number;
  filteredRooms: number;
}

export interface FilterOptions {
  search: string;
  activity: string;
  difficulty: string;
  mode: TeamMode | '';
  status: TeamStatus | '';
  profession: Profession | '';
  playerType: PlayerType | '';
  minCombatPower: number;
  maxCombatPower: number;
  hasSlots: boolean;
  isFlexibleTime: boolean;
}

const defaultFilters: FilterOptions = {
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
};

const RoomFilters: React.FC<RoomFiltersProps> = ({
  onFilter,
  totalRooms,
  filteredRooms
}) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  const selectedActivityConfig = ACTIVITIES.find(a => a.id === filters.activity);

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          筛选条件
          <Text type="secondary">
            ({filteredRooms}/{totalRooms} 个房间)
          </Text>
        </Space>
      }
      extra={
        <Space>
          <Button 
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起' : '展开'}筛选
          </Button>
          <Button 
            size="small" 
            icon={<ClearOutlined />}
            onClick={handleClear}
          >
            清空
          </Button>
        </Space>
      }
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 基础筛选 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索房间标题..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="选择活动"
              value={filters.activity || undefined}
              onChange={(value) => handleFilterChange('activity', value || '')}
              style={{ width: '100%' }}
              allowClear
            >
              {ACTIVITIES.map(activity => (
                <Option key={activity.id} value={activity.id}>
                  {activity.name}
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="房间状态"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange('status', value || '')}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value={TeamStatus.RECRUITING}>招募中</Option>
              <Option value={TeamStatus.FULL}>已满员</Option>
              <Option value={TeamStatus.IN_PROGRESS}>进行中</Option>
              <Option value={TeamStatus.COMPLETED}>已完成</Option>
            </Select>
          </Col>
        </Row>

        {/* 高级筛选 */}
        {expanded && (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="难度等级"
                  value={filters.difficulty || undefined}
                  onChange={(value) => handleFilterChange('difficulty', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                  disabled={!selectedActivityConfig}
                >
                  {selectedActivityConfig?.difficulties.map(diff => (
                    <Option key={diff.level} value={diff.level}>
                      {diff.level}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="组队模式"
                  value={filters.mode || undefined}
                  onChange={(value) => handleFilterChange('mode', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                >
                  <Option value={TeamMode.EQUAL}>平等组队</Option>
                  <Option value={TeamMode.CARRY}>大佬带队</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="偏好职业"
                  value={filters.profession || undefined}
                  onChange={(value) => handleFilterChange('profession', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {Object.entries(PROFESSION_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Space>
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="玩家类型"
                  value={filters.playerType || undefined}
                  onChange={(value) => handleFilterChange('playerType', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {Object.entries(PLAYER_TYPE_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space.Compact style={{ width: '100%' }}>
                  <InputNumber
                    placeholder="最低战力"
                    value={filters.minCombatPower || undefined}
                    onChange={(value) => handleFilterChange('minCombatPower', value || 0)}
                    style={{ width: '50%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  />
                  <InputNumber
                    placeholder="最高战力"
                    value={filters.maxCombatPower || undefined}
                    onChange={(value) => handleFilterChange('maxCombatPower', value || 0)}
                    style={{ width: '50%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  />
                </Space.Compact>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Checkbox
                  checked={filters.hasSlots}
                  onChange={(e) => handleFilterChange('hasSlots', e.target.checked)}
                >
                  只显示有空位的房间
                </Checkbox>
              </Col>
              
              <Col xs={24} sm={12}>
                <Checkbox
                  checked={filters.isFlexibleTime}
                  onChange={(e) => handleFilterChange('isFlexibleTime', e.target.checked)}
                >
                  只显示时间灵活的房间
                </Checkbox>
              </Col>
            </Row>
          </>
        )}
      </Space>
    </Card>
  );
};

export default RoomFilters;