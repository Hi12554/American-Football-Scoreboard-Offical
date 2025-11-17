# American Football Scoreboard - Design Guidelines

## Design Approach
**Hybrid Approach**: Combining broadcast sports aesthetics (ESPN, NFL Network) with Material Design's clear information hierarchy and interaction patterns. The design should evoke stadium energy while maintaining precise readability and intuitive controls.

## Core Design Elements

### Color Palette

**Dark Mode Primary** (Stadium Night Theme):
- Background: 220 15% 8% (deep charcoal, like nighttime stadium)
- Surface: 220 12% 12% (elevated panels)
- Primary Accent: 142 76% 45% (vibrant field green)
- Score Highlight: 45 93% 58% (touchdown gold)
- Error/Penalty: 0 84% 60% (penalty flag red)
- Text Primary: 0 0% 98%
- Text Secondary: 220 9% 65%

**Team Colors**: Support dynamic team color injection for customization (defaults: home team 220 90% 50% blue, away team 0 0% 95% white)

### Typography
- Primary Font: 'Rajdhani' (Google Fonts) - bold, athletic, excellent for large numbers
- Secondary Font: 'Inter' (Google Fonts) - clean controls and labels
- Score Display: 900 weight, 96-144px size
- Quarter/Time: 700 weight, 32-48px
- Down/Distance: 600 weight, 24-32px
- Control Labels: 500 weight, 14-16px

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 8, 12, 16 for consistent rhythm
- Scoreboard container: max-w-7xl, centered
- Main scoreboard panel: 16-unit vertical padding, 12-unit horizontal
- Control sections: 8-unit spacing between groups
- Button spacing: 2-unit gaps in button groups

### Component Library

**Scoreboard Display** (Top Section):
- Two-column team layout with center stats divider
- Team sections: Large team names (text-4xl), massive scores (text-9xl), possession indicator (animated football icon)
- Center stats: Quarter display, game clock (MM:SS format), timeout indicators
- Bottom stats bar: Down & Distance, Field Position (yard line), Ball On indicators
- Glass morphism effect on panels with subtle backdrop blur

**Control Panel** (Bottom Section):
- Grouped control sections with clear visual hierarchy
- Score Controls: Large ±1, ±3, ±6, ±7 buttons for each team
- Game Clock: Digital display with Start/Pause/Reset buttons, manual time adjustment
- Quarter Controls: 1st-4th Q buttons plus OT, highlight active quarter
- Down Controls: 1st-4th down selector, yards-to-go stepper, line of scrimmage tracker
- Possession Toggle: Switch ball indicator between teams
- Reset All: Prominent danger-styled button to reset entire game

**Button Styles**:
- Primary actions: Filled buttons with team colors, rounded-lg
- Increment/Decrement: Icon buttons (+ and - symbols), hover scale 105%
- Quarter selectors: Pill-shaped toggles, active state with green glow
- Reset/Danger: Outlined red with hover fill

### Animations

**Score Changes** (Keep Minimal):
- Score number: Scale pulse from 100% to 115% back to 100% over 400ms
- New score flash: Brief yellow glow overlay fading out over 600ms
- No confetti or excessive celebration effects

**Possession Changes**:
- Football icon: Slide transition (200ms ease) from one team to other
- Subtle rotation during slide for realism

**Game Clock**:
- Clock digits: Flip animation when minutes/seconds change (300ms)
- Running state: Subtle green pulse border on clock container

**Button Feedback**:
- Tap/click: Scale down to 95%, return to 100% (150ms)
- Hover: Brightness increase by 10%

### Responsive Behavior
- Desktop (lg:): Full two-column scoreboard, side-by-side controls
- Tablet (md:): Maintain layout but reduce font sizes by 15%
- Mobile: Stack scoreboard vertically, collapse controls into accordion sections, maintain tap target sizes (min 44px)

### Visual Enhancements
- Scoreboard background: Subtle radial gradient suggesting stadium lights
- Grid pattern overlay: Faint yard line pattern in background (5% opacity)
- Team sections: Animated border glow in team colors when score changes
- Control panel: Segmented sections with divider lines (green accent)

### Accessibility
- High contrast ratios maintained (WCAG AAA where possible)
- Large, readable fonts for scores and time
- Clear button labels and adequate spacing
- Focus indicators with 3px green outline on all interactive elements
- Keyboard navigation support for all controls