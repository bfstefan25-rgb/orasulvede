# OrasulVede — Project Rules

## Tech Stack
- React 19 + Vite + Tailwind CSS
- Supabase (auth & database)
- React Router v7, React Hook Form, Lucide icons
- Dark mode via `class` strategy on `<html>`

## Design Philosophy — Mobile First, Always

Every component, page, and layout **must be designed for mobile screens first** (360px baseline), then progressively enhanced for tablet (768px) and desktop (1024px+).

### Layout Rules
- Default styles target mobile. Use `md:` and `lg:` breakpoints to add desktop enhancements — never the other way around.
- Max content width: `max-w-lg` on mobile, `max-w-2xl` on tablet, `max-w-6xl` on desktop where appropriate.
- Generous touch targets: all interactive elements must be at least 44px tall on mobile.
- Bottom navigation is the primary nav on mobile; top navbar is for `md:` and above.
- Reserve 80px bottom padding on mobile pages to clear the fixed bottom nav.
- Single-column layouts on mobile. Multi-column grids only at `md:` or above.

### Spacing & Typography
- Use Tailwind spacing scale consistently: `p-4` / `gap-4` as the base mobile spacing.
- Body text: `text-sm` (14px) on mobile, `text-base` (16px) on `md:`.
- Headings: `text-xl` on mobile, `text-2xl` / `text-3xl` on `md:`.
- Keep line lengths readable — never wider than `max-w-prose` for text blocks.

### Accent Color — Blue
The primary accent is Tailwind blue, defined in `tailwind.config.js`:
- **primary-500**: `#3b82f6` — default interactive elements, links, icons
- **primary-600**: `#2563eb` — buttons, active states, CTA backgrounds
- **primary-700**: `#1d4ed8` — hover states on buttons
- **primary-50**: `#eff6ff` — light tinted backgrounds (light mode)
- **primary-100**: `#dbeafe` — subtle highlights
- Dark mode accent tints: use `blue-900/40` or `blue-900/30` for tinted backgrounds.

Use `primary-*` tokens from the config, not raw `blue-*` classes, so the palette is easy to change later.

### Component Patterns
- **Buttons**: Rounded (`rounded-xl`), full-width on mobile (`w-full`), auto-width on desktop. Primary buttons use `bg-primary-600 text-white hover:bg-primary-700`. Minimum height `h-12` on mobile.
- **Cards**: `rounded-2xl`, `shadow-sm`, `p-4` on mobile / `p-6` on desktop. White bg in light mode, `bg-gray-800` in dark mode.
- **Inputs**: `rounded-xl`, `h-12`, `text-base` (prevents iOS zoom), full-width. Border `border-gray-300 dark:border-gray-600`, focus ring `focus:ring-2 focus:ring-primary-500`.
- **Lists / Feeds**: Vertical stack with `gap-3` on mobile. No horizontal scroll unless it's an intentional carousel.
- **Modals / Sheets**: Use bottom sheets on mobile (slide up from bottom), centered modals on desktop.

### Dark Mode
- Always provide dark variants for backgrounds, text, and borders.
- Light bg: `bg-white` / Dark bg: `bg-gray-900` or `bg-gray-800` for cards.
- Light text: `text-gray-900` / Dark text: `dark:text-gray-100`.
- Borders: `border-gray-200 dark:border-gray-700`.

### UX Principles
- **Thumb-friendly**: Place primary actions in the bottom half of the screen on mobile.
- **Minimal taps**: Reduce the number of steps to complete any action.
- **Instant feedback**: Show loading spinners, skeleton screens, or optimistic UI on every async action.
- **Clean whitespace**: Don't cram elements — let the UI breathe with consistent spacing.
- **No horizontal overflow**: Nothing should cause horizontal scroll on mobile.
- **Progressive disclosure**: Show essential info first, details on tap/expand.

### Do NOT
- Use fixed pixel widths that break on small screens.
- Use desktop-first breakpoints (`max-w` media queries).
- Add hover-only interactions with no touch/tap equivalent.
- Use text smaller than 12px anywhere.
- Use padding/margin smaller than 8px (0.5rem) between interactive elements.
- Create layouts that require pinch-to-zoom to be usable.
