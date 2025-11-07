import { TeamTier } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Star, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TierBadgeProps {
  tier: TeamTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const { t } = useLanguage();
  
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
  const getTierColor = (tier: TeamTier) => {
    switch (tier) {
      case 'VIP':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '1-Star Expert':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '2-Star Expert':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case '3-Star Expert':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case '1-Star Ambassador':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case '2-Star Ambassador':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case '3-Star Ambassador':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'Supreme':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white dark:from-yellow-500 dark:to-orange-600';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const isSupreme = tier === 'Supreme';

  return (
    <Badge className={`${getTierColor(tier)} ${className} flex items-center gap-1`}>
      {isSupreme ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
      {getTierTranslation(tier)}
    </Badge>
  );
}
