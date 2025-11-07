import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DailyEarning } from '@shared/schema';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StreamingReleaseChartProps {
  dailyBreakdown: DailyEarning[];
}

export function StreamingReleaseChart({ dailyBreakdown }: StreamingReleaseChartProps) {
  const { t } = useLanguage();

  // Calculate streaming release data from daily breakdown
  const data = [];
  
  // Find unlock task milestones (20, 40, 60, 80, 100)
  const unlockTasks = [20, 40, 60, 80, 100];
  
  if (dailyBreakdown && dailyBreakdown.length > 0) {
    for (const taskCount of unlockTasks) {
      const dayData = dailyBreakdown.find(d => d.taskNumber === taskCount);
      if (dayData) {
        data.push({
          tasks: taskCount,
          claimable: Number(dayData.claimable.toFixed(2)),
          locked: Number(dayData.locked.toFixed(2)),
        });
      }
    }
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <Card className="p-6" data-testid="card-release-schedule">
      <h3 className="text-lg font-semibold mb-4">{t.releaseSchedule}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="tasks" 
            label={{ value: t.tasks, position: 'insideBottom', offset: -5 }}
            className="text-sm"
          />
          <YAxis 
            label={{ value: 'USD ($)', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip 
            formatter={formatCurrency}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
          <Bar dataKey="claimable" stackId="a" fill="hsl(var(--chart-2))" name={t.claimable} />
          <Bar dataKey="locked" stackId="a" fill="hsl(var(--chart-4))" name={t.locked} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
