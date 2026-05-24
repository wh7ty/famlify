# Mind

## Zweck

Dieses Dokument ist das laufende Projekt-Tagebuch fuer Famlify. Es soll bei jeder relevanten Arbeit am Projekt genutzt und aktualisiert werden, damit Entscheidungen, Kontext und naechste Schritte nicht verloren gehen.

## Arbeitsregel

- Vor groesseren Aenderungen kurz pruefen, was hier steht.
- Nach relevanten Entscheidungen, Implementierungsschritten oder Richtungswechseln dieses Dokument aktualisieren.
- Kurz und praktisch schreiben: Kontext, Entscheidung, Warum, Naechstes.
- `AGENTS.md` macht diese Regel projektlokal verbindlich: `mind.md` ist der lokale Memory-Skill fuer Famlify.
- `docs/design-system.md` ist der lokale Design-System-Skill fuer UI-Arbeit und muss vor UI-Design/Implementierung gelesen werden.

## Aktueller Kontext

- Ziel ist eine private Webapp nur fuer den Nutzer und seine Freundin.
- Spaeter soll sie live auf einer eigenen Webapp-Domain laufen, mit Datenbank, Login und nur zwei Accounts.
- Zuerst wird ein Prototyp gebaut.
- Der Prototyp muss vor allem auf Tablet und Mobile gut funktionieren; Desktop soll ebenfalls sauber nutzbar sein.
- Gewuenschte Richtung: ein privater Alltags-Hub mit Dashboard.
- Startansicht: "Heute"-Dashboard mit schnellen Alltagsinformationen und Aktionen.
- Moegliche Module: Aufgaben, Einkaufsliste, Termine, Notizen/Rezepte/Erinnerungen.
- Der Nutzer moechte `mind.md` als Skill-artige Arbeitsweise: bei jeder relevanten Arbeit anwenden und aktuell halten.
- Der Nutzer moechte ein Design-System, das immer angewendet wird, aehnlich wie shadcn/ui.
- Design-System wurde projektlokal in `docs/design-system.md` angelegt: shadcn-inspiriert, mobile-first, ruhig, warm, organisiert.
- shadcn/ui soll nach Moeglichkeit direkt eingebunden werden, sobald ein echtes React/Next/Vite-Projektgeruest erstellt wird.
- Projektgeruest wurde in `web/` erstellt: Next.js 16, React 19, TypeScript, Tailwind CSS 4, App Router, npm.
- shadcn/ui wurde in `web/` initialisiert mit `radix-nova`, Radix, Lucide, CSS-Variablen und Import-Alias `@/*`.
- Installierte shadcn-Komponenten: button, card, input, textarea, checkbox, badge, avatar, tabs, sheet, dialog, dropdown-menu, calendar, sonner.
- `npm.cmd run lint` in `web/` laeuft erfolgreich.
- Erste echte Vorschau wurde in `web/src/app/page.tsx` gebaut: "Heute"-Dashboard mit Sidebar/Desktop, Quick Actions, Summary Cards, Aufgaben, Einkaufsliste, Notiz und Mobile Bottom Nav.
- `web/src/app/globals.css` nutzt nun Famlify-Farbtokens statt neutralem shadcn-Default.
- `web/src/app/layout.tsx` nutzt lokale System-Fonts statt `next/font/google`, damit Builds ohne externen Font-Fetch funktionieren.
- shadcn `calendar.tsx` wurde fuer `react-day-picker` v10 angepasst: `table`-ClassName-Key durch `month_grid` ersetzt.
- `npm.cmd run lint` und `npm.cmd run build` in `web/` laufen erfolgreich.
- Lokale Vorschau laeuft bei Bedarf auf `http://localhost:3001`; Port 3000 war bereits von einer anderen lokalen App belegt.
- Die sichtbare Webapp-Sprache wurde auf Englisch umgestellt (`html lang="en"`, englische Dashboard-Copy und Metadaten).
- Shopping-List-Prototyp wurde interaktiv gemacht: Items abhaken, hinzufuegen, Menge setzen, Kategorie waehlen, loeschen und Fortschritt anzeigen. Aktuell nur lokaler React-State, keine Persistenz.
- Navigation wurde als klickbarer Prototype-State umgesetzt. Der fruehere "Lists"-Bereich heisst jetzt "Shopping" und zeigt eine eigene Shopping-Seite mit Header, Summary Cards, voller Shopping List, Store-Run-Kompaktansicht und House Favorites.
- Shopping-Ansicht hat jetzt eine mobile-first Quick-Add-Grid-Flaeche mit quadratischen Icon-Kacheln, inspiriert vom Interaktionsprinzip von Bring: Tippen auf ein Item fuegt es direkt zur Liste hinzu oder reaktiviert es. Keine Bring-Assets/Kopie.
- Quick-Add-Kacheln haben jetzt einen eigenen Check/Uncheck-Status fuer "in storage". Beim Check wird das Item als gekauft markiert und zeigt "Bought X days ago". Dazu kam eine "Recurring restock"-Visualisierung mit Fortschrittsbalken auf Basis von Restock-Intervallen.
- Shopping-Flow wurde neu aufgebaut: Favorites-Browse und Add-Favorite oben, Favorites als klickbare Square Cards, verbundene Square-Card-Bereiche fuer Shopping und Storage. Klick auf Shopping-Card markiert "bought" und verschiebt nach Storage mit Timestamp; Klick auf Storage-Card verschiebt zurueck in Shopping (needs restock).
- Compact-Squares wurden nachtraeglich auf Lesbarkeit optimiert: leicht mehr Innenabstand, Titeltext in Shopping/Storage auf `11px` mit staerkerem Kontrast, Statuschips fuer "bought ... ago" deutlicher hervorgehoben.

