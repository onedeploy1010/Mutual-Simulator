import { z } from "zod";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const ProductType = {
  SHORT: 'short',
  LONG: 'long',
} as const;

export const productTypeSchema = z.enum([ProductType.SHORT, ProductType.LONG]);
export type ProductType = z.infer<typeof productTypeSchema>;

export const investmentInputSchema = z.object({
  rwaCount: z.number().min(1).int(),
  productType: productTypeSchema,
  duration: z.number().min(5).max(10).int().optional(),
  dailyRate: z.number().min(1.0).max(1.5).optional(),
  streamingRate: z.number().min(0.5).max(1.0).optional(), // Long-term streaming rate (same as short-term)
});

export type InvestmentInput = z.infer<typeof investmentInputSchema>;

export interface DailyEarning {
  day: number;
  taskNumber: number;
  dailyProfit: number;
  streamingBonus: number;
  unlockPercentage: number;
  claimable: number;
  locked: number;
  cumulativeProfit: number;
}

export interface InvestmentResult {
  dailyReturn: number;
  monthlyReturn: number;
  totalReturn: number;
  totalStreamingBonus: number;
  dailyStreamingBonus: number;
  totalWithCapital: number;
  dailyBreakdown: DailyEarning[];
}

export interface StreamingReleaseNode {
  taskCount: 20 | 40 | 60 | 80 | 100;
  claimablePercent: number;
  lockedPercent: number;
  description: string;
}

export const streamingReleaseSchedule: StreamingReleaseNode[] = [
  { taskCount: 20, claimablePercent: 50, lockedPercent: 50, description: 'First Release' },
  { taskCount: 40, claimablePercent: 50, lockedPercent: 50, description: 'Second Release' },
  { taskCount: 60, claimablePercent: 50, lockedPercent: 50, description: 'Third Release' },
  { taskCount: 80, claimablePercent: 50, lockedPercent: 50, description: 'Fourth Release' },
  { taskCount: 100, claimablePercent: 100, lockedPercent: 0, description: 'Final Release - All Unlocked' },
];

export const referralInputSchema = z.object({
  downlineRwaCount: z.number().min(1).int(),
  secondLevelRwaCount: z.number().min(0).int().optional(),
  dailyRate: z.number().min(1.0).max(1.5),
});

export type ReferralInput = z.infer<typeof referralInputSchema>;

export interface ReferralReward {
  directDailyReward: number;
  directMonthlyReward: number;
  indirectDailyReward: number;
  indirectMonthlyReward: number;
  totalDailyReward: number;
  totalMonthlyReward: number;
}

export type TeamTier = 
  | 'VIP' 
  | '1-Star Expert' 
  | '2-Star Expert' 
  | '3-Star Expert' 
  | '1-Star Ambassador' 
  | '2-Star Ambassador' 
  | '3-Star Ambassador' 
  | 'Supreme';

export interface TeamTierInfo {
  tier: TeamTier;
  requirementMin: number;
  requirementMax: number | null;
  communityRequirement: string;
  communityRequirementZh: string;
  teamDividendPercent: number;
  streamingManagementPercent: number;
  isSupreme: boolean;
}

