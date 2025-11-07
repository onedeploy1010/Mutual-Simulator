import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { streamingReleaseSchedule } from '@shared/schema';
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

export function StreamingReleaseChart() {
  const { t } = useLanguage();

  const data = streamingReleaseSchedule.map(node => ({
    tasks: node.taskCount,
    claimable: node.claimablePercent,
    locked: node.lockedPercent,
    description: node.description,
  }));

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
            label={{ value: '%', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip 
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
