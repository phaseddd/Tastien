import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppStore } from '@/stores';
import { TeamRoom, UserProfile } from '@/types';
import { MatchingService } from '@/services/matchingService';

const matchingService = new MatchingService();

/**
 * 房间管理Hook
 */
export const useRooms = () => {
  const { rooms, loading, actions } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const refreshRooms = useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.loadRooms();
    } finally {
      setRefreshing(false);
    }
  }, [actions]);

  return {
    rooms,
    loading: loading || refreshing,
    refreshRooms,
    createRoom: actions.createRoom,
    joinRoom: actions.joinRoom,
    leaveRoom: actions.leaveRoom
  };
};

/**
 * 匹配推荐Hook
 */
export const useMatching = () => {
  const getRecommendedRooms = useCallback((user: UserProfile, rooms: TeamRoom[]) => {
    return matchingService.recommendRooms(user, rooms);
  }, []);

  const calculateMatchScore = useCallback((user: UserProfile, room: TeamRoom) => {
    return matchingService.calculateMatchScore(user, room);
  }, []);

  return {
    getRecommendedRooms,
    calculateMatchScore
  };
};

/**
 * 用户状态Hook
 */
export const useUser = () => {
  const { user, isLoggedIn, actions } = useAppStore();

  return {
    user,
    isLoggedIn,
    setUser: actions.setUser,
    updateUser: actions.updateUserProfile,
    logout: actions.logout
  };
};

/**
 * 加载状态Hook
 */
export const useLoading = () => {
  const { loading, error, actions } = useAppStore();

  return {
    loading,
    error,
    setLoading: actions.setLoading,
    setError: actions.setError,
    clearError: () => actions.setError(null)
  };
};

/**
 * 房间过滤Hook
 */
export const useRoomFilters = (rooms: TeamRoom[]) => {
  const [filters, setFilters] = useState({
    activity: '',
    status: '',
    mode: '',
    minCombatPower: 0,
    maxCombatPower: 999999
  });

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (filters.activity && room.activity.type !== filters.activity) {
        return false;
      }
      if (filters.status && room.status !== filters.status) {
        return false;
      }
      if (filters.mode && room.mode !== filters.mode) {
        return false;
      }
      if (room.requirements.minCombatPower < filters.minCombatPower) {
        return false;
      }
      if (room.requirements.minCombatPower > filters.maxCombatPower) {
        return false;
      }
      return true;
    });
  }, [rooms, filters]);

  return {
    filters,
    setFilters,
    filteredRooms,
    clearFilters: () => setFilters({
      activity: '',
      status: '',
      mode: '',
      minCombatPower: 0,
      maxCombatPower: 999999
    })
  };
};

/**
 * 本地存储Hook
 */
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue] as const;
};

/**
 * 定时刷新Hook
 */
export const useAutoRefresh = (callback: () => void, interval: number = 30000) => {
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  // 使用useEffect处理定时器
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive) {
      intervalId = setInterval(callback, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, callback, interval]);

  return { isActive, start, stop };
};