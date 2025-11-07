# RWA Profit Simulator

## Overview
A comprehensive Real World Assets (RWA) investment profit calculator with multi-tier rewards system. Users can calculate investment returns for short-term and long-term products, analyze referral rewards, and track team-based bonuses across 8 tier levels from VIP to Supreme.

## Project Status
**Current Phase**: Frontend development complete with all core features
**Last Updated**: Current session
**Tech Stack**: React + TypeScript + Tailwind CSS + Recharts + Wouter

## Features Implemented

### 1. Investment Calculator
- **Short-term products**: 5-10 day duration, fixed 5% return
- **Long-term products**: 180 days, 1-1.5% daily return with capital release
- **Streaming bonus system**: 40% of returns distributed over 100-day cycle
- **Release schedule**: 20/40/60/80/100 task milestones with 50% unlock pattern
- **Interactive charts**: Daily profit progression and streaming release visualization
- **Daily breakdown table**: Comprehensive per-day earnings with unlock percentages

### 2. Referral Rewards System
- **Direct rewards**: 20% of first-level downline daily profits
- **Indirect rewards**: 10% of second-level downline daily profits
- **Flexible inputs**: Configurable investment amounts and daily rates (1-1.5%)
- **Monthly projections**: Automatic 30-day calculations

### 3. Team Rewards Calculator
- **8-tier system**: VIP → 1/2/3-Star Expert → 1/2/3-Star Ambassador → Supreme
- **Team dividends**: 10-70% based on tier level
- **Streaming management**: 0-30% additional management rewards
- **Supreme bonus**: 5% of company-wide RWA daily profits
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
- Investment types and validation schemas
- Team tier definitions with requirements
- Translation strings for EN/ZH
- Streaming release schedule configuration
- TypeScript types for all calculations

### Calculation Engine (`client/src/lib/calculations.ts`)
- `calculateInvestment()`: Processes short/long-term investment returns
- `calculateReferralRewards()`: Computes direct and indirect referral bonuses
- `calculateTeamRewards()`: Calculates tier-based team rewards
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
- Total return = Investment × 5%
- Daily return = Total return ÷ Duration
- Streaming bonus = Total return × 40% (released over 100 days)

### Long-Term Investment
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
- Direct: Downline daily profit × 20%
- Indirect: Second-level daily profit × 10%

### Team Rewards
- Team dividend = Small area daily profit × Tier dividend %
- Streaming management = Small area daily profit × Tier management %
- Supreme bonus = Company-wide daily profit × 5% (Supreme tier only)

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

## Next Steps (Backend & Integration)
1. Implement storage interface for saving calculation scenarios
2. Add API endpoints for calculation history
3. Connect frontend to backend APIs
4. Add loading states and error handling
5. Implement data persistence layer
6. Testing and architect review

## Development Notes
- All calculations performed client-side (no backend required for MVP)
- Recharts library used for all data visualizations
- Form validation using Zod schemas
- React Hook Form for all input forms
- Wouter for lightweight routing
- Complete mobile responsiveness with touch-friendly targets
- Accessibility features: proper labels, ARIA attributes, keyboard navigation