## Offene Entscheidungen

- Welche Module sind im ersten Prototyp sichtbar?
- Soll der Prototyp nur Mockdaten nutzen oder schon lokale Persistenz haben?
- Welcher visuelle Stil passt: ruhig/minimal, warm/persoenlich, oder eher produktiv/organisiert?
- Welche Technologie soll verwendet werden, falls ein echtes Projektgeruest erstellt wird?
- Welche Module sind in der ersten visuellen Vorschau konkret sichtbar?
- Soll die Shopping-Ansicht spaeter eine echte Route `/shopping` werden oder vorerst im Single-Page-Prototyp bleiben?
- Soll lokale Persistenz per `localStorage` als naechster Prototyp-Schritt kommen?

## Naechster Schritt

- Vorschau im Browser gemeinsam pruefen und dann iterieren.
- Mobile/Tablet-Feinschliff als naechsten UI-Schritt priorisieren.
- GitHub publish versucht: lokaler `origin` zeigt auf `https://github.com/wh7ty/famlify.git`, Push blockiert aktuell mit `Repository not found`/GitHub 404. Naechstes: Repo-Sichtbarkeit/Name/Auth auf GitHub pruefen, dann `git push -u origin main` erneut ausfuehren.
- Vercel deploy context: Next.js app liegt in `web/`; lokaler `npm run build` in `web/` laeuft erfolgreich. Vercel muss Root Directory `web` nutzen und die Supabase Public Env Vars gesetzt haben.
- Vercel CLI Deploy aus `web/` war erfolgreich: Production URL `https://web-omega-tan-70.vercel.app`, HTTP 200. Vercel UI-Fehler kam vom falschen/alten Projektkontext; CLI hat neues Projekt `web` korrekt als Next.js erkannt.

- Visual category split improved for compact cards: Shopping List cards now use amber surface + 'to buy' chip, Storage cards use emerald surface + stronger 'bought Xd ago' chip for clear state recognition at a glance.

- Anti-accidental interaction added on Shopping cards: first tap arms the card for 1.8s with visual state ('tap again'), second tap confirms purchase and moves item to Storage. No modal/pop-up to keep flow fast on mobile.

- Storage cards now also use two-tap confirmation (1.8s window): first tap shows 'tap again', second tap moves item back to Shopping. Interaction symmetry between Shopping and Storage is now consistent.

- Browse cards now show explicit insertion state beyond color: items already in Shopping render a visible 'In list' badge with check icon and helper text ('Already in shopping').

- Browse state wording updated: replaced 'In list' with 'Added' and helper text with 'Ready to buy' for a cleaner, less intrusive feel.

- Browse interaction extended: items already in Shopping now support double-tap remove (1.8s). First tap shows pending remove state ('Tap again'), second tap removes item from Shopping while keeping it in Favorites catalog.

