import { Injectable } from '@nestjs/common';
@Injectable()
export class GamificationService {
  async getStatus(cid: string) {
    return { points: 840, tier: 'gold', streak: 24, longestStreak: 24, activeChallenges: [] };
  }
  async getChallenges() { return { challenges: [] }; }
  async claimReward(cid: string, challengeId: string) { return { success: true, challengeId }; }
  async getHistory(cid: string) { return { history: [] }; }
  /** Called by subscription service each week to update streak */
  async processWeeklyDelivery(cid: string, delivered: boolean) {
    return { newStreak: delivered ? 25 : 0 };
  }
}
