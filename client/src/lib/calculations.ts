import type {
  InvestmentInput,
  InvestmentResult,
  DailyEarning,
  ReferralInput,
  ReferralReward,
  TeamRewardInput,
  TeamRewardResult,
} from '@shared/schema';
import { teamTiers } from '@shared/schema';

export function calculateInvestment(input: InvestmentInput): InvestmentResult {
  const { rwaCount, productType, duration, dailyRate } = input;
  
  const amount = rwaCount * 100;
  
  let totalDays: number;
  let totalReturn: number;
  let dailyReturn: number;
  
  if (productType === 'short') {
    totalDays = duration || 7;
    totalReturn = amount * 0.05;
    dailyReturn = totalReturn / totalDays;
  } else {
    totalDays = 180;
    const rate = dailyRate || 1.0;
    dailyReturn = amount * (rate / 100);
    totalReturn = dailyReturn * totalDays;
  }
  
  const dailyBreakdown: DailyEarning[] = [];
  
  if (productType === 'short') {
    let cumulativeProfit = 0;
    for (let day = 1; day <= totalDays; day++) {
      cumulativeProfit += dailyReturn;
      
      dailyBreakdown.push({
        day,
        taskNumber: day,
        dailyProfit: dailyReturn,
        streamingBonus: 0,
        unlockPercentage: 0,
        claimable: 0,
        locked: 0,
        cumulativeProfit,
      });
    }
    
    return {
      dailyReturn,
      monthlyReturn: dailyReturn * 30,
      totalReturn,
      totalStreamingBonus: 0,
      dailyStreamingBonus: 0,
      totalWithCapital: amount + totalReturn,
      dailyBreakdown,
    };
  }
  
  const dailyStreamingBonus = dailyReturn * 0.4;
  
  const streamingAccumulator = new Map<number, { total: number; claimable: number; locked: number }>();
  
  for (let day = 1; day <= 100; day++) {
    const bonusThisDay = dailyStreamingBonus;
    const prevAccumulated = day === 1 ? 0 : (streamingAccumulator.get(day - 1)?.total || 0);
    const totalAccumulated = prevAccumulated + bonusThisDay;
    
    let claimable = 0;
    let locked = totalAccumulated;
    
    if (day < 20) {
      claimable = 0;
      locked = totalAccumulated;
    } else if (day === 20) {
      const cycleAccumulated = dailyStreamingBonus * 20;
      claimable = cycleAccumulated * 0.5;
      locked = totalAccumulated - claimable;
    } else if (day > 20 && day < 40) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      claimable = cycle1Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day === 40) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle2Accumulated = dailyStreamingBonus * 20;
      const cycle2Unlocked = cycle2Accumulated * 0.5;
      claimable = cycle1Unlocked + cycle2Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day > 40 && day < 60) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle2Unlocked = (dailyStreamingBonus * 20) * 0.5;
      claimable = cycle1Unlocked + cycle2Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day === 60) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle2Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle3Accumulated = dailyStreamingBonus * 20;
      const cycle3Unlocked = cycle3Accumulated * 0.5;
      claimable = cycle1Unlocked + cycle2Unlocked + cycle3Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day > 60 && day < 80) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle2Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle3Unlocked = (dailyStreamingBonus * 20) * 0.5;
      claimable = cycle1Unlocked + cycle2Unlocked + cycle3Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day === 80) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle2Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle3Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle4Accumulated = dailyStreamingBonus * 20;
      const cycle4Unlocked = cycle4Accumulated * 0.5;
      claimable = cycle1Unlocked + cycle2Unlocked + cycle3Unlocked + cycle4Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day > 80 && day < 100) {
      const cycle1Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle2Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle3Unlocked = (dailyStreamingBonus * 20) * 0.5;
      const cycle4Unlocked = (dailyStreamingBonus * 20) * 0.5;
      claimable = cycle1Unlocked + cycle2Unlocked + cycle3Unlocked + cycle4Unlocked;
      locked = totalAccumulated - claimable;
    } else if (day === 100) {
      claimable = totalAccumulated;
      locked = 0;
    }
    
    streamingAccumulator.set(day, { total: totalAccumulated, claimable, locked });
  }
  
  const totalStreamingBonus = dailyStreamingBonus * 100;
  
  let cumulativeProfit = 0;
  for (let day = 1; day <= totalDays; day++) {
    cumulativeProfit += dailyReturn;
    const taskNumber = day <= 100 ? day : 100;
    const streamingData = streamingAccumulator.get(day <= 100 ? day : 100) || { total: 0, claimable: 0, locked: 0 };
    
    const unlockPercentage = getUnlockPercentageForTask(day);
    const streamingBonusToday = day <= 100 ? dailyStreamingBonus : 0;
    
    dailyBreakdown.push({
      day,
      taskNumber,
      dailyProfit: dailyReturn,
      streamingBonus: streamingBonusToday,
      unlockPercentage,
      claimable: streamingData.claimable,
      locked: streamingData.locked,
      cumulativeProfit,
    });
  }
  
  return {
    dailyReturn,
    monthlyReturn: dailyReturn * 30,
    totalReturn,
    totalStreamingBonus,
    dailyStreamingBonus,
    totalWithCapital: amount + totalReturn,
    dailyBreakdown,
  };
}