- Added a subtle stats container under Storage cards (In stock / Bought today / Need soon) with low-contrast surface to bring quick inventory insight back without visual noise.

- Added new 'Recurring Shopping' container with always-needed items (milk, butter, olive oil, coffee). Items are tappable for quick re-add to Shopping and show lightweight status (in shopping / last bought).

- Added new 'Statistics' container with 3 compact ranges: Week, Month, and 6 Months. Values are computed from tracked bought timestamps and include a subtle total purchase counter.

- Statistics container upgraded to a detailed table view: rows for Week/Month/6 Months and columns for total plus category breakdown (Produce, Dairy, Pantry, Home) for clearer trend comparison.

- Statistics section now includes a detailed purchased-items table (item, category, bought Xd ago, current state in storage/shopping) sorted by most recent purchase.

- Statistics item table now tracks true buy frequency via per-item purchaseHistory. Detailed rows now show Week/Month/6 Months counts, total purchases per item, and last bought marker instead of a single-state snapshot.

- Added responsive mobile navigation: fixed bottom tab bar (Today, Shopping, Calendar, Notes) for reliable view switching on phone. Desktop sidebar remains for large screens.

- Browse Items control now remains visible on tablet (hidden only on desktop). Browse search + favorite grid are collapsible on mobile/tablet and stay always visible on desktop.

- Removed Calendar from this prototype: deleted Calendar navigation entry and view type, leaving Today/Shopping/Notes only.

- Added new page/view 'Dacia' (Schrebergarten): dedicated sections for Plants, Garden Tasks (checklist), and Notes & Todo. Added Dacia tab to navigation for mobile and desktop/tablet flows.

- Dacia page refined: plants now include visual icons per entry; Notes area now uses categorized note cards (Supplies, Watering, Planning) for faster scanning and structure.

- Upgraded Dacia Plants into an advanced management block: per-plant planted age, last watered, watering interval, due/on-track status, and quick 'Water now' action for daily garden operations.

- Added subtle settings entry points on Dacia cards: small muted settings icon buttons in Garden Tasks, Plants, and Notes headers for future configuration actions.

- Dacia archive UX refined: removed per-item Archive actions, added category-level 'Archive done' actions for Tasks/Plants/Notes with done checkboxes; added subtle per-item Edit icons across Tasks, Plants, and Notes.

- Statistics UX improved for mobile: replaced horizontal table scrolling with stacked card-style summary and item detail blocks on small screens; tables remain for tablet/desktop.

- Replaced per-item edit icon with subtle 3-dots action menu on Tasks, Plants, and Notes. Each item now opens dropdown actions (Edit, Archive, Delete) for consistent management patterns.

- Replaced 'Notes' navigation with 'Home' and created a dedicated Home page for flat management (Home Tasks, categorized Notes, and room/area status overview). Internal route state also renamed from notes -> home for consistency.

- Home page now has recurring tasks with automatic re-open logic. Each task has an interval (weekly, 2w, 3w, monthly); when marked done it stays completed until interval expires, then returns to open/due state automatically.

- Home recurring tasks refined: grouped by interval categories (1 week, 2 weeks, 3 weeks, 1 month, 3 months) and each task now has a 3-dot action menu for edit/mark-done actions.

- Home Tasks now has a top-right 'Add task' button with a compact on-demand form (title + repeat interval). Form stays hidden by default to keep UI from feeling overwhelming while still enabling quick task growth.

- Added Home 'Today Focus' prototype strip with fast daily metrics (Due today, Done this week, Recurring active). Built intentionally backend-agnostic to transition cleanly to Supabase later.

- Added universal Home Quick Capture (+): single entrypoint to add Task or Note fast. Tasks auto-infer repeat interval from text keywords (one-time/weekly/2w/3w/month/3m), notes auto-infer category (Supplies/Maintenance/Reminder/General).

- Added explicit 2-user section for private household setup: You (Owner) + Partner (Member). Visible in desktop sidebar and as a mobile Home card, ready for later Supabase auth linkage.

- Prototyped dedicated Users page and nav entry for 2-person household setup. Includes member cards (Owner/Member) and auth/access placeholders to prepare Supabase migration and live domain rollout.

