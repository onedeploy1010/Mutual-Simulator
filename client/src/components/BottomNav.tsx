import { useLocation, Link } from 'wouter';
import { Calculator, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { path: '/', icon: Calculator, label: t.investment, testId: 'tab-investment' },
    { path: '/referral', icon: Users, label: t.referral, testId: 'tab-referral' },
    { path: '/team', icon: Trophy, label: t.team, testId: 'tab-team' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Link key={tab.path} href={tab.path}>
              <div
                data-testid={tab.testId}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors min-w-[80px] hover-elevate active-elevate-2 cursor-pointer ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
