import type {
  InvestmentInput,
  InvestmentResult,
  DailyEarning,
  ReferralInput,
  ReferralReward,
  TeamRewardInput,
  TeamRewardResult,
  StreamingManagementDailyBreakdown,
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
    totalReturn = amount * 0.05;  // 5% total return
    dailyReturn = totalReturn / totalDays;  // 0.5%-1% daily (5%/5days to 5%/10days)
  } else {
    totalDays = 180;
    const rate = dailyRate || 1.0;
    dailyReturn = amount * (rate / 100);  // 1%-1.5% daily
    totalReturn = dailyReturn * totalDays;
  }
  
  const dailyBreakdown: DailyEarning[] = [];
  
  // STREAMING BONUS FORMULA: 每日分红收益 × 40%
  // Short-term: daily dividend rate = 0.5%-1%, streaming = 0.2%-0.4% daily (estimate 0.3%)
  // Long-term: daily dividend rate = 1%-1.5%, streaming = 0.4%-0.6% daily
  
  if (productType === 'short') {
    // Short-term streaming: 每日分红 × 40%
    // Daily dividend rate = 5% / duration = 0.5%-1%
    // Daily streaming rate = daily dividend × 40% = 0.2%-0.4%
    // Using actual calculation (not 0.3% estimate) for accuracy
    const dailyDividendRate = 0.05 / totalDays;  // 0.5%-1% depending on duration
    const dailyStreamingRate = dailyDividendRate * 0.4;  // 0.2%-0.4%
    const dailyStreamingAmount = amount * dailyStreamingRate;  // Actual daily streaming in USD
    const totalStreamingBonus = dailyStreamingAmount * 100;  // 100 days release
    
    let cumulativeProfit = 0;
    let cumulativeStreamingBonus = 0;
    
    for (let day = 1; day <= totalDays; day++) {
      let streamingBonusToday = 0;
      let unlockPercentage = 0;
      
      // NOTE: Streaming bonus is released at cumulative task milestones (20/40/60/80/100)
      // across multiple investments, not during the single investment period
      
      cumulativeProfit += dailyReturn + streamingBonusToday;
      
      dailyBreakdown.push({
        day,
        taskNumber: day,
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
      monthlyReturn: 0,
      totalReturn,
      totalStreamingBonus,
      dailyStreamingBonus: dailyStreamingAmount,
      totalWithCapital: amount + totalReturn + totalStreamingBonus,
      dailyBreakdown,
    };
  }
  
  // Long-term: 每日分红 × 40% streaming bonus
  // Daily streaming = dailyReturn × 40%, released over 100 days
  const dailyStreamingAmount = dailyReturn * 0.4;  // 每日推流奖励
  const totalStreamingBonus = dailyStreamingAmount * 100;  // 100天总推流
  const cycleAccumulation = dailyStreamingAmount * 20;  // 每20天累积
  
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
    dailyStreamingBonus: dailyStreamingAmount,
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
  const { currentTier, totalPerformanceRwa, dailyRate, mecPrice } = input;
  
  const tierInfo = teamTiers.find(t => t.tier === currentTier);
  if (!tierInfo) {
    throw new Error('Invalid tier');
  }
  
  // 使用整个团队业绩计算（不再使用小区业绩）
  const totalPerformanceUsd = totalPerformanceRwa * 100;
  
  // 基础分红收入 = 团队总业绩 × 每日收益率
  const baseDividendIncome = totalPerformanceUsd * (dailyRate / 100);
  
  // 团队分红奖励 = 基础分红收入 × 分红比例 (每日发放)
  const teamDividendReward = baseDividendIncome * (tierInfo.teamDividendPercent / 100);
  
  // Team dividend is split: 90% USD, 10% MEC
  const teamDividendUsd = teamDividendReward * 0.9;
  const teamDividendMec = (teamDividendReward * 0.1) / mecPrice;
  
  // 推流管理奖励：每日分红 × 40%（推流池）× 管理比例，100天释放
  // 公式: 每日推流管理 = baseDividendIncome × 40% × streamingManagementPercent%
  const dailyStreamingAmount = baseDividendIncome * 0.4;  // 每日推流 = 每日分红 × 40%
  const dailyStreamingRate = dailyStreamingAmount * (tierInfo.streamingManagementPercent / 100);
  const cycleAccumulation = dailyStreamingRate * 20; // 每20天累积
  const streamingManagementTotal100Days = dailyStreamingRate * 100;
  const streamingManagementReward = dailyStreamingRate; // 每日推流管理奖励
  
  // Streaming management is 100% USD
  const streamingManagementUsd = streamingManagementReward;
  
  // Generate 180-day streaming management breakdown with phased unlocks
  const streamingManagementBreakdown: StreamingManagementDailyBreakdown[] = [];
  let cumulativeClaimable = 0;
  
  for (let day = 1; day <= 180; day++) {
    let releasedToday = 0;
    let unlockEvent = false;
    let unlockPercent = 0;
    let cycle = day <= 100 ? Math.min(Math.ceil(day / 20), 5) : 5;
    
    if (day <= 100) {
      if (day === 20 || day === 40 || day === 60 || day === 80) {
        // Release 50% of the 20-day cycle accumulation
        releasedToday = cycleAccumulation * 0.5;
        cumulativeClaimable += releasedToday;
        unlockEvent = true;
        unlockPercent = 50;
      } else if (day === 100) {
        // Full unlock - release remaining locked balance
        releasedToday = streamingManagementTotal100Days - cumulativeClaimable;
        cumulativeClaimable = streamingManagementTotal100Days;
        unlockEvent = true;
        unlockPercent = 100;
      }
    }
    
    const lockedBalance = streamingManagementTotal100Days - cumulativeClaimable;
    
    streamingManagementBreakdown.push({
      day,
      cycle,
      releasedToday,
      cumulativeClaimable,
      lockedBalance,
      unlockEvent,
      unlockPercent,
    });
  }
  
  let supremeReward = 0;
  let supremeRewardUsd = 0;
  let supremeRewardMec = 0;
  if (tierInfo.isSupreme) {
    supremeReward = baseDividendIncome * 0.05;
    // Supreme reward is split: 90% USD, 10% MEC
    supremeRewardUsd = supremeReward * 0.9;
    supremeRewardMec = (supremeReward * 0.1) / mecPrice;
  }
  
  const totalDailyReward = teamDividendReward + streamingManagementReward + supremeReward;
  const totalMonthlyReward = totalDailyReward * 30;
  
  // Daily and monthly USD/MEC breakdown
  const totalDailyUsd = teamDividendUsd + streamingManagementUsd + supremeRewardUsd;
  const totalDailyMec = teamDividendMec + supremeRewardMec; // Streaming is 100% USD
  const totalMonthlyUsd = totalDailyUsd * 30;
  const totalMonthlyMec = totalDailyMec * 30;
  
  // 180-day calculations
  // Team dividend: 180 days (90% USD, 10% MEC)
  const teamDividend180Days = teamDividendReward * 180;
  const teamDividend180DaysUsd = teamDividend180Days * 0.9;
  const teamDividend180DaysMecValue = teamDividend180Days * 0.1;
  
  // Streaming management: only 100 days (100% USD)
  const streamingManagement180Days = streamingManagementTotal100Days;
  const streamingManagement180DaysUsd = streamingManagement180Days;
  
  // Supreme: 180 days (90% USD, 10% MEC)
  const supreme180Days = supremeReward * 180;
  const supreme180DaysUsd = supreme180Days * 0.9;
  const supreme180DaysMecValue = supreme180Days * 0.1;
  
  const total180DayUsd = teamDividend180DaysUsd + streamingManagement180DaysUsd + supreme180DaysUsd;
  const daily180DayUsd = total180DayUsd / 180;
  
  const total180DayMecValue = teamDividend180DaysMecValue + supreme180DaysMecValue;
  const total180DayMec = total180DayMecValue / mecPrice;
  const daily180DayMec = total180DayMec / 180;
  
  return {
    teamDividendReward,
    teamDividendUsd,
    teamDividendMec,
    streamingManagementReward,
    streamingManagementUsd,
    streamingManagementBreakdown,
    supremeReward,
    supremeRewardUsd,
    supremeRewardMec,
    totalDailyReward,
    totalDailyUsd,
    totalDailyMec,
    totalMonthlyReward,
    totalMonthlyUsd,
    totalMonthlyMec,
    total180DayUsd,
    daily180DayUsd,
    total180DayMec,
    daily180DayMec,
    tierInfo,
    mecPrice,
  };
}
