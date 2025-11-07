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

### 3. Team Rewards Calculator (RWA-Based, Slider Selection)
- **Input**: Select RWA units using sliders (1 RWA = $100 USD)
- **Total Performance Slider**: Select within selected tier's range (e.g., VIP: 60-200 RWA)
- **Small Area Slider**: Select between 50%-100% of total performance
- **Validation**: Both values must be within valid ranges
- **Daily profits**: Derived from RWA × 100 × daily rate (1-1.5%)
- **8-tier system with USD ranges**: 
  - VIP ($6K-20K), 1-Star Expert ($20K-60K), 2-Star Expert ($60K-200K), 3-Star Expert ($200K-600K)
  - 1-Star Ambassador ($600K-2M), 2-Star Ambassador ($2M-6M), 3-Star Ambassador ($6M+), Supreme (up to $10M)
- **Team dividend**: Small area daily profit × Dividend % (10%-70% by tier)
- **Management reward**: Total performance daily streaming profit × Management % (5%-30%, starting from 1-Star Expert)
  - Daily streaming profit = Total daily profit × 40%
- **Supreme bonus**: 5% of total team daily profits (Supreme tier only)
- **UI**: Dynamic sliders adjust ranges based on tier selection; auto-constrains small area when total changes

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
  - Zod validation: Total performance must be within selected tier's min/max range (except Supreme)
  - Zod validation: Small area must be ≥ 50% and ≤ 100% of total performance
- Team tier definitions with requirements
- Translation strings for EN/ZH
- Streaming release schedule configuration
- TypeScript types for all calculations

### Calculation Engine (`client/src/lib/calculations.ts`)
- `calculateInvestment()`: Converts RWA to USD (×100), processes short/long-term returns
- `calculateReferralRewards()`: Converts RWA to USD, applies unified daily rate to both levels
- `calculateTeamRewards()`: Converts RWA to USD, uses user-selected small area performance
  - Small area performance = User-selected value (50%-100% of total)
  - Small area daily profit = `smallAreaPerformanceUsd × dailyRate / 100`
  - Team dividend = Small area daily profit × Tier dividend %
  - Management reward = Total daily streaming profit × Tier management %
  - Supreme bonus: `totalDailyProfit × 0.05` (Supreme tier only)
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
- **Daily streaming bonus** = Daily return × 40% (accumulated for first 100 days only)
- **Total streaming bonus** = Daily streaming bonus × 100
- Capital returned on day 180

### Streaming Bonus Accumulation & Release (20-Day Cycles)
- **Daily accumulation**: Each day (1-100) earns streaming bonus = Daily profit × 40%
- **Days 1-19**: Accumulate daily, 0% claimable, 100% locked
- **Day 20**: Unlock 50% of 20-day cycle (days 1-20), lock remaining 50%
- **Days 21-39**: Continue accumulating, maintain day 20 unlocked amount
- **Day 40**: Unlock 50% of cycle 2 (days 21-40), total claimable = cycles 1+2 unlocked
- **Days 41-59**: Continue accumulating, maintain previous unlocked amounts
- **Day 60**: Unlock 50% of cycle 3 (days 41-60), total claimable = cycles 1+2+3 unlocked
- **Days 61-79**: Continue accumulating, maintain previous unlocked amounts
- **Day 80**: Unlock 50% of cycle 4 (days 61-80), total claimable = cycles 1+2+3+4 unlocked
- **Days 81-99**: Continue accumulating, maintain previous unlocked amounts
- **Day 100**: Unlock all remaining locked amounts (100% claimable, 0% locked)
- **Days 101-180**: No streaming bonus earned (0 per day)

### Referral Rewards
- Downline investment = RWA count × 100 (USD)
- Downline daily profit = Investment × Daily rate (1-1.5%)
- Direct: Downline daily profit × 20%
- Indirect: Second-level daily profit × 10%
- Unified daily rate applies to both levels

### Team Rewards
- Total performance = RWA count × 100 (USD)
- Small area performance = Total performance × 50% (auto-calculated)
- Small area daily profit = Small area performance × Daily rate (1-1.5%)
- Team dividend = Small area daily profit × Tier dividend % (10%-70%)
- Management reward = Total daily streaming profit × Tier management % (5%-30%, starting from 1-Star Expert)
  - Total daily profit = Total performance × Daily rate (1-1.5%)
  - Total daily streaming profit = Total daily profit × 40%
- Supreme bonus = Total daily profit × 5% (Supreme tier only)

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
**November 7, 2025 (Latest v2)**: 
- **Team Rewards auto-calculation**: Small area performance now automatically calculated as 50% of total performance
  - Removed small area performance input field from Team page
  - Updated schema to only require: currentTier, totalPerformanceRwa, dailyRate
  - Simplified user workflow: select tier → enter total performance → calculate
  - System automatically derives small area and performs all reward calculations
  - Helper text explains: "Small area is automatically set to 50% of total performance"

**November 7, 2025 (v1)**: 
- **Team tier system overhaul**: Updated all 8 tiers with explicit USD performance ranges
  - VIP: $6K-$20K, 1-Star Expert: $20K-$60K, 2-Star Expert: $60K-$200K, 3-Star Expert: $200K-$600K
  - 1-Star Ambassador: $600K-$2M, 2-Star Ambassador: $2M-$6M, 3-Star Ambassador: $6M+, Supreme: no range
  - Changed from single `requirementSelfAndTeam` to `requirementMin/requirementMax` range structure
  - Added validation to enforce total performance falls within selected tier's range (exempts Supreme)
- **Team reward calculation refinement**: Corrected formulas for team dividend and management reward
  - Team dividend = Small area daily profit × Tier dividend % (10%-70% by tier)
  - Management reward = Total performance daily streaming profit × Tier management % (5%-30%, starting from 1-Star Expert)
  - Daily streaming profit = Total daily profit × 40% (applies to total performance, not small area)
  - Supreme bonus remains at 5% of total daily profit
- **Team page UI enhancement**: Added tier range display below tier selector
  - Shows performance range in both RWA units and USD equivalent (e.g., "60 - 200 RWA ($6,000 - $20,000)")
  - Updates dynamically when user selects different tier
  - Validation errors display when total performance is out of selected tier's range

**November 7, 2025 (Earlier)**: 
- **RWA-based inputs**: Converted all calculators to use RWA units (1 RWA = $100 USD)
  - Investment Calculator: Changed from USD to RWA count input
  - Referral Rewards: Unified daily rate selector applies to both referral levels, RWA inputs
  - Team Rewards: Auto-calculates daily profits from RWA performance and rate, enforces 50% small area validation
- **Mobile optimization**: Daily breakdown table now uses responsive design
  - Mobile (<768px): Card layout with labeled key-value pairs for easy reading
  - Desktop (≥768px): Traditional table layout with sticky header
  - Maintains all data fields and color coding across both views
- **Streaming bonus calculation refinement**: Changed from total-based to daily-based accumulation
  - **OLD**: Total streaming = Total return × 40%, distributed across 100 days
  - **NEW**: Daily streaming = Daily profit × 40%, accumulated for first 100 days only
  - Each 20-day cycle unlocks 50% at milestones (days 20/40/60/80/100)
  - Days 101-180 earn zero streaming bonus (only days 1-100 generate streaming rewards)
  - Example: 10 RWA @ 1.2% = $12/day profit → $4.80/day streaming × 100 days = $480 total
- **Business logic update**: Removed streaming bonus from short-term investments
  - Short-term products (5-10 days) no longer calculate streaming bonus
  - Only long-term products (180 days) have streaming bonus with 20-day accumulation cycles
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
