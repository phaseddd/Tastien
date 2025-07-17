import { ActivityConfig, ActivityType, Profession } from '@/types';

// 活动配置常量
export const ACTIVITIES: ActivityConfig[] = [
  {
    id: 'dungeon-normal',
    name: '普通副本',
    type: ActivityType.DUNGEON,
    maxPlayers: 4,
    minCombatPower: 50000,
    dailyLimit: 3,
    duration: 30,
    difficulties: [
      {
        level: '简单',
        minCombatPower: 50000,
        rewards: ['经验药水', '金币']
      },
      {
        level: '困难',
        minCombatPower: 80000,
        rewards: ['高级装备', '稀有材料']
      },
      {
        level: '地狱',
        minCombatPower: 120000,
        rewards: ['传说装备', '神话材料']
      }
    ]
  },
  {
    id: 'beast-trial',
    name: '圣兽试炼',
    type: ActivityType.BEAST_TRIAL,
    maxPlayers: 6,
    minCombatPower: 100000,
    dailyLimit: 2,
    duration: 45,
    difficulties: [
      {
        level: '青龙',
        minCombatPower: 100000,
        rewards: ['青龙精华', '龙鳞']
      },
      {
        level: '白虎',
        minCombatPower: 120000,
        rewards: ['白虎精华', '虎骨']
      },
      {
        level: '朱雀',
        minCombatPower: 150000,
        rewards: ['朱雀精华', '凤羽']
      },
      {
        level: '玄武',
        minCombatPower: 180000,
        rewards: ['玄武精华', '龟甲']
      }
    ]
  },
  {
    id: 'tower-climb',
    name: '双人爬塔',
    type: ActivityType.TOWER_CLIMB,
    maxPlayers: 2,
    minCombatPower: 60000,
    dailyLimit: 5,
    duration: 20,
    difficulties: [
      {
        level: '1-10层',
        minCombatPower: 60000,
        rewards: ['塔币', '经验']
      },
      {
        level: '11-20层',
        minCombatPower: 80000,
        rewards: ['高级塔币', '技能书']
      },
      {
        level: '21-30层',
        minCombatPower: 100000,
        rewards: ['稀有塔币', '装备强化石']
      }
    ]
  }
];

// 职业配置
export const PROFESSION_CONFIG = {
  [Profession.KNIGHT]: {
    name: '骑士',
    description: '防御型职业，擅长保护队友',
    color: '#1890ff',
    icon: '🛡️'
  },
  [Profession.FIGHTER]: {
    name: '斗士',
    description: '近战输出职业，高攻击力',
    color: '#f5222d',
    icon: '⚔️'
  },
  [Profession.MAGE]: {
    name: '术士',
    description: '远程魔法职业，群体伤害',
    color: '#722ed1',
    icon: '🔮'
  },
  [Profession.SAGE]: {
    name: '贤者',
    description: '辅助治疗职业，团队支援',
    color: '#52c41a',
    icon: '✨'
  }
};

// 玩家类型配置
export const PLAYER_TYPE_CONFIG = {
  master: {
    name: '大佬',
    description: '实力超群，能够带队',
    color: '#faad14',
    minCombatPower: 150000
  },
  normal: {
    name: '普通',
    description: '实力达标，需要组队',
    color: '#1890ff',
    minCombatPower: 80000
  },
  newbie: {
    name: '萌新',
    description: '需要大佬带领',
    color: '#52c41a',
    minCombatPower: 0
  }
};

// 时间段配置
export const TIME_SLOTS = [
  { label: '早上 (8:00-12:00)', value: '08:00-12:00' },
  { label: '下午 (12:00-18:00)', value: '12:00-18:00' },
  { label: '晚上 (18:00-22:00)', value: '18:00-22:00' },
  { label: '深夜 (22:00-02:00)', value: '22:00-02:00' }
];

// Gist文件命名规则
export const GIST_FILES = {
  MAIN_DATA: 'tastien-rooms.json',      // 主数据文件
  USER_INDEX: 'tastien-users.json',     // 用户索引
  STATISTICS: 'tastien-stats.json'      // 统计数据
};

// 本地存储键名
export const STORAGE_KEYS = {
  USER_PROFILE: 'tastien_user_profile',
  USER_SETTINGS: 'tastien_user_settings',
  CACHED_ROOMS: 'tastien_cached_rooms',
  LAST_SYNC: 'tastien_last_sync'
};

// 应用配置
export const APP_CONFIG = {
  VERSION: '1.0.0',
  REFRESH_INTERVAL: 30000, // 30秒自动刷新
  MAX_ROOMS_PER_PAGE: 20,
  MAX_MEMBERS_DISPLAY: 6,
  GITHUB_API_BASE: 'https://api.github.com',
  DEFAULT_AVATAR: '👤'
};