- Mobile navigation updated: fixed 4-item bottom nav (Today, Shopping, Dacia, Home) plus new top mobile bar with hamburger menu for full-page access (including Users).

- Added prototype Recipes page + nav entry with quick filters, recipe cards, prep/serving info, and missing-ingredient handoff actions for Shopping flow.

- Recipes prototype now supports per-recipe thumbnail uploads from phone/local image picker. Added image upload action and live thumbnail preview on recipe cards.

- Recipes missing-ingredients UX changed to pill chips with double-tap interaction: first tap arms the pill, second tap adds that ingredient directly to Shopping list.

- Added a real Today Dashboard page as central app reference: quick overview cards for Shopping, Home, Dacia, Recipes, and Profile with live counts and one-tap navigation into each feature.

- Today Dashboard widgets were expanded with richer module detail: added a second detail grid with per-feature operational stats (Shopping, Home, Dacia, Recipes, Profile) for deeper at-a-glance context.

- Dashboard widgets now include subtle icons for faster scanning across all modules (Shopping, Home, Dacia, Recipes, Profile) in both primary and detail cards.
- Design direction changed: Magic UI is now the visual schema for the next rework. It should be used as a subtle premium enhancement layer on top of shadcn-style structure, especially for dashboard cards, animated lists, number/stat motion, and restrained borders/background texture.

- Magic UI installation started: added @magicui/globe via shadcn registry. Created src/components/ui/globe.tsx and installed required dependencies. Magic UI is now available as real component code, not only design schema.

- Dashboard reworked to the new Magic UI-inspired schema: added @magicui/number-ticker, a soft gradient status header, animated KPI numbers, richer clickable feature widgets, and a subtle household pulse section for cross-app signals.

- Top navigation reworked: added a compact "F" app logo, active-section indicator, tablet quick tabs, and a cleaner responsive hamburger menu while keeping the 4-item mobile bottom nav.

- Added a dedicated user/profile icon button to the top-right navbar next to the hamburger menu, linking directly to the Profile page.

- Bottom mobile navigation reworked into a floating 4-item app bar with stronger active pill state, softer inactive icons, equal touch targets, and a subtle gradient backdrop.

- Today dashboard header counters redesigned from plain mini stats into clickable status tiles with icons, contextual sublabels, and separate Shopping/Home/Dacia visual tones.

- Today dashboard header counters adjusted back to a persistent 3-column grid layout on mobile and desktop, keeping the redesigned status-tile styling.

- Shopping page reworked to the new Magic UI-inspired design schema: added a soft status hero with animated KPI tiles, redesigned Browse panel, distinct amber Shopping List state, distinct green Storage state, and cleaner Recurring/Statistics cards.

- Shopping rework second pass: tightened section padding, made Browse controls more app-like, upgraded Storage micro-metrics into tiles, and redesigned Statistics into responsive summary cards plus detailed tables only on large screens.

- Shopping Recurring and Statistics completed: Recurring Shopping now uses restock cards with queued/restock status and urgency bars; Statistics now uses analytics KPI tiles, responsive range cards, and item rhythm cards instead of feeling like the old table section.

- Shopping refinements: Browse Shopping Items upgraded into a command-panel style section; Recurring Shopping made denser with 2/3/4/6-column responsive grid; Statistics KPI tiles changed to a compact inline 3-column row.

- Recurring Shopping progress behavior corrected: bars now represent freshness/stock remaining, starting full after purchase and decreasing as days pass instead of increasing over time.

- Dacia page reworked to the new design schema: added garden hero with Tasks/Plants/Water Due KPIs, redesigned Tasks/Plants/Notes as distinct amber/green/sky modules, and added plant watering freshness bars.

- Recipes page reworked to the new design schema: added recipe hero with KPI tiles, polished quick filters, upgraded recipe cards with stronger media/meta/missing-pill hierarchy, and redesigned recipe details with image hero, compact gallery strip, ingredient cards, and timed step cards.

- Recipe item cards fully reworked: cards now use media-first preview layout with title overlay, compact action menu, four meta tiles, horizontal tags, dedicated missing-ingredients strip, and icon-only add-to-shopping action.

- Recipe detail navigation refined: on mobile/tablet, the top navbar changes into a Back to recipes control with the active recipe name; desktop keeps a detail-header back button because the top navbar is hidden there.

