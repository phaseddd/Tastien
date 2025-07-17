import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, TeamRoom, ActivityConfig, AppState, MemberStatus } from '@/types';
import { ACTIVITIES, STORAGE_KEYS } from '@/constants';
import { gistService } from '@/services/gistService';
import { generateId, getBJTime } from '@/utils';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      isLoggedIn: false,
      rooms: [],
      currentRoom: null,
      loading: false,
      error: null,
      activities: ACTIVITIES,

      // 操作方法
      actions: {
        // 用户操作
        setUser: (user: UserProfile) => {
          set({ 
            user, 
            isLoggedIn: true,
            error: null 
          });
        },

        updateUserProfile: (updates: Partial<UserProfile>) => {
          const { user } = get();
          if (user) {
            const updatedUser = { 
              ...user, 
              ...updates,
              lastActive: getBJTime().toISOString()
            };
            set({ user: updatedUser });
          }
        },

        logout: () => {
          set({ 
            user: null, 
            isLoggedIn: false,
            currentRoom: null,
            error: null 
          });
        },

        // 房间操作
        loadRooms: async () => {
          set({ loading: true, error: null });
          try {
            const rooms = await gistService.getRooms();
            // 过滤过期房间
            const validRooms = rooms.filter(room => {
              const createdAt = new Date(room.createdAt);
              const now = new Date();
              const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
              return hoursDiff < 24; // 24小时内的房间
            });
            
            set({ rooms: validRooms, loading: false });
          } catch (error) {
            console.error('加载房间失败:', error);
            set({ 
              error: error instanceof Error ? error.message : '加载房间失败',
              loading: false 
            });
          }
        },

        createRoom: async (roomData) => {
          const { user } = get();
          if (!user) {
            set({ error: '请先设置用户信息' });
            return;
          }

          set({ loading: true, error: null });
          try {
            const room: TeamRoom = {
              ...roomData,
              id: generateId(),
              leader: user,
              members: [{
                user,
                joinedAt: getBJTime().toISOString(),
                status: MemberStatus.ACTIVE
              }],
              createdAt: getBJTime().toISOString(),
              updatedAt: getBJTime().toISOString()
            };

            await gistService.createRoom(room);
            
            // 重新加载房间列表
            await get().actions.loadRooms();
            
            set({ loading: false });
          } catch (error) {
            console.error('创建房间失败:', error);
            set({ 
              error: error instanceof Error ? error.message : '创建房间失败',
              loading: false 
            });
          }
        },

        joinRoom: async (roomId: string) => {
          const { user } = get();
          if (!user) {
            set({ error: '请先设置用户信息' });
            return;
          }

          set({ loading: true, error: null });
          try {
            await gistService.joinRoom(roomId, user);
            
            // 重新加载房间列表
            await get().actions.loadRooms();
            
            set({ loading: false });
          } catch (error) {
            console.error('加入房间失败:', error);
            set({ 
              error: error instanceof Error ? error.message : '加入房间失败',
              loading: false 
            });
          }
        },

        leaveRoom: async (roomId: string) => {
          const { user } = get();
          if (!user) {
            set({ error: '请先设置用户信息' });
            return;
          }

          set({ loading: true, error: null });
          try {
            await gistService.leaveRoom(roomId, user.id);
            
            // 重新加载房间列表
            await get().actions.loadRooms();
            
            // 如果离开的是当前房间，清除当前房间
            const { currentRoom } = get();
            if (currentRoom?.id === roomId) {
              set({ currentRoom: null });
            }
            
            set({ loading: false });
          } catch (error) {
            console.error('离开房间失败:', error);
            set({ 
              error: error instanceof Error ? error.message : '离开房间失败',
              loading: false 
            });
          }
        },

        deleteRoom: async (roomId: string) => {
          const { user } = get();
          if (!user) {
            set({ error: '请先设置用户信息' });
            return;
          }

          set({ loading: true, error: null });
          try {
            await gistService.deleteRoom(roomId, user.id);
            
            // 重新加载房间列表
            await get().actions.loadRooms();
            
            // 如果删除的是当前房间，清除当前房间
            const { currentRoom } = get();
            if (currentRoom?.id === roomId) {
              set({ currentRoom: null });
            }
            
            set({ loading: false });
          } catch (error) {
            console.error('删除房间失败:', error);
            set({ 
              error: error instanceof Error ? error.message : '删除房间失败',
              loading: false 
            });
          }
        },

        // UI操作
        setLoading: (loading: boolean) => {
          set({ loading });
        },

        setError: (error: string | null) => {
          set({ error });
        }
      }
    }),
    {
      name: STORAGE_KEYS.USER_PROFILE,
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
);