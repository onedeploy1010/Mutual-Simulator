import { Moon, Sun, Globe, Calculator, Users, Trophy } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import logoDark from '@assets/image_1762536371479.png';
import logoLight from '@assets/image_1762536980372.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: Calculator, label: t.investment, testId: 'nav-investment' },
    { path: '/referral', icon: Users, label: t.referral, testId: 'nav-referral' },
    { path: '/team', icon: Trophy, label: t.team, testId: 'nav-team' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-card-border backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <img 
            src={theme === 'dark' ? logoDark : logoLight} 
            alt="Mutual Logo" 
            className="h-10 w-auto transition-opacity duration-300" 
            data-testid="logo-image" 
          />
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                    data-testid={item.testId}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-language-toggle"
              >
                <Globe className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                data-testid="menu-item-english"
                className={language === 'en' ? 'bg-accent' : ''}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('zh')}
                data-testid="menu-item-chinese"
                className={language === 'zh' ? 'bg-accent' : ''}
              >
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
