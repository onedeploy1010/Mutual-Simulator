import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { TierBadge } from '@/components/TierBadge';
import { ChevronDown, Users, Crown } from 'lucide-react';
import type { TeamTier } from '@shared/schema';

interface TierNode {
  id: string;
  tier: string;
  label: string;
  labelZh: string;
  requirement: string;
  requirementZh: string;
  children?: TierNode[];
  level: number;
}

const tierStructure: TierNode = {
  id: 'supreme',
  tier: 'Supreme',
  label: 'Supreme',
  labelZh: '至尊',
  requirement: '2× 3★ Ambassador',
  requirementZh: '2个3星大使',
  level: 0,
  children: [
    {
      id: 'amb3-1',
      tier: '3-Star Ambassador',
      label: '3★ Ambassador',
      labelZh: '3星大使',
      requirement: '2× 2★ Ambassador',
      requirementZh: '2个2星大使',
      level: 1,
      children: [
        {
          id: 'amb2-1',
          tier: '2-Star Ambassador',
          label: '2★ Ambassador',
          labelZh: '2星大使',
          requirement: '2× 1★ Ambassador',
          requirementZh: '2个1星大使',
          level: 2,
          children: [
            {
              id: 'amb1-1',
              tier: '1-Star Ambassador',
              label: '1★ Ambassador',
              labelZh: '1星大使',
              requirement: '2× 3★ Expert',
              requirementZh: '2个3星达人',
              level: 3,
              children: [
                {
                  id: 'exp3-1',
                  tier: '3-Star Expert',
                  label: '3★ Expert',
                  labelZh: '3星达人',
                  requirement: '2× 2★ Expert',
                  requirementZh: '2个2星达人',
                  level: 4,
                  children: [
                    {
                      id: 'exp2-1',
                      tier: '2-Star Expert',
                      label: '2★ Expert',
                      labelZh: '2星达人',
                      requirement: '2× 1★ Expert',
                      requirementZh: '2个1星达人',
                      level: 5,
                      children: [
                        {
                          id: 'exp1-1',
                          tier: '1-Star Expert',
                          label: '1★ Expert',
                          labelZh: '1星达人',
                          requirement: '2× VIP',
                          requirementZh: '2个VIP',
                          level: 6,
                          children: [
                            { id: 'vip-1', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                            { id: 'vip-2', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                          ]
                        },
                        {
                          id: 'exp1-2',
                          tier: '1-Star Expert',
                          label: '1★ Expert',
                          labelZh: '1星达人',
                          requirement: '2× VIP',
                          requirementZh: '2个VIP',
                          level: 6,
                          children: [
                            { id: 'vip-3', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                            { id: 'vip-4', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                          ]
                        },
                      ]
                    },
                    {
                      id: 'exp2-2',
                      tier: '2-Star Expert',
                      label: '2★ Expert',
                      labelZh: '2星达人',
                      requirement: '2× 1★ Expert',
                      requirementZh: '2个1星达人',
                      level: 5,
                      children: [
                        {
                          id: 'exp1-3',
                          tier: '1-Star Expert',
                          label: '1★ Expert',
                          labelZh: '1星达人',
                          requirement: '2× VIP',
                          requirementZh: '2个VIP',
                          level: 6,
                          children: [
                            { id: 'vip-5', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                            { id: 'vip-6', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                          ]
                        },
                        {
                          id: 'exp1-4',
                          tier: '1-Star Expert',
                          label: '1★ Expert',
                          labelZh: '1星达人',
                          requirement: '2× VIP',
                          requirementZh: '2个VIP',
                          level: 6,
                          children: [
                            { id: 'vip-7', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                            { id: 'vip-8', tier: 'VIP', label: 'VIP', labelZh: 'VIP', requirement: '', requirementZh: '', level: 7 },
                          ]
                        },
                      ]
                    },
                  ]
                },
                {
                  id: 'exp3-2',
                  tier: '3-Star Expert',
                  label: '3★ Expert',
                  labelZh: '3星达人',
                  requirement: '2× 2★ Expert',
                  requirementZh: '2个2星达人',
                  level: 4,
                }
              ]
            },
            {
              id: 'amb1-2',
              tier: '1-Star Ambassador',
              label: '1★ Ambassador',
              labelZh: '1星大使',
              requirement: '2× 3★ Expert',
              requirementZh: '2个3星达人',
              level: 3,
            }
          ]
        },
        {
          id: 'amb2-2',
          tier: '2-Star Ambassador',
          label: '2★ Ambassador',
          labelZh: '2星大使',
          requirement: '2× 1★ Ambassador',
          requirementZh: '2个1星大使',
          level: 2,
        }
      ]
    },
    {
      id: 'amb3-2',
      tier: '3-Star Ambassador',
      label: '3★ Ambassador',
      labelZh: '3星大使',
      requirement: '2× 2★ Ambassador',
      requirementZh: '2个2星大使',
      level: 1,
    }
  ]
};

const tierOrder = [
  'VIP',
  '1-Star Expert',
  '2-Star Expert', 
  '3-Star Expert',
  '1-Star Ambassador',
  '2-Star Ambassador',
  '3-Star Ambassador',
  'Supreme'
];

interface TeamTierVisualizationProps {
  currentTier?: string;
  animated?: boolean;
}

export function TeamTierVisualization({ currentTier = 'VIP', animated = true }: TeamTierVisualizationProps) {
  const { t, language } = useLanguage();
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [expandedLevel, setExpandedLevel] = useState(0);
  
  const currentTierIndex = tierOrder.indexOf(currentTier);

  useEffect(() => {
    if (!animated) {
      const allNodes = new Set<string>();
      const collectNodes = (node: TierNode) => {
        allNodes.add(node.id);
        node.children?.forEach(collectNodes);
      };
      collectNodes(tierStructure);
      setVisibleNodes(allNodes);
      setExpandedLevel(8);
      return;
    }

    const animateNodes = async () => {
      const delays = [0, 200, 400, 600, 800, 1000, 1200, 1400];
      
      for (let level = 0; level <= 7; level++) {
        await new Promise(resolve => setTimeout(resolve, delays[level] || 200));
        setExpandedLevel(level + 1);
        
        const nodesAtLevel = new Set(visibleNodes);
        const addNodesAtLevel = (node: TierNode) => {
          if (node.level <= level) {
            nodesAtLevel.add(node.id);
          }
          node.children?.forEach(addNodesAtLevel);
        };
        addNodesAtLevel(tierStructure);
        setVisibleNodes(nodesAtLevel);
      }
    };

    animateNodes();
  }, [animated]);

  const getTierColor = (tier: string): string => {
    const tierIdx = tierOrder.indexOf(tier);
    if (tierIdx < currentTierIndex) return 'opacity-40';
    if (tierIdx === currentTierIndex) return 'ring-2 ring-primary ring-offset-2 ring-offset-background';
    return '';
  };

  const isNodeVisible = (nodeId: string, level: number) => {
    return expandedLevel > level;
  };

  const renderCompactNode = (node: TierNode, isLeft: boolean = true) => {
    const visible = isNodeVisible(node.id, node.level);
    const tierIdx = tierOrder.indexOf(node.tier);
    const isActive = tierIdx <= currentTierIndex;
    const isCurrent = tierIdx === currentTierIndex;
    
    return (
      <div 
        key={node.id}
        className={`
          flex flex-col items-center transition-all duration-500 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
        data-testid={`tier-node-${node.id}`}
      >
        <div 
          className={`
            relative p-2 md:p-3 rounded-lg border transition-all duration-300
            ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border/50'}
            ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-105' : ''}
            ${!isActive ? 'opacity-50' : ''}
          `}
        >
          {node.tier === 'Supreme' && (
            <Crown className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500" />
          )}
          <div className="flex items-center gap-1.5">
            <Users className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs md:text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {language === 'zh' ? node.labelZh : node.label}
            </span>
          </div>
          {node.requirement && (
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 text-center">
              {language === 'zh' ? node.requirementZh : node.requirement}
            </p>
          )}
        </div>

        {node.children && node.children.length > 0 && visible && (
          <>
            <div className="w-px h-3 md:h-4 bg-border/50" />
            <ChevronDown className="w-3 h-3 text-muted-foreground -my-1" />
            <div className="w-px h-2 md:h-3 bg-border/50" />
            
            <div className="flex gap-2 md:gap-4">
              {node.children.map((child, idx) => (
                <div key={child.id} className="flex flex-col items-center">
                  {node.children!.length > 1 && (
                    <div className="flex items-center mb-1">
                      <div className={`h-px w-4 md:w-8 ${idx === 0 ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-transparent to-border/50`} />
                    </div>
                  )}
                  {renderCompactNode(child, idx === 0)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSimplifiedView = () => {
    return (
      <div className="flex flex-col items-center gap-2 py-4" data-testid="tier-visualization-simple">
        {[...tierOrder].reverse().map((tier, idx) => {
          const tierIdx = tierOrder.indexOf(tier);
          const isActive = tierIdx <= currentTierIndex;
          const isCurrent = tierIdx === currentTierIndex;
          const requirement = getRequirementForTier(tier);
          
          return (
            <div 
              key={tier}
              className={`
                w-full max-w-xs transition-all duration-300 delay-${idx * 100}
                ${animated && expandedLevel <= idx ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
              `}
            >
              {idx > 0 && (
                <div className="flex justify-center mb-2">
                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-180" />
                </div>
              )}
              <div 
                className={`
                  p-3 rounded-lg border text-center transition-all
                  ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border/50'}
                  ${isCurrent ? 'ring-2 ring-primary shadow-lg' : ''}
                  ${!isActive ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {tier === 'Supreme' && <Crown className="w-4 h-4 text-yellow-500" />}
                  <TierBadge tier={tier as TeamTier} />
                </div>
                {requirement && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'zh' ? requirement.zh : requirement.en}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getRequirementForTier = (tier: string): { en: string; zh: string } | null => {
    const requirements: Record<string, { en: string; zh: string }> = {
      'VIP': { en: '', zh: '' },
      '1-Star Expert': { en: '2× VIP (different lines)', zh: '2个VIP（不同组织线）' },
      '2-Star Expert': { en: '2× 1★ Expert', zh: '2个1星达人' },
      '3-Star Expert': { en: '2× 2★ Expert', zh: '2个2星达人' },
      '1-Star Ambassador': { en: '2× 3★ Expert', zh: '2个3星达人' },
      '2-Star Ambassador': { en: '2× 1★ Ambassador', zh: '2个1星大使' },
      '3-Star Ambassador': { en: '2× 2★ Ambassador', zh: '2个2星大使' },
      'Supreme': { en: '2× 3★ Ambassador', zh: '2个3星大使' },
    };
    return requirements[tier] || null;
  };

  return (
    <Card className="p-4 md:p-6 card-luxury overflow-hidden" data-testid="team-tier-visualization">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-base md:text-lg font-semibold">{t.tierStructure || 'Tier Structure'}</h3>
      </div>
      
      <p className="text-xs md:text-sm text-muted-foreground mb-4">
        {language === 'zh' 
          ? '每个层级需要2个下级社区（不同组织线）' 
          : 'Each tier requires 2 downline communities (different organization lines)'}
      </p>

      <div className="block md:hidden">
        {renderSimplifiedView()}
      </div>
      
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="min-w-[600px] flex justify-center">
          {renderCompactNode(tierStructure)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4 justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/10 border border-primary/30" />
            <span className="text-muted-foreground">{t.achieved || 'Achieved'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded ring-2 ring-primary bg-primary/20" />
            <span className="text-muted-foreground">{t.currentLevel || 'Current'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted/30 border border-border/50 opacity-50" />
            <span className="text-muted-foreground">{t.locked || 'Locked'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
