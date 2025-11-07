import { DailyEarning } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DailyBreakdownTableProps {
  dailyBreakdown: DailyEarning[];
}

export function DailyBreakdownTable({ dailyBreakdown }: DailyBreakdownTableProps) {
  const { t } = useLanguage();

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card className="p-0 overflow-hidden" data-testid="card-daily-breakdown">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[80px]">{t.day}</TableHead>
              <TableHead className="w-[80px]">{t.task}</TableHead>
              <TableHead className="text-right">{t.dailyProfit}</TableHead>
              <TableHead className="text-right">{t.unlock} %</TableHead>
              <TableHead className="text-right">{t.claimable}</TableHead>
              <TableHead className="text-right">{t.locked}</TableHead>
              <TableHead className="text-right">{t.cumulative}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyBreakdown.map((day, index) => (
              <TableRow key={index} data-testid={`row-day-${day.day}`}>
                <TableCell className="font-medium">{day.day}</TableCell>
                <TableCell>{day.taskNumber}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(day.dailyProfit)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {day.unlockPercentage}%
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(day.claimable)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-orange-600 dark:text-orange-400">
                  {formatCurrency(day.locked)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {formatCurrency(day.cumulativeProfit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