- Profile page reworked into a normal account page: profile hero, owner/user summary, partner access, account settings list, and calm private-household access details.

- Dashboard Household pulse reworked into a live status panel with three signal tiles, progress bars, and compact cross-app context for Shopping, Garden, and Recipes.

- User roles corrected: both people are owners/co-owners, not Owner + Member. Sidebar, dashboard profile details, and Profile page now reflect equal owner access.

- Supabase setup started: Codex config now points the Supabase MCP server at project_ref khqhgdfvrarbxslyvzug via remote MCP URL and enables remote_mcp_client_enabled. Supabase agent skills were installed locally under .agents/skills.

- Security check for Supabase credentials completed: no sbp tokens, service-role keys, Supabase access tokens, or .env secrets were found in the project. web/.gitignore already ignores .env* files. Codex config only stores the remote MCP URL with project_ref, not an API secret.

- Home Tasks live sync aligned with Shopping/Dacia: Home task completion now persists both `completed_by` and deterministic `completed_by_label`, and the UI reads the real synced Supabase values instead of old local-only `you/partner` placeholders. This makes the checked state and checker badge consistent across both accounts.
- Home Notes upgraded from static prototype cards to real shared CRUD: dedicated mobile-friendly add composer, inline edit mode, delete action, and more generous card padding for readability. Notes now save through `home_notes` and sync between both accounts through the existing Supabase realtime + polling path.
- Recipes now have a real full-page detail editor flow: `Add recipe` opens the detail editor, recipe-card 3-dot menu supports `Edit` and `Delete`, and recipe save replaces the related ingredient/step/missing-item rows in Supabase so both accounts stay synced on create/update/delete.
- Recipe delete bug fixed: the Recipes sync loader no longer re-seeds prototype recipes when the shared recipe table becomes empty, and local recipe state now starts empty instead of from `initialRecipes`. Deleting all recipes now stays deleted across sync refreshes.
- Push safety check completed before GitHub setup: no obvious secrets or service-role credentials were found in the tracked project files, `web/.env.local` remains local-only via ignore rules, and a root `.gitignore` was added so the whole `Famlify/` repo is safer to initialize and commit from the top level.

## Supabase Implementation Readiness

- Goal: move the current prototype from local React state into Supabase with real persistence, login, two-owner access, and live synchronization across two devices.

- Auth model: only two users, both equal owners/co-owners. Use Supabase Auth with email/password or magic-link style login. Authorization must not depend on user-editable metadata. Store role/access in an app table or app metadata controlled by backend/admin logic.

- Workspace model: create one shared household/workspace record. Both authenticated owner users are members of that workspace with role `owner`. All app data belongs to that workspace, not to isolated personal accounts.

- Security model: enable RLS on every exposed public table. Policies should allow access only when `auth.uid()` is a member/owner of the row's workspace. Do not expose service-role keys to the frontend. Frontend should use only publishable/anon client configuration through `.env.local`, which stays ignored by git.

- Core tables to plan:
  - `profiles`: auth user mirror, display name, avatar, created/updated timestamps.
  - `workspaces`: shared household record.
  - `workspace_members`: user/workspace membership and role (`owner` for both users).
  - `shopping_items`: favorite item library, category, icon, recurring flag, current status (`shopping`/`storage`/none), bought timestamps.
  - `shopping_purchase_events`: purchase history for statistics and recurring restock rhythm.
  - `home_tasks`: one-time and recurring flat tasks, interval days, completed state, completed by user, timestamps.
  - `home_notes` and possibly `home_areas`: categorized notes and area status.
  - `garden_tasks`, `garden_plants`, `garden_notes`: Dacia tasks, plant management, watering state, notes, archive state.
  - `recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_missing_items`, `recipe_images`: recipe storage, image metadata, shopping handoff.

- Live update strategy: prefer Supabase Realtime with Postgres Changes subscriptions per workspace/table. When one device changes shopping/storage/tasks/plants/recipes, the second device should receive the database change and update local UI immediately. Use optimistic UI locally, then reconcile with Supabase response/realtime event.

- Polling fallback: optional lightweight fallback only if Realtime disconnects, e.g. refetch active workspace data every 20-30 seconds after connection loss. Do not make polling the primary sync solution because it will feel delayed and can waste requests.

