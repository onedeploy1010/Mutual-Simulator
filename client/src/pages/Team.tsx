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
  const dailyRate = form.watch('dailyRate');
  const isSupreme = currentTier === 'Supreme';

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
                onValueChange={(value) => form.setValue('currentTier', value)}
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
              <Label htmlFor="totalPerformanceRwa" className="text-sm font-medium mb-2 block">
                {t.totalPerformance}
              </Label>
              <Input
                id="totalPerformanceRwa"
                type="number"
                min="1"
                step="1"
                {...form.register('totalPerformanceRwa', { valueAsNumber: true })}
                data-testid="input-total-performance-rwa"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 RWA = $100 USD
              </p>
              {form.formState.errors.totalPerformanceRwa && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.totalPerformanceRwa.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="smallAreaPerformanceRwa" className="text-sm font-medium mb-2 block">
                {t.smallAreaPerformance}
              </Label>
              <Input
                id="smallAreaPerformanceRwa"
                type="number"
                min="1"
                step="1"
                {...form.register('smallAreaPerformanceRwa', { valueAsNumber: true })}
                data-testid="input-small-area-performance-rwa"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be ≥ 50% of total performance (1 RWA = $100 USD)
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
