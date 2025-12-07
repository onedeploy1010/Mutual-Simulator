import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { investmentInputSchema, type InvestmentInput, type InvestmentResult, ProductType } from '@shared/schema';
import { calculateInvestment } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvestment } from '@/contexts/InvestmentContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MetricCard } from '@/components/MetricCard';
import { StreamingReleaseChart } from '@/components/StreamingReleaseChart';
import { ProfitProgressionChart } from '@/components/ProfitProgressionChart';
import { MobileWizard } from '@/components/MobileWizard';
import { DollarSign, TrendingUp, Calendar, Zap, PiggyBank, ListOrdered, ChevronRight } from 'lucide-react';

export default function Investment() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { setInvestmentData } = useInvestment();
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [currentFormValues, setCurrentFormValues] = useState<InvestmentInput | null>(null);
  const isMobile = useIsMobile();

  const form = useForm<InvestmentInput>({
    resolver: zodResolver(investmentInputSchema),
    defaultValues: {
      rwaCount: 1,
      productType: ProductType.SHORT,
      duration: 8,
      dailyRate: 1.25,
      streamingRate: 0.75,
    },
  });

  const productType = form.watch('productType');
  const dailyRate = form.watch('dailyRate');
  const rwaCount = form.watch('rwaCount');

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

  const ProductTypeStep = (
    <div className="space-y-6">
      <Label className="text-base md:text-lg font-semibold block text-center mb-4">{t.productType}</Label>
      <div className="grid grid-cols-1 gap-4">
        <Button
          type="button"
          variant={productType === ProductType.SHORT ? 'default' : 'outline'}
          className="w-full h-auto py-3 text-lg"
          onClick={() => {
            form.setValue('productType', ProductType.SHORT);
            setResult(null);
          }}
          data-testid="button-product-short"
        >
          <div className="flex flex-col items-center">
            <span className="font-semibold">{t.shortTerm}</span>
            <span className="text-xs opacity-80">{t.shortTermDesc}</span>
          </div>
        </Button>
        <Button
          type="button"
          variant={productType === ProductType.LONG ? 'default' : 'outline'}
          className="w-full h-auto py-3 text-lg"
          onClick={() => {
            form.setValue('productType', ProductType.LONG);
            setResult(null);
          }}
          data-testid="button-product-long"
        >
          <div className="flex flex-col items-center">
            <span className="font-semibold">{t.longTerm}</span>
            <span className="text-xs opacity-80">{t.longTermDesc}</span>
          </div>
        </Button>
      </div>
    </div>
  );

  const AmountStep = (
    <div className="space-y-6">
      <div>
        <Label htmlFor="rwaCount" className="text-base md:text-lg font-semibold mb-4 block text-center">
          {t.investmentAmount}
        </Label>
        <div className="relative">
          <Input
            id="rwaCount"
            type="number"
            step="1"
            min="1"
            {...form.register('rwaCount', { valueAsNumber: true })}
            data-testid="input-rwaCount"
            className="font-mono text-2xl h-16 text-center"
          />
        </div>
        {form.formState.errors.rwaCount && (
          <p className="text-sm text-destructive mt-2 text-center">
            {form.formState.errors.rwaCount.message}
          </p>
        )}
        <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">1 RWA = $100 USD</p>
          <p className="text-xl font-bold font-mono text-primary mt-1">
            = ${(rwaCount || 1) * 100}
          </p>
        </div>
      </div>
    </div>
  );

  const RateStep = (
    <div className="space-y-6">
      {productType === ProductType.SHORT ? (
        <div>
          <Label className="text-base md:text-lg font-semibold mb-4 block text-center">
            {t.duration}
          </Label>
          <div className="text-center mb-4">
            <span className="metric-value-lg text-primary">{form.watch('duration') || 8}</span>
            <span className="text-lg ml-2">{t.days}</span>
          </div>
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
                className="mt-4"
              />
            )}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-3">
            <span>5 {t.days}</span>
            <span>10 {t.days}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Label className="text-base md:text-lg font-semibold mb-4 block text-center">
              {t.dailyReturnRate}
            </Label>
            <div className="text-center mb-4">
              <span className="metric-value-lg text-primary">{dailyRate?.toFixed(2)}%</span>
            </div>
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
                />
              )}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1.0%</span>
              <span>1.5%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center p-3 bg-primary/10 rounded-lg">
              {t.streamingFormula}: 0.5%-1% × 40% = 0.2%-0.4% {t.daily}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const mobileSteps = [
    { id: 'product', title: t.productType, content: ProductTypeStep },
    { id: 'amount', title: t.investmentAmount, content: AmountStep },
    { id: 'rate', title: productType === ProductType.SHORT ? t.duration : t.dailyReturnRate, content: RateStep },
  ];

  const ResultsSection = result && (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={DollarSign}
          label={t.dailyReturn}
          value={formatCurrency(result.dailyReturn)}
          testId="metric-daily-return"
          large
        />
        {productType === ProductType.LONG && (
          <MetricCard
            icon={Calendar}
            label={t.monthlyReturn}
            value={formatCurrency(result.monthlyReturn)}
            testId="metric-monthly-return"
            large
          />
        )}
        <MetricCard
          icon={TrendingUp}
          label={t.totalReturn}
          value={formatCurrency(result.totalReturn)}
          testId="metric-total-return"
          large
        />
        <MetricCard
          icon={Zap}
          label={t.streamingBonus}
          value={formatCurrency(result.totalStreamingBonus)}
          subtitle={`${formatCurrency(result.dailyStreamingBonus)} ${t.daily.toLowerCase()}`}
          testId="metric-streaming-bonus"
          large
        />
        <MetricCard
          icon={PiggyBank}
          label={t.totalWithCapital}
          value={formatCurrency(result.totalWithCapital)}
          testId="metric-total-with-capital"
          large
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 card-luxury glass-card">
          <ProfitProgressionChart dailyBreakdown={result.dailyBreakdown} />
        </Card>
        <Card className="p-4 md:p-6 card-luxury glass-card">
          <StreamingReleaseChart dailyBreakdown={result.dailyBreakdown} />
        </Card>
      </div>

      <Card className="p-4 md:p-6 bg-muted/30 border-primary/20">
        <p className="text-sm md:text-base text-muted-foreground">
          <span className="font-semibold text-foreground">{t.streamingBonusNote}:</span>{' '}
          {productType === ProductType.SHORT ? t.streamingBonusShortTermNote : t.streamingBonusLongTermNote}
        </p>
      </Card>

      {result.dailyBreakdown.length > 0 && (
        <Button
          variant="default"
          size="lg"
          className="w-full h-14 text-lg"
          onClick={handleViewDetailedBreakdown}
          data-testid="button-view-detailed-breakdown"
        >
          <ListOrdered className="w-5 h-5 mr-2" />
          {t.viewDetailedBreakdown}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="section-header text-foreground flex items-center justify-center gap-2">
            <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-chart-1 rounded-full"></div>
            {t.investmentCalculator}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {productType === ProductType.SHORT ? t.shortTermDesc : t.longTermDesc}
          </p>
        </div>

        {!result ? (
          <MobileWizard
            steps={mobileSteps}
            onComplete={() => form.handleSubmit(onSubmit)()}
            isValid={form.formState.isValid || true}
          />
        ) : (
          <>
            {ResultsSection}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleReset}
              data-testid="button-reset"
            >
              {t.reset}
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="section-header text-foreground flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-chart-1 rounded-full"></div>
          {t.investmentCalculator}
        </h2>
        <p className="text-base text-muted-foreground mt-2 ml-5">
          {productType === ProductType.SHORT ? t.shortTermDesc : t.longTermDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 card-luxury glass-card lg:col-span-1">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">{t.productType}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={productType === ProductType.SHORT ? 'default' : 'outline'}
                    className="w-full h-12"
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
                    className="w-full h-12"
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
                <Label htmlFor="rwaCount" className="text-base font-semibold mb-3 block">
                  {t.investmentAmount}
                </Label>
                <Input
                  id="rwaCount"
                  type="number"
                  step="1"
                  min="1"
                  {...form.register('rwaCount', { valueAsNumber: true })}
                  data-testid="input-rwaCount"
                  className="font-mono text-xl h-14"
                />
                {form.formState.errors.rwaCount && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.rwaCount.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  1 RWA = $100 USD = <span className="font-mono font-semibold text-primary">${(rwaCount || 1) * 100}</span>
                </p>
              </div>

              {productType === ProductType.SHORT && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    {t.duration}: <span className="font-mono text-primary text-xl">{form.watch('duration') || 8} {t.days}</span>
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
                        className="mt-4"
                      />
                    )}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>5 {t.days}</span>
                    <span>10 {t.days}</span>
                  </div>
                </div>
              )}

              {productType === ProductType.LONG && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    {t.dailyReturnRate}: <span className="font-mono text-primary text-xl">{dailyRate?.toFixed(2)}%</span>
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
                        className="mt-3"
                      />
                    )}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>1.0%</span>
                    <span>1.5%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 p-3 bg-primary/10 rounded-lg">
                    {t.streamingFormula}: 0.5%-1% × 40% = 0.2%-0.4% {t.daily}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" size="lg" className="flex-1 h-14 text-lg" data-testid="button-calculate">
                {t.calculate}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={handleReset} data-testid="button-reset">
                {t.reset}
              </Button>
            </div>
          </form>
        </Card>

        <div className="lg:col-span-2">
          {result ? (
            ResultsSection
          ) : (
            <Card className="p-12 card-luxury glass-card flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t.calculate} {t.investment.toLowerCase()}</p>
                <p className="text-sm mt-2">{t.shortTermDesc}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
