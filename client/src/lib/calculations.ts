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
  
  const dailyStreamingRate = dailyReturn * 0.4;
  const cycleAccumulation = dailyStreamingRate * 20;
  const totalStreamingBonus = dailyStreamingRate * 100;
  
  let cumulativeProfit = 0;
  let cumulativeStreamingBonus = 0;
  
  for (let day = 1; day <= totalDays; day++) {
    let streamingBonusToday = 0;
    let unlockPercentage = 0;
    
    if (day === 20 || day === 40 || day === 60 || day === 80) {
      streamingBonusToday = cycleAccumulation * 0.5;
      cumulativeStreamingBonus += streamingBonusToday;
      unlockPercentage = 50;
    } else if (day === 100) {
      streamingBonusToday = totalStreamingBonus - cumulativeStreamingBonus;
      cumulativeStreamingBonus = totalStreamingBonus;
      unlockPercentage = 100;
    } else if (day > 100) {
      unlockPercentage = 100;
    }
    
    cumulativeProfit += dailyReturn + streamingBonusToday;
    
    dailyBreakdown.push({
      day,
      taskNumber: day <= 100 ? day : 100,
      dailyProfit: dailyReturn,
      streamingBonus: streamingBonusToday,
      unlockPercentage,
      claimable: cumulativeStreamingBonus,
      locked: totalStreamingBonus - cumulativeStreamingBonus,
      cumulativeProfit,
    });
  }
  
  return {
    dailyReturn,
    monthlyReturn: dailyReturn * 30,
    totalReturn,
    totalStreamingBonus,
    dailyStreamingBonus: dailyStreamingRate,
    totalWithCapital: amount + totalReturn + totalStreamingBonus,
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
  
  const totalDailyProfit = totalPerformanceUsd * (dailyRate / 100);
  const totalDailyStreamingProfit = totalDailyProfit * 0.4;
  const streamingManagementReward = totalDailyStreamingProfit * (tierInfo.streamingManagementPercent / 100);
  
  let supremeReward = 0;
  if (tierInfo.isSupreme) {
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
