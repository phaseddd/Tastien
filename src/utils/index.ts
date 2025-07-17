import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { v4 as uuidv4 } from 'uuid';
import { TimeSlot, UserProfile, TeamRoom } from '@/types';
import { Logger } from './errorHandling';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 获取北京时间
 */
export const getBJTime = (date?: string | Date): dayjs.Dayjs => {
  return dayjs(date).tz('Asia/Shanghai');
};

/**
 * 格式化时间显示
 */
export const formatTime = (time: string | dayjs.Dayjs | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return getBJTime(time as string | Date).format(format);
};

/**
 * 计算时间差（分钟）
 */
export const getTimeDiff = (start: string | Date, end: string | Date): number => {
  return getBJTime(end).diff(getBJTime(start), 'minute');
};

/**
 * 检查时间是否在范围内
 */
export const isTimeInRange = (
  time: string | Date,
  startTime: string,
  endTime: string
): boolean => {
  const target = getBJTime(time);
  const start = getBJTime().hour(parseInt(startTime.split(':')[0])).minute(parseInt(startTime.split(':')[1]));
  const end = getBJTime().hour(parseInt(endTime.split(':')[0])).minute(parseInt(endTime.split(':')[1]));
  
  return target.isAfter(start) && target.isBefore(end);
};

/**
 * 检查时间是否重叠
 */
export const isTimeOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = dayjs(slot1.startTime);
  const end1 = dayjs(slot1.endTime);
  const start2 = dayjs(slot2.startTime);
  const end2 = dayjs(slot2.endTime);
  
  return start1.isBefore(end2) && start2.isBefore(end1);
};

/**
 * 生成UUID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * 计算战力匹配度
 */
export const calculatePowerMatch = (userPower: number, requiredPower: number): number => {
  if (userPower < requiredPower) return 0;
  if (userPower >= requiredPower * 2) return 1;
  return (userPower - requiredPower) / requiredPower;
};

/**
 * 计算时间匹配度
 */
export const calculateTimeMatch = (userTime: TimeSlot[], roomTime: TimeSlot[]): number => {
  let matchCount = 0;
  
  for (const userSlot of userTime) {
    for (const roomSlot of roomTime) {
      if (isTimeOverlap(userSlot, roomSlot)) {
        matchCount++;
        break;
      }
    }
  }
  
  return roomTime.length > 0 ? matchCount / roomTime.length : 0;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 深拷贝对象
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 数组去重
 */
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * 数组分组
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * 文件大小格式化
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * URL参数解析
 */
export const parseUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

/**
 * 生成随机颜色
 */
export const generateRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

/**
 * 检查是否为移动设备
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    Logger.info('Text copied to clipboard');
    return true;
  } catch (error) {
    Logger.error('Failed to copy text to clipboard', error as Error);
    return false;
  }
};

/**
 * 下载文件
 */
export const downloadFile = (data: string, filename: string, type: string = 'text/plain'): void => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 本地存储工具
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      Logger.error(`Error reading localStorage key "${key}"`, error as Error);
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      Logger.error(`Error setting localStorage key "${key}"`, error as Error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      Logger.error(`Error removing localStorage key "${key}"`, error as Error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      Logger.error('Error clearing localStorage', error as Error);
      return false;
    }
  }
};

/**
 * 数组分块
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 获取状态颜色
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    recruiting: 'green',
    full: 'orange',
    in_progress: 'blue',
    completed: 'default',
    cancelled: 'red'
  };
  return colorMap[status] || 'default';
};

/**
 * 获取状态文本
 */
export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    recruiting: '招募中',
    full: '已满员',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || status;
};

/**
 * 验证用户信息
 */
export const validateUserProfile = (profile: Partial<UserProfile>): string[] => {
  const errors: string[] = [];
  
  if (!profile.gameId?.trim()) {
    errors.push('游戏ID不能为空');
  }
  
  if (!profile.profession) {
    errors.push('请选择职业');
  }
  
  if (!profile.combatPower || profile.combatPower <= 0) {
    errors.push('战力必须大于0');
  }
  
  return errors;
};

/**
 * 验证房间信息
 */
export const validateTeamRoom = (room: Partial<TeamRoom>): string[] => {
  const errors: string[] = [];
  
  if (!room.title?.trim()) {
    errors.push('房间标题不能为空');
  }
  
  if (!room.activity) {
    errors.push('请选择活动');
  }
  
  if (!room.difficulty) {
    errors.push('请选择难度');
  }
  
  if (!room.maxMembers || room.maxMembers <= 0) {
    errors.push('最大人数必须大于0');
  }
  
  return errors;
};

/**
 * 格式化数字显示
 */
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString();
};

/**
 * 计算剩余时间
 */
export const getTimeRemaining = (targetTime: string): string => {
  const now = getBJTime();
  const target = dayjs(targetTime);
  const diff = target.diff(now, 'minute');
  
  if (diff <= 0) return '已过期';
  if (diff < 60) return `${diff}分钟后`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时后`;
  return `${Math.floor(diff / 1440)}天后`;
};