import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyEarning } from '@shared/schema';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProfitProgressionChartProps {
  dailyBreakdown: DailyEarning[];
}

export function ProfitProgressionChart({ dailyBreakdown }: ProfitProgressionChartProps) {
  const { t } = useLanguage();

  const data = dailyBreakdown.slice(0, 100).map(day => ({
    day: day.day,
    cumulative: parseFloat(day.cumulativeProfit.toFixed(2)),
    daily: parseFloat(day.dailyProfit.toFixed(2)),
  }));

  return (
    <Card className="p-6" data-testid="card-profit-progression">
      <h3 className="text-lg font-semibold mb-4">{t.profitProgression}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="day" 
            label={{ value: t.day, position: 'insideBottom', offset: -5 }}
            className="text-sm"
          />
          <YAxis 
            label={{ value: 'USD ($)', angle: -90, position: 'insideLeft' }}
            className="text-sm"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name={t.cumulative}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="daily" 
            stroke="hsl(var(--chart-3))" 
            strokeWidth={2}
            name={t.daily}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
