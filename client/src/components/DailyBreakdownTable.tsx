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
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden" data-testid="mobile-daily-breakdown">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 p-4">
            {dailyBreakdown.map((day, index) => (
              <Card 
                key={index} 
                className="p-4 space-y-2"
                data-testid={`card-day-${day.day}`}
              >
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-semibold text-base">
                    {t.day} {day.day}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t.task} {day.taskNumber}
                  </span>
                </div>
                
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.dailyProfit}:</span>
                    <span className="font-mono font-medium">{formatCurrency(day.dailyProfit)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.unlock}:</span>
                    <span className="font-mono">{day.unlockPercentage}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.claimable}:</span>
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {formatCurrency(day.claimable)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.locked}:</span>
                    <span className="font-mono text-orange-600 dark:text-orange-400">
                      {formatCurrency(day.locked)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-1.5 border-t">
                    <span className="font-medium">{t.cumulative}:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(day.cumulativeProfit)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block p-0 overflow-hidden" data-testid="card-daily-breakdown">
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
    </>
  );
}
