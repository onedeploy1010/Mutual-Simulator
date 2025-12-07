import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { investmentInputSchema, type InvestmentInput, type InvestmentResult, ProductType } from '@shared/schema';
import { calculateInvestment } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvestment } from '@/contexts/InvestmentContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MetricCard } from '@/components/MetricCard';
import { StreamingReleaseChart } from '@/components/StreamingReleaseChart';
import { ProfitProgressionChart } from '@/components/ProfitProgressionChart';
import { DollarSign, TrendingUp, Calendar, Zap, PiggyBank, ListOrdered } from 'lucide-react';

export default function Investment() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { setInvestmentData } = useInvestment();
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [currentFormValues, setCurrentFormValues] = useState<InvestmentInput | null>(null);

  const form = useForm<InvestmentInput>({
    resolver: zodResolver(investmentInputSchema),
    defaultValues: {
      rwaCount: 1,
      productType: ProductType.SHORT,
      duration: 8, // Default to average (5+10)/2 = 7.5 → 8
      dailyRate: 1.25, // Default to average (1.0+1.5)/2 = 1.25
      streamingRate: 0.75, // Default to average (0.5+1.0)/2 = 0.75
    },
  });

  const productType = form.watch('productType');
  const dailyRate = form.watch('dailyRate');
  const streamingRate = form.watch('streamingRate');

  const onSubmit = (data: InvestmentInput) => {
    const calculatedResult = calculateInvestment(data);
    setResult(calculatedResult);
    setCurrentFormValues(data);
  };

  const handleViewDetailedBreakdown = () => {
    if (!result || !currentFormValues) return;
    
    setInvestmentData(result, currentFormValues);
    navigate('/daily-breakdown');
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-chart-1 rounded-full"></div>
          {t.investmentCalculator}
        </h2>
        <p className="text-sm text-muted-foreground ml-3">
          {productType === ProductType.SHORT ? t.shortTermDesc : t.longTermDesc}
        </p>
      </div>

      <Card className="p-6 card-premium shadow-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">{t.productType}</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={productType === ProductType.SHORT ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    form.setValue('productType', ProductType.SHORT);
                    setResult(null);
                  }}
                  data-testid="button-product-short"
                >
                  {t.shortTerm}
                </Button>
                <Button
                  type="button"
                  variant={productType === ProductType.LONG ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    form.setValue('productType', ProductType.LONG);
                    setResult(null);
                  }}
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
                <Label className="text-sm font-medium mb-2 block">
                  {t.duration}: <span className="font-mono text-primary">{form.watch('duration') || 8} {t.days}</span>
                </Label>
                <Controller
                  name="duration"
                  control={form.control}
                  render={({ field }) => (
                    <Slider
                      min={5}
                      max={10}
                      step={1}
                      value={[field.value || 8]}
                      onValueChange={([value]) => field.onChange(value)}
                      data-testid="slider-duration"
                      className="mt-2"
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 {t.days}</span>
                  <span>10 {t.days}</span>
                </div>
              </div>
            )}

            {productType === ProductType.LONG && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t.dailyReturnRate}: <span className="font-mono text-primary">{dailyRate?.toFixed(2)}%</span>
                  </Label>
                  <Controller
                    name="dailyRate"
                    control={form.control}
                    render={({ field }) => (
                      <Slider
                        min={1.0}
                        max={1.5}
                        step={0.05}
                        value={[field.value || 1.25]}
                        onValueChange={([value]) => field.onChange(value)}
                        data-testid="slider-daily-rate"
                        className="mt-2"
                      />
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1.0%</span>
                    <span>1.5%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t.streamingRate}: <span className="font-mono text-primary">{streamingRate?.toFixed(2)}%</span>
                  </Label>
                  <Controller
                    name="streamingRate"
                    control={form.control}
                    render={({ field }) => (
                      <Slider
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        value={[field.value || 0.75]}
                        onValueChange={([value]) => field.onChange(value)}
                        data-testid="slider-streaming-rate"
                        className="mt-2"
                      />
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.5%</span>
                    <span>1.0%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.streamingRateDesc}
                  </p>
                </div>
              </>
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
            {productType === ProductType.LONG && (
              <MetricCard
                icon={Calendar}
                label={t.monthlyReturn}
                value={formatCurrency(result.monthlyReturn)}
                testId="metric-monthly-return"
              />
            )}
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
            <StreamingReleaseChart dailyBreakdown={result.dailyBreakdown} />
          </div>

          <Card className="p-4 bg-muted/30 border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t.streamingBonusNote}:</span>{' '}
              {productType === ProductType.SHORT ? t.streamingBonusShortTermNote : t.streamingBonusLongTermNote}
            </p>
          </Card>

          {result.dailyBreakdown.length > 0 && (
            <Card className="p-6">
              <Button
                variant="default"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleViewDetailedBreakdown}
                data-testid="button-view-detailed-breakdown"
              >
                <ListOrdered className="w-4 h-4" />
                {t.viewDetailedBreakdown}
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
