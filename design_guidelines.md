# RWA Profit Calculator - Design Guidelines

## Design Approach

**Selected Framework:** Material Design System (Data-Focused Variant)

**Rationale:** This is a utility-focused financial calculator requiring information density, data clarity, and professional trust signals. Material Design provides excellent patterns for forms, data tables, and card-based metrics while maintaining accessibility and mobile responsiveness.

**Core Principles:**
- Clarity over decoration: Every element serves the calculation workflow
- Data hierarchy: Guide users through complex multi-tier reward structures
- Professional trust: Clean, structured layouts signal reliability
- Mobile-first: Bottom tab navigation and vertical card stacking

---

## Typography

**Font Stack:** 
- Primary: Inter (Google Fonts) - headers, labels, body text
- Monospace: JetBrains Mono - financial figures, calculations, tables

**Type Scale:**
- Page Titles: text-2xl font-semibold (Mobile) / text-3xl font-bold (Desktop)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body/Labels: text-sm font-normal
- Data Values: text-base font-semibold (monospace)
- Large Metrics: text-4xl font-bold (monospace) for key numbers
- Helper Text: text-xs text-gray-600

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16
- Component padding: p-4 (mobile), p-6 (desktop)
- Section gaps: gap-4 (mobile), gap-6 (desktop)
- Card spacing: space-y-4 internally
- Page margins: px-4 (mobile), px-8 (tablet), max-w-7xl mx-auto (desktop)

**Grid Structure:**
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns for metric cards (md:grid-cols-2)
- Desktop: 3 columns for summary metrics (lg:grid-cols-3)

**Container Hierarchy:**
- Full viewport: Mobile pages use full height with bottom tab nav
- Content sections: max-w-6xl centered for readability
- Data tables: Horizontal scroll on mobile with sticky first column

---

## Component Library

### Navigation
**Bottom Tab Bar (Mobile Primary):**
- Fixed bottom navigation with 3 tabs: Investment | Referral | Team
- Icons from Heroicons (outline style) above labels
- Active state: filled icon variant
- Height: h-16 with safe-area-inset-bottom
- Desktop: Converts to side navigation or top tabs

### Cards & Containers

**Metric Summary Cards:**
- Elevated card style (shadow-md)
- Icon + Label + Large Value layout
- Stacked vertically on mobile, horizontal grid on tablet+
- Border radius: rounded-lg
- Consistent internal padding: p-6

**Calculation Result Cards:**
- Bordered card style (border-2)
- Prominent header with calculation type
- Key-value pairs in structured rows
- "View Details" expansion button at bottom
- Background: subtle gradient or solid

**Data Table Cards:**
- Full-width container with overflow-x-auto
- Sticky header row
- Alternating row styles for readability
- Monospace fonts for numerical columns
- Mobile: Compress to card-style rows showing key info

### Forms

**Input Structure:**
- Label above input (vertical stacking)
- Material-style floating labels or clear labels with helper text below
- Input height: h-12 for touch targets
- Consistent border radius: rounded-md
- Error states with icon + message below

**Input Types:**
- Text/Number: Standard input with currency prefix ($) where applicable
- Radio/Select: Product type selection (Short/Long) as segmented control or radio buttons
- Slider: Daily return rate adjustment (1.0% - 1.5%) with value display
- Stepper: Investment amount in $100 increments

**Buttons:**
- Primary CTA: Large, full-width on mobile (h-12), auto-width desktop
- Secondary: Outlined variant for "View Details", "Reset"
- Button groups: Equal-width segments for product type toggle

### Data Visualization

**Charts (Recharts Integration):**
- Line chart: Daily earnings progression over time
- Bar chart: Unlock schedule visualization (20/40/60/80/100 days)
- Pie/Donut: Reward distribution breakdown (Direct/Indirect/Team)
- Container: Responsive aspect ratio, min-height to prevent cramping

**Progress Indicators:**
- Linear progress bars for streaming bonus unlock stages
- Circular progress for overall completion (100-day cycle)
- Labeled milestones at 20/40/60/80/100 task marks

**Table Components:**
- Daily breakdown table: Date | Task # | Daily Profit | Unlock % | Claimable | Locked
- Sticky header with sort indicators
- Expandable rows for detailed calculation formulas
- Footer row for totals/averages

### Specialty Components

**Tier Badge System:**
- Visual badges for VIP → 3-Star Ambassador → Supreme levels
- Icon + Label + Percentage display
- Stacked list on mobile, horizontal badges on desktop
- Progressive color intensity (not specified, but varying visual weight)

**Calculation Explanation Cards:**
- Collapsible "How is this calculated?" sections
- Formula display with variable highlighting
- Step-by-step breakdown for complex multi-tier calculations

**Multi-language Toggle:**
- Flag icons + language code in top-right corner
- Compact switch component (EN/中文)
- Persists selection across sessions

---

## Responsive Behavior

**Mobile (< 768px):**
- Bottom tab navigation
- Single column cards
- Full-width form inputs
- Horizontal scroll tables
- Stacked metric displays

**Tablet (768px - 1024px):**
- 2-column metric grids
- Side-by-side form layouts where appropriate
- Tab navigation may move to top

**Desktop (> 1024px):**
- 3-column summary metrics
- Side navigation or prominent top tabs
- Multi-column form layouts
- Full table visibility without scroll
- Chart/table side-by-side views

---

## Page-Specific Layouts

### Page 1: Investment Calculator
**Structure:**
1. Page header with title
2. Input form card (Product type, Amount, Rate slider for long-term)
3. Summary metrics grid (3-4 key values: Daily/Monthly/Total/Streaming Bonus)
4. "Calculate" CTA button
5. Results section with chart + expandable daily table
6. Streaming bonus release schedule visualization

### Page 2: Referral Rewards (Tabs)
**Tab 1 - Direct/Indirect:**
1. Input section for downline investments (up to 2 levels)
2. Calculation cards showing 20% and 10% rewards
3. Combined daily/monthly projections

**Tab 2 - Team Rewards:**
1. Current tier badge display
2. Requirements checklist for next tier
3. Team structure input (total performance, small area performance)
4. Reward calculation breakdown by tier
5. Projection chart for tier advancement

---

## Icons
**Library:** Heroicons (via CDN)
- Calculator icon: Investment page
- Users icon: Referral page  
- Star icon: Team rewards/tier badges
- Chart bar: Data visualization sections
- Lock/Unlock: Streaming bonus states
- Arrow trending up: Profit indicators

---

## Accessibility
- Minimum touch target: 44x44px on all interactive elements
- Form inputs with associated labels and aria-labels
- Tab navigation with keyboard support and focus indicators
- Table headers with scope attributes
- Color contrast ratios meeting WCAG AA standards (will be defined in color phase)
- Screen reader announcements for calculation results

---

This design creates a professional, data-focused financial calculator that prioritizes clarity and usability across all devices while maintaining visual consistency through Material Design principles.