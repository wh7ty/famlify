# Famlify Design System

## Purpose

Use this design system for every Famlify UI decision. It is inspired by shadcn/ui and now uses Magic UI as the visual style layer: composable components, clear variants, accessible primitives, soft motion, subtle interactive surfaces, and predictable responsive behavior.

Famlify is a private daily-life app for two people. The UI should feel calm, intimate, quick to scan, and practical on mobile and tablet.

## Product Feel

- Private, warm, organized, and lightweight.
- Useful first, decorative second.
- Mobile-first dashboard experience, not a marketing site.
- Dense enough for daily use, but not cramped.
- Soft personal details are allowed; avoid cute overload.
- Magic UI influence should feel premium and alive, but never like a landing page.

## Core Principles

- Build from reusable components: `Button`, `Card`, `Input`, `Dialog`, `Sheet`, `Tabs`, `Badge`, `Avatar`, `Checkbox`, `Textarea`, `Calendar`, `Toast`.
- Use Magic UI components selectively as enhancement layers, not as decoration everywhere.
- Use variants instead of one-off styles: `default`, `secondary`, `ghost`, `destructive`, `outline`.
- Prefer accessible primitives and keyboard-friendly interactions.
- Use clear visual hierarchy: page title, section title, item title, metadata, action.
- Keep cards shallow. Do not put cards inside cards.
- Favor bottom sheets and drawers on mobile; use dialogs or side panels on tablet/desktop.
- Use icons for repeated actions: add, edit, delete, check, calendar, list, note, search, filter.

## Layout Rules

- Design mobile first at `360px`.
- Tablet target is `768px-1024px`.
- Desktop should expand into columns, not stretch single columns too wide.
- Use a persistent bottom navigation on mobile.
- Use a left sidebar or compact top navigation on tablet/desktop.
- Keep primary actions reachable with one thumb on mobile.
- Use fixed-height toolbars and stable list rows to prevent layout shift.

## Spacing

- Base spacing: `4px`.
- Common gaps: `8px`, `12px`, `16px`, `24px`.
- Screen padding:
  - Mobile: `16px`
  - Tablet: `24px`
  - Desktop: `32px`
- Card padding:
  - Compact: `12px`
  - Default: `16px`
  - Large: `20px`

## Radius

- Component radius: `8px`.
- Small controls: `6px`.
- Full round only for avatars, icon buttons, and toggles.
- Avoid very large pill shapes unless the control is intentionally compact and icon-led.

## Typography

- Use a readable sans-serif for the app shell.
- Avoid oversized hero typography inside the app.
- Dashboard title: `24-30px`.
- Section title: `16-18px`.
- Body text: `14-16px`.
- Metadata: `12-13px`.
- Letter spacing: `0`.

## Color Direction

Start with a neutral light interface and a small set of warm accents.

- Background: soft off-white, not beige-heavy.
- Surface: white or near-white.
- Text: high-contrast charcoal.
- Muted text: cool gray.
- Primary accent: warm green or blue-green.
- Secondary accent: muted rose or amber for personal notes and highlights.
- Destructive: clear red, used sparingly.

Avoid a one-note palette. Do not let the app become all beige, all purple, all dark blue, or all brown.

## Magic UI Style Layer

Magic UI is the new design schema for the prototype rework.

- Use `Magic Card` or similar subtle surface effects for dashboard widgets and major feature cards.
- Use `Number Ticker`-style motion for dashboard/statistic numbers.
- Use `Animated List` behavior for activity, tasks, recent actions, and recipe/shopping events.
- Use `Shine Border` or `Border Beam` only for one important active state per view, not for every card.
- Use `Dot Pattern`, `Noise Texture`, or soft pattern backgrounds only as low-opacity app atmosphere.
- Avoid flashy Magic UI effects like heavy gradients, meteors, orbiting circles, or decorative animation unless the screen specifically benefits from it.
- Motion should be calm: short, purposeful, and tied to state changes such as added, bought, done, archived, or opened.
- Keep the interface operational: dashboards, lists, forms, cards, and navigation remain the core.

## Rework Rules

- Rework page by page, not randomly.
- Start with the shell: background, sidebar/topbar, mobile bottom nav, cards.
- Then apply the schema to Today Dashboard, Shopping, Home, Dacia, Recipes, and Profile.
- Every page should share the same surface language: soft card, subtle border, light motion, clear icon-led headers.
- Mobile remains the priority. Effects must not make mobile feel slower or busier.

## Component Behavior

- Buttons: icon plus short label for important actions; icon-only for repeated toolbar actions with tooltip.
- Forms: labels above fields, inline validation, clear disabled/loading states.
- Lists: checkbox or status control on the left, main text center, quick action on the right.
- Empty states: short, useful text plus one action.
- Loading states: skeleton rows/cards, not spinners as the main layout.
- Error states: explain what failed and offer retry when possible.

## Famlify-Specific Components

- `TodayHeader`: greeting, date, small profile pair.
- `QuickAddBar`: fast actions for task, grocery, note, event.
- `TodaySummary`: compact cards for urgent tasks, next event, shopping count.
- `TaskList`: shared tasks with owner, due state, completion.
- `GroceryList`: grouped shopping items with checked state.
- `NotePreview`: latest note or pinned household note.
- `MobileNav`: Today, Lists, Calendar, Notes, Settings.

## Responsive Pattern

- Mobile: single-column dashboard, bottom nav, quick-add sticky near bottom or top.
- Tablet: two-column dashboard, navigation rail or sidebar, side sheet for editing.
- Desktop: centered max-width content, optional three-column dashboard, avoid empty stretched space.

## Implementation Preference

If the project uses React/Next.js, prefer shadcn/ui-style components with Tailwind tokens and accessible primitives. If shadcn/ui is installed, use it directly. If not, build local components with the same API style and token discipline.

Always update this file when the visual system changes in a meaningful way.
