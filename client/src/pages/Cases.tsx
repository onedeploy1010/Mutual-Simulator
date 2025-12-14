import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calculator,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Crown,
  Star,
  Sparkles,
  Network,
  Expand,
  Shrink
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface TreeNodeData {
  label: string;
  rwa: number;
  color: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: 'crown' | 'user' | 'users' | 'star';
  level: number;
  children?: TreeNodeData[];
}

interface TreeNodeProps {
  node: TreeNodeData;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

function TreeNode({ node, isExpanded, onToggle, isMobile }: TreeNodeProps) {
  const formatRwa = (value: number) => new Intl.NumberFormat('en-US').format(value);
  
  const IconComponent = {
    crown: Crown,
    user: User,
    users: Users,
    star: Star,
  }[node.icon];

  const sizeClasses = {
    0: 'px-4 py-2.5 min-w-[80px]',
    1: 'px-3 py-2 min-w-[70px]',
    2: 'px-2.5 py-1.5 min-w-[60px]',
    3: 'px-2 py-1 min-w-[50px]',
    4: 'px-1.5 py-1 min-w-[44px]',
  };
  
  const iconSizes = {
    0: 'w-4 h-4',
    1: 'w-3.5 h-3.5',
    2: 'w-3 h-3',
    3: 'w-2.5 h-2.5',
    4: 'w-2 h-2',
  };
  
  const textSizes = {
    0: 'text-sm',
    1: 'text-xs',
    2: 'text-xs',
    3: 'text-[10px]',
    4: 'text-[9px]',
  };
  
  const rwaSizes = {
    0: 'text-xs',
    1: 'text-[10px]',
    2: 'text-[9px]',
    3: 'text-[8px]',
    4: 'text-[8px]',
  };

  const level = Math.min(node.level, 4) as 0 | 1 | 2 | 3 | 4;
  const hasChildren = node.children && node.children.length > 0;
  const showChildren = isExpanded && hasChildren;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, delay: node.level * 0.05 }}
        className={`relative ${sizeClasses[level]} rounded-lg bg-gradient-to-br ${node.gradientFrom} ${node.gradientTo} border ${node.borderColor} shadow-md text-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105`}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <IconComponent className={iconSizes[level]} />
          <span className={`${textSizes[level]} font-bold`}>{node.label}</span>
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-0.5"
            >
              <ChevronDown className={`${iconSizes[level]} opacity-60`} />
            </motion.div>
          )}
        </div>
        <span className={`font-mono ${rwaSizes[level]} opacity-75`}>{formatRwa(node.rwa)}</span>
      </motion.div>
      
      <AnimatePresence>
        {showChildren && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <div className={`w-px ${isMobile ? 'h-2' : 'h-3'} bg-gradient-to-b from-border/80 to-border/40`}></div>
            <div className="relative flex gap-1">
              {node.children.length > 1 && (
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border/50"
                  style={{ width: `calc(100% - ${isMobile ? '40px' : '50px'})` }}
                ></div>
              )}
              {node.children.map((child, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-px ${isMobile ? 'h-2' : 'h-3'} bg-border/50`}></div>
                  <ExpandableTreeNode node={child} isMobile={isMobile} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandableTreeNode({ node, isMobile }: { node: TreeNodeData; isMobile: boolean }) {
  const [isExpanded, setIsExpanded] = useState(node.level < 2);
  
  return (
    <TreeNode 
      node={node} 
      isExpanded={isExpanded} 
      onToggle={() => setIsExpanded(!isExpanded)}
      isMobile={isMobile}
    />
  );
}

function OrgTreeDiagram({ config, t }: { config: CaseConfig; t: any }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullExpanded, setIsFullExpanded] = useState(false);
  const [treeKey, setTreeKey] = useState(0);

  const toggleExpandAll = () => {
    setIsFullExpanded(!isFullExpanded);
    setTreeKey(k => k + 1);
  };

  const buildTree = (): TreeNodeData => {
    const directChildren: TreeNodeData[] = [];
    
    for (let i = 0; i < config.directCount; i++) {
      const indirectChildren: TreeNodeData[] = [];
      
      for (let j = 0; j < config.indirectPerDirect; j++) {
        const thirdLevelChildren: TreeNodeData[] = [];
        
        if (config.extraNodes && config.extraNodes.length > 0) {
          const level3Node = config.extraNodes.find(n => n.level === 3);
          if (level3Node) {
            const nodesPerBranch = Math.ceil(level3Node.count / (config.directCount * config.indirectPerDirect));
            for (let k = 0; k < Math.min(nodesPerBranch, isMobile ? 1 : 2); k++) {
              const fourthLevelChildren: TreeNodeData[] = [];
              
              const level4Node = config.extraNodes.find(n => n.level === 4);
              if (level4Node) {
                const l4PerBranch = Math.ceil(level4Node.count / level3Node.count);
                for (let l = 0; l < Math.min(l4PerBranch, isMobile ? 1 : 2); l++) {
                  fourthLevelChildren.push({
                    label: `E${k * 2 + l + 1}`,
                    rwa: level4Node.rwa,
                    color: 'bg-rose-500/20',
                    borderColor: 'border-rose-500/40',
                    gradientFrom: 'from-rose-500/20',
                    gradientTo: 'to-pink-500/30',
                    icon: 'star',
                    level: 4,
                  });
                }
              }
              
              thirdLevelChildren.push({
                label: `D${k + 1}`,
                rwa: level3Node.rwa,
                color: 'bg-purple-500/20',
                borderColor: 'border-purple-500/40',
                gradientFrom: 'from-purple-500/20',
                gradientTo: 'to-violet-500/30',
                icon: 'star',
                level: 3,
                children: fourthLevelChildren.length > 0 ? fourthLevelChildren : undefined,
              });
            }
          }
        }
        
        indirectChildren.push({
          label: `C${i * config.indirectPerDirect + j + 1}`,
          rwa: config.indirectRwa,
          color: 'bg-blue-500/20',
          borderColor: 'border-blue-500/40',
          gradientFrom: 'from-blue-500/20',
          gradientTo: 'to-indigo-500/30',
          icon: 'users',
          level: 2,
          children: thirdLevelChildren.length > 0 ? thirdLevelChildren : undefined,
        });
      }
      
      directChildren.push({
        label: `B${i + 1}`,
        rwa: config.directRwa,
        color: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/40',
        gradientFrom: 'from-cyan-500/25',
        gradientTo: 'to-teal-500/35',
        icon: 'user',
        level: 1,
        children: indirectChildren.length > 0 ? indirectChildren : undefined,
      });
    }
    
    return {
      label: 'A',
      rwa: config.selfRwa,
      color: 'bg-amber-500/25',
      borderColor: 'border-amber-500/50',
      gradientFrom: 'from-amber-500/30',
      gradientTo: 'to-orange-500/40',
      icon: 'crown',
      level: 0,
      children: directChildren,
    };
  };

  const tree = buildTree();

  const ExpandableRoot = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
      <TreeNode 
        node={tree} 
        isExpanded={isExpanded} 
        onToggle={() => setIsExpanded(!isExpanded)}
        isMobile={isMobile}
      />
    );
  };

  return (
    <Card className="p-3 card-luxury">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          {t.orgStructure || '组织架构图'}
        </h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={toggleExpandAll}
          className="h-7 text-xs gap-1"
          data-testid="button-toggle-tree-expand"
        >
          {isFullExpanded ? <Shrink className="w-3 h-3" /> : <Expand className="w-3 h-3" />}
          {isFullExpanded ? (t.collapse || '收起') : (t.expand || '展开')}
        </Button>
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="flex justify-center min-w-fit py-2" key={treeKey}>
          <ExpandableRoot key={isFullExpanded ? 'expanded' : 'collapsed'} />
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-border/40">
        <div className="flex flex-wrap justify-center gap-2 text-[9px]">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            <Crown className="w-2.5 h-2.5 text-amber-600" />
            <span>A: {t.selfLabel || '自己'}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
            <User className="w-2.5 h-2.5 text-cyan-600" />
            <span>B: {t.directLabel || '直推'}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30">
            <Users className="w-2.5 h-2.5 text-blue-600" />
            <span>C: {t.indirectLabel || '间推'}</span>
          </div>
          {config.extraNodes && config.extraNodes.length > 0 && (
            <>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                <Star className="w-2.5 h-2.5 text-purple-600" />
                <span>D: {t.level3Label || '三代'}</span>
              </div>
              {config.extraNodes.find(n => n.level === 4) && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
                  <Star className="w-2.5 h-2.5 text-rose-600" />
                  <span>E: {t.level4Label || '四代'}</span>
                </div>
              )}
            </>
          )}
        </div>
        <p className="text-center text-[9px] text-muted-foreground mt-2">
          {t.clickToExpand || '点击节点展开/收起下级'}
        </p>
      </div>
    </Card>
  );
}

interface TeamNode {
  id: string;
  rwa: number;
  children: TeamNode[];
}

interface CaseConfig {
  tier: string;
  tierLabel: string;
  selfRwa: number;
  directCount: number;
  directRwa: number;
  indirectPerDirect: number;
  indirectRwa: number;
  extraNodes?: { level: number; count: number; rwa: number }[];
  teamDividendPercent: number;
  minPerformance: number;
}

const defaultCases: Record<string, CaseConfig> = {
  vip: {
    tier: 'VIP',
    tierLabel: 'VIP',
    selfRwa: 500,
    directCount: 2,
    directRwa: 500,
    indirectPerDirect: 5,
    indirectRwa: 500,
    teamDividendPercent: 10,
    minPerformance: 6000,
  },
  star1: {
    tier: '1-Star Expert',
    tierLabel: '1★',
    selfRwa: 500,
    directCount: 2,
    directRwa: 500,
    indirectPerDirect: 1,
    indirectRwa: 500,
    extraNodes: [{ level: 3, count: 4, rwa: 4500 }],
    teamDividendPercent: 20,
    minPerformance: 20000,
  },
  star2: {
    tier: '2-Star Expert',
    tierLabel: '2★',
    selfRwa: 500,
    directCount: 2,
    directRwa: 500,
    indirectPerDirect: 2,
    indirectRwa: 500,
    extraNodes: [{ level: 3, count: 8, rwa: 7000 }],
    teamDividendPercent: 30,
    minPerformance: 60000,
  },
  star3: {
    tier: '3-Star Expert',
    tierLabel: '3★',
    selfRwa: 500,
    directCount: 2,
    directRwa: 500,
    indirectPerDirect: 2,
    indirectRwa: 500,
    extraNodes: [
      { level: 3, count: 8, rwa: 5000 },
      { level: 4, count: 16, rwa: 10000 },
    ],
    teamDividendPercent: 40,
    minPerformance: 200000,
  },
};

export default function Cases() {
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [activeTab, setActiveTab] = useState('vip');
  const [showParams, setShowParams] = useState(false);
  const [dailyRate, setDailyRate] = useState(1.25);
  const [streamingRate, setStreamingRate] = useState(0.3);
  
  const [customStructure, setCustomStructure] = useState<Record<string, CaseConfig>>(() => ({...defaultCases}));

  const currentCase = customStructure[activeTab];

  const calculations = useMemo(() => {
    const config = currentCase;
    
    const selfTotal = config.selfRwa;
    const directTotal = config.directCount * config.directRwa;
    const indirectTotal = config.directCount * config.indirectPerDirect * config.indirectRwa;
    
    // Calculate extra levels separately for proper reward calculation
    let level3Total = 0;
    let level4Total = 0;
    if (config.extraNodes) {
      config.extraNodes.forEach(node => {
        if (node.level === 3) level3Total = node.count * node.rwa;
        if (node.level === 4) level4Total = node.count * node.rwa;
      });
    }
    const extraTotal = level3Total + level4Total;
    
    const totalInvestment = selfTotal + directTotal + indirectTotal + extraTotal;
    const teamPerformance = totalInvestment - selfTotal;
    
    // 定制RWA分红：整个团队的投资分红
    const customRwaDividend = totalInvestment * (dailyRate / 100);
    
    // 推流奖励：整个团队的推流
    const streamingReward = totalInvestment * (streamingRate / 100);
    
    // 直推奖励 (Direct Referral - 20%):
    // A对B的直推(20%): directTotal * rate * 20%
    // B对C的直推(20%): indirectTotal * rate * 20%
    // C对D的直推(20%): level3Total * rate * 20% (for 1★+ tiers)
    const directRefRewardA = directTotal * (dailyRate / 100) * 0.20;
    const directRefRewardB = indirectTotal * (dailyRate / 100) * 0.20;
    const directRefRewardC = level3Total * (dailyRate / 100) * 0.20;
    const directRefReward = directRefRewardA + directRefRewardB + directRefRewardC;
    
    // 间推奖励 (Indirect Referral - 10%):
    // A对C的间推(10%): indirectTotal * rate * 10%
    // B对D的间推(10%): level3Total * rate * 10% (for 1★+ tiers)
    const indirectRefRewardA = indirectTotal * (dailyRate / 100) * 0.10;
    const indirectRefRewardB = level3Total * (dailyRate / 100) * 0.10;
    const indirectRefReward = indirectRefRewardA + indirectRefRewardB;
    
    // 团队奖励：团队业绩 * 日利率 * 等级比例
    const teamReward = teamPerformance * (dailyRate / 100) * (config.teamDividendPercent / 100);
    
    // 推流管理奖励 (Streaming Management - 5% for 1★+):
    // 公式: 团队业绩 × 0.3% × 等级推流管理比例
    // VIP: 0%, 1★: 5%, 2★: 10%, 3★: 15%
    const streamingManagementPercent = config.tier === 'VIP' ? 0 : 
      config.tier === '1-Star Expert' ? 5 :
      config.tier === '2-Star Expert' ? 10 :
      config.tier === '3-Star Expert' ? 15 : 0;
    const streamingManagementReward = teamPerformance * 0.003 * (streamingManagementPercent / 100);
    
    const totalDailyIncome = customRwaDividend + streamingReward + directRefReward + indirectRefReward + teamReward + streamingManagementReward;
    const dailyRatio = (totalDailyIncome / totalInvestment) * 100;
    const monthlyIncome = totalDailyIncome * 30;
    const total180DayProfit = totalDailyIncome * 180;
    const paybackDays = Math.ceil(totalInvestment / totalDailyIncome);
    
    return {
      selfTotal,
      directTotal,
      indirectTotal,
      extraTotal,
      level3Total,
      level4Total,
      totalInvestment,
      teamPerformance,
      customRwaDividend,
      streamingReward,
      directRefRewardA,
      directRefRewardB,
      directRefRewardC,
      directRefReward,
      indirectRefRewardA,
      indirectRefRewardB,
      indirectRefReward,
      teamReward,
      streamingManagementPercent,
      streamingManagementReward,
      totalDailyIncome,
      dailyRatio,
      monthlyIncome,
      total180DayProfit,
      paybackDays,
    };
  }, [currentCase, dailyRate, streamingRate]);

  const updateDirectCount = (delta: number) => {
    setCustomStructure(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        directCount: Math.max(1, Math.min(10, prev[activeTab].directCount + delta)),
      },
    }));
  };

  const updateIndirectPerDirect = (delta: number) => {
    setCustomStructure(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        indirectPerDirect: Math.max(0, Math.min(10, prev[activeTab].indirectPerDirect + delta)),
      },
    }));
  };

  const updateRwa = (field: 'selfRwa' | 'directRwa' | 'indirectRwa', delta: number) => {
    setCustomStructure(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: Math.max(100, prev[activeTab][field] + delta),
      },
    }));
  };

  const resetToDefault = () => {
    setCustomStructure(prev => ({
      ...prev,
      [activeTab]: {...defaultCases[activeTab]},
    }));
  };

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatRwa = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const ParamsPanel = (
    <AnimatePresence>
      {showParams && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card className="p-3 mb-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 border-violet-500/30">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-violet-700 dark:text-violet-300">{t.customRwaRate}</span>
                  <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">{dailyRate.toFixed(2)}%</span>
                </div>
                <Slider
                  min={1.0}
                  max={1.5}
                  step={0.05}
                  value={[dailyRate]}
                  onValueChange={([v]) => setDailyRate(v)}
                  data-testid="slider-daily-rate-cases"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1.0%</span>
                  <span>1.5%</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-violet-700 dark:text-violet-300">{t.streamingRateSetting}</span>
                  <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">{streamingRate.toFixed(2)}%</span>
                </div>
                <Slider
                  min={0.2}
                  max={0.4}
                  step={0.02}
                  value={[streamingRate]}
                  onValueChange={([v]) => setStreamingRate(v)}
                  data-testid="slider-streaming-rate-cases"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.2%</span>
                  <span>0.4%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const StructureCard = (
    <Card className="p-3 card-luxury">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          {t.structureOverview}
        </h3>
        <Button size="sm" variant="outline" onClick={resetToDefault} className="text-xs h-7">
          {t.reset}
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium">{t.selfInvestment}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateRwa('selfRwa', -100)}>
              <Minus className="w-3 h-3" />
            </Button>
            <span className="font-mono text-sm w-16 text-center">{formatRwa(currentCase.selfRwa)}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateRwa('selfRwa', 100)}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-medium">{t.level1}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateDirectCount(-1)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-mono text-xs w-4 text-center">{currentCase.directCount}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateDirectCount(1)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">×</span>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateRwa('directRwa', -100)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-mono text-xs w-12 text-center">{formatRwa(currentCase.directRwa)}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateRwa('directRwa', 100)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium">{t.level2}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateIndirectPerDirect(-1)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-mono text-xs w-4 text-center">{currentCase.indirectPerDirect}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateIndirectPerDirect(1)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">×</span>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateRwa('indirectRwa', -100)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-mono text-xs w-12 text-center">{formatRwa(currentCase.indirectRwa)}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateRwa('indirectRwa', 100)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {currentCase.extraNodes && currentCase.extraNodes.map((node, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium">{t[`level${node.level}` as keyof typeof t] || `Level ${node.level}`}</span>
            </div>
            <span className="font-mono text-xs">{node.count} × {formatRwa(node.rwa)}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t.totalInvestment}</span>
          <span className="font-mono font-semibold">{formatRwa(calculations.totalInvestment)} RWA</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t.teamPerformance}</span>
          <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formatRwa(calculations.teamPerformance)} RWA</span>
        </div>
      </div>
    </Card>
  );

  const ResultsCard = (
    <Card className="p-3 card-luxury">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-emerald-500" />
        {t.incomeBreakdown}
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <span className="text-xs">{t.customRwaDividend}</span>
          <span className="font-mono text-sm font-semibold text-cyan-600 dark:text-cyan-400">{formatUsd(calculations.customRwaDividend)}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30">
          <span className="text-xs">{t.streamingReward}</span>
          <span className="font-mono text-sm font-semibold text-violet-600 dark:text-violet-400">{formatUsd(calculations.streamingReward)}</span>
        </div>
        
        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs">{t.directReferralReward} A→B (20%)</span>
            <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatUsd(calculations.directRefRewardA)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs">{t.directReferralReward} B→C (20%)</span>
            <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatUsd(calculations.directRefRewardB)}</span>
          </div>
          {calculations.directRefRewardC > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs">{t.directReferralReward} C→D (20%)</span>
              <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatUsd(calculations.directRefRewardC)}</span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs">{t.indirectReferralReward} A→C (10%)</span>
            <span className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">{formatUsd(calculations.indirectRefRewardA)}</span>
          </div>
          {calculations.indirectRefRewardB > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs">{t.indirectReferralReward} B→D (10%)</span>
              <span className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">{formatUsd(calculations.indirectRefRewardB)}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
          <span className="text-xs">{t.teamReward} ({currentCase.teamDividendPercent}%)</span>
          <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">{formatUsd(calculations.teamReward)}</span>
        </div>
        
        {calculations.streamingManagementReward > 0 && (
          <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/30">
            <span className="text-xs">{t.streamingManagementReward || '推流管理奖励'} ({calculations.streamingManagementPercent}%)</span>
            <span className="font-mono text-sm font-semibold text-rose-600 dark:text-rose-400">{formatUsd(calculations.streamingManagementReward)}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t-2 border-primary/30">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground">{t.totalDailyIncome}</p>
            <p className="font-mono text-lg font-bold text-primary">{formatUsd(calculations.totalDailyIncome)}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
            <p className="text-xs text-muted-foreground">{t.dailyRatio}</p>
            <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{calculations.dailyRatio.toFixed(2)}%</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-center">
            <p className="text-xs text-muted-foreground">{t.monthlyIncome}</p>
            <p className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">{formatUsd(calculations.monthlyIncome)}</p>
          </div>
          <div className="p-2 rounded-lg bg-violet-500/10 text-center">
            <p className="text-xs text-muted-foreground">{t.total180DayProfit}</p>
            <p className="font-mono text-base font-bold text-violet-600 dark:text-violet-400">{formatUsd(calculations.total180DayProfit)}</p>
          </div>
        </div>
        
        <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-center">
          <p className="text-xs text-muted-foreground">{t.paybackPeriod}</p>
          <p className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
            {calculations.paybackDays} {t.days}
          </p>
        </div>
      </div>
    </Card>
  );

  const TierTabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full h-auto p-1">
        <TabsTrigger value="vip" className="text-xs py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white" data-testid="tab-vip-case">
          VIP
        </TabsTrigger>
        <TabsTrigger value="star1" className="text-xs py-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white" data-testid="tab-star1-case">
          1★
        </TabsTrigger>
        <TabsTrigger value="star2" className="text-xs py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white" data-testid="tab-star2-case">
          2★
        </TabsTrigger>
        <TabsTrigger value="star3" className="text-xs py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white" data-testid="tab-star3-case">
          3★
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            {t.cases}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 ml-3">
            {t.casesDesc}
          </p>
        </div>
        <Button
          size="sm"
          variant={showParams ? "default" : "outline"}
          onClick={() => setShowParams(!showParams)}
          className="h-8"
          data-testid="button-toggle-params"
        >
          <Settings className="w-4 h-4 mr-1" />
          {t.baseParams}
        </Button>
      </div>

      {ParamsPanel}
      
      {TierTabs}
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-center">
          <span className="text-sm font-semibold">
            {currentCase.tier} - {t.teamPerformance}: {formatRwa(currentCase.minPerformance)} RWA+
          </span>
        </div>
        
        <OrgTreeDiagram config={currentCase} t={t} />
        
        {isMobile ? (
          <div className="space-y-3">
            {StructureCard}
            {ResultsCard}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {StructureCard}
            {ResultsCard}
          </div>
        )}
      </motion.div>
    </div>
  );
}
