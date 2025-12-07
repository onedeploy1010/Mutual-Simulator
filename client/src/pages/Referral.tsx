import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { referralInputSchema, type ReferralInput, type ReferralReward } from '@shared/schema';
import { calculateReferralRewards } from '@/lib/calculations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MetricCard } from '@/components/MetricCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, TrendingUp, Calculator } from 'lucide-react';

export default function Referral() {
  const { t } = useLanguage();
  const [result, setResult] = useState<ReferralReward | null>(null);
  const [showResults, setShowResults] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<ReferralInput>({
    resolver: zodResolver(referralInputSchema),
    defaultValues: {
      downlineRwaCount: 1,
      secondLevelRwaCount: 0,
      dailyRate: 1.25,
    },
  });

  const dailyRate = form.watch('dailyRate');

  const onSubmit = (data: ReferralInput) => {
    const calculatedResult = calculateReferralRewards(data);
    setResult(calculatedResult);
    setShowResults(true);
  };

  const handleReset = () => {
    form.reset();
    setResult(null);
    setShowResults(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const ResultsContent = result && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={UserPlus}
          label={`${t.directReward} - ${t.daily}`}
          value={formatCurrency(result.directDailyReward)}
          subtitle={`${formatCurrency(result.directMonthlyReward)} ${t.monthly.toLowerCase()}`}
          testId="metric-direct-reward"
          large
        />
        <MetricCard
          icon={Users}
          label={`${t.indirectReward} - ${t.daily}`}
          value={formatCurrency(result.indirectDailyReward)}
          subtitle={`${formatCurrency(result.indirectMonthlyReward)} ${t.monthly.toLowerCase()}`}
          testId="metric-indirect-reward"
          large
        />
        <MetricCard
          icon={TrendingUp}
          label={`${t.totalReward} - ${t.daily}`}
          value={formatCurrency(result.totalDailyReward)}
          subtitle={`${formatCurrency(result.totalMonthlyReward)} ${t.monthly.toLowerCase()}`}
          testId="metric-total-referral-reward"
          large
          highlight
        />
      </div>

      <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20 card-luxury">
        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-foreground">{t.rewardSummary}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-card rounded-md">
                <span className="text-sm text-muted-foreground">{t.directReward} (20%)</span>
                <span className="font-mono font-semibold">{formatCurrency(result.directDailyReward)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-card rounded-md">
                <span className="text-sm text-muted-foreground">{t.indirectReward} (10%)</span>
                <span className="font-mono font-semibold">{formatCurrency(result.indirectDailyReward)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center p-4 bg-card rounded-md">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.monthly} {t.totalReward}</p>
                  <p className="text-xl xl:text-2xl font-bold font-mono text-primary">
                    {formatCurrency(result.totalMonthlyReward)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-gradient-to-br from-chart-1/10 to-chart-2/10 rounded-md border border-chart-1/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">180 {t.days} {t.totalReward}</p>
                  <p className="text-xl xl:text-2xl font-bold font-mono text-chart-1" data-testid="value-180-day-referral">
                    {formatCurrency(result.total180DayReward)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleCloseResults}
        data-testid="button-close-results"
      >
        {t.backToForm}
      </Button>
    </div>
  );

  const FormSection = (
    <Card className="p-4 md:p-6 xl:p-8 card-luxury glass-card">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          {/* Rate Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/15 dark:to-blue-500/15 rounded-xl border-2 border-cyan-500/30"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              <span className="text-base font-semibold text-cyan-700 dark:text-cyan-300">{t.dailyReturnRateReferral}</span>
            </div>
            <div className="text-center mb-3">
              <span className="font-mono text-3xl font-bold text-cyan-600 dark:text-cyan-400">{dailyRate?.toFixed(2)}%</span>
            </div>
            <Slider
              min={1.0}
              max={1.5}
              step={0.1}
              value={[dailyRate || 1.25]}
              onValueChange={([value]) => form.setValue('dailyRate', value)}
              data-testid="slider-daily-rate"
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>1.0%</span>
              <span>1.5%</span>
            </div>
            <p className="text-xs text-cyan-600/80 dark:text-cyan-400/80 mt-3 text-center">
              {t.rateAppliesBothLevels}
            </p>
          </motion.div>

          {/* Level 1 - Direct Reward */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/15 dark:to-blue-500/15 rounded-xl border-2 border-cyan-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-cyan-500" />
              <h3 className="text-base font-semibold text-cyan-700 dark:text-cyan-300">
                Level 1 - {t.directReward}
              </h3>
              <span className="ml-auto text-xs font-mono bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full">20%</span>
            </div>

            <div>
              <Label htmlFor="downlineRwaCount" className="text-sm font-medium mb-2 block text-cyan-700/80 dark:text-cyan-300/80">
                {t.downlineInvestment}
              </Label>
              <Input
                id="downlineRwaCount"
                type="number"
                step="1"
                min="1"
                {...form.register('downlineRwaCount', { valueAsNumber: true })}
                data-testid="input-downline-rwa"
                className="font-mono h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 RWA = $100 USD
              </p>
            </div>
          </motion.div>

          {/* Level 2 - Indirect Reward */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-indigo-500/15 rounded-xl border-2 border-blue-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-blue-700 dark:text-blue-300">
                Level 2 - {t.indirectReward}
              </h3>
              <span className="text-xs text-blue-600/70 dark:text-blue-400/70">(Optional)</span>
              <span className="ml-auto text-xs font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">10%</span>
            </div>

            <div>
              <Label htmlFor="secondLevelRwaCount" className="text-sm font-medium mb-2 block text-blue-700/80 dark:text-blue-300/80">
                {t.secondLevelInvestment}
              </Label>
              <Input
                id="secondLevelRwaCount"
                type="number"
                step="1"
                min="0"
                {...form.register('secondLevelRwaCount', { valueAsNumber: true })}
                data-testid="input-second-level-rwa"
                className="font-mono h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 RWA = $100 USD
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" size="lg" className="flex-1 h-12 xl:h-14 text-base xl:text-lg" data-testid="button-calculate-referral">
            <Calculator className="w-5 h-5 mr-2" />
            {t.calculate}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={handleReset} data-testid="button-reset-referral">
            {t.reset}
          </Button>
        </div>
      </form>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="section-header text-foreground flex items-center gap-3">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
            {t.referralRewards}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 ml-5">
            {t.referralDesc}
          </p>
        </div>

        {!showResults ? (
          FormSection
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {ResultsContent}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="mb-6 md:mb-8">
        <h2 className="section-header text-foreground flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
          {t.referralRewards}
        </h2>
        <p className="text-base xl:text-lg text-muted-foreground mt-2 ml-5">
          {t.referralDesc}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {FormSection}
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6"
          >
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-chart-1 rounded-full"></div>
                {t.resultsSummary}
              </DialogTitle>
            </DialogHeader>
            {ResultsContent}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
