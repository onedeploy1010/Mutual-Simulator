import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTeam } from '@/contexts/TeamContext';
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

interface DailyTeamReward {
  day: number;
  teamDividend: number;
  managementReward: number;
  supremeReward: number;
  totalReward: number;
}

export default function TeamDailyBreakdown() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { result, input } = useTeam();
  const [currentPage, setCurrentPage] = useState(1);
  const [dayRange, setDayRange] = useState<string>('all');

  // Use streaming management breakdown from calculation result
  const dailyData = useMemo((): DailyTeamReward[] => {
    if (!result || !input) return [];
    
    if (!result.streamingManagementBreakdown || result.streamingManagementBreakdown.length === 0) {
      return [];
    }
    
    const data: DailyTeamReward[] = [];
    for (let day = 1; day <= 180; day++) {
      const breakdown = result.streamingManagementBreakdown[day - 1];
      const managementReward = breakdown?.releasedToday || 0;
      const totalReward = result.teamDividendReward + managementReward + result.supremeReward;
      
      data.push({
        day,
        teamDividend: result.teamDividendReward,
        managementReward,
        supremeReward: result.supremeReward,
        totalReward,
      });
    }
    return data;
  }, [result, input]);

  const totalPerformanceRwa = input?.totalPerformanceRwa || 0;
  const smallAreaPerformanceRwa = input?.smallAreaPerformanceRwa || 0;
  const dailyRate = input?.dailyRate || 0;
  const tierName = result?.tierInfo.tier || '';

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...dailyData];

    // Filter by day range
    if (dayRange !== 'all') {
      const [start, end] = dayRange.split('-').map(Number);
      filtered = filtered.filter(d => d.day >= start && d.day <= end);
    }

    return filtered;
  }, [dailyData, dayRange]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (dailyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground">{t.noDataAvailable}</p>
        <Button onClick={() => navigate('/team')} variant="outline" data-testid="button-back-to-team">
          <Home className="w-4 h-4 mr-2" />
          {t.backToTeam}
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
            onClick={() => navigate('/team')}
            className="hover:text-foreground transition-colors" 
            data-testid="link-breadcrumb-team"
          >
            {t.team}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{t.teamDailyBreakdownPage}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{t.teamDailyBreakdownPage}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tierName} • {t.totalPerformanceRwa}: {totalPerformanceRwa} RWA • {t.dailyReturnRate}: {dailyRate}%
            </p>
          </div>
          <Button onClick={() => navigate('/team')} variant="outline" size="sm" data-testid="button-back" className="w-full md:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
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
                <SelectItem value="1-30">{t.days1to30}</SelectItem>
                <SelectItem value="31-60">{t.days31to60}</SelectItem>
                <SelectItem value="61-90">{t.days61to90}</SelectItem>
                <SelectItem value="91-120">{t.days91to120}</SelectItem>
                <SelectItem value="121-150">{t.days121to150}</SelectItem>
                <SelectItem value="151-180">{t.days151to180}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>
              {t.showing} {filteredData.length} {t.of} {dailyData.length} {t.days}
            </span>
            {filteredData.length > 0 && (
              <span>
                {t.page} {currentPage} {t.of} {totalPages}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Table - Desktop */}
      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{t.day}</TableHead>
                <TableHead className="text-right">{t.teamDividend}</TableHead>
                <TableHead className="text-right">{t.streamingManagement}</TableHead>
                {result?.tierInfo.isSupreme && (
                  <TableHead className="text-right">{t.supremeReward}</TableHead>
                )}
                <TableHead className="text-right">{t.totalReward}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((day) => (
                <TableRow key={day.day} data-testid={`row-day-${day.day}`}>
                  <TableCell className="text-center font-mono font-medium">
                    {day.day}
                  </TableCell>
                  <TableCell className="text-right font-mono text-primary">
                    {formatCurrency(day.teamDividend)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-chart-3">
                    {formatCurrency(day.managementReward)}
                  </TableCell>
                  {result?.tierInfo.isSupreme && (
                    <TableCell className="text-right font-mono text-chart-1">
                      {formatCurrency(day.supremeReward)}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-mono font-bold">
                    {formatCurrency(day.totalReward)}
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
              {/* Day */}
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="text-sm text-muted-foreground">{t.day}</div>
                <div className="text-lg font-bold font-mono">{day.day}</div>
              </div>

              {/* Team Dividend */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t.teamDividend}</div>
                <div className="font-mono text-primary">{formatCurrency(day.teamDividend)}</div>
              </div>

              {/* Management Reward */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{t.streamingManagement}</div>
                <div className="font-mono text-chart-3">{formatCurrency(day.managementReward)}</div>
              </div>

              {/* Supreme Reward */}
              {result?.tierInfo.isSupreme && day.supremeReward > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{t.supremeReward}</div>
                  <div className="font-mono text-chart-1">{formatCurrency(day.supremeReward)}</div>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground">{t.totalReward}</div>
                <div className="font-mono font-bold">{formatCurrency(day.totalReward)}</div>
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