- Client architecture direction:
  - Create a Supabase browser client in the Next/React app.
  - Add auth/session provider.
  - Replace prototype arrays/state with hooks per domain: shopping, home, dacia, recipes, profile.
  - Each hook loads initial data, subscribes to relevant realtime channels, and exposes mutation functions.
  - Keep local optimistic state for fast mobile feel.

- Realtime channel shape:
  - one channel per workspace or domain, e.g. `workspace:{workspaceId}:shopping`, `workspace:{workspaceId}:home`, `workspace:{workspaceId}:dacia`, `workspace:{workspaceId}:recipes`.
  - subscribe to insert/update/delete events for tables filtered by workspace_id where possible.

- Storage direction: recipe photos should use Supabase Storage with a private bucket scoped by workspace. Use signed URLs or RLS-backed storage policies so only the two owners can access uploaded recipe photos.

- Migration workflow:
  - First design schema locally in SQL/migrations.
  - Apply with MCP/CLI only after MCP auth is working.
  - Run Supabase advisors/security checks after schema/RLS.
  - Generate TypeScript types from Supabase and use them in the app.

- Important next steps before implementation:
  - Restart/reload Codex so the new remote Supabase MCP config is active.
  - Authenticate Supabase MCP via `codex mcp login supabase` or the Codex `/mcp` flow.
  - Verify `/mcp` shows the real project ref `khqhgdfvrarbxslyvzug`.
  - Then create the database schema and RLS policies before connecting frontend writes.

## Supabase Local Implementation Progress

- Added initial Supabase migration at `supabase/migrations/202605210001_famlify_initial_schema.sql`.

- Migration includes:
  - shared workspace model with two equal `owner` users via `workspaces` and `workspace_members`
  - `profiles`
  - Shopping tables: `shopping_items`, `shopping_purchase_events`
  - Home tables: `home_tasks`, `home_notes`, `home_areas`
  - Dacia tables: `garden_tasks`, `garden_plants`, `garden_notes`
  - Recipe tables: `recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_missing_items`, `recipe_images`
  - `recipe-images` private Storage bucket and object policies
  - RLS enabled on every public app table
  - owner-only workspace RLS helper `public.is_workspace_owner`
  - Realtime publication entries for app tables so the frontend can subscribe to live changes across devices

- Added secure frontend setup:
  - `web/.env.example` contains only public placeholders: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `web/src/lib/supabase/client.ts` creates a browser client from public env vars
  - installed `@supabase/supabase-js` and `@supabase/ssr`

- Security notes:
  - no service-role key or personal access token is stored in the repo
  - `.env*` remains ignored by `web/.gitignore`
  - RLS policy for initial workspace membership was tightened so a user can only create their initial owner membership for a workspace they created, or manage memberships where they are already an owner

- Verification:
  - `npm run lint` passes with only existing Next image warnings in recipe image rendering
  - `npm audit --omit=dev` reports a moderate PostCSS advisory through Next.js; npm suggests `--force` which would downgrade/break Next, so do not apply blindly. Revisit by upgrading Next when a safe version is available.

- Blocker:
  - active Supabase MCP in this Codex session still points at placeholder `DEIN_PROJECT_REF`; local config is correct, but the session needs MCP reload/auth before applying migrations to the real project.

- Frontend Supabase connection configured locally: `web/.env.local` now contains the real project URL and publishable key. The file is ignored by git via `web/.gitignore`. A local Supabase client connection test succeeded with no active session, which is expected before auth/login is implemented.

- Supabase Auth gate implemented in the prototype:
  - `web/src/app/page.tsx` now creates a browser Supabase client from the gitignored env vars
  - the app checks the current session, listens to auth state changes, and shows an email/password sign-in or sign-up screen before the private app
  - sign out is available from the top nav and Profile page
  - no service-role key is used in the browser; this remains publishable-key-only client auth

- Continued Supabase implementation:
  - added an authenticated Data API grant block to the initial migration so public app tables are explicitly available to logged-in users while RLS still controls row access
  - added a Profile-page Supabase connection check that queries `profiles` after login and shows whether the database is connected, whether the schema migration is still pending, or whether a check failed
  - added authenticated workspace bootstrap logic: once the schema is live, the app upserts the logged-in user's profile, finds an existing owner workspace, or creates `Famlify Home` plus the initial owner membership
  - Profile now shows both Supabase connection status and household workspace status, including the active workspace id once available

