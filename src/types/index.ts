// TypeScript类型定义

// 职业枚举
export enum Profession {
  KNIGHT = 'knight',     // 骑士
  FIGHTER = 'fighter',   // 斗士
  MAGE = 'mage',        // 术士
  SAGE = 'sage'         // 贤者
}

// 玩家类型枚举
export enum PlayerType {
  MASTER = 'master',     // 大佬
  NORMAL = 'normal',     // 普通
  NEWBIE = 'newbie'      // 萌新
}

// 活动类型枚举
export enum ActivityType {
  DUNGEON = 'dungeon',          // 副本
  BEAST_TRIAL = 'beast_trial',  // 圣兽试炼
  TOWER_CLIMB = 'tower_climb'   // 双人爬塔
}

// 队伍状态枚举
export enum TeamStatus {
  RECRUITING = 'recruiting',   // 招募中
  FULL = 'full',              // 已满员
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',     // 已完成
  CANCELLED = 'cancelled'      // 已取消
}

// 组队模式枚举
export enum TeamMode {
  CARRY = 'carry',            // 大佬带队
  EQUAL = 'equal'             // 平等组队
}

// 成员状态枚举
export enum MemberStatus {
  ACTIVE = 'active',          // 活跃
  PENDING = 'pending',        // 待确认
  OFFLINE = 'offline'         // 离线
}

// 时间段接口
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// 用户偏好设置接口
export interface UserPreferences {
  autoJoin: boolean;          // 自动加入匹配的队伍
  notifications: boolean;     // 接收通知
  preferredActivities: ActivityType[]; // 偏好活动
}

// 信誉评分接口
export interface ReputationScore {
  overall: number;              // 总体评分 (0-100)
  punctuality: number;          // 准时率
  skillMatch: number;           // 实力匹配度
  teamwork: number;             // 团队配合
  carryCount: number;           // 带队次数 (仅大佬)
  participationCount: number;   // 参与次数
}

// 用户信息接口
export interface UserProfile {
  id: string;                    // 用户唯一ID (UUID)
  gameId: string;               // 游戏名
  profession: Profession;       // 职业
  combatPower: number;          // 战力
  playerType: PlayerType;       // 玩家类型
  availableTime: TimeSlot[];    // 可用时间段
  preferences: UserPreferences; // 个人偏好设置
  reputation: ReputationScore;  // 信誉评分
  createdAt: string;           // 创建时间
  lastActive: string;          // 最后活跃时间
}

// 难度等级接口
export interface Difficulty {
  level: string;                // 难度名称
  minCombatPower: number;       // 战力要求
  rewards: string[];            // 奖励描述
}

// 活动配置接口
export interface ActivityConfig {
  id: string;
  name: string;
  type: ActivityType;
  maxPlayers: number;           // 最大人数
  minCombatPower: number;       // 最低战力要求
  dailyLimit: number;           // 每日次数限制
  duration: number;             // 预计耗时(分钟)
  difficulties: Difficulty[];   // 难度等级
}

// 队伍要求接口
export interface TeamRequirements {
  minCombatPower: number;       // 最低战力
  preferredProfessions: Profession[]; // 偏好职业
  playerTypes: PlayerType[];    // 接受的玩家类型
}

// 队伍时间安排接口
export interface TeamSchedule {
  timeSlots: TimeSlot[];        // 可选时间段
  preferredTime?: string;       // 偏好时间
  isFlexible: boolean;          // 时间是否灵活
}

// 队伍成员接口
export interface TeamMember {
  user: UserProfile;
  joinedAt: string;
  status: MemberStatus;        // 成员状态
  role?: string;               // 队内角色
}

// 组队房间接口
export interface TeamRoom {
  id: string;                   // 房间ID
  gistId?: string;             // 对应的Gist ID
  title: string;               // 房间标题
  activity: ActivityConfig;     // 活动信息
  difficulty: string;          // 选择的难度
  leader: UserProfile;         // 队长信息
  members: TeamMember[];       // 队员列表
  maxMembers: number;          // 最大人数
  requirements: TeamRequirements; // 入队要求
  schedule: TeamSchedule;      // 时间安排
  status: TeamStatus;          // 房间状态
  mode: TeamMode;              // 组队模式
  createdAt: string;
  updatedAt: string;
}

// 队伍反馈接口
export interface TeamFeedback {
  onTime: boolean;             // 是否准时
  skillRating: number;         // 技能评分 (1-5)
  teamworkRating: number;      // 团队配合评分 (1-5)
  comment?: string;            // 评价留言
}

// Gist数据结构接口
export interface GistData {
  rooms: TeamRoom[];           // 所有房间数据
  lastUpdated: string;         // 最后更新时间
  version: string;             // 数据版本
}

// 应用状态接口
export interface AppState {
  // 用户状态
  user: UserProfile | null;
  isLoggedIn: boolean;
  
  // 房间状态
  rooms: TeamRoom[];
  currentRoom: TeamRoom | null;
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // 配置状态
  activities: ActivityConfig[];
  
  // 操作方法
  actions: {
    // 用户操作
    setUser: (user: UserProfile) => void;
    updateUserProfile: (updates: Partial<UserProfile>) => void;
    logout: () => void;
    
    // 房间操作
    loadRooms: () => Promise<void>;
    createRoom: (room: Omit<TeamRoom, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    joinRoom: (roomId: string) => Promise<void>;
    leaveRoom: (roomId: string) => Promise<void>;
    
    // UI操作
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
}