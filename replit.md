# RWA Profit Simulator

## Overview
A comprehensive Real World Assets (RWA) investment profit calculator with multi-tier rewards system. Users can calculate investment returns for short-term and long-term products, analyze referral rewards, and track team-based bonuses across 8 tier levels from VIP to Supreme.

## Project Status
**Current Phase**: Frontend development complete with RWA-based inputs across all calculators
**Last Updated**: November 7, 2025
**Tech Stack**: React + TypeScript + Tailwind CSS + Recharts + Wouter

## Features Implemented

### 1. Investment Calculator (RWA-Based)
- **Input**: RWA units (1 RWA = $100 USD)
- **Short-term products**: 5-10 day duration, fixed 5% return
- **Long-term products**: 180 days, 1-1.5% daily return with capital release
- **Streaming bonus system**: 40% of returns distributed over 100-day cycle
- **Release schedule**: 20/40/60/80/100 task milestones with 50% unlock pattern
- **Interactive charts**: Daily profit progression and streaming release visualization
- **Daily breakdown table**: Comprehensive per-day earnings with unlock percentages

### 2. Referral Rewards System (RWA-Based, Unified Rate)
- **Input**: RWA units for downline investments (1 RWA = $100 USD)
- **Unified daily rate**: Single rate selector (1-1.5%) applies to both levels
- **Direct rewards**: 20% of first-level downline daily profits
- **Indirect rewards**: 10% of second-level downline daily profits
- **Monthly projections**: Automatic 30-day calculations

### 3. Team Rewards Calculator (RWA-Based, Auto-Calculated)
- **Input**: RWA units for team performance (1 RWA = $100 USD)
- **Validation**: Small area performance must be ≥ 50% and ≤ total performance
- **Auto-calculation**: Daily profits derived from RWA × 100 × daily rate (1-1.5%)
- **8-tier system**: VIP → 1/2/3-Star Expert → 1/2/3-Star Ambassador → Supreme
- **Team dividends**: 10-70% of small area daily profit based on tier level
- **Streaming management**: 0-30% of small area daily profit additional rewards
- **Supreme bonus**: 5% of total team daily profits (auto-calculated from total performance)
- **Requirements table**: Complete tier progression and community structure display

### 4. UI/UX Features
- **Mobile-first design**: Bottom tab navigation for mobile, responsive layouts
- **Bilingual support**: English/Chinese toggle with localStorage persistence
- **Dark mode**: Complete theme system with light/dark toggle
- **Material Design**: Professional data-focused aesthetic with Inter + JetBrains Mono fonts
- **Interactive components**: Sliders, metric cards, collapsible tables
- **Recharts integration**: Line and bar charts for data visualization

## Architecture

### Data Schema (`shared/schema.ts`)
- **RWA-based inputs**: All investment amounts now in RWA units (1 RWA = 100 USD)
- **Investment schema**: `rwaCount` (integer), `productType`, `duration`, `dailyRate`
- **Referral schema**: `downlineRwaCount`, `secondLevelRwaCount` (optional), unified `dailyRate`
- **Team schema**: `totalPerformanceRwa`, `smallAreaPerformanceRwa`, `dailyRate`, `currentTier`
  - Zod validation: `smallAreaPerformanceRwa >= totalPerformanceRwa * 0.5`
  - Zod validation: `smallAreaPerformanceRwa <= totalPerformanceRwa`
- Team tier definitions with requirements
- Translation strings for EN/ZH
- Streaming release schedule configuration
- TypeScript types for all calculations

### Calculation Engine (`client/src/lib/calculations.ts`)
- `calculateInvestment()`: Converts RWA to USD (×100), processes short/long-term returns
- `calculateReferralRewards()`: Converts RWA to USD, applies unified daily rate to both levels
- `calculateTeamRewards()`: Converts RWA to USD, auto-calculates daily profits from performance × rate
  - Derives small area daily profit from `smallAreaPerformanceRwa × 100 × dailyRate / 100`
  - Applies tier-based percentages to calculated daily profit
  - Supreme bonus: `totalPerformanceRwa × 100 × dailyRate / 100 × 0.05`
- Daily breakdown generation with unlock percentages