- Login screen tightened for the private two-user app:
  - removed the "Need to create an owner account?" signup switch
  - browser auth now only signs in existing Supabase Auth users, so user creation stays controlled in Supabase/admin flow

- Home page redesigned into the newer visual schema:
  - added a soft glass-style Home hero with compact metrics for due tasks, done-this-week, and recurring tasks
  - reworked Quick Capture as its own highlighted module
  - updated Today Focus, Home Tasks, Notes, and Areas to match the newer dashboard/shopping/recipe card language with tinted sections, subtle rings, icons, and compact mobile-safe spacing

- Data safety / live sync requirement clarified:
  - current prototype still keeps many app items in React state, so this is not yet safe enough for real shared usage
  - production direction must make Supabase Postgres the single source of truth for Shopping, Home, Dacia, Recipes, notes, plants, images, and activity
  - every create/update/check/archive/delete action should write to Supabase first or optimistically with rollback, show a visible saving/saved/error status, and update the second user's device through Supabase Realtime Postgres changes
  - avoid hard deletes for important household data; prefer `archived_at`/soft delete plus activity history so accidental deletion is recoverable

- Started real persistence/live-sync implementation with Shopping:
  - added `activity_events` to the Supabase migration for audit/history of create/update/check/restock/archive/delete actions
  - Shopping now loads shared `shopping_items` and `shopping_purchase_events` from Supabase after workspace setup
  - if the shared shopping library is empty, the existing prototype favorites are seeded into Supabase once
  - Shopping actions now write to Supabase first: add to list, remove from list, mark bought, move back to shopping, create custom item
  - Shopping subscribes to Supabase Realtime Postgres changes for shopping tables and activity events, then refreshes the local UI when another device changes data
  - Shopping header now shows live sync state: local/loading/saving/saved/error

- Added global sync indicator to the top navigation:
  - derives status from database, workspace, and Shopping sync state
  - desktop shows status label plus short sync message
  - mobile shows a compact color dot
  - loading/saving states pulse so it is visible when sync work is happening

- Continued persistence/live-sync implementation with Home:
  - Home now loads shared `home_tasks` and `home_notes` from Supabase after workspace setup
  - if Home tables are empty, current prototype recurring tasks and notes are seeded once
  - Home Tasks actions now write to Supabase: check/uncheck, add task, archive completed tasks
  - Quick Capture now writes new tasks or notes to Supabase
  - Home subscribes to Supabase Realtime Postgres changes for `home_tasks`, `home_notes`, and `activity_events`
  - global sync indicator now combines Shopping and Home sync states, prioritizing error/saving/loading before synced

- Continued persistence/live-sync implementation with Dacia:
  - Dacia now loads shared `garden_tasks`, `garden_plants`, and `garden_notes` from Supabase after workspace setup
  - if Dacia tables are empty, current prototype tasks, plants, and notes are seeded once
  - Dacia actions now write to Supabase: water plant, archive/restore plants, archive/restore tasks, archive/restore notes
  - Dacia delete actions are treated as soft archive to reduce data-loss risk
  - Dacia subscribes to Supabase Realtime Postgres changes for `garden_tasks`, `garden_plants`, `garden_notes`, and `activity_events`
  - global sync indicator now combines Shopping, Home, and Dacia sync states

- Continued persistence/live-sync implementation with Recipes:
  - Recipes now loads shared `recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_missing_items`, and `recipe_images` metadata from Supabase
  - if recipe tables are empty, current prototype recipes, ingredients, steps, and missing items are seeded once
  - Recipes subscribes to Supabase Realtime Postgres changes for recipe tables and `activity_events`
  - double-tapping a missing ingredient now adds it to Shopping and removes the missing item from Supabase
  - global sync indicator now combines Shopping, Home, Dacia, and Recipes sync states
  - actual recipe photo upload/storage URL handling remains a follow-up because it needs the Supabase Storage bucket and upload flow tested after migration

