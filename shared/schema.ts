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
  amount: z.number().min(100).multipleOf(100),
  productType: productTypeSchema,
  duration: z.number().optional(),
  dailyRate: z.number().min(1.0).max(1.5).optional(),
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
  downlineInvestment: z.number().min(100),
  downlineDailyRate: z.number().min(1.0).max(1.5),
  secondLevelInvestment: z.number().min(0).optional(),
  secondLevelDailyRate: z.number().min(1.0).max(1.5).optional(),
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
  requirementSelfAndTeam: number;
  communityRequirement: string;
  smallAreaMinPercent: number;
  teamDividendPercent: number;
  streamingManagementPercent: number;
  isSupreme: boolean;
}

export const teamTiers: TeamTierInfo[] = [
  {
    tier: 'VIP',
    requirementSelfAndTeam: 6000,
    communityRequirement: '-',
    smallAreaMinPercent: 50,
    teamDividendPercent: 10,
    streamingManagementPercent: 0,
    isSupreme: false,
  },
  {
    tier: '1-Star Expert',
    requirementSelfAndTeam: 20000,
    communityRequirement: 'Two communities with VIP',
    smallAreaMinPercent: 50,
    teamDividendPercent: 20,
    streamingManagementPercent: 5,
    isSupreme: false,
  },
  {
    tier: '2-Star Expert',
    requirementSelfAndTeam: 60000,
    communityRequirement: 'Two communities with 1-Star Expert',
    smallAreaMinPercent: 50,
    teamDividendPercent: 30,
    streamingManagementPercent: 10,
    isSupreme: false,
  },
  {
    tier: '3-Star Expert',
    requirementSelfAndTeam: 200000,
    communityRequirement: 'Two communities with 2-Star Expert',
    smallAreaMinPercent: 50,
    teamDividendPercent: 40,
    streamingManagementPercent: 15,
    isSupreme: false,
  },
  {
    tier: '1-Star Ambassador',
    requirementSelfAndTeam: 600000,
    communityRequirement: 'Two communities with 3-Star Expert',
    smallAreaMinPercent: 50,
    teamDividendPercent: 50,
    streamingManagementPercent: 20,
    isSupreme: false,
  },
  {
    tier: '2-Star Ambassador',
    requirementSelfAndTeam: 2000000,
    communityRequirement: 'Two communities with 1-Star Ambassador',
    smallAreaMinPercent: 50,
    teamDividendPercent: 60,
    streamingManagementPercent: 25,
    isSupreme: false,
  },
  {
    tier: '3-Star Ambassador',
    requirementSelfAndTeam: 6000000,
    communityRequirement: 'Two communities with 2-Star Ambassador',
    smallAreaMinPercent: 50,
    teamDividendPercent: 70,
    streamingManagementPercent: 30,
    isSupreme: false,
  },
  {
    tier: 'Supreme',
    requirementSelfAndTeam: 0,
    communityRequirement: 'Two communities with 3-Star Ambassador',
    smallAreaMinPercent: 0,
    teamDividendPercent: 5,
    streamingManagementPercent: 0,
    isSupreme: true,
  },
];

export const teamRewardInputSchema = z.object({
  currentTier: z.string(),
  totalPerformance: z.number().min(0),
  smallAreaPerformance: z.number().min(0),
  smallAreaDailyProfit: z.number().min(0),
  companyWideDailyProfit: z.number().min(0).optional(),
});

export type TeamRewardInput = z.infer<typeof teamRewardInputSchema>;

export interface TeamRewardResult {
  teamDividendReward: number;
  streamingManagementReward: number;
  supremeReward: number;
  totalDailyReward: number;
  totalMonthlyReward: number;
  tierInfo: TeamTierInfo;
}

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: 'RWA Profit Simulator',
    investment: 'Investment',
    referral: 'Referral',
    team: 'Team',
    investmentCalculator: 'Investment Calculator',
    productType: 'Product Type',
    shortTerm: 'Short Term',
    longTerm: 'Long Term',
    investmentAmount: 'Investment Amount (USD)',
    duration: 'Duration (Days)',
    dailyReturnRate: 'Daily Return Rate',
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
    downlineInvestment: 'Downline Investment',
    downlineDailyRate: 'Downline Daily Rate',
    secondLevelInvestment: '2nd Level Investment',
    secondLevelDailyRate: '2nd Level Daily Rate',
    directReward: 'Direct Reward (20%)',
    indirectReward: 'Indirect Reward (10%)',
    totalReward: 'Total Reward',
    daily: 'Daily',
    monthly: 'Monthly',
    currentTier: 'Current Tier',
    totalPerformance: 'Total Performance',
    smallAreaPerformance: 'Small Area Performance',
    smallAreaDailyProfit: 'Small Area Daily Profit',
    companyWideDailyProfit: 'Company-wide Daily Profit',
    teamDividend: 'Team Dividend',
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
  },
  zh: {
    appTitle: 'RWA收益模拟器',
    investment: '投资',
    referral: '推荐',
    team: '团队',
    investmentCalculator: '投资计算器',
    productType: '产品类型',
    shortTerm: '短线产品',
    longTerm: '长线产品',
    investmentAmount: '投资金额 (USD)',
    duration: '投资周期（天）',
    dailyReturnRate: '每日收益率',
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
    downlineInvestment: '下级投资额',
    downlineDailyRate: '下级每日收益率',
    secondLevelInvestment: '二级投资额',
    secondLevelDailyRate: '二级每日收益率',
    directReward: '直推奖励 (20%)',
    indirectReward: '间推奖励 (10%)',
    totalReward: '总奖励',
    daily: '每日',
    monthly: '每月',
    currentTier: '当前等级',
    totalPerformance: '团队总业绩',
    smallAreaPerformance: '小区业绩',
    smallAreaDailyProfit: '小区每日分红',
    companyWideDailyProfit: '全公司每日分红',
    teamDividend: '团队分红',
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
