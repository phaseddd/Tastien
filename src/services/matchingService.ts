import { UserProfile, TeamRoom, TimeSlot, Profession } from '@/types';
import { calculatePowerMatch, calculateTimeMatch, isTimeOverlap, chunkArray } from '@/utils';

export class MatchingService {
  /**
   * 计算匹配度分数
   */
  calculateMatchScore(user: UserProfile, room: TeamRoom): number {
    let score = 0;
    
    // 战力匹配 (40%)
    const powerScore = calculatePowerMatch(user.combatPower, room.requirements.minCombatPower);
    score += powerScore * 0.4;
    
    // 时间匹配 (30%)
    const timeScore = calculateTimeMatch(user.availableTime, room.schedule.timeSlots);
    score += timeScore * 0.3;
    
    // 职业搭配 (20%)
    const professionScore = this.calculateProfessionScore(user.profession, room);
    score += professionScore * 0.2;
    
    // 信誉评分 (10%)
    const reputationScore = user.reputation.overall / 100;
    score += reputationScore * 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * 计算职业搭配分数
   */
  private calculateProfessionScore(userProfession: Profession, room: TeamRoom): number {
    // 如果房间没有职业偏好，返回中等分数
    if (!room.requirements.preferredProfessions?.length) {
      return 0.5;
    }

    // 检查是否是偏好职业
    if (room.requirements.preferredProfessions.includes(userProfession)) {
      return 1.0;
    }

    // 检查职业平衡性
    const currentProfessions = room.members.map(m => m.user.profession);
    const professionCount = currentProfessions.filter(p => p === userProfession).length;
    
    // 如果该职业已经很多，降低分数
    if (professionCount >= 2) {
      return 0.3;
    }

    return 0.6;
  }

  /**
   * 推荐最佳房间
   */
  recommendRooms(user: UserProfile, rooms: TeamRoom[]): TeamRoom[] {
    return rooms
      .filter(room => 
        room.status === 'recruiting' && 
        room.members.length < room.maxMembers &&
        user.combatPower >= room.requirements.minCombatPower
      )
      .map(room => ({
        room,
        score: this.calculateMatchScore(user, room)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.room);
  }

  /**
   * 大佬批量带队优化
   */
  optimizeBatchCarry(
    master: UserProfile, 
    applicants: UserProfile[], 
    activity: any,
    timeSlot: TimeSlot
  ): UserProfile[][] {
    const maxTeamSize = activity.maxPlayers;
    const masterCapacity = this.calculateMasterCapacity(master, activity);
    
    // 过滤符合条件的申请者
    const validApplicants = applicants.filter(user => 
      user.combatPower >= activity.minCombatPower &&
      this.hasTimeOverlap(user.availableTime, [timeSlot])
    );

    // 按战力和信誉排序
    validApplicants.sort((a, b) => {
      const scoreA = a.reputation.overall + (a.combatPower / 1000);
      const scoreB = b.reputation.overall + (b.combatPower / 1000);
      return scoreB - scoreA;
    });

    // 分组
    const teams: UserProfile[][] = [];
    const chunks = chunkArray(validApplicants, maxTeamSize - 1); // 减1为大佬预留位置
    
    chunks.forEach((chunk, index) => {
      if (index < masterCapacity) {
        teams.push(chunk);
      }
    });

    return teams;
  }

  /**
   * 计算大佬带队能力
   */
  private calculateMasterCapacity(master: UserProfile, activity: any): number {
    const baseCapacity = Math.floor(activity.dailyLimit / 2); // 基础容量
    const reputationBonus = Math.floor(master.reputation.carryCount / 10); // 经验加成
    return Math.min(baseCapacity + reputationBonus, activity.dailyLimit);
  }

  /**
   * 检查时间重叠
   */
  private hasTimeOverlap(userTime: TimeSlot[], roomTime: TimeSlot[]): boolean {
    for (const userSlot of userTime) {
      for (const roomSlot of roomTime) {
        if (isTimeOverlap(userSlot, roomSlot)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 智能职业搭配建议
   */
  suggestProfessionBalance(currentMembers: UserProfile[], maxMembers: number): Profession[] {
    const currentProfessions = currentMembers.map(m => m.profession);
    const professionCount: Record<Profession, number> = {
      [Profession.KNIGHT]: 0,
      [Profession.FIGHTER]: 0,
      [Profession.MAGE]: 0,
      [Profession.SAGE]: 0
    };

    // 统计当前职业分布
    currentProfessions.forEach(profession => {
      professionCount[profession]++;
    });

    const suggestions: Profession[] = [];
    const remainingSlots = maxMembers - currentMembers.length;

    // 根据队伍规模和当前配置推荐
    if (maxMembers >= 4) {
      // 4人以上队伍，建议平衡配置
      if (professionCount[Profession.KNIGHT] === 0) suggestions.push(Profession.KNIGHT);
      if (professionCount[Profession.SAGE] === 0) suggestions.push(Profession.SAGE);
      if (professionCount[Profession.FIGHTER] < 2) suggestions.push(Profession.FIGHTER);
      if (professionCount[Profession.MAGE] < 2) suggestions.push(Profession.MAGE);
    } else {
      // 小队伍，优先输出和治疗
      if (professionCount[Profession.SAGE] === 0) suggestions.push(Profession.SAGE);
      if (professionCount[Profession.FIGHTER] === 0) suggestions.push(Profession.FIGHTER);
      if (professionCount[Profession.MAGE] === 0) suggestions.push(Profession.MAGE);
    }

    return suggestions.slice(0, remainingSlots);
  }

  /**
   * 计算队伍战力评估
   */
  evaluateTeamPower(members: UserProfile[], activity: any): {
    averagePower: number;
    minPower: number;
    maxPower: number;
    successRate: number;
  } {
    if (members.length === 0) {
      return { averagePower: 0, minPower: 0, maxPower: 0, successRate: 0 };
    }

    const powers = members.map(m => m.combatPower);
    const averagePower = powers.reduce((sum, power) => sum + power, 0) / powers.length;
    const minPower = Math.min(...powers);
    const maxPower = Math.max(...powers);

    // 计算成功率
    let successRate = 0;
    if (minPower >= activity.minCombatPower) {
      const powerRatio = averagePower / activity.minCombatPower;
      successRate = Math.min(powerRatio * 0.8, 1.0); // 最高80%基础成功率
      
      // 职业平衡加成
      const professionBonus = this.calculateProfessionBonus(members);
      successRate = Math.min(successRate + professionBonus, 1.0);
    }

    return {
      averagePower: Math.round(averagePower),
      minPower,
      maxPower,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * 计算职业平衡加成
   */
  private calculateProfessionBonus(members: UserProfile[]): number {
    const professions = new Set(members.map(m => m.profession));
    const uniqueCount = professions.size;
    
    // 职业越多样，加成越高
    return Math.min(uniqueCount * 0.05, 0.2); // 最高20%加成
  }
}

export const matchingService = new MatchingService();