import axios from 'axios';
import { GistData, TeamRoom, UserProfile, MemberStatus, TeamStatus } from '@/types';
import { GIST_FILES, APP_CONFIG } from '@/constants';

/**
 * 从Gist URL中提取Gist ID
 * @param gistIdOrUrl Gist ID或完整的Gist URL
 * @returns 纯净的Gist ID
 */
function extractGistId(gistIdOrUrl: string): string {
  // 如果是完整的GitHub Gist URL，提取ID部分
  const gistUrlPattern = /(?:https?:\/\/)?(?:gist\.)?github\.com\/[^\/]+\/([a-f0-9]+)/i;
  const match = gistIdOrUrl.match(gistUrlPattern);
  
  if (match) {
    return match[1];
  }
  
  // 如果不是URL格式，直接返回（假设已经是ID）
  return gistIdOrUrl;
}

export class GistService {
  private readonly gistId: string;
  private readonly githubToken?: string;

  constructor(gistId: string, githubToken?: string) {
    this.gistId = extractGistId(gistId);
    this.githubToken = githubToken;
  }

  /**
   * 获取请求头
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    return headers;
  }

  /**
   * 获取所有房间数据
   */
  async getRooms(): Promise<TeamRoom[]> {
    try {
      const response = await axios.get(
        `${APP_CONFIG.GITHUB_API_BASE}/gists/${this.gistId}`,
        { headers: this.getHeaders() }
      );

      const content = response.data.files[GIST_FILES.MAIN_DATA]?.content;
      if (!content) {
        return [];
      }

      const data: GistData = JSON.parse(content);
      return data.rooms || [];
    } catch (error) {
      console.error('获取房间数据失败:', error);
      throw new Error('获取房间数据失败');
    }
  }

  /**
   * 创建新房间
   */
  async createRoom(room: TeamRoom): Promise<void> {
    try {
      const rooms = await this.getRooms();
      rooms.push(room);
      await this.updateGist({ 
        rooms, 
        lastUpdated: new Date().toISOString(),
        version: APP_CONFIG.VERSION
      });
    } catch (error) {
      console.error('创建房间失败:', error);
      throw new Error('创建房间失败');
    }
  }

  /**
   * 更新房间信息
   */
  async updateRoom(roomId: string, updates: Partial<TeamRoom>): Promise<void> {
    try {
      const rooms = await this.getRooms();
      const index = rooms.findIndex(r => r.id === roomId);
      
      if (index === -1) {
        throw new Error('房间不存在');
      }

      rooms[index] = { 
        ...rooms[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };

      await this.updateGist({ 
        rooms, 
        lastUpdated: new Date().toISOString(),
        version: APP_CONFIG.VERSION
      });
    } catch (error) {
      console.error('更新房间失败:', error);
      throw new Error('更新房间失败');
    }
  }

  /**
   * 加入房间
   */
  async joinRoom(roomId: string, user: UserProfile): Promise<void> {
    try {
      const rooms = await this.getRooms();
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        throw new Error('房间不存在');
      }

      if (room.members.length >= room.maxMembers) {
        throw new Error('房间已满');
      }

      // 检查是否已经在房间中
      const isAlreadyMember = room.members.some(m => m.user.id === user.id);
      if (isAlreadyMember) {
        throw new Error('您已经在这个房间中');
      }

      room.members.push({
        user,
        joinedAt: new Date().toISOString(),
        status: MemberStatus.ACTIVE
      });

      // 如果房间满员，更新状态
      if (room.members.length >= room.maxMembers) {
        room.status = TeamStatus.FULL;
      }

      await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('加入房间失败:', error);
      throw error;
    }
  }

  /**
   * 离开房间
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const rooms = await this.getRooms();
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        throw new Error('房间不存在');
      }

      // 移除成员
      room.members = room.members.filter(m => m.user.id !== userId);

      // 如果是队长离开，解散房间
      if (room.leader.id === userId) {
        room.status = TeamStatus.CANCELLED;
      } else if (room.status === TeamStatus.FULL && room.members.length < room.maxMembers) {
        room.status = TeamStatus.RECRUITING;
      }

      await this.updateRoom(roomId, room);
    } catch (error) {
      console.error('离开房间失败:', error);
      throw error;
    }
  }

  /**
   * 删除房间
   */
  async deleteRoom(roomId: string, userId: string): Promise<void> {
    try {
      const rooms = await this.getRooms();
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        throw new Error('房间不存在');
      }

      // 检查权限：只有队长可以删除房间
      if (room.leader.id !== userId) {
        throw new Error('只有队长可以删除房间');
      }
      
      const filteredRooms = rooms.filter(r => r.id !== roomId);
      
      await this.updateGist({ 
        rooms: filteredRooms, 
        lastUpdated: new Date().toISOString(),
        version: APP_CONFIG.VERSION
      });
    } catch (error) {
      console.error('删除房间失败:', error);
      throw error;
    }
  }

  /**
   * 更新Gist数据
   */
  private async updateGist(data: GistData): Promise<void> {
    try {
      await axios.patch(
        `${APP_CONFIG.GITHUB_API_BASE}/gists/${this.gistId}`,
        {
          files: {
            [GIST_FILES.MAIN_DATA]: {
              content: JSON.stringify(data, null, 2)
            }
          }
        },
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('更新Gist失败:', error);
      throw new Error('数据同步失败');
    }
  }

  /**
   * 检查Gist是否存在
   */
  async checkGistExists(): Promise<boolean> {
    try {
      await axios.get(
        `${APP_CONFIG.GITHUB_API_BASE}/gists/${this.gistId}`,
        { headers: this.getHeaders() }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 创建新的Gist
   */
  async createGist(description = 'Tastien 游戏组队数据'): Promise<string> {
    try {
      const response = await axios.post(
        `${APP_CONFIG.GITHUB_API_BASE}/gists`,
        {
          description,
          public: false,
          files: {
            [GIST_FILES.MAIN_DATA]: {
              content: JSON.stringify({
                rooms: [],
                lastUpdated: new Date().toISOString(),
                version: APP_CONFIG.VERSION
              }, null, 2)
            }
          }
        },
        { headers: this.getHeaders() }
      );

      return response.data.id;
    } catch (error) {
      console.error('创建Gist失败:', error);
      throw new Error('创建数据存储失败');
    }
  }
}

// 环境变量验证和配置
const validateConfig = () => {
  const gistId = import.meta.env.VITE_GIST_ID;
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  
  if (!gistId || gistId === 'your_gist_id_here') {
    console.warn('⚠️ VITE_GIST_ID 未配置或使用默认值，请在 .env 文件中设置正确的 Gist ID');
  }
  
  if (!githubToken || githubToken === 'your_github_token_here') {
    console.warn('⚠️ VITE_GITHUB_TOKEN 未配置或使用默认值，请在 .env 文件中设置正确的 GitHub Token');
  }
  
  return {
    gistId: gistId || '',
    githubToken: githubToken || '',
    isConfigured: !!(gistId && githubToken && 
                     gistId !== 'your_gist_id_here' && 
                     githubToken !== 'your_github_token_here')
  };
};

// 默认的Gist服务实例（需要配置Gist ID）
const config = validateConfig();

export const gistService = new GistService(
  config.gistId,
  config.githubToken
);

// 导出配置状态，供其他组件检查
export const isGistServiceConfigured = config.isConfigured;