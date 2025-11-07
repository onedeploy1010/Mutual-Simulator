import { useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
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
import type { DailyEarning } from '@shared/schema';

const ITEMS_PER_PAGE = 20;

type FilterType = 'all' | 'streaming' | 'unlocked' | 'locked';

export default function DailyBreakdown() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dayRange, setDayRange] = useState<string>('all');

  // Get data from location state (passed from Investment page)
  const dailyBreakdown: DailyEarning[] = (history.state?.dailyBreakdown || []) as DailyEarning[];
  const investmentAmount = history.state?.investmentAmount || 0;
  const dailyRate = history.state?.dailyRate || 0;

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
        <p className="text-muted-foreground">No daily breakdown data available</p>
        <Button onClick={() => navigate('/')} variant="outline" data-testid="button-back-to-home">
          <Home className="w-4 h-4 mr-2" />
          Back to Investment Calculator
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/">
            <a className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">
              Investment
            </a>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Daily Breakdown</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">180-Day Daily Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Investment: {formatCurrency(investmentAmount)} • Daily Rate: {dailyRate}%
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" size="sm" data-testid="button-back">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-type" className="text-sm font-medium mb-2 block">
              Filter by Type
            </Label>
            <Select value={filterType} onValueChange={(value) => {
              setFilterType(value as FilterType);
              setCurrentPage(1);
            }}>
              <SelectTrigger id="filter-type" data-testid="select-filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="streaming">Streaming Bonus Days</SelectItem>
                <SelectItem value="unlocked">Days with Unlocked Funds</SelectItem>
                <SelectItem value="locked">Days with Locked Funds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="day-range" className="text-sm font-medium mb-2 block">
              Day Range
            </Label>
            <Select value={dayRange} onValueChange={(value) => {
              setDayRange(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger id="day-range" data-testid="select-day-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 180 Days</SelectItem>
                <SelectItem value="1-20">Days 1-20 (Cycle 1)</SelectItem>
                <SelectItem value="21-40">Days 21-40 (Cycle 2)</SelectItem>
                <SelectItem value="41-60">Days 41-60 (Cycle 3)</SelectItem>
                <SelectItem value="61-80">Days 61-80 (Cycle 4)</SelectItem>
                <SelectItem value="81-100">Days 81-100 (Cycle 5)</SelectItem>
                <SelectItem value="101-180">Days 101-180 (No Streaming)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredData.length} of {dailyBreakdown.length} days
          </span>
          {filteredData.length > 0 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Day</TableHead>
                <TableHead className="text-center">Task</TableHead>
                <TableHead className="text-right">Daily Profit</TableHead>
                <TableHead className="text-right">Streaming</TableHead>
                <TableHead className="text-center">Unlock</TableHead>
                <TableHead className="text-right">Claimable</TableHead>
                <TableHead className="text-right">Locked</TableHead>
                <TableHead className="text-right">Cumulative</TableHead>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
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
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
