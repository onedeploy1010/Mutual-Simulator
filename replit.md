# RWA Profit Simulator

## Overview
The RWA Profit Simulator is a tool designed to calculate investment returns and multi-tier rewards for Real World Assets (RWA). It enables users to assess potential profits from short-term and long-term RWA products, analyze referral earnings, and track team-based bonuses across various tiered levels, from VIP to Supreme. The project aims to provide comprehensive financial projections for RWA investments.

## User Preferences
- **Language**: EN/ZH toggle in top navigation (默认中文/Default Chinese)
- **Theme**: Light/dark mode toggle in top navigation
- **Persistence**: Both preferences saved to localStorage

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first, responsive design with bottom tab navigation for mobile and full-width content for desktop.
- **Branding**: 
  - Dual logo system: separate logos for light and dark themes
  - Light theme: soft blue header (hsl 198 45% 92%) matching light logo colors
  - Dark theme: purple-blue gradient background matching dark logo
  - Premium card styling with shadows and hover effects
  - Gradient accent bars on page titles
- **Modern Design**: Premium card styles (`shadow-lg`, hover animations), Glassmorphism effects in dark mode, touch-friendly sizing (44px minimum for interactive elements on mobile), smooth transitions (200ms duration).
- **Typography**: Inter for headings, labels, and body text; JetBrains Mono for financial figures and data tables.
- **Interactive Components**: Sliders, metric cards, collapsible tables, and data visualizations using Recharts (line and bar charts).
- **Theming**: Complete dark mode support with coordinated color schemes for both themes.
- **Bilingual Support**: English and Chinese language options with persistence.

### Technical Implementations
- **Frontend**: React, TypeScript, Tailwind CSS for styling, Recharts for charting, Wouter for routing.
- **Data Schema**: All inputs are RWA-based (1 RWA = $100 USD) and validated using Zod. Schemas define investment, referral, and team parameters, including tier definitions and performance ranges.
- **Calculation Engine**: Client-side JavaScript functions (`calculateInvestment()`, `calculateReferralRewards()`, `calculateTeamRewards()`) handle all profit calculations based on RWA units and daily rates.
- **State Management**: `InvestmentContext` is used for sharing calculation results between pages.
- **Component Structure**: Organized into `contexts`, `components`, and `pages` for modularity.
- **Form Handling**: React Hook Form with Controller for slider components to ensure proper form state management and accessibility.

### Feature Specifications
- **Investment Calculator**:
    - **Short-term**: 5-10 days (configurable), 5% fixed return, 40% streaming bonus (based on daily dividend) released at cumulative task milestones (20/40/60/80/100 tasks across multiple investments).
    - **Long-term**: 180 days, 1-1.5% daily return with capital release, 40% streaming bonus over 100 days with 20-day cycle unlock milestones.
    - Interactive charts and daily breakdown tables.
    - **Slider Defaults**: All sliders default to average/middle value, not minimum.
    - **Streaming Bonus Mechanics**:
      - Formula: Streaming bonus = Daily dividend × 40%
      - Short-term: Daily dividend rate = 0.5%-1% (5%/duration), streaming = 0.2%-0.4% daily
      - Long-term: Uses **same 0.5%-1% streaming rate as short-term** (independent slider), streaming = 0.2%-0.4% daily
      - Both types: Released in 100 days with milestone-based unlocks
      - UI includes explanatory info cards for each product type
- **Referral Rewards**:
    - Calculates direct (20% of first-level daily profits) and indirect (10% of second-level daily profits) rewards based on a unified daily rate.
    - Monthly projections.
- **Team Rewards Calculator**:
    - Supports 8 tiers (VIP to Supreme) with specific RWA/USD performance ranges.
    - **Calculation based on ENTIRE team performance** (not small area).
    - Each tier requires at least two communities with corresponding tier-level downlines (dynamically displayed).
    - **Team dividend** = Total team performance × daily rate × tier dividend %
    - **Streaming management** = Daily dividend × 40% × tier streaming %, released over 100 days.
    - Supreme tier: 70% team dividend, 30% streaming management, plus 5% global Supreme bonus.
    - **Reward splits**:
      - Team dividends (10-70% by tier): 90% USD / 10% MEC
      - Streaming management rewards (0-30% by tier): 100% USD
      - Supreme bonus (5% for Supreme tier only): 90% USD / 10% MEC
    - **Streaming Management Rewards**: Based on daily dividend × 40%, released over 100 days with phased unlocks:
      - Day 20/40/60/80: Release 50% of each 20-day cycle, 50% locked
      - Day 100: Full unlock (all previously locked amounts released)
      - Days 101-180: No streaming management rewards
    - Integrates MEC Token with selectable MEC price (1/2/4/8/16/32 USD per MEC).
    - 180-day total calculations: Shows total USD and MEC quantities earned over 180 days with daily breakdowns.
    - Team Daily Breakdown page displays phased unlock events and released amounts for each milestone day.

## External Dependencies
- **Recharts**: JavaScript charting library for data visualization.
- **Wouter**: A lightweight client-side routing library for React.
- **Zod**: TypeScript-first schema declaration and validation library.
- **React Hook Form**: Library for flexible and extensible forms with validation.
- **Shadcn UI**: Used as a component library with custom styling.