# IT Help Desk — Project Rules

## Architecture: MVVM

| Layer | Contains | Rules |
|---|---|---|
| **Model** (`models/`) | Types, enums, abstract repository classes, error types | No UI code |
| **Mock Backend** (`core/mock-backend/`) | MockDatabase, TicketWorkflowService, TicketAccessPolicy, Mock*Repository, seed data | Acts as "server". All repositories return Promises with simulated delay. |
| **ViewModel** (`*.view-model.ts`) | One @Injectable() per page, in page's `providers` | Exposes readonly signals + async commands. No DOM, no Material dialogs (use UiFeedbackService). |
| **View** (`*.page.ts`, `*.component.ts`) | Standalone components | Only binds ViewModel signals and calls methods. No business rules, no permission logic, no repository calls. |

## Ticket Workflow — Hard Rules

1. **Only `TicketWorkflowService` writes to tickets.** Nothing else.
2. **Only the ticket creator can close a ticket** (CONFIRM_RESOLUTION). Engineers and managers cannot.
3. Every ticket includes `allowedActions: TicketAction[]` computed by `TicketWorkflowService`. UI shows action buttons **only** from this list.
4. Resolution note (min 20 chars) required for SUBMIT_VERIFICATION.
5. Reopen reason (min 10 chars) required for REOPEN.
6. Every action recorded in activity timeline with actor name, role, timestamp.

## Statuses (exactly six)

OPEN → ASSIGNED → IN_PROGRESS → VERIFICATION → CLOSED
                                 VERIFICATION → REOPENED → ASSIGNED (cycle)
                                 CLOSED → REOPENED (within reopen window)

## Angular Conventions

- **Standalone components only** — no NgModules
- **ChangeDetectionStrategy.OnPush** everywhere
- Signal inputs: `input()` / `input.required()`
- Signal outputs: `output()`
- Control flow: `@if`, `@for`, `@switch`
- DI: `inject()` function
- **TypeScript strict mode** with `no-explicit-any`
- Lazy-loaded routes with functional guards
- Route params via `withComponentInputBinding()`

## Internationalization (i18n)

- **Transloco** (`@jsverse/transloco`) for all UI strings — never hardcode user-facing text.
- Translation files: `public/i18n/en.json`, `public/i18n/ar.json`.
- Use `{{ 'key.path' | transloco }}` in templates; `TranslocoService.translate()` in TypeScript.
- **RTL**: set `dir` and `lang` on `<html>` via `PreferencesStore`. Use CSS logical properties (`margin-inline-start`, `border-inline-end`, `padding-block`, etc.) — never physical `left`/`right` for layout.
- **Cairo** font for Arabic text (loaded via Google Fonts in `styles.scss`).
- When adding new UI strings, add keys to both `en.json` and `ar.json`.

## Theme & Preferences

- **PreferencesStore** (`core/preferences/preferences.store.ts`) — signal-based, persisted to localStorage.
- Three theme modes: `light`, `dark`, `system`. Applied via `html.dark-theme` / `html.light-theme` classes + `data-theme` attribute.
- Language toggle reloads the page to ensure Transloco fully re-renders.
- Sidebar collapsed state persisted; on mobile (<1024px) sidebar switches to overlay mode.

## Design Rules (Unslop)

- One neutral ramp + one accent color. No gradients, glows, or purple washes.
- Weights 400–500, 600 max. Sentence case everywhere.
- One icon set (Material Symbols), one size (18px).
- Borders: hairlines at 6–10% opacity.
- No looping animations, no transition-all, no bouncy springs.
- Charts: one accent per chart, muted grid, muted labels.
