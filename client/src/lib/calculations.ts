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
      monthlyReturn: 0,
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
  const { currentTier, totalPerformanceRwa, smallAreaPerformanceRwa, dailyRate, mecPrice } = input;
  
  const tierInfo = teamTiers.find(t => t.tier === currentTier);
  if (!tierInfo) {
    throw new Error('Invalid tier');
  }
  
  const smallAreaPerformanceUsd = smallAreaPerformanceRwa * 100;
  
  // 基础分红收入 = 小区业绩 × 每日收益率
  const baseDividendIncome = smallAreaPerformanceUsd * (dailyRate / 100);
  
  // 团队分红奖励 = 基础分红收入 × 分红比例 (每日发放)
  const teamDividendReward = baseDividendIncome * (tierInfo.teamDividendPercent / 100);
  
  // Team dividend is split: 90% USD, 10% MEC
  const teamDividendUsd = teamDividendReward * 0.9;
  const teamDividendMec = (teamDividendReward * 0.1) / mecPrice;
  
  // 推流管理奖励：基础分红收入的40%作为推流池，然后按管理比例分配，100天释放
  const dailyStreamingPool = baseDividendIncome * 0.4;
  const streamingManagementTotal100Days = dailyStreamingPool * 100 * (tierInfo.streamingManagementPercent / 100);
  const streamingManagementReward = streamingManagementTotal100Days / 100; // 平均每日
  
  let supremeReward = 0;
  if (tierInfo.isSupreme) {
    supremeReward = baseDividendIncome * 0.05;
  }
  
  const totalDailyReward = teamDividendReward + streamingManagementReward + supremeReward;
  const totalMonthlyReward = totalDailyReward * 30;
  
  // 180-day calculations
  // Team dividend: 180 days (90% USD, 10% MEC)
  const teamDividend180Days = teamDividendReward * 180;
  // Streaming management: only 100 days (100% USD)
  const streamingManagement180Days = streamingManagementTotal100Days;
  // Supreme: 180 days (100% USD)
  const supreme180Days = supremeReward * 180;
  
  const total180DayUsd = (teamDividend180Days * 0.9) + streamingManagement180Days + supreme180Days;
  const daily180DayUsd = total180DayUsd / 180;
  
  const total180DayMecValue = teamDividend180Days * 0.1;
  const total180DayMec = total180DayMecValue / mecPrice;
  const daily180DayMec = total180DayMec / 180;
  
  return {
    teamDividendReward,
    teamDividendUsd,
    teamDividendMec,
    streamingManagementReward,
    supremeReward,
    totalDailyReward,
    totalMonthlyReward,
    total180DayUsd,
    daily180DayUsd,
    total180DayMec,
    daily180DayMec,
    tierInfo,
    mecPrice,
  };
}
