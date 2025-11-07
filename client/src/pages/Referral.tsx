import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { referralInputSchema, type ReferralInput, type ReferralReward } from '@shared/schema';
import { calculateReferralRewards } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MetricCard } from '@/components/MetricCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, TrendingUp } from 'lucide-react';

export default function Referral() {
  const { t } = useLanguage();
  const [result, setResult] = useState<ReferralReward | null>(null);

  const form = useForm<ReferralInput>({
    resolver: zodResolver(referralInputSchema),
    defaultValues: {
      downlineInvestment: 100,
      downlineDailyRate: 1.0,
      secondLevelInvestment: 0,
      secondLevelDailyRate: 1.0,
    },
  });

  const downlineDailyRate = form.watch('downlineDailyRate');
  const secondLevelDailyRate = form.watch('secondLevelDailyRate');

  const onSubmit = (data: ReferralInput) => {
    const calculatedResult = calculateReferralRewards(data);
    setResult(calculatedResult);
  };

  const handleReset = () => {
    form.reset();
    setResult(null);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.referralRewards}</h2>
        <p className="text-sm text-muted-foreground">
          Direct: 20% of downline daily profit | Indirect: 10% of 2nd level daily profit
        </p>
      </div>

      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="direct" data-testid="tab-direct-rewards">
            {t.directRewards}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-6 mt-6">
          <Card className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-l-primary pl-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Level 1 - {t.directReward}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="downlineInvestment" className="text-sm font-medium mb-2 block">
                        {t.downlineInvestment}
                      </Label>
                      <Input
                        id="downlineInvestment"
                        type="number"
                        step="100"
                        min="100"
                        {...form.register('downlineInvestment', { valueAsNumber: true })}
                        data-testid="input-downline-investment"
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {t.downlineDailyRate}: <span className="font-mono text-primary">{downlineDailyRate?.toFixed(1)}%</span>
                      </Label>
                      <Slider
                        min={1.0}
                        max={1.5}
                        step={0.1}
                        value={[downlineDailyRate || 1.0]}
                        onValueChange={([value]) => form.setValue('downlineDailyRate', value)}
                        data-testid="slider-downline-rate"
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1.0%</span>
                        <span>1.5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-l-chart-3 pl-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Level 2 - {t.indirectReward} <span className="text-xs text-muted-foreground">(Optional)</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="secondLevelInvestment" className="text-sm font-medium mb-2 block">
                        {t.secondLevelInvestment}
                      </Label>
                      <Input
                        id="secondLevelInvestment"
                        type="number"
                        step="100"
                        min="0"
                        {...form.register('secondLevelInvestment', { valueAsNumber: true })}
                        data-testid="input-second-level-investment"
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {t.secondLevelDailyRate}: <span className="font-mono text-primary">{secondLevelDailyRate?.toFixed(1)}%</span>
                      </Label>
                      <Slider
                        min={1.0}
                        max={1.5}
                        step={0.1}
                        value={[secondLevelDailyRate || 1.0]}
                        onValueChange={([value]) => form.setValue('secondLevelDailyRate', value)}
                        data-testid="slider-second-level-rate"
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1.0%</span>
                        <span>1.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" data-testid="button-calculate-referral">
                  {t.calculate}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} data-testid="button-reset-referral">
                  {t.reset}
                </Button>
              </div>
            </form>
          </Card>

          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  icon={UserPlus}
                  label={`${t.directReward} - ${t.daily}`}
                  value={formatCurrency(result.directDailyReward)}
                  subtitle={`${formatCurrency(result.directMonthlyReward)} ${t.monthly.toLowerCase()}`}
                  testId="metric-direct-reward"
                />
                <MetricCard
                  icon={Users}
                  label={`${t.indirectReward} - ${t.daily}`}
                  value={formatCurrency(result.indirectDailyReward)}
                  subtitle={`${formatCurrency(result.indirectMonthlyReward)} ${t.monthly.toLowerCase()}`}
                  testId="metric-indirect-reward"
                />
                <MetricCard
                  icon={TrendingUp}
                  label={`${t.totalReward} - ${t.daily}`}
                  value={formatCurrency(result.totalDailyReward)}
                  subtitle={`${formatCurrency(result.totalMonthlyReward)} ${t.monthly.toLowerCase()}`}
                  testId="metric-total-referral-reward"
                />
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Reward Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-card rounded-md">
                        <span className="text-sm text-muted-foreground">Direct (20%)</span>
                        <span className="font-mono font-semibold">{formatCurrency(result.directDailyReward)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-card rounded-md">
                        <span className="text-sm text-muted-foreground">Indirect (10%)</span>
                        <span className="font-mono font-semibold">{formatCurrency(result.indirectDailyReward)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center p-6 bg-card rounded-md">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{t.monthly} {t.totalReward}</p>
                        <p className="text-3xl font-bold font-mono text-primary">
                          {formatCurrency(result.totalMonthlyReward)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
