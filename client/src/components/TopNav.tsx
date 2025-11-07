import { Moon, Sun, Globe } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 bg-card/95 border-b border-border/50 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={theme === 'dark' ? logoDark : logoLight} 
            alt="Mutual Logo" 
            className="h-10 w-auto transition-opacity duration-300" 
            data-testid="logo-image" 
          />
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
