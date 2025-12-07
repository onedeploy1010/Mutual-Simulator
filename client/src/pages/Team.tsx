import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamRewardInputSchema, type TeamRewardInput, type TeamRewardResult, teamTiers } from '@shared/schema';
import { calculateTeamRewards } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTeam } from '@/contexts/TeamContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MetricCard } from '@/components/MetricCard';
import { TierBadge } from '@/components/TierBadge';
import { TeamTierVisualization } from '@/components/TeamTierVisualization';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, TrendingUp, Zap, Crown, ListOrdered, ArrowLeft, ArrowRight, Calculator, Users } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function Team() {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const { setTeamData } = useTeam();
  const [result, setResult] = useState<TeamRewardResult | null>(null);
  const [currentFormValues, setCurrentFormValues] = useState<TeamRewardInput | null>(null);
  const isMobile = useIsMobile();

  const getTierTranslation = (tierName: string) => {
    const tierMap: Record<string, keyof typeof t> = {
      'VIP': 'tierVIP',
      '1-Star Expert': 'tier1StarExpert',
      '2-Star Expert': 'tier2StarExpert',
      '3-Star Expert': 'tier3StarExpert',
      '1-Star Ambassador': 'tier1StarAmbassador',
      '2-Star Ambassador': 'tier2StarAmbassador',
      '3-Star Ambassador': 'tier3StarAmbassador',
      'Supreme': 'tierSupreme',
    };
    const key = tierMap[tierName];
    return key ? t[key] : tierName;
  };

  const form = useForm<TeamRewardInput>({
    resolver: zodResolver(teamRewardInputSchema),
    defaultValues: {
      currentTier: 'VIP',
      totalPerformanceRwa: 60,
      dailyRate: 1.25,
      mecPrice: 1,
    },
  });

  const currentTier = form.watch('currentTier');
  const totalPerformanceRwa = form.watch('totalPerformanceRwa');
  const dailyRate = form.watch('dailyRate');
  const isSupreme = currentTier === 'Supreme';
  
  const tierInfo = teamTiers.find(t => t.tier === currentTier);
  const minTotalRwa = tierInfo ? Math.max(1, Math.ceil(tierInfo.requirementMin / 100)) : 1;
  const maxTotalRwa = tierInfo && tierInfo.requirementMax 
    ? Math.floor(tierInfo.requirementMax / 100) 
    : Math.max(minTotalRwa * 10, 100000);

  const onSubmit = (data: TeamRewardInput) => {
    const calculatedResult = calculateTeamRewards(data);
    setResult(calculatedResult);
    setCurrentFormValues(data);
  };

  const handleViewDetailedBreakdown = () => {
    if (!result || !currentFormValues) return;
    setTeamData(result, currentFormValues);
    navigate('/team-daily-breakdown');
  };

  const handleReset = () => {
    form.reset();
    setResult(null);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  const handleTierChange = (value: string) => {
    form.setValue('currentTier', value);
    const newTierInfo = teamTiers.find(t => t.tier === value);
    if (newTierInfo) {
      const newMinTotal = Math.max(1, Math.ceil(newTierInfo.requirementMin / 100));
      const newMaxTotal = newTierInfo.requirementMax 
        ? Math.floor(newTierInfo.requirementMax / 100)
        : Math.max(newMinTotal * 10, 100000);
      const safeTotal = Math.max(newMinTotal, Math.min(totalPerformanceRwa || newMinTotal, newMaxTotal));
      form.setValue('totalPerformanceRwa', safeTotal);
    }
  };

  const FormSection = (
    <div className="space-y-4">
      <Card className="p-4 xl:p-6 card-luxury">
        <Label className="text-base xl:text-lg font-semibold mb-4 block text-center">
          {t.currentTier}
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {teamTiers.slice(0, 4).map((tier) => (
            <Button
              key={tier.tier}
              type="button"
              variant={currentTier === tier.tier ? 'default' : 'outline'}
              size="sm"
              className={`h-auto py-2 px-2 text-xs xl:text-sm flex flex-col items-center gap-0.5 ${currentTier === tier.tier ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              onClick={() => handleTierChange(tier.tier)}
              data-testid={`tab-tier-${tier.tier}`}
            >
              <span className="font-medium truncate w-full text-center">
                {language === 'zh' 
                  ? (tier.tier === 'VIP' ? 'VIP' : tier.tier.includes('Expert') ? `${tier.tier.charAt(0)}星达人` : tier.tier)
                  : (tier.tier === 'VIP' ? 'VIP' : tier.tier.replace('-Star Expert', '★E'))
                }
              </span>
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {teamTiers.slice(4).map((tier) => (
            <Button
              key={tier.tier}
              type="button"
              variant={currentTier === tier.tier ? 'default' : 'outline'}
              size="sm"
              className={`h-auto py-2 px-2 text-xs xl:text-sm flex flex-col items-center gap-0.5 ${currentTier === tier.tier ? 'ring-2 ring-primary ring-offset-1' : ''} ${tier.tier === 'Supreme' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' : ''}`}
              onClick={() => handleTierChange(tier.tier)}
              data-testid={`tab-tier-${tier.tier}`}
            >
              <span className="font-medium truncate w-full text-center flex items-center justify-center gap-0.5">
                {tier.tier === 'Supreme' && <Crown className="w-3 h-3 text-yellow-500" />}
                {language === 'zh' 
                  ? (tier.tier === 'Supreme' ? '至尊' : tier.tier.includes('Ambassador') ? `${tier.tier.charAt(0)}星大使` : tier.tier)
                  : (tier.tier === 'Supreme' ? 'Supreme' : tier.tier.replace('-Star Ambassador', '★A'))
                }
              </span>
            </Button>
          ))}
        </div>
      </Card>

      <TeamTierVisualization currentTier={currentTier} />
      
      <Card className="p-4 xl:p-6 card-luxury glass-card">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            {(() => {
              const tierInfo = teamTiers.find(t => t.tier === currentTier);
              if (!tierInfo) return null;
              
              return (
                <div className="p-3 bg-muted/30 rounded-md border border-border/50 space-y-2">
                  {!tierInfo.isSupreme && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t.performanceRange}: </span>
                      <span className="font-mono font-medium text-foreground">
                        {formatNumber(tierInfo.requirementMin / 100)} - {tierInfo.requirementMax ? formatNumber(tierInfo.requirementMax / 100) : '∞'} RWA
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t.dividend}: </span>
                      <span className="font-mono font-semibold text-primary">{tierInfo.teamDividendPercent}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t.management}: </span>
                      <span className="font-mono font-semibold text-chart-3">{tierInfo.streamingManagementPercent}%</span>
                    </div>
                  </div>
                  {tierInfo.communityRequirement && tierInfo.communityRequirement !== '-' && (
                    <div className="p-2 bg-primary/10 rounded-md border border-primary/30">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-primary font-medium">{t.communityStructure}:</span>
                        <span className="text-foreground font-medium">
                          {language === 'zh' ? tierInfo.communityRequirementZh : tierInfo.communityRequirement}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div>
              <Label className="text-base xl:text-lg font-semibold mb-3 block">
                {t.teamDailyRate}: <span className="font-mono text-primary text-lg xl:text-xl">{dailyRate?.toFixed(2)}%</span>
              </Label>
              <Slider
                min={1.0}
                max={1.5}
                step={0.1}
                value={[dailyRate || 1.25]}
                onValueChange={([value]) => form.setValue('dailyRate', value)}
                data-testid="slider-team-daily-rate"
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>1.0%</span>
                <span>1.5%</span>
              </div>
            </div>

            <div>
              <Label htmlFor="mecPrice" className="text-base xl:text-lg font-semibold mb-3 block">
                {t.mecPrice}
              </Label>
              <Select
                value={form.watch('mecPrice')?.toString()}
                onValueChange={(value) => form.setValue('mecPrice', Number(value))}
              >
                <SelectTrigger id="mecPrice" data-testid="select-mec-price" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" data-testid="mec-price-1">1 USD</SelectItem>
                  <SelectItem value="2" data-testid="mec-price-2">2 USD</SelectItem>
                  <SelectItem value="4" data-testid="mec-price-4">4 USD</SelectItem>
                  <SelectItem value="8" data-testid="mec-price-8">8 USD</SelectItem>
                  <SelectItem value="16" data-testid="mec-price-16">16 USD</SelectItem>
                  <SelectItem value="32" data-testid="mec-price-32">32 USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base xl:text-lg font-semibold mb-3 block">
                {t.totalPerformance}: <span className="font-mono text-primary text-lg xl:text-xl">{totalPerformanceRwa || 0} RWA</span>
              </Label>
              <Slider
                min={minTotalRwa}
                max={maxTotalRwa}
                step={1}
                value={[totalPerformanceRwa || minTotalRwa]}
                onValueChange={([value]) => form.setValue('totalPerformanceRwa', value)}
                data-testid="slider-total-performance"
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{minTotalRwa} RWA</span>
                <span>{maxTotalRwa === 1000 ? '∞' : `${maxTotalRwa} RWA`}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                1 RWA = $100 USD · {t.rangeFor} {currentTier}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" className="flex-1 h-12 xl:h-14 text-base xl:text-lg" data-testid="button-calculate-team">
              <Calculator className="w-5 h-5 mr-2" />
              {t.calculate}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleReset} data-testid="button-reset-team">
              {t.reset}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const ResultsSection = result && (
    <div className="space-y-4 xl:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-4 xl:p-6 bg-gradient-to-br from-primary/5 to-chart-1/5 border-primary/20 card-luxury">
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base xl:text-lg font-semibold text-foreground">{t.tierInfo}</h3>
            <TierBadge tier={result.tierInfo.tier} />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="p-3 bg-card rounded-md">
              <p className="text-sm text-muted-foreground mb-1">{t.dividend}</p>
              <p className="text-xl xl:text-2xl font-bold font-mono text-primary">
                {result.tierInfo.teamDividendPercent}%
              </p>
            </div>
            <div className="p-3 bg-card rounded-md">
              <p className="text-sm text-muted-foreground mb-1">{t.management}</p>
              <p className="text-xl xl:text-2xl font-bold font-mono text-chart-3">
                {result.tierInfo.streamingManagementPercent}%
              </p>
            </div>
            {result.tierInfo.isSupreme && (
              <div className="p-3 bg-card rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Supreme</p>
                <p className="text-xl xl:text-2xl font-bold font-mono text-chart-1">5%</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="p-4 xl:p-6 card-luxury glass-card">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="text-base xl:text-lg font-semibold">{t.teamDividend}</h3>
            <span className="text-sm text-muted-foreground">({result.tierInfo.teamDividendPercent}%)</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <span className="text-sm text-muted-foreground">90% USD</span>
              <span className="font-mono text-lg xl:text-xl font-semibold" data-testid="value-team-dividend-usd">
                {formatCurrency(result.teamDividendUsd)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-md">
              <span className="text-sm text-muted-foreground">10% MEC</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-lg xl:text-xl font-semibold text-primary" data-testid="value-team-dividend-mec">
                  {result.teamDividendMec.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">MEC</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 xl:p-6 card-luxury glass-card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-chart-3" />
            <h3 className="text-base xl:text-lg font-semibold">{t.streamingManagement}</h3>
            <span className="text-sm text-muted-foreground">({result.tierInfo.streamingManagementPercent}%)</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
              <span className="text-sm text-muted-foreground">100% USD</span>
              <span className="font-mono text-lg xl:text-xl font-semibold" data-testid="metric-streaming-management-usd">
                {formatCurrency(result.streamingManagementUsd)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic px-1">
              {t.streamingManagement100DaysNote}
            </div>
          </div>
        </Card>

        {result.tierInfo.isSupreme && (
          <Card className="p-4 xl:p-6 card-luxury glass-card xl:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-chart-1" />
              <h3 className="text-base xl:text-lg font-semibold">{t.supremeReward}</h3>
              <span className="text-sm text-muted-foreground">(5%)</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <span className="text-sm text-muted-foreground">90% USD</span>
                <span className="font-mono text-lg xl:text-xl font-semibold" data-testid="metric-supreme-reward-usd">
                  {formatCurrency(result.supremeRewardUsd)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">10% MEC</span>
                  <span className="text-xs text-muted-foreground">@ {result.mecPrice} USD/MEC</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-lg xl:text-xl font-semibold" data-testid="metric-supreme-reward-mec">
                    {result.supremeRewardMec.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">MEC</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-4 xl:p-6 bg-gradient-to-br from-primary/10 to-chart-1/10 border-primary/30">
        <h3 className="text-base xl:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t.rewardSummary}
        </h3>
        
        <div className="grid grid-cols-3 gap-3 xl:gap-4 mb-4">
          <div className="p-3 xl:p-4 bg-card rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">{t.daily}</p>
            <div>
              <p className="text-xs text-muted-foreground/70">USD</p>
              <p className="text-lg xl:text-xl font-bold font-mono text-foreground" data-testid="metric-daily-usd">
                {formatCurrency(result.totalDailyUsd)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70">MEC</p>
              <p className="text-lg xl:text-xl font-bold font-mono text-primary" data-testid="metric-daily-mec">
                {result.totalDailyMec.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="p-3 xl:p-4 bg-card rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">{t.monthly}</p>
            <div>
              <p className="text-xs text-muted-foreground/70">USD</p>
              <p className="text-lg xl:text-xl font-bold font-mono text-foreground" data-testid="metric-monthly-usd">
                {formatCurrency(result.totalMonthlyUsd)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70">MEC</p>
              <p className="text-lg xl:text-xl font-bold font-mono text-primary" data-testid="metric-monthly-mec">
                {result.totalMonthlyMec.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="p-3 xl:p-4 bg-card rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">180 {t.days}</p>
            <div>
              <p className="text-xs text-muted-foreground/70">USD</p>
              <p className="text-lg xl:text-xl font-bold font-mono text-foreground" data-testid="value-180-day-usd">
                {formatCurrency(result.total180DayUsd)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70">MEC</p>
              <p className="text-lg xl:text-xl font-bold font-mono text-primary" data-testid="value-180-day-mec">
                {result.total180DayMec.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center p-2 bg-muted/20 rounded-md mb-4">
          @ {result.mecPrice} USD/MEC
        </div>

        <Button 
          onClick={handleViewDetailedBreakdown}
          className="w-full h-12 xl:h-14 text-base xl:text-lg"
          data-testid="button-view-team-breakdown"
        >
          <ListOrdered className="w-5 h-5 mr-2" />
          {t.viewDetailedBreakdown}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={handleReset}
          className="flex-1 h-12"
          data-testid="button-reset-results"
        >
          {t.reset}
        </Button>
      </div>
    </div>
  );

  const EmptyResultsPlaceholder = (
    <Card className="p-12 text-center card-luxury glass-card h-full flex items-center justify-center min-h-[400px]">
      <div className="space-y-4">
        <Users className="w-16 h-16 mx-auto text-muted-foreground/30" />
        <p className="text-muted-foreground text-lg">{t.selectTierAndCalculate}</p>
      </div>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="section-header text-foreground flex items-center gap-3">
            <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-chart-1 rounded-full"></div>
            {t.teamRewards}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 ml-5">
            {t.calculateTeamRewardsDesc}
          </p>
        </div>

        {!result ? (
          FormSection
        ) : (
          ResultsSection
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="mb-6 xl:mb-8">
        <h2 className="section-header text-foreground flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-chart-1 rounded-full"></div>
          {t.teamRewards}
        </h2>
        <p className="text-base xl:text-lg text-muted-foreground mt-2 ml-5">
          {t.calculateTeamRewardsDesc}
        </p>
      </div>

      <div className="hidden xl:grid xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2">
          {FormSection}
        </div>
        <div className="xl:col-span-3">
          {result ? ResultsSection : EmptyResultsPlaceholder}
        </div>
      </div>

      <div className="xl:hidden space-y-6">
        {FormSection}
        {ResultsSection}
      </div>
    </div>
  );
}
