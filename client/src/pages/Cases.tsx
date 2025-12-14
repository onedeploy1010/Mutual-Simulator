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
  Crown,
  Star,
  Sparkles
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
    
    let extraTotal = 0;
    if (config.extraNodes) {
      config.extraNodes.forEach(node => {
        extraTotal += node.count * node.rwa;
      });
    }
    
    const totalInvestment = selfTotal + directTotal + indirectTotal + extraTotal;
    const teamPerformance = totalInvestment - selfTotal;
    
    const customRwaDividend = selfTotal * 100 * (dailyRate / 100);
    const streamingReward = selfTotal * 100 * (streamingRate / 100);
    
    const directRefReward = directTotal * 100 * (dailyRate / 100) * 0.20;
    const indirectRefReward = indirectTotal * 100 * (dailyRate / 100) * 0.10;
    
    const teamReward = teamPerformance * 100 * (dailyRate / 100) * (config.teamDividendPercent / 100);
    
    const totalDailyIncome = customRwaDividend + streamingReward + directRefReward + indirectRefReward + teamReward;
    const dailyRatio = (totalDailyIncome / (totalInvestment * 100)) * 100;
    const monthlyIncome = totalDailyIncome * 30;
    const total180DayProfit = totalDailyIncome * 180;
    const paybackDays = Math.ceil((totalInvestment * 100) / totalDailyIncome);
    
    return {
      selfTotal,
      directTotal,
      indirectTotal,
      extraTotal,
      totalInvestment,
      teamPerformance,
      customRwaDividend,
      streamingReward,
      directRefReward,
      indirectRefReward,
      teamReward,
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
          <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formatUsd(calculations.teamPerformance * 100)}</span>
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
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
          <span className="text-xs">{t.directReferralReward} (20%)</span>
          <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatUsd(calculations.directRefReward)}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30">
          <span className="text-xs">{t.indirectReferralReward} (10%)</span>
          <span className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">{formatUsd(calculations.indirectRefReward)}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
          <span className="text-xs">{t.teamReward} ({currentCase.teamDividendPercent}%)</span>
          <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">{formatUsd(calculations.teamReward)}</span>
        </div>
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
            {currentCase.tier} - {t.teamPerformance}: {formatUsd(currentCase.minPerformance)}+
          </span>
        </div>
        
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
