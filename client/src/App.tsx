import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { InvestmentProvider } from "@/contexts/InvestmentContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import Investment from "@/pages/Investment";
import Referral from "@/pages/Referral";
import Team from "@/pages/Team";
import Cases from "@/pages/Cases";
import DailyBreakdown from "@/pages/DailyBreakdown";
import TeamDailyBreakdown from "@/pages/TeamDailyBreakdown";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Investment} />
      <Route path="/referral" component={Referral} />
      <Route path="/team" component={Team} />
      <Route path="/cases" component={Cases} />
      <Route path="/daily-breakdown" component={DailyBreakdown} />
      <Route path="/team-daily-breakdown" component={TeamDailyBreakdown} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <InvestmentProvider>
            <TeamProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background">
                  <TopNav />
                  <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
                    <Router />
                  </main>
                  <BottomNav />
                </div>
                <Toaster />
              </TooltipProvider>
            </TeamProvider>
          </InvestmentProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
