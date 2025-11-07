import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { investmentInputSchema, type InvestmentInput, type InvestmentResult, ProductType } from '@shared/schema';
import { calculateInvestment } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MetricCard } from '@/components/MetricCard';
import { DailyBreakdownTable } from '@/components/DailyBreakdownTable';
import { StreamingReleaseChart } from '@/components/StreamingReleaseChart';
import { ProfitProgressionChart } from '@/components/ProfitProgressionChart';
import { DollarSign, TrendingUp, Calendar, Zap, PiggyBank, ChevronDown, ChevronUp, ListOrdered } from 'lucide-react';

export default function Investment() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState<InvestmentInput | null>(null);

  const form = useForm<InvestmentInput>({
    resolver: zodResolver(investmentInputSchema),
    defaultValues: {
      rwaCount: 1,
      productType: ProductType.SHORT,
      duration: 7,
      dailyRate: 1.0,
    },
  });

  const productType = form.watch('productType');
  const dailyRate = form.watch('dailyRate');

  const onSubmit = (data: InvestmentInput) => {
    const calculatedResult = calculateInvestment(data);
    setResult(calculatedResult);
    setCurrentFormValues(data);
    setShowBreakdown(false);
  };

  const handleViewDetailedBreakdown = () => {
    if (!result || !currentFormValues) return;
    
    const investmentAmount = currentFormValues.rwaCount * 100;
    
    navigate('/daily-breakdown', {
      state: {
        dailyBreakdown: result.dailyBreakdown,
        investmentAmount,
        dailyRate: currentFormValues.dailyRate || 0,
      }
    });
  };

  const handleReset = () => {
    form.reset();
    setResult(null);
    setShowBreakdown(false);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.investmentCalculator}</h2>
        <p className="text-sm text-muted-foreground">
          {productType === ProductType.SHORT
            ? 'Short-term: Fixed 5% return, 5-10 days'
            : 'Long-term: 1-1.5% daily, 180 days with capital return'}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">{t.productType}</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={productType === ProductType.SHORT ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => form.setValue('productType', ProductType.SHORT)}
                  data-testid="button-product-short"
                >
                  {t.shortTerm}
                </Button>
                <Button
                  type="button"
                  variant={productType === ProductType.LONG ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => form.setValue('productType', ProductType.LONG)}
                  data-testid="button-product-long"
                >
                  {t.longTerm}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="rwaCount" className="text-sm font-medium mb-2 block">
                {t.investmentAmount}
              </Label>
              <Input
                id="rwaCount"
                type="number"
                step="1"
                min="1"
                {...form.register('rwaCount', { valueAsNumber: true })}
                data-testid="input-rwaCount"
                className="font-mono"
              />
              {form.formState.errors.rwaCount && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.rwaCount.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                1 RWA = $100 USD
              </p>
            </div>

            {productType === ProductType.SHORT && (
              <div>
                <Label htmlFor="duration" className="text-sm font-medium mb-2 block">
                  {t.duration}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="10"
                  {...form.register('duration', { valueAsNumber: true })}
                  data-testid="input-duration"
                  className="font-mono"
                />
              </div>
            )}

            {productType === ProductType.LONG && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {t.dailyReturnRate}: <span className="font-mono text-primary">{dailyRate?.toFixed(1)}%</span>
                </Label>
                <Slider
                  min={1.0}
                  max={1.5}
                  step={0.1}
                  value={[dailyRate || 1.0]}
                  onValueChange={([value]) => form.setValue('dailyRate', value)}
                  data-testid="slider-daily-rate"
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1.0%</span>
                  <span>1.5%</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" data-testid="button-calculate">
              {t.calculate}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} data-testid="button-reset">
              {t.reset}
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              icon={DollarSign}
              label={t.dailyReturn}
              value={formatCurrency(result.dailyReturn)}
              testId="metric-daily-return"
            />
            <MetricCard
              icon={Calendar}
              label={t.monthlyReturn}
              value={formatCurrency(result.monthlyReturn)}
              testId="metric-monthly-return"
            />
            <MetricCard
              icon={TrendingUp}
              label={t.totalReturn}
              value={formatCurrency(result.totalReturn)}
              testId="metric-total-return"
            />
            <MetricCard
              icon={Zap}
              label={t.streamingBonus}
              value={formatCurrency(result.totalStreamingBonus)}
              subtitle={`${formatCurrency(result.dailyStreamingBonus)} ${t.daily.toLowerCase()}`}
              testId="metric-streaming-bonus"
            />
            <MetricCard
              icon={PiggyBank}
              label={t.totalWithCapital}
              value={formatCurrency(result.totalWithCapital)}
              testId="metric-total-with-capital"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfitProgressionChart dailyBreakdown={result.dailyBreakdown} />
            <StreamingReleaseChart />
          </div>

          <Card className="p-6">
            <div className="space-y-3">
              {productType === ProductType.LONG && result.dailyBreakdown.length === 180 && (
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleViewDetailedBreakdown}
                  data-testid="button-view-detailed-breakdown"
                >
                  <ListOrdered className="w-4 h-4" />
                  View Detailed 180-Day Breakdown
                </Button>
              )}
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowBreakdown(!showBreakdown)}
                data-testid="button-toggle-breakdown"
              >
                {showBreakdown ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    {t.hideDailyBreakdown}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    {t.viewDailyBreakdown}
                  </>
                )}
              </Button>
            </div>

            {showBreakdown && (
              <div className="mt-6">
                <DailyBreakdownTable dailyBreakdown={result.dailyBreakdown} />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
