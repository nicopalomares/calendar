# Week Calendar

A week/day calendar inspired by a well-known web calendar app, built with React, TypeScript and Vite. Items live in client state only (no backend).

## Features

- **Week and day views**, switchable from the toolbar
- **Create** an item by clicking an empty time slot (title + type: Event, Task or Appointment schedule)
- **Edit** by clicking an item, then clicking its title in the popup
- **Move** items by dragging them to another time or day (snaps to 15 minutes)
- **Resize** by dragging the bottom edge (snaps to 15 minutes)
- **Overlap layout**: the item that starts first is drawn behind on the left, the other on top, shifted right with a white outline
- **Delete** from the popup's trash icon
- Each type has its own color

## Getting started

Requires Node ≥ 20.

```bash
npm install
npx playwright install chromium
npm run dev       # http://localhost:5173
```

## Scripts

| Command            | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server                           |
| `npm run build`    | Type-check and build for production                 |
| `npm run preview`  | Serve the production build                          |
| `npm test`         | Run the Playwright tests (starts the dev server)    |
| `npm run test:ui`  | Run the tests in Playwright's UI mode               |

## Project structure

```
src/
  components/   Grid, Toolbar, CreateModal, ItemPopup
  lib/          time helpers and the overlap layout rule
  state/        useItems (client state)
  types.ts      CalendarItem and constants
tests/          Playwright specs, one file per behavior (B1–B8)
reference/      screen recording of the reference app
```

## Docs

- [task.md](task.md): the behavior spec and success criteria (B1–B8)
- [tests/README.md](tests/README.md): the `data-testid` contract used by the tests

Tests run against a fixed clock (Wed 2026-11-18), so the visible week is always Sun 15 – Sat 21 Nov 2026.
