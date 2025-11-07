# RWA Profit Simulator

## Overview
The RWA Profit Simulator is a tool designed to calculate investment returns and multi-tier rewards for Real World Assets (RWA). It enables users to assess potential profits from short-term and long-term RWA products, analyze referral earnings, and track team-based bonuses across various tiered levels, from VIP to Supreme. The project aims to provide comprehensive financial projections for RWA investments.

## User Preferences
- **Language**: EN/ZH toggle in top navigation
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
- **Form Handling**: React Hook Form for managing input forms and validation.

### Feature Specifications
- **Investment Calculator**:
    - **Short-term**: 5-10 days, 5% fixed return.
    - **Long-term**: 180 days, 1-1.5% daily return with capital release, 40% streaming bonus over 100 days with 20-day cycle unlock milestones.
    - Interactive charts and daily breakdown tables.
- **Referral Rewards**:
    - Calculates direct (20% of first-level daily profits) and indirect (10% of second-level daily profits) rewards based on a unified daily rate.
    - Monthly projections.
- **Team Rewards Calculator**:
    - Supports 8 tiers (VIP to Supreme) with specific RWA/USD performance ranges.
    - Total Performance and Small Area (50% of total performance) sliders for input.
    - Calculates daily profits, team dividends (10-70% by tier), management rewards (5-30%), and a 5% Supreme bonus.
    - Integrates MEC Token: Team dividend split into 90% USD and 10% MEC tokens with selectable MEC price (1/2/4/8/16/32 USD per MEC).
    - 180-day total calculations: Shows total USD and MEC quantities earned over 180 days with daily breakdowns.

## External Dependencies
- **Recharts**: JavaScript charting library for data visualization.
- **Wouter**: A lightweight client-side routing library for React.
- **Zod**: TypeScript-first schema declaration and validation library.
- **React Hook Form**: Library for flexible and extensible forms with validation.
- **Shadcn UI**: Used as a component library with custom styling.