- Supabase bootstrap fix after first real migration test:
  - user reported migration ran successfully and auth users exist, but sync badge stayed red with "Workspace setup failed"
  - root cause identified in RLS: `workspaces insert(...).select("id")` needs a SELECT policy before the initial `workspace_members` row exists
  - updated workspace SELECT policy in the migration to allow `created_by = auth.uid()` in addition to `is_workspace_owner(id)`
  - added safer Supabase error extraction in the frontend so PostgREST error objects show their real message instead of a generic fallback
  - follow-up real error showed profile/workspace insert RLS still blocked browser bootstrap, so workspace creation has been moved into a secured Postgres RPC `public.ensure_owner_workspace`
  - frontend now calls `ensure_owner_workspace` instead of manually upserting profile, inserting workspace, and inserting membership from the browser
  - user ran the RPC SQL in Supabase successfully (`Success. No rows returned`)
  - after reloading `http://localhost:3001/`, the global sync badge now shows `Saved` with "Shopping, Home, Dacia and Recipes are live"
  - browser console currently shows no Supabase errors; the app is connected enough for a two-device live-sync smoke test

- Fixed a Supabase UUID sync edge case:
  - user reported `invalid input syntax for type uuid: "carrots"`
  - root cause was old prototype slug ids (for example `carrots`) being used after Supabase migration, especially when recipe missing-ingredient pills add items back into Shopping
  - added a UUID guard plus `ensureShoppingItem(title)` so slug/draft items are first resolved to or created as real `shopping_items` rows before any Supabase update
  - recipe missing-pill flow now awaits that shared shopping item creation and keeps the UI using the persisted UUID
  - `npm run lint` passes with only the existing recipe `<img>` warnings; `npm run build` passes

- Improved custom Shopping item persistence:
  - "Add custom item" now uses the same `ensureShoppingItem(title)` path as recipe missing pills instead of doing its own direct insert
  - existing titles are reused instead of creating weak duplicate draft items
  - created/custom items are immediately added to local favorites and shopping state with the real Supabase UUID
  - `npm run lint` and `npm run build` pass; only the existing recipe `<img>` warnings remain

- Account sync issue identified:
  - if the second account previously bootstrapped its own workspace, `ensure_owner_workspace` returned that user's existing workspace instead of the shared household workspace
  - local migration updated so the first household workspace is always used and every authenticated user is added to it as owner
  - live database still needs the SQL repair/merge so existing rows from secondary workspaces are moved into the primary workspace

- Live sync reliability improvement:
  - user confirmed both accounts now share data, but changes do not appear live on the other account
  - kept Supabase Realtime subscriptions in place, but added a quiet 4-second polling fallback for Shopping, Home, Dacia, and Recipes
  - this makes the private two-user app reliably refresh across devices even if Realtime publication/subscription events are delayed or misconfigured
  - `npm run lint` and `npm run build` pass; only existing recipe `<img>` warnings remain

- Shopping list UX:
  - added a small `X` action on each Shopping List item card
  - the `X` removes the item from the current shopping list without marking it as bought or moving it into Storage
  - kept the main card tap behavior for double-tap bought confirmation
  - `npm run lint` and `npm run build` pass; only existing recipe `<img>` warnings remain

- Browse Shopping Items cleanup:
  - added a small `X` action to Browse Shopping Items cards
  - the `X` archives/removes the item from the shared shopping library and local UI
  - duplicate item names are normalized and blocked when adding custom items, so multiple entries like `Spezi` should not be created again
  - loaded shopping rows are also deduplicated by normalized title before rendering, hiding existing duplicate rows from the prototype period
  - `npm run lint` and `npm run build` pass; only existing recipe `<img>` warnings remain

- Browse Shopping Items toggle refinement:
  - replaced the mobile-only browse toggle with a shared `Browse items` control for mobile, tablet, and desktop
  - removed the label swap to `Hide items`; the button now keeps one stable label and only the chevron changes state
  - the browse/search area now cleanly opens and closes on all breakpoints

- Dacia task sync upgrade:
  - garden task checkboxes now save directly to Supabase through `completed_at` and `completed_by` instead of using a local-only done list
  - Dacia realtime plus the 4-second refresh fallback now carries checked task state across both user accounts
  - the archive action for Dacia tasks now derives from persisted completed tasks rather than temporary local checkbox state
  - checked Dacia tasks keep a small user badge so it is still visible who marked the task
