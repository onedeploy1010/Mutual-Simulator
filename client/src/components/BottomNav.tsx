import { useLocation, Link } from 'wouter';
import { Calculator, Users, Trophy, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { path: '/', icon: Calculator, label: t.investment, testId: 'tab-investment' },
    { path: '/referral', icon: Users, label: t.referral, testId: 'tab-referral' },
    { path: '/team', icon: Trophy, label: t.team, testId: 'tab-team' },
    { path: '/cases', icon: BookOpen, label: t.cases, testId: 'tab-cases' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-card-border md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button
                type="button"
                data-testid={tab.testId}
                className={`flex flex-col items-center justify-center gap-1 px-6 py-2 transition-all duration-200 min-w-[72px] rounded-lg ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
