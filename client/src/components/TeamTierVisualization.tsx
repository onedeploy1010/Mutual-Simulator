import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Users, Crown, ChevronUp } from 'lucide-react';
import type { TeamTier } from '@shared/schema';

interface TierRequirement {
  tier: TeamTier;
  label: string;
  labelZh: string;
  requirement: string;
  requirementZh: string;
  performance: string;
  performanceZh: string;
}

const tierRequirements: TierRequirement[] = [
  { tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '-', requirementZh: '-', performance: '6,000-19,999', performanceZh: '6,000-19,999' },
  { tier: '1-Star Expert', label: '1★ Expert', labelZh: '1星达人', requirement: '2× VIP', requirementZh: '2个VIP', performance: '20,000-59,999', performanceZh: '20,000-59,999' },
  { tier: '2-Star Expert', label: '2★ Expert', labelZh: '2星达人', requirement: '2× 1★', requirementZh: '2个1星', performance: '60,000-199,999', performanceZh: '60,000-199,999' },
  { tier: '3-Star Expert', label: '3★ Expert', labelZh: '3星达人', requirement: '2× 2★', requirementZh: '2个2星', performance: '200,000-599,999', performanceZh: '20万-59万' },
  { tier: '1-Star Ambassador', label: '1★ Amb', labelZh: '1星大使', requirement: '2× 3★E', requirementZh: '2个3星达人', performance: '600,000-1.99M', performanceZh: '60万-199万' },
  { tier: '2-Star Ambassador', label: '2★ Amb', labelZh: '2星大使', requirement: '2× 1★A', requirementZh: '2个1星大使', performance: '2M-5.99M', performanceZh: '200万-599万' },
  { tier: '3-Star Ambassador', label: '3★ Amb', labelZh: '3星大使', requirement: '2× 2★A', requirementZh: '2个2星大使', performance: '6M+', performanceZh: '600万+' },
  { tier: 'Supreme', label: 'Supreme', labelZh: '至尊', requirement: '2× 3★A', requirementZh: '2个3星大使', performance: '6M+', performanceZh: '600万+' },
];

interface TeamTierVisualizationProps {
  currentTier?: string;
}

export function TeamTierVisualization({ currentTier = 'VIP' }: TeamTierVisualizationProps) {
  const { t, language } = useLanguage();
  const [animatedIndex, setAnimatedIndex] = useState(-1);
  
  const currentTierIndex = tierRequirements.findIndex(t => t.tier === currentTier);

  useEffect(() => {
    setAnimatedIndex(-1);
    const timer = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        setAnimatedIndex(idx);
        idx++;
        if (idx > currentTierIndex) {
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentTier, currentTierIndex]);

  const currentTierData = tierRequirements[currentTierIndex];
  const previousTier = currentTierIndex > 0 ? tierRequirements[currentTierIndex - 1] : null;

  return (
    <Card className="p-3 md:p-4 card-luxury overflow-hidden" data-testid="team-tier-visualization">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm md:text-base font-semibold">{t.tierStructure}</h3>
      </div>

      <div className="flex flex-col items-center gap-1 py-2">
        <div 
          className={`
            w-full max-w-[280px] p-2 rounded-lg border-2 text-center transition-all duration-300
            ${currentTierIndex === tierRequirements.length - 1 
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
              : 'bg-primary/10 border-primary/50'}
            ring-2 ring-primary ring-offset-1 ring-offset-background shadow-md
          `}
        >
          <div className="flex items-center justify-center gap-1.5">
            {currentTier === 'Supreme' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
            <span className="text-sm font-bold text-foreground">
              {language === 'zh' ? currentTierData?.labelZh : currentTierData?.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            ${currentTierData?.performance}
          </p>
        </div>

        {currentTierIndex > 0 && (
          <>
            <ChevronUp className="w-4 h-4 text-primary my-0.5" />
            
            <div className="text-[10px] text-center text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {language === 'zh' ? '需要2个不同组织线' : 'Requires 2 different lines'}
            </div>

            <div className="flex items-start gap-4 mt-1">
              {[0, 1].map((lineIdx) => (
                <div 
                  key={lineIdx}
                  className={`
                    flex flex-col items-center transition-all duration-500
                    ${animatedIndex >= currentTierIndex - 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                  `}
                  style={{ transitionDelay: `${lineIdx * 100}ms` }}
                >
                  <div className="w-px h-3 bg-border" />
                  
                  <div 
                    className={`
                      p-1.5 rounded border text-center min-w-[90px]
                      bg-primary/5 border-primary/30
                    `}
                  >
                    <span className="text-xs font-medium text-foreground">
                      {language === 'zh' ? previousTier?.labelZh : previousTier?.label}
                    </span>
                    <p className="text-[9px] text-muted-foreground">
                      ${previousTier?.performance}
                    </p>
                  </div>

                  {currentTierIndex > 1 && (
                    <>
                      <ChevronUp className="w-3 h-3 text-muted-foreground my-0.5" />
                      <div className="text-[9px] text-muted-foreground">...</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-border/50">
        <p className="text-[10px] text-center text-muted-foreground mb-2">
          {language === 'zh' ? '层级晋升要求' : 'Tier Upgrade Requirements'}
        </p>
        <div className="grid grid-cols-4 gap-1 text-[9px]">
          {tierRequirements.slice(0, 4).map((tier, idx) => {
            const isActive = idx <= currentTierIndex;
            const isCurrent = idx === currentTierIndex;
            return (
              <div 
                key={tier.tier}
                className={`
                  p-1 rounded text-center transition-all duration-300
                  ${isActive ? 'bg-primary/10' : 'bg-muted/30 opacity-50'}
                  ${isCurrent ? 'ring-1 ring-primary' : ''}
                  ${animatedIndex >= idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="font-medium truncate">{language === 'zh' ? tier.labelZh : tier.label}</div>
                <div className="text-muted-foreground">{language === 'zh' ? tier.requirementZh : tier.requirement}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-1 text-[9px] mt-1">
          {tierRequirements.slice(4).map((tier, idx) => {
            const realIdx = idx + 4;
            const isActive = realIdx <= currentTierIndex;
            const isCurrent = realIdx === currentTierIndex;
            return (
              <div 
                key={tier.tier}
                className={`
                  p-1 rounded text-center transition-all duration-300
                  ${isActive ? 'bg-primary/10' : 'bg-muted/30 opacity-50'}
                  ${isCurrent ? 'ring-1 ring-primary' : ''}
                  ${tier.tier === 'Supreme' ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''}
                  ${animatedIndex >= realIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                style={{ transitionDelay: `${realIdx * 100}ms` }}
              >
                <div className="font-medium truncate flex items-center justify-center gap-0.5">
                  {tier.tier === 'Supreme' && <Crown className="w-2.5 h-2.5 text-yellow-500" />}
                  {language === 'zh' ? tier.labelZh : tier.label}
                </div>
                <div className="text-muted-foreground">{language === 'zh' ? tier.requirementZh : tier.requirement}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-border/30">
        <div className="flex items-center gap-3 justify-center text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-primary/10 ring-1 ring-primary" />
            <span className="text-muted-foreground">{t.currentLevel}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-primary/10" />
            <span className="text-muted-foreground">{t.achieved}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-muted/30 opacity-50" />
            <span className="text-muted-foreground">{t.locked}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
