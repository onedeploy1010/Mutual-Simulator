import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  testId?: string;
}

export function MetricCard({ icon: Icon, label, value, subtitle, testId }: MetricCardProps) {
  return (
    <Card className="p-6" data-testid={testId}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold font-mono text-foreground" data-testid={`${testId}-value`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