export const teamTiers: TeamTierInfo[] = [
  {
    tier: 'VIP',
    requirementMin: 6000,
    requirementMax: 20000,
    communityRequirement: '-',
    communityRequirementZh: '-',
    teamDividendPercent: 10,
    streamingManagementPercent: 0,
    isSupreme: false,
  },
  {
    tier: '1-Star Expert',
    requirementMin: 20000,
    requirementMax: 60000,
    communityRequirement: 'Two communities with VIP',
    communityRequirementZh: '两个社区各有VIP',
    teamDividendPercent: 20,
    streamingManagementPercent: 5,
    isSupreme: false,
  },
  {
    tier: '2-Star Expert',
    requirementMin: 60000,
    requirementMax: 200000,
    communityRequirement: 'Two communities with 1-Star Expert',
    communityRequirementZh: '两个社区各有1星专家',
    teamDividendPercent: 30,
    streamingManagementPercent: 10,
    isSupreme: false,
  },
  {
    tier: '3-Star Expert',
    requirementMin: 200000,
    requirementMax: 600000,
    communityRequirement: 'Two communities with 2-Star Expert',
    communityRequirementZh: '两个社区各有2星专家',
    teamDividendPercent: 40,
    streamingManagementPercent: 15,
    isSupreme: false,
  },
  {
    tier: '1-Star Ambassador',
    requirementMin: 600000,
    requirementMax: 2000000,
    communityRequirement: 'Two communities with 3-Star Expert',
    communityRequirementZh: '两个社区各有3星专家',
    teamDividendPercent: 50,
    streamingManagementPercent: 20,
    isSupreme: false,
  },
  {
    tier: '2-Star Ambassador',
    requirementMin: 2000000,
    requirementMax: 6000000,
    communityRequirement: 'Two communities with 1-Star Ambassador',
    communityRequirementZh: '两个社区各有1星大使',
    teamDividendPercent: 60,
    streamingManagementPercent: 25,
    isSupreme: false,
  },
  {
    tier: '3-Star Ambassador',
    requirementMin: 6000000,
    requirementMax: null,
    communityRequirement: 'Two communities with 2-Star Ambassador',
    communityRequirementZh: '两个社区各有2星大使',
    teamDividendPercent: 70,
    streamingManagementPercent: 30,
    isSupreme: false,
  },
  {
    tier: 'Supreme',
    requirementMin: 0,
    requirementMax: null,
    communityRequirement: 'Two communities with 3-Star Ambassador',
    communityRequirementZh: '两个社区各有3星大使',
    teamDividendPercent: 70,
    streamingManagementPercent: 30,
    isSupreme: true,
  },
];

export const teamRewardInputSchema = z.object({
  currentTier: z.string(),
  totalPerformanceRwa: z.number().min(1).int(),
  dailyRate: z.number().min(1.0).max(1.5),
  mecPrice: z.number().refine((val) => [1, 2, 4, 8, 16, 32].includes(val), {
    message: "MEC price must be one of: 1, 2, 4, 8, 16, 32 USD",
  }),
}).refine(
  (data) => {
    const tierInfo = teamTiers.find(t => t.tier === data.currentTier);
    if (!tierInfo || tierInfo.isSupreme) return true;
    const totalPerformanceUsd = data.totalPerformanceRwa * 100;
    const isAboveMin = totalPerformanceUsd >= tierInfo.requirementMin;
    const isBelowMax = tierInfo.requirementMax === null || totalPerformanceUsd <= tierInfo.requirementMax;
    return isAboveMin && isBelowMax;
  },
  {
    message: "Total performance must be within the selected tier range",
    path: ["totalPerformanceRwa"],
  }
);

export type TeamRewardInput = z.infer<typeof teamRewardInputSchema>;

export interface StreamingManagementDailyBreakdown {
  day: number;
  cycle: number;
  releasedToday: number;
  cumulativeClaimable: number;
  lockedBalance: number;
  unlockEvent: boolean;
  unlockPercent: number;
}