### Component Structure
```
client/src/
├── contexts/
│   ├── LanguageContext.tsx (EN/ZH switching)
│   └── ThemeContext.tsx (Light/Dark mode)
├── components/
│   ├── TopNav.tsx (Header with language and theme toggles)
│   ├── BottomNav.tsx (Mobile tab navigation)
│   ├── MetricCard.tsx (Summary metric display)
│   ├── DailyBreakdownTable.tsx (Detailed daily earnings table)
│   ├── StreamingReleaseChart.tsx (Bar chart for unlock schedule)
│   ├── ProfitProgressionChart.tsx (Line chart for earnings)
│   └── TierBadge.tsx (Visual tier indicators)
├── pages/
│   ├── Investment.tsx (Main investment calculator)
│   ├── Referral.tsx (Referral rewards calculator)
│   └── Team.tsx (Team rewards calculator)
└── App.tsx (Main routing and provider setup)
```

### Design System
- **Colors**: Material-inspired palette with chart colors for data viz
- **Typography**: 
  - Inter for headings, labels, body text
  - JetBrains Mono for financial figures and data tables
- **Spacing**: Consistent 4/6 unit padding for mobile/desktop
- **Components**: Shadcn UI library with custom styling
- **Responsive**: Mobile-first with md/lg breakpoints

## Key Calculations

### Short-Term Investment
- Investment amount = RWA count × 100 (USD)
- Total return = Investment × 5%
- Daily return = Total return ÷ Duration
- **No streaming bonus** (short-term products don't have streaming tasks)

### Long-Term Investment
- Investment amount = RWA count × 100 (USD)
- Daily return = Investment × Daily rate (1-1.5%)
- Total return = Daily return × 180 days
- Streaming bonus = Total return × 40% (released over 100 days)
- Capital returned on day 180

### Streaming Bonus Release Pattern
- Days 1-20: 0% claimable, 100% locked
- Days 21-40: 50% of days 1-20 unlocked
- Days 41-60: Additional 50% of days 21-40 unlocked
- Days 61-80: Additional 50% of days 41-60 unlocked
- Days 81-100: Additional 50% of days 61-80 unlocked
- Day 100: All remaining locked amounts unlocked

### Referral Rewards
- Downline investment = RWA count × 100 (USD)
- Downline daily profit = Investment × Daily rate (1-1.5%)
- Direct: Downline daily profit × 20%
- Indirect: Second-level daily profit × 10%
- Unified daily rate applies to both levels

### Team Rewards
- Total performance = RWA count × 100 (USD)
- Small area performance = RWA count × 100 (USD, must be ≥ 50% of total)
- Small area daily profit = Small area performance × Daily rate (1-1.5%)
- Team dividend = Small area daily profit × Tier dividend %
- Streaming management = Small area daily profit × Tier management %
- Supreme bonus = Total daily profit × 5% (Supreme tier only)
  - Total daily profit = Total performance × Daily rate (1-1.5%)

## User Preferences
- **Language**: EN/ZH toggle in top navigation
- **Theme**: Light/dark mode toggle in top navigation
- **Persistence**: Both preferences saved to localStorage

## Navigation Structure
- **Mobile**: Bottom tab bar with 3 tabs (Investment, Referral, Team)
- **Desktop**: Same bottom tabs visible with full-width content
- **Routes**: 
  - `/` - Investment Calculator
  - `/referral` - Referral Rewards
  - `/team` - Team Rewards

## Recent Updates
**November 7, 2025**: 
- **RWA-based inputs**: Converted all calculators to use RWA units (1 RWA = $100 USD)
  - Investment Calculator: Changed from USD to RWA count input
  - Referral Rewards: Unified daily rate selector applies to both referral levels, RWA inputs
  - Team Rewards: Auto-calculates daily profits from RWA performance and rate, enforces 50% small area validation
- **Mobile optimization**: Daily breakdown table now uses responsive design
  - Mobile (<768px): Card layout with labeled key-value pairs for easy reading
  - Desktop (≥768px): Traditional table layout with sticky header
  - Maintains all data fields and color coding across both views
- **Business logic update**: Removed streaming bonus from short-term investments
  - Short-term products (5-10 days) no longer calculate streaming bonus
  - Only long-term products (180 days) have 40% streaming bonus over 100-task cycle
  - Clarifies that streaming tasks only apply to long-term investments

## Next Steps (Backend & Integration)
1. Implement storage interface for saving calculation scenarios
2. Add API endpoints for calculation history
3. Connect frontend to backend APIs
4. Add loading states and error handling
5. Implement data persistence layer
6. End-to-end testing

## Development Notes
- All calculations performed client-side (no backend required for MVP)
- Recharts library used for all data visualizations
- Form validation using Zod schemas
- React Hook Form for all input forms
- Wouter for lightweight routing
- Complete mobile responsiveness with touch-friendly targets
- Accessibility features: proper labels, ARIA attributes, keyboard navigation