function getUnlockPercentageForTask(taskNumber: number): number {
  if (taskNumber < 20) return 0;
  if (taskNumber === 20) return 50;
  if (taskNumber < 40) return 50;
  if (taskNumber === 40) return 50;
  if (taskNumber < 60) return 50;
  if (taskNumber === 60) return 50;
  if (taskNumber < 80) return 50;
  if (taskNumber === 80) return 50;
  if (taskNumber < 100) return 50;
  if (taskNumber === 100) return 100;
  return 100;
}

export function calculateReferralRewards(input: ReferralInput): ReferralReward {
  const { downlineRwaCount, secondLevelRwaCount, dailyRate } = input;
  
  const downlineInvestment = downlineRwaCount * 100;
  const downlineDailyProfit = downlineInvestment * (dailyRate / 100);
  const directDailyReward = downlineDailyProfit * 0.2;
  
  let indirectDailyReward = 0;
  if (secondLevelRwaCount && secondLevelRwaCount > 0) {
    const secondLevelInvestment = secondLevelRwaCount * 100;
    const secondLevelDailyProfit = secondLevelInvestment * (dailyRate / 100);
    indirectDailyReward = secondLevelDailyProfit * 0.1;
  }
  
  return {
    directDailyReward,
    directMonthlyReward: directDailyReward * 30,
    indirectDailyReward,
    indirectMonthlyReward: indirectDailyReward * 30,
    totalDailyReward: directDailyReward + indirectDailyReward,
    totalMonthlyReward: (directDailyReward + indirectDailyReward) * 30,
  };
}

export function calculateTeamRewards(input: TeamRewardInput): TeamRewardResult {
  const { currentTier, totalPerformanceRwa, smallAreaPerformanceRwa, dailyRate } = input;
  
  const tierInfo = teamTiers.find(t => t.tier === currentTier);
  if (!tierInfo) {
    throw new Error('Invalid tier');
  }
  
  const totalPerformanceUsd = totalPerformanceRwa * 100;
  const smallAreaPerformanceUsd = smallAreaPerformanceRwa * 100;
  
  const smallAreaDailyProfit = smallAreaPerformanceUsd * (dailyRate / 100);
  const teamDividendReward = smallAreaDailyProfit * (tierInfo.teamDividendPercent / 100);
  const streamingManagementReward = smallAreaDailyProfit * (tierInfo.streamingManagementPercent / 100);
  
  let supremeReward = 0;
  if (tierInfo.isSupreme) {
    const totalDailyProfit = totalPerformanceUsd * (dailyRate / 100);
    supremeReward = totalDailyProfit * 0.05;
  }
  
  const totalDailyReward = teamDividendReward + streamingManagementReward + supremeReward;
  
  return {
    teamDividendReward,
    streamingManagementReward,
    supremeReward,
    totalDailyReward,
    totalMonthlyReward: totalDailyReward * 30,
    tierInfo,
  };
}