export interface TeamRewardResult {
  teamDividendReward: number;
  teamDividendUsd: number;
  teamDividendMec: number;
  streamingManagementReward: number;
  streamingManagementUsd: number;
  streamingManagementBreakdown: StreamingManagementDailyBreakdown[];
  supremeReward: number;
  supremeRewardUsd: number;
  supremeRewardMec: number;
  totalDailyReward: number;
  totalDailyUsd: number;
  totalDailyMec: number;
  totalMonthlyReward: number;
  totalMonthlyUsd: number;
  totalMonthlyMec: number;
  total180DayUsd: number;
  daily180DayUsd: number;
  total180DayMec: number;
  daily180DayMec: number;
  tierInfo: TeamTierInfo;
  mecPrice: number;
}

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: 'Mutual Profit Calculator',
    investment: 'Investment',
    referral: 'Referral',
    team: 'Team',
    investmentCalculator: 'Investment Calculator',
    productType: 'Product Type',
    shortTerm: 'Short Term',
    longTerm: 'Long Term',
    investmentAmount: 'Investment Amount (RWA)',
    duration: 'Duration (Days)',
    dailyReturnRate: 'Daily Return Rate',
    streamingRate: 'Streaming Rate',
    streamingRateDesc: 'Streaming bonus = daily dividend × 40%',
    calculate: 'Calculate',
    reset: 'Reset',
    dailyReturn: 'Daily Return',
    monthlyReturn: 'Monthly Return',
    totalReturn: 'Total Return',
    streamingBonus: 'Streaming Bonus',
    totalWithCapital: 'Total with Capital',
    viewDailyBreakdown: 'View Daily Breakdown',
    hideDailyBreakdown: 'Hide Daily Breakdown',
    day: 'Day',
    task: 'Task',
    dailyProfit: 'Daily Profit',
    unlock: 'Unlock',
    claimable: 'Claimable',
    locked: 'Locked',
    cumulative: 'Cumulative',
    referralRewards: 'Referral Rewards',
    directRewards: 'Direct & Indirect Rewards',
    teamRewards: 'Team Rewards',
    downlineInvestment: 'Direct Referral RWA',
    dailyReturnRateReferral: 'Daily Return Rate (Both Levels)',
    secondLevelInvestment: 'Indirect Referral RWA',
    directReward: 'Direct Reward (20%)',
    indirectReward: 'Indirect Reward (10%)',
    totalReward: 'Total Reward',
    daily: 'Daily',
    monthly: 'Monthly',
    currentTier: 'Current Tier',
    totalPerformance: 'Total Performance (RWA)',
    smallAreaPerformance: 'Small Area Performance (RWA)',
    teamDailyRate: 'Daily Return Rate',
    teamDividend: 'Team Dividend',
    teamDividendUsd: 'USD Reward (90%)',
    teamDividendMec: 'MEC Tokens (10%)',
    mecTokens: 'MEC Tokens',
    mecPrice: 'MEC Price (USD)',
    total180Days: '180-Day Total',
    total180DayUsd: 'Total USD (90%)',
    total180DayMec: 'Total MEC Tokens',
    dailyUsd: 'Daily USD',
    dailyMec: 'Daily MEC',
    streamingManagement: 'Streaming Management',
    supremeReward: 'Supreme Reward',
    tierRequirements: 'Tier Requirements',
    requirement: 'Requirement',
    communityStructure: 'Community Structure',
    dividend: 'Dividend',
    management: 'Management',
    releaseSchedule: 'Release Schedule',
    tasks: 'Tasks',
    profitProgression: 'Profit Progression',
    dailyBreakdownPage: '180-Day Daily Breakdown',
    backToInvestment: 'Back to Investment',
    viewDetailedBreakdown: 'View Detailed 180-Day Breakdown',
    filterByType: 'Filter by Type',
    dayRange: 'Day Range',
    allDays: 'All Days',
    streamingBonusDays: 'Streaming Bonus Days',
    daysWithUnlocked: 'Days with Unlocked Funds',
    daysWithLocked: 'Days with Locked Funds',
    all180Days: 'All 180 Days',
    cycle1: 'Days 1-20 (Cycle 1)',
    cycle2: 'Days 21-40 (Cycle 2)',
    cycle3: 'Days 41-60 (Cycle 3)',
    cycle4: 'Days 61-80 (Cycle 4)',
    cycle5: 'Days 81-100 (Cycle 5)',
    noStreaming: 'Days 101-180 (No Streaming)',
    showing: 'Showing',
    of: 'of',
    days: 'days',
    page: 'Page',
    previous: 'Previous',
    next: 'Next',
    back: 'Back',
    noDataAvailable: 'No daily breakdown data available',
    teamDailyBreakdownPage: '180-Day Team Rewards Breakdown',
    backToTeam: 'Back to Team Rewards',
    totalPerformanceRwa: 'Total Performance (RWA)',
    smallAreaPerformanceRwa: 'Small Area Performance (RWA)',
    teamDividendDaily: 'Team Dividend (Daily)',
    managementRewardDaily: 'Management Reward (Daily)',
    supremeRewardDaily: 'Supreme Reward (Daily)',
    totalTeamRewardDaily: 'Total Team Reward (Daily)',
    days1to30: 'Days 1-30',
    days31to60: 'Days 31-60',
    days61to90: 'Days 61-90',
    days91to120: 'Days 91-120',
    days121to150: 'Days 121-150',
    days151to180: 'Days 151-180',
    performanceRange: 'Performance range',
    currentTierBenefits: 'Current Tier Benefits',
    monthlyTotal: 'Monthly Total',
    calculateTeamRewardsDesc: 'Calculate rewards based on your team tier and performance',
    rangeFor: 'Range for',
    smallAreaAutoDesc: 'Small area is automatically set to 50% of total performance',
    shortTermDesc: 'Short-term: Fixed 5% return, 5-10 days',
    longTermDesc: 'Long-term: 1-1.5% daily, 180 days with capital return',
    referralDesc: 'Direct: 20% of downline daily profit | Indirect: 10% of 2nd level daily profit | Single rate for both levels',
    rateAppliesBothLevels: 'This rate applies to both direct and indirect referral levels',
    smallAreaRangeDesc: 'Select between 50%-100% of total performance',
    tierVIP: 'VIP',
    tier1StarExpert: '1-Star Expert',
    tier2StarExpert: '2-Star Expert',
    tier3StarExpert: '3-Star Expert',
    tier1StarAmbassador: '1-Star Ambassador',
    tier2StarAmbassador: '2-Star Ambassador',
    tier3StarAmbassador: '3-Star Ambassador',
    tierSupreme: 'Supreme',
    twoCommunities: 'Two communities with',
    tierInfo: 'Tier Information',
    rewardSummary: 'Reward Summary',
    streamingManagement100DaysNote: '* Released over 100 days only',
    streamingBonusNote: 'Streaming Bonus Formula',
    streamingBonusShortTermNote: 'Streaming bonus = Daily dividend × 40% (0.2%-0.4% daily, estimated 0.3%). Released at cumulative task milestones: 20, 40, 60, 80, 100 tasks. Continue investing to unlock!',
    streamingBonusLongTermNote: 'Streaming bonus = Daily dividend × 40% (0.4%-0.6% daily). Released at days 20, 40, 60, 80, 100 with phased unlocks.',
  },
  zh: {
    appTitle: 'Mutual收益计算器',
    investment: '投资',
    referral: '推荐',
    team: '团队',
    investmentCalculator: '投资计算器',
    productType: '产品类型',
    shortTerm: '短线产品',
    longTerm: '长线产品',
    investmentAmount: '投资金额 (RWA)',
    duration: '投资周期（天）',
    dailyReturnRate: '每日收益率',
    streamingRate: '推流利率',
    streamingRateDesc: '推流奖励 = 每日分红 × 40%',
    calculate: '计算',
    reset: '重置',
    dailyReturn: '每日收益',
    monthlyReturn: '月度收益',
    totalReturn: '总收益',
    streamingBonus: '推流收益',
    totalWithCapital: '含本金总额',
    viewDailyBreakdown: '查看每日明细',
    hideDailyBreakdown: '隐藏每日明细',
    day: '天数',
    task: '任务',
    dailyProfit: '每日收益',
    unlock: '解锁比例',
    claimable: '可领取',
    locked: '锁仓',
    cumulative: '累计',
    referralRewards: '推荐奖励',
    directRewards: '直推与间推奖励',
    teamRewards: '团队奖励',
    downlineInvestment: '直推下级RWA',
    dailyReturnRateReferral: '每日收益率（两级）',
    secondLevelInvestment: '间推下级RWA',
    directReward: '直推奖励 (20%)',
    indirectReward: '间推奖励 (10%)',
    totalReward: '总奖励',
    daily: '每日',
    monthly: '每月',
    currentTier: '当前等级',
    totalPerformance: '团队总业绩（RWA）',
    smallAreaPerformance: '小区业绩（RWA）',
    teamDailyRate: '每日收益率',
    teamDividend: '团队分红',
    teamDividendUsd: 'USD奖励（90%）',
    teamDividendMec: 'MEC代币（10%）',
    mecTokens: 'MEC代币',
    mecPrice: 'MEC价格（USD）',
    total180Days: '180天总计',
    total180DayUsd: 'USD总奖励（90%）',
    total180DayMec: 'MEC代币总数',
    dailyUsd: '每日USD',
    dailyMec: '每日MEC',
    streamingManagement: '推流管理',
    supremeReward: '至尊奖励',
    tierRequirements: '等级要求',
    requirement: '要求',
    communityStructure: '社区结构',
    dividend: '分红',
    management: '管理',
    releaseSchedule: '释放时间表',
    tasks: '任务',
    profitProgression: '收益进程',
    dailyBreakdownPage: '180天每日明细',
    backToInvestment: '返回投资计算',
    viewDetailedBreakdown: '查看180天详细明细',
    filterByType: '筛选类型',
    dayRange: '天数范围',
    allDays: '全部天数',
    streamingBonusDays: '推流收益天数',
    daysWithUnlocked: '已解锁天数',
    daysWithLocked: '锁仓天数',
    all180Days: '全部180天',
    cycle1: '第1-20天（周期1）',
    cycle2: '第21-40天（周期2）',
    cycle3: '第41-60天（周期3）',
    cycle4: '第61-80天（周期4）',
    cycle5: '第81-100天（周期5）',
    noStreaming: '第101-180天（无推流）',
    showing: '显示',
    of: '共',
    days: '天',
    page: '页',
    previous: '上一页',
    next: '下一页',
    back: '返回',
    noDataAvailable: '暂无每日明细数据',
    teamDailyBreakdownPage: '180天团队奖励明细',
    backToTeam: '返回团队奖励',
    totalPerformanceRwa: '团队总业绩（RWA）',
    smallAreaPerformanceRwa: '小区业绩（RWA）',
    teamDividendDaily: '团队分红（每日）',
    managementRewardDaily: '管理奖励（每日）',
    supremeRewardDaily: '至尊奖励（每日）',
    totalTeamRewardDaily: '团队总奖励（每日）',
    days1to30: '第1-30天',
    days31to60: '第31-60天',
    days61to90: '第61-90天',
    days91to120: '第91-120天',
    days121to150: '第121-150天',
    days151to180: '第151-180天',
    performanceRange: '业绩范围',
    currentTierBenefits: '当前等级福利',
    monthlyTotal: '月度总计',
    calculateTeamRewardsDesc: '根据您的团队等级和业绩计算奖励',
    rangeFor: '范围',
    smallAreaAutoDesc: '小区业绩自动设置为总业绩的50%',
    shortTermDesc: '短线产品：固定5%收益，5-10天周期',
    longTermDesc: '长线产品：每日1-1.5%收益，180天周期含本金返还',
    referralDesc: '直推：下级每日收益的20% | 间推：二级每日收益的10% | 两级使用统一收益率',
    rateAppliesBothLevels: '此收益率同时适用于直推和间推两个层级',
    smallAreaRangeDesc: '选择总业绩的50%-100%之间',
    tierVIP: 'VIP',
    tier1StarExpert: '1星专家',
    tier2StarExpert: '2星专家',
    tier3StarExpert: '3星专家',
    tier1StarAmbassador: '1星大使',
    tier2StarAmbassador: '2星大使',
    tier3StarAmbassador: '3星大使',
    tierSupreme: '至尊',
    twoCommunities: '两个社区达到',
    tierInfo: '等级信息',
    rewardSummary: '奖励汇总',
    streamingManagement100DaysNote: '* 仅在前100天释放',
    streamingBonusNote: '推流计算公式',
    streamingBonusShortTermNote: '推流收益 = 每日分红 × 40%（每日0.2%-0.4%，可按0.3%估算）。在累计完成20/40/60/80/100次任务时释放。继续投资以解锁！',
    streamingBonusLongTermNote: '推流收益 = 每日分红 × 40%（每日0.4%-0.6%）。在第20/40/60/80/100天分阶段释放。',
  },
};

export const calculationScenarios = pgTable("calculation_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  inputData: text("input_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalculationScenarioSchema = createInsertSchema(calculationScenarios).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculationScenario = z.infer<typeof insertCalculationScenarioSchema>;
export type CalculationScenario = typeof calculationScenarios.$inferSelect;
