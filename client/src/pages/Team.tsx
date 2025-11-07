import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamRewardInputSchema, type TeamRewardInput, type TeamRewardResult, teamTiers } from '@shared/schema';
import { calculateTeamRewards } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MetricCard } from '@/components/MetricCard';
import { TierBadge } from '@/components/TierBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, TrendingUp, Zap, Crown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function Team() {
  const { t } = useLanguage();
  const [result, setResult] = useState<TeamRewardResult | null>(null);

  const form = useForm<TeamRewardInput>({
    resolver: zodResolver(teamRewardInputSchema),
    defaultValues: {
      currentTier: 'VIP',
      totalPerformanceRwa: 60,
      smallAreaPerformanceRwa: 30,
      dailyRate: 1.0,
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
  
  const minSmallAreaRwa = Math.max(1, Math.ceil((totalPerformanceRwa || 1) * 0.5));
  const maxSmallAreaRwa = Math.max(1, totalPerformanceRwa || 1);

  const onSubmit = (data: TeamRewardInput) => {
    const calculatedResult = calculateTeamRewards(data);
    setResult(calculatedResult);
  };

  const handleReset = () => {
    form.reset();
    setResult(null);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.teamRewards}</h2>
        <p className="text-sm text-muted-foreground">
          Calculate rewards based on your team tier and performance
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentTier" className="text-sm font-medium mb-2 block">
                {t.currentTier}
              </Label>
              <Select
                value={currentTier}
                onValueChange={(value) => {
                  form.setValue('currentTier', value);
                  const newTierInfo = teamTiers.find(t => t.tier === value);
                  if (newTierInfo) {
                    const newMinTotal = Math.max(1, Math.ceil(newTierInfo.requirementMin / 100));
                    const newMaxTotal = newTierInfo.requirementMax 
                      ? Math.floor(newTierInfo.requirementMax / 100)
                      : Math.max(newMinTotal * 10, 100000);
                    const safeTotal = Math.max(newMinTotal, Math.min(totalPerformanceRwa || newMinTotal, newMaxTotal));
                    form.setValue('totalPerformanceRwa', safeTotal);
                    const safeSmallArea = Math.max(1, Math.ceil(safeTotal * 0.5));
                    form.setValue('smallAreaPerformanceRwa', safeSmallArea);
                  }
                }}
              >
                <SelectTrigger data-testid="select-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamTiers.map((tier) => (
                    <SelectItem key={tier.tier} value={tier.tier} data-testid={`option-tier-${tier.tier}`}>
                      <div className="flex items-center gap-2">
                        <TierBadge tier={tier.tier} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(() => {
                const tierInfo = teamTiers.find(t => t.tier === currentTier);
                if (!tierInfo || tierInfo.isSupreme) return null;
                const minRwa = tierInfo.requirementMin / 100;
                const maxRwa = tierInfo.requirementMax ? tierInfo.requirementMax / 100 : null;
                return (
                  <p className="text-xs text-muted-foreground mt-2">
                    Performance range: {formatNumber(minRwa)} - {maxRwa ? formatNumber(maxRwa) : '∞'} RWA 
                    <span className="text-muted-foreground/70"> (${formatNumber(tierInfo.requirementMin)} - {tierInfo.requirementMax ? `$${formatNumber(tierInfo.requirementMax)}` : '∞'})</span>
                  </p>
                );
              })()}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t.teamDailyRate}: <span className="font-mono text-primary">{dailyRate?.toFixed(1)}%</span>
              </Label>
              <Slider
                min={1.0}
                max={1.5}
                step={0.1}
                value={[dailyRate || 1.0]}
                onValueChange={([value]) => form.setValue('dailyRate', value)}
                data-testid="slider-team-daily-rate"
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1.0%</span>
                <span>1.5%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Long-term RWA investment daily return rate
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t.totalPerformance}: <span className="font-mono text-primary">{totalPerformanceRwa || 0} RWA</span>
              </Label>
              <Slider
                min={minTotalRwa}
                max={maxTotalRwa}
                step={1}
                value={[totalPerformanceRwa || minTotalRwa]}
                onValueChange={([value]) => {
                  form.setValue('totalPerformanceRwa', value);
                  const newMinSmall = Math.ceil(value * 0.5);
                  const currentSmall = form.getValues('smallAreaPerformanceRwa');
                  if (currentSmall < newMinSmall || currentSmall > value) {
                    form.setValue('smallAreaPerformanceRwa', newMinSmall);
                  }
                }}
                data-testid="slider-total-performance"
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{minTotalRwa} RWA</span>
                <span>{maxTotalRwa === 1000 ? '∞' : `${maxTotalRwa} RWA`}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                1 RWA = $100 USD · Range for {currentTier}
              </p>
              {form.formState.errors.totalPerformanceRwa && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.totalPerformanceRwa.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t.smallAreaPerformance}: <span className="font-mono text-primary">{form.watch('smallAreaPerformanceRwa') || 0} RWA</span>
              </Label>
              <Slider
                min={minSmallAreaRwa}
                max={maxSmallAreaRwa}
                step={1}
                value={[form.watch('smallAreaPerformanceRwa') || minSmallAreaRwa]}
                onValueChange={([value]) => form.setValue('smallAreaPerformanceRwa', value)}
                data-testid="slider-small-area-performance"
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{minSmallAreaRwa} RWA (50%)</span>
                <span>{maxSmallAreaRwa} RWA (100%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select between 50%-100% of total performance
              </p>
              {form.formState.errors.smallAreaPerformanceRwa && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.smallAreaPerformanceRwa.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" data-testid="button-calculate-team">
              {t.calculate}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} data-testid="button-reset-team">
              {t.reset}
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              icon={Trophy}
              label={`${t.teamDividend} (${result.tierInfo.teamDividendPercent}%)`}
              value={formatCurrency(result.teamDividendReward)}
              testId="metric-team-dividend"
            />
            <MetricCard
              icon={Zap}
              label={`${t.streamingManagement} (${result.tierInfo.streamingManagementPercent}%)`}
              value={formatCurrency(result.streamingManagementReward)}
              testId="metric-streaming-management"
            />
            {result.tierInfo.isSupreme && (
              <MetricCard
                icon={Crown}
                label={`${t.supremeReward} (5%)`}
                value={formatCurrency(result.supremeReward)}
                testId="metric-supreme-reward"
              />
            )}
            <MetricCard
              icon={TrendingUp}
              label={`${t.totalReward} - ${t.daily}`}
              value={formatCurrency(result.totalDailyReward)}
              subtitle={`${formatCurrency(result.totalMonthlyReward)} ${t.monthly.toLowerCase()}`}
              testId="metric-total-team-reward"
            />
          </div>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-chart-1/5 border-primary/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Current Tier Benefits</h3>
                <TierBadge tier={result.tierInfo.tier} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">{t.dividend}</p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {result.tierInfo.teamDividendPercent}%
                  </p>
                </div>
                <div className="p-4 bg-card rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">{t.management}</p>
                  <p className="text-2xl font-bold font-mono text-chart-3">
                    {result.tierInfo.streamingManagementPercent}%
                  </p>
                </div>
                <div className="p-4 bg-card rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">{t.monthly} Total</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {formatCurrency(result.totalMonthlyReward)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.tierRequirements}</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">{t.requirement}</TableHead>
                <TableHead>{t.communityStructure}</TableHead>
                <TableHead className="text-right">{t.dividend} %</TableHead>
                <TableHead className="text-right">{t.management} %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamTiers.map((tier) => (
                <TableRow key={tier.tier} data-testid={`row-tier-${tier.tier}`}>
                  <TableCell>
                    <TierBadge tier={tier.tier} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {tier.requirementSelfAndTeam > 0 ? `$${formatNumber(tier.requirementSelfAndTeam)}` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                    {tier.communityRequirement}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                    {tier.teamDividendPercent}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-chart-3">
                    {tier.streamingManagementPercent}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
