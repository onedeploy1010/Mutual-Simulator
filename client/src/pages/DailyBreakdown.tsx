import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvestment } from '@/contexts/InvestmentContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

type FilterType = 'all' | 'streaming' | 'unlocked' | 'locked';

export default function DailyBreakdown() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { result, input } = useInvestment();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dayRange, setDayRange] = useState<string>('all');

  const dailyBreakdown = result?.dailyBreakdown || [];
  const rwaCount = input?.rwaCount || 0;
  const dailyRate = input?.dailyRate || 0;

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...dailyBreakdown];

    // Filter by type
    if (filterType === 'streaming') {
      filtered = filtered.filter(d => d.streamingBonus > 0);
    } else if (filterType === 'unlocked') {
      filtered = filtered.filter(d => d.claimable > 0);
    } else if (filterType === 'locked') {
      filtered = filtered.filter(d => d.locked > 0);
    }

    // Filter by day range
    if (dayRange !== 'all') {
      const [start, end] = dayRange.split('-').map(Number);
      filtered = filtered.filter(d => d.day >= start && d.day <= end);
    }

    return filtered;
  }, [dailyBreakdown, filterType, dayRange]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (dailyBreakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground">{t.noDataAvailable}</p>
        <Button onClick={() => navigate('/')} variant="outline" data-testid="button-back-to-home">
          <Home className="w-4 h-4 mr-2" />
          {t.backToInvestment}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      {/* Header with breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => navigate('/')}
            className="hover:text-foreground transition-colors" 
            data-testid="link-breadcrumb-home"
          >
            {t.investment}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{t.dailyBreakdownPage}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{t.dailyBreakdownPage}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t.investmentAmount}: {rwaCount} RWA • {t.dailyReturnRate}: {dailyRate}%
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" size="sm" data-testid="button-back" className="w-full md:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-type" className="text-sm font-medium mb-2 block">
              {t.filterByType}
            </Label>
            <Select value={filterType} onValueChange={(value) => {
              setFilterType(value as FilterType);
              setCurrentPage(1);
            }}>
              <SelectTrigger id="filter-type" data-testid="select-filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allDays}</SelectItem>
                <SelectItem value="streaming">{t.streamingBonusDays}</SelectItem>
                <SelectItem value="unlocked">{t.daysWithUnlocked}</SelectItem>
                <SelectItem value="locked">{t.daysWithLocked}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="day-range" className="text-sm font-medium mb-2 block">
              {t.dayRange}
            </Label>
            <Select value={dayRange} onValueChange={(value) => {
              setDayRange(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger id="day-range" data-testid="select-day-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all180Days}</SelectItem>
                <SelectItem value="1-20">{t.cycle1}</SelectItem>
                <SelectItem value="21-40">{t.cycle2}</SelectItem>
                <SelectItem value="41-60">{t.cycle3}</SelectItem>
                <SelectItem value="61-80">{t.cycle4}</SelectItem>
                <SelectItem value="81-100">{t.cycle5}</SelectItem>
                <SelectItem value="101-180">{t.noStreaming}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {t.showing} {filteredData.length} {t.of} {dailyBreakdown.length} {t.days}
          </span>
          {filteredData.length > 0 && (
            <span>
              {t.page} {currentPage} {t.of} {totalPages}
            </span>
          )}
        </div>
      </Card>

      {/* Table - Desktop */}
      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{t.day}</TableHead>
                <TableHead className="text-center">{t.task}</TableHead>
                <TableHead className="text-right">{t.dailyProfit}</TableHead>
                <TableHead className="text-right">{t.streamingBonus}</TableHead>
                <TableHead className="text-center">{t.unlock}</TableHead>
                <TableHead className="text-right">{t.claimable}</TableHead>
                <TableHead className="text-right">{t.locked}</TableHead>
                <TableHead className="text-right">{t.cumulative}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((day) => (
                <TableRow key={day.day} data-testid={`row-day-${day.day}`}>
                  <TableCell className="text-center font-mono font-medium">
                    {day.day}
                  </TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground">
                    {day.taskNumber}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(day.dailyProfit)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {day.streamingBonus > 0 ? (
                      <span className="text-chart-1">{formatCurrency(day.streamingBonus)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {day.unlockPercentage > 0 ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        day.unlockPercentage === 100 
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {day.unlockPercentage}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {day.claimable > 0 ? (
                      <span className="text-green-600 dark:text-green-400">{formatCurrency(day.claimable)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {day.locked > 0 ? (
                      <span className="text-orange-600 dark:text-orange-400">{formatCurrency(day.locked)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(day.cumulativeProfit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((day) => (
          <Card key={day.day} className="p-4" data-testid={`card-day-${day.day}`}>
            <div className="space-y-3">
              {/* Day and Task */}
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{t.day}</div>
                  <div className="text-lg font-bold font-mono">{day.day}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">{t.task}</div>
                  <div className="text-sm font-mono">{day.taskNumber}</div>
                </div>
              </div>

              {/* Daily Profit */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t.dailyProfit}</div>
                <div className="font-mono font-medium">{formatCurrency(day.dailyProfit)}</div>
              </div>

              {/* Streaming Bonus */}
              {day.streamingBonus > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{t.streamingBonus}</div>
                  <div className="font-mono text-chart-1">{formatCurrency(day.streamingBonus)}</div>
                </div>
              )}

              {/* Unlock */}
              {day.unlockPercentage > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{t.unlock}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    day.unlockPercentage === 100 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {day.unlockPercentage}%
                  </span>
                </div>
              )}

              {/* Claimable */}
              {day.claimable > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{t.claimable}</div>
                  <div className="font-mono text-green-600 dark:text-green-400">{formatCurrency(day.claimable)}</div>
                </div>
              )}

              {/* Locked */}
              {day.locked > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{t.locked}</div>
                  <div className="font-mono text-orange-600 dark:text-orange-400">{formatCurrency(day.locked)}</div>
                </div>
              )}

              {/* Cumulative */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground">{t.cumulative}</div>
                <div className="font-mono font-bold">{formatCurrency(day.cumulativeProfit)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            data-testid="button-prev-page"
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t.previous}
          </Button>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  data-testid={`button-page-${pageNum}`}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            data-testid="button-next-page"
            className="w-full sm:w-auto"
          >
            {t.next}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
