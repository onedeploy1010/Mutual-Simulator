import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  testId?: string;
  large?: boolean;
  highlight?: boolean;
}

export function MetricCard({ icon: Icon, label, value, subtitle, testId, large, highlight }: MetricCardProps) {
  return (
    <Card 
      className={`p-4 md:p-6 card-luxury glass-card ${highlight ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`} 
      data-testid={testId}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className={`p-2 md:p-3 rounded-lg ${highlight ? 'bg-primary/20' : 'bg-primary/10'}`}>
          <Icon className={`${large ? 'w-5 h-5 md:w-6 md:h-6' : 'w-5 h-5'} text-primary`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${large ? 'text-sm md:text-base' : 'text-sm'} text-muted-foreground mb-1`}>{label}</p>
          <p 
            className={`${large ? 'text-xl md:text-2xl lg:text-3xl' : 'text-xl md:text-2xl'} font-bold font-mono ${highlight ? 'text-primary' : 'text-foreground'}`} 
            data-testid={`${testId}-value`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
