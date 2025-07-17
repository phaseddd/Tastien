import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  message
} from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useRooms, useUser } from '@/hooks';
import { TeamRoom, TeamMode, TeamStatus, ActivityType } from '@/types';
import { ACTIVITIES, PROFESSION_CONFIG } from '@/constants';
import { validateTeamRoom } from '@/utils';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface CreateRoomModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const { user } = useUser();
  const { createRoom } = useRooms();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('用户信息不存在');
      return;
    }

    setLoading(true);
    try {
      const activity = ACTIVITIES.find(a => a.id === values.activity);
      if (!activity) {
        message.error('请选择有效的活动');
        return;
      }

      const roomData = {
        title: values.title,
        activity,
        difficulty: values.difficulty,
        maxMembers: values.maxMembers || activity.maxPlayers,
        requirements: {
          minCombatPower: values.minCombatPower || activity.minCombatPower,
          preferredProfessions: values.preferredProfessions || [],
          playerTypes: values.playerTypes || ['master', 'normal', 'newbie']
        },
        schedule: {
          timeSlots: [], // 暂时为空，后续可以添加时间选择
          isFlexible: values.flexibleTime || true
        },
        status: 'recruiting' as TeamStatus,
        mode: values.mode || 'equal' as TeamMode
      };

      // 验证房间数据
      const errors = validateTeamRoom(roomData);
      if (errors.length > 0) {
        message.error(errors[0]);
        return;
      }

      await createRoom(roomData);
      message.success('房间创建成功！');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('创建房间失败:', error);
      message.error('创建房间失败');
    } finally {
      setLoading(false);
    }
  };

  const selectedActivityConfig = ACTIVITIES.find(a => a.id === selectedActivity);

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          创建房间
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          mode: 'equal',
          flexibleTime: true,
          playerTypes: ['master', 'normal', 'newbie']
        }}
      >
        <Form.Item
          name="title"
          label="房间标题"
          rules={[
            { required: true, message: '请输入房间标题' },
            { max: 50, message: '标题最多50个字符' }
          ]}
        >
          <Input placeholder="为您的房间起个响亮的名字" />
        </Form.Item>

        <Form.Item
          name="activity"
          label="活动类型"
          rules={[{ required: true, message: '请选择活动类型' }]}
        >
          <Select 
            placeholder="选择要进行的活动"
            onChange={setSelectedActivity}
          >
            {ACTIVITIES.map(activity => (
              <Option key={activity.id} value={activity.id}>
                <div>
                  <div>{activity.name}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {activity.maxPlayers}人 • 最低{activity.minCombatPower}战力 • {activity.duration}分钟
                  </Text>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedActivityConfig && (
          <Form.Item
            name="difficulty"
            label="难度选择"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Select placeholder="选择挑战难度">
              {selectedActivityConfig.difficulties.map(diff => (
                <Option key={diff.level} value={diff.level}>
                  <div>
                    <div>{diff.level}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      最低{diff.minCombatPower}战力 • 奖励: {diff.rewards.join(', ')}
                    </Text>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="mode"
          label="组队模式"
          rules={[{ required: true, message: '请选择组队模式' }]}
        >
          <Select>
            <Option value="equal">
              <div>
                <div>平等组队</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  所有成员平等参与，共同完成挑战
                </Text>
              </div>
            </Option>
            <Option value="carry">
              <div>
                <div>大佬带队</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  高战力玩家带领低战力玩家
                </Text>
              </div>
            </Option>
          </Select>
        </Form.Item>

        <Divider orientation="left">高级设置</Divider>

        <Form.Item
          name="maxMembers"
          label="最大人数"
          tooltip="不填写则使用活动默认人数"
        >
          <InputNumber
            min={2}
            max={selectedActivityConfig?.maxPlayers || 6}
            placeholder={`默认 ${selectedActivityConfig?.maxPlayers || 4} 人`}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="minCombatPower"
          label="最低战力要求"
          tooltip="不填写则使用活动默认要求"
        >
          <InputNumber
            min={1}
            placeholder={`默认 ${selectedActivityConfig?.minCombatPower || 50000}`}
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="preferredProfessions"
          label="偏好职业"
          tooltip="选择希望加入的职业，不选择则接受所有职业"
        >
          <Select
            mode="multiple"
            placeholder="选择偏好的职业（可多选）"
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
        </Form.Item>

        <Form.Item
          name="flexibleTime"
          label="时间安排"
          valuePropName="checked"
        >
          <Switch checkedChildren="时间灵活" unCheckedChildren="固定时间" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建房间
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRoomModal;