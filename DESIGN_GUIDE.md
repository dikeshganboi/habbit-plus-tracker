# FocusLab - Visual Design Guide

This document describes the visual appearance and UI elements of the FocusLab application.

---

## 🎨 Color Palette

### Primary Colors

```
Background Colors:
├─ Pure Black       : #000000 (body background)
├─ Zinc-900         : #18181b (card backgrounds)
└─ Zinc-800         : #27272a (card borders, inputs)

Text Colors:
├─ White            : #ffffff (primary text)
├─ Zinc-400         : #a1a1aa (secondary text, labels)
└─ Zinc-500         : #71717a (disabled text)

Accent Colors:
├─ Indigo-600       : #4f46e5 (primary buttons, active states)
├─ Indigo-700       : #4338ca (button hover)
└─ Purple-600       : #9333ea (gradient accents)
```

### Functional Colors

```
Success/Habits:
├─ Orange-500       : #f97316 (habit gradient start)
├─ Red-500          : #ef4444 (habit gradient end)
├─ Emerald-500      : #10b981 (task gradient start, low priority)
└─ Teal-500         : #14b8a6 (task gradient end)

Priority Colors:
├─ Red-400          : #f87171 (high priority)
├─ Yellow-400       : #facc15 (medium priority)
└─ Emerald-400      : #34d399 (low priority)

State Colors:
├─ Emerald-500      : #10b981 (active indicator)
└─ Red-500          : #ef4444 (error states)
```

---

## 📱 Layout Structure

### Header

```
┌─────────────────────────────────────────────────────────────┐
│  [📦] FocusLab                             [●] Active       │
│  Background: zinc-900 | Border: zinc-800                     │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Tabs

```
┌─────────────────────────────────────────────────────────────┐
│  [🏠 Home]  [🎯 Habits]  [✅ Tasks]                         │
│  Active tab: indigo-600 border, white text                   │
│  Inactive tabs: transparent, zinc-400 text                   │
└─────────────────────────────────────────────────────────────┘
```

### Main Content Area

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Max Width: 1280px (7xl)                                     │
│  Padding: 4 (16px) on mobile, 6 (24px) on tablet, 8 (32px)  │
│  Background: black                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 Dashboard Tab Layout

```
╔═══════════════════════════════════════════════════════════╗
║                   WELCOME TO FOCUSLAB                      ║
║           Track your habits and manage tasks               ║
║  Background: Gradient (indigo-600 → purple-600)            ║
║  Padding: 8 (32px) | Rounded: 2xl (16px)                   ║
╚═══════════════════════════════════════════════════════════╝

┌───────────────────────────┐  ┌──────────────────────────┐
│  [📈] DAILY HABITS        │  │  [✓] TASKS               │
│                           │  │                          │
│  80%                      │  │  65%                     │
│  4/5 done                 │  │  13/20 done              │
│  ████████░░ (progress)    │  │  ██████░░░░ (progress)   │
│                           │  │                          │
│  Orange→Red gradient      │  │  Emerald→Teal gradient   │
└───────────────────────────┘  └──────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  [💬] "The secret of getting ahead is getting started."   │
│       Daily Motivation                                     │
│                                                            │
│  Background: zinc-900 | Border: zinc-800                   │
└───────────────────────────────────────────────────────────┘

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│    5    │ │    4    │ │   20    │ │   13    │
│  Total  │ │  Done   │ │  Total  │ │ Complete│
│ Habits  │ │  Today  │ │  Tasks  │ │  Tasks  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🎯 Habit Tracker Tab Layout

### Add Habit Form

```
┌───────────────────────────────────────────────────────────┐
│  [Input: Enter a new habit...]         [+ Add]            │
│  Background: zinc-900 | Rounded: 2xl                       │
└───────────────────────────────────────────────────────────┘
```

### Habit Card (Single Habit)

```
┌───────────────────────────────────────────────────────────┐
│  Morning Exercise              [🔥 3 day streak]    [🗑]  │
│  Weekly: 71%                                               │
│                                                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Mon │ │Tue │ │Wed │ │Thu │ │Fri │ │Sat │ │Sun │      │
│  │ 22 │ │ 23 │ │ 24 │ │ 25 │ │ 26 │ │ 27 │ │ 28 │      │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘      │
│  Completed: Gradient (indigo→purple)                       │
│  Incomplete: Gray (zinc-700)                               │
│  Today: Blue ring (indigo-400)                             │
└───────────────────────────────────────────────────────────┘
```

### Week Header

```
┌───────────────────────────────────────────────────────────┐
│  Current Week                        Nov 22 - Nov 28      │
└───────────────────────────────────────────────────────────┘
```

---

## ✅ Task Manager Tab Layout

### Statistics Row

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│     20     │  │     12     │  │      8     │
│   Total    │  │   Active   │  │ Completed  │
│   Tasks    │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘
```

### Add Task Form

```
┌───────────────────────────────────────────────────────────┐
│  [Input: Enter a new task...]                              │
│  [Dropdown: High/Medium/Low]  [+ Add]                      │
│  Background: zinc-900 | Rounded: 2xl                       │
└───────────────────────────────────────────────────────────┘
```

### Filter Tabs

```
┌───────────────────────────────────────────────────────────┐
│  [  All  ]  [ Active ]  [ Completed ]                     │
│  Active: indigo-600 background, white text                 │
│  Inactive: zinc-400 text                                   │
└───────────────────────────────────────────────────────────┘
```

### Task Card (High Priority)

```
┌───────────────────────────────────────────────────────────┐
│  [ ] Complete project presentation                         │
│      Nov 22, 2024                [⚠ High]           [🗑]  │
│                                                            │
│  Background: zinc-800 | Border: zinc-700                   │
│  Priority Badge: Red background, red text                  │
└───────────────────────────────────────────────────────────┘
```

### Task Card (Medium Priority)

```
┌───────────────────────────────────────────────────────────┐
│  [ ] Review code changes                                   │
│      Nov 22, 2024                [○ Medium]         [🗑]  │
│                                                            │
│  Priority Badge: Yellow background, yellow text            │
└───────────────────────────────────────────────────────────┘
```

### Task Card (Low Priority)

```
┌───────────────────────────────────────────────────────────┐
│  [ ] Update documentation                                  │
│      Nov 22, 2024                [✓ Low]            [🗑]  │
│                                                            │
│  Priority Badge: Green background, green text              │
└───────────────────────────────────────────────────────────┘
```

### Task Card (Completed)

```
┌───────────────────────────────────────────────────────────┐
│  [✓] Buy groceries                                         │
│      Nov 22, 2024                [○ Medium]         [🗑]  │
│                                                            │
│  Text: Strikethrough, zinc-500 color                       │
│  Opacity: 60%                                              │
└───────────────────────────────────────────────────────────┘
```

---

## 🔤 Typography

### Font Families

```
Primary: 'Inter'
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
Monospace: (not used in this app)
```

### Font Sizes

```
3xl: 1.875rem (30px) - Welcome banner heading
2xl: 1.5rem (24px)   - Section headings
xl:  1.25rem (20px)  - Large text
lg:  1.125rem (18px) - Card headings
base: 1rem (16px)    - Body text
sm:  0.875rem (14px) - Labels, secondary text
xs:  0.75rem (12px)  - Tiny labels, badges
```

### Font Weights

```
font-bold:    700 - Headings
font-semibold: 600 - Sub-headings
font-medium:   500 - Buttons, labels
font-normal:   400 - Body text
```

---

## 📐 Spacing & Sizing

### Border Radius

```
rounded-2xl: 16px  - Main cards
rounded-xl:  12px  - Smaller cards, buttons
rounded-lg:  8px   - Small elements, badges
rounded-full: 50%  - Circles (status dot)
```

### Padding

```
p-8: 32px - Large cards (Dashboard cards)
p-6: 24px - Regular cards (Habit/Task cards)
p-4: 16px - Small cards, buttons
p-3: 12px - Compact elements
p-2: 8px  - Very tight spacing
```

### Gaps (Space Between Elements)

```
space-y-6: 24px - Main content sections
space-y-4: 16px - Card lists
space-y-3: 12px - Form elements
space-y-2: 8px  - Labels and inputs
gap-6: 24px     - Grid columns
gap-4: 16px     - Grid items
gap-3: 12px     - Button groups
gap-2: 8px      - Small groups
```

### Margins

```
mb-4: 16px - Below headings
mb-3: 12px - Below sub-headings
mb-2: 8px  - Below labels
mt-1: 4px  - Above small text
```

---

## 🎭 Interactive States

### Button States

```
Default:
  bg-indigo-600, text-white, px-6, py-3, rounded-xl

Hover:
  bg-indigo-700, scale-105 (subtle), cursor-pointer

Active/Pressed:
  bg-indigo-800, scale-95

Disabled:
  bg-zinc-700, text-zinc-500, cursor-not-allowed, opacity-50
```

### Input States

```
Default:
  bg-zinc-800, border-zinc-700, text-white

Focus:
  border-indigo-600, outline-none, ring-2 ring-indigo-600

Disabled:
  bg-zinc-900, text-zinc-600, cursor-not-allowed
```

### Card States

```
Default:
  border-zinc-800

Hover:
  border-zinc-700, cursor-pointer (if clickable)

Active/Selected:
  border-indigo-600
```

---

## 🌈 Gradient Definitions

### Habit Progress Bar

```css
background: linear-gradient(to right, #f97316, #ef4444);
/* Orange 500 → Red 500 */
```

### Task Progress Bar

```css
background: linear-gradient(to right, #10b981, #14b8a6);
/* Emerald 500 → Teal 500 */
```

### Welcome Banner

```css
background: linear-gradient(to right, #4f46e5, #9333ea);
/* Indigo 600 → Purple 600 */
```

### Completed Habit Day Button

```css
background: linear-gradient(to bottom right, #4f46e5, #9333ea);
/* Indigo 600 → Purple 600 */
```

### Logo/Branding

```css
background: linear-gradient(to bottom right, #4f46e5, #9333ea);
/* Indigo 600 → Purple 600 */
```

---

## 🔘 Button Styles

### Primary Button (Add, Submit)

```
Classes: bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3
         rounded-xl font-medium transition-all
Size: 48px height
Icon: Plus (20px)
```

### Icon Button (Delete, Close)

```
Classes: text-zinc-500 hover:text-red-500 transition-colors
Size: 40x40px clickable area
Icon: Trash2, X (18px)
```

### Tab Button (Navigation)

```
Active:
  Classes: border-b-2 border-indigo-600 text-white px-4 py-4
Inactive:
  Classes: border-b-2 border-transparent text-zinc-400
           hover:text-white hover:border-zinc-700 px-4 py-4
```

### Day Toggle Button (Habit Grid)

```
Completed:
  Classes: bg-gradient-to-br from-indigo-600 to-purple-600
           text-white shadow-lg
Incomplete:
  Classes: bg-zinc-700 text-zinc-400 hover:bg-zinc-600
Today:
  Additional: ring-2 ring-indigo-400
```

### Filter Button (Task Filters)

```
Active:
  Classes: bg-indigo-600 text-white rounded-lg px-4 py-2
Inactive:
  Classes: text-zinc-400 hover:text-white hover:bg-zinc-800
           rounded-lg px-4 py-2
```

---

## 📦 Component Dimensions

### Cards

```
Large Card (Dashboard):     Full width, p-8, rounded-2xl
Regular Card (Habit/Task):  Full width, p-6, rounded-2xl
Form Card:                  Full width, p-6, rounded-2xl
Stat Card:                  Auto width, p-4, rounded-xl
```

### Inputs

```
Text Input:     h-12 (48px), px-4, rounded-xl
Dropdown:       h-12 (48px), px-4, rounded-xl
Checkbox:       w-6 h-6 (24x24px), rounded-lg
```

### Icons

```
Navigation Icons: 20px
Action Icons:     18px
Status Icons:     16px
Badge Icons:      14px
```

---

## 🎯 Priority Badge Styles

### High Priority

```
Background: bg-red-500/20 (20% opacity)
Text: text-red-400
Border: border-red-500/50
Icon: AlertCircle (14px)
Size: px-3 py-1, text-xs, rounded-lg
```

### Medium Priority

```
Background: bg-yellow-500/20
Text: text-yellow-400
Border: border-yellow-500/50
Icon: Circle (14px)
Size: px-3 py-1, text-xs, rounded-lg
```

### Low Priority

```
Background: bg-emerald-500/20
Text: text-emerald-400
Border: border-emerald-500/50
Icon: CheckCircle2 (14px)
Size: px-3 py-1, text-xs, rounded-lg
```

---

## 🔄 Animations & Transitions

### Standard Transition

```css
transition: all 0.2s ease-in-out;
```

### Hover Scale

```css
transform: scale(1.05);
transition: transform 0.2s;
```

### Active Press

```css
transform: scale(0.95);
```

### Loading Spinner

```css
animation: spin 1s linear infinite;
```

### Pulse Animation (Status Dot)

```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)

```
- Single column layout
- Full width cards
- Stack navigation on top
- Hide some labels
- Smaller padding (p-4)
```

### Tablet (640px - 1024px)

```
- 2 column grid for stats
- Medium padding (p-6)
- Show all navigation
```

### Desktop (> 1024px)

```
- Multi-column layouts
- Max width 1280px centered
- Large padding (p-8)
- Hover effects enabled
```

---

## 🌟 Special Effects

### Glow Effect (Buttons on Hover)

```css
box-shadow: 0 0 20px rgba(79, 70, 229, 0.5);
```

### Card Shadow

```css
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Progress Bar Fill Animation

```css
transition: width 0.5s ease-in-out;
```

### Custom Scrollbar

```css
/* Track */
::-webkit-scrollbar-track {
  background: #18181b;
}

/* Thumb */
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}

/* Hover */
::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
```

---

## 🎨 Dark Mode Consistency

All elements maintain consistent dark theme:

- No white backgrounds (except text)
- All cards have zinc-900 backgrounds
- All borders are zinc-800 or darker
- Hover states lighten by 1 shade
- Focus states use indigo accent
- Disabled states use zinc-600+

---

This design guide ensures consistent, beautiful, dark-mode UI throughout FocusLab! 🌙✨
