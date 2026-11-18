# TASK · MD

# Task: Week calendar with event creation, editing, drag and resize

## Overview

Build a calendar view inspired by a well-known web calendar app. The reference behavior was captured in a screen recording of the real app. This task covers only the interactions observed in that recording.

The goal is a faithful, testable reimplementation: every behavior below has an objective success criterion and an automated check.

## Reference material

- `reference/screenshots/videoReference.mov`: screen recording of the reference app (week view, day view, create modal, overlapping events)

## Scope

| ID  | Behavior                                                                                   |
| --- | ------------------------------------------------------------------------------------------ |
| B1  | Week view and day view, with a toggle between them                                         |
| B2  | Create an item by clicking an empty time slot, which opens a modal                         |
| B3  | The modal lets the user set a title and choose a type: Event, Task or Appointment schedule |
| B4  | Edit an existing item (title and type)                                                     |
| B5  | Move an item to another time or another day by dragging it                                 |
| B6  | Change an item's duration by dragging its bottom edge                                      |
| B7  | Overlapping items are laid out according to which one starts first                         |
| B8  | Delete an item from its detail popup                                                       |

## Out of scope

Anything not observed in the recording, for example: month view, recurring events, reminders, guests, time zones, sync with a backend. Items are stored in client state (and optionally `localStorage`).

## Test setup (for deterministic checks)

- Tests run with a fixed clock (Playwright `page.clock`) so "today" and the visible week are always the same.
- Grid slots, items and controls expose `data-testid` attributes, for example `slot-2026-11-15-09:00`, `item-<id>`, `view-toggle-day`, `view-toggle-week`.

## Success criteria

### B1: Views

- **B1.1** The week view shows 7 day columns and one row per hour.
- **B1.2** Clicking "Day" shows a single column for the selected day. Clicking "Week" shows 7 columns again.
- **B1.3** Items created in one view are visible in the other view, at the same day and time.

### B2 and B3: Create

- **B2.1** Clicking the empty slot for Sunday 15 at 09:00 opens the create modal.
- **B2.2** The modal shows a title input and a type selector with exactly three options: Event, Task, Appointment schedule.
- **B3.1** Entering the title "Standup", choosing "Event" and saving closes the modal and renders an item titled "Standup" in the Sunday 15 column, from 09:00 to 09:30 (default duration: 30 minutes).
- **B3.2** Closing the modal without saving creates nothing.

### B4: Edit

- **B4.1** Clicking an existing item opens its detail popup. Clicking the title in the popup opens editing, which shows the current title and type pre-filled.
- **B4.2** Changing the title and saving updates the item in place. Its day, start time and duration do not change.
- **B4.3** Event, Task and Appointment schedule items are drawn in three different colors.

### B5: Move

- **B5.1** Dragging an item from Sunday 09:00 to Tuesday 14:00 places it on Tuesday starting at 14:00.
- **B5.2** The item keeps its original duration after moving.
- **B5.3** No other item changes position as a result of the move (unless the layout rule in B7 applies).
- **B5.4** Moving snaps to 15-minute steps: releasing between two steps sets the start to the nearest quarter hour.

### B6: Resize

- **B6.1** Dragging the bottom edge of a 09:00 item down to 11:00 makes it end at 11:00. Its start time stays at 09:00.
- **B6.2** The item's height in the grid matches its new duration.
- **B6.3** Resizing snaps to 15-minute steps: releasing the edge between two steps sets the end time to the nearest quarter hour (for example, 10:40 snaps to 10:45).
- **B6.4** The item's displayed time range updates to match (for example, "9 – 11am").

### B7: Overlap

Reference: the overlapping events in `reference/screenshots/videoReference.mov` ("Lunch" 1 – 2pm and "(Sin título)" 1 – 1:45pm on the same day).

- **B7.1** When two items overlap in time on the same day, both remain visible and clickable.
- **B7.2** The item that goes first is drawn behind, aligned to the left edge of the day column. In the reference, both items start at 1pm and the longer one ("Lunch", 1 hour) is the one behind.
- **B7.3** The other item is drawn on top of it (higher stacking order), shifted to the right so its left edge starts roughly halfway across the column.
- **B7.4** The item on top has a white outline that separates it visually from the item behind.
- **B7.5** Each item keeps its own color, title and time range, and the part of the item behind that is not covered (its left side and the rest of its duration) stays visible.

### B8: Delete

- **B8.1** Clicking an item opens its detail popup, which shows a trash icon.
- **B8.2** Clicking the trash icon removes the item immediately, with no extra confirmation step, and closes the popup.
- **B8.3** The deleted item no longer appears in either view.
- **B8.4** Deleting one item does not affect any other item.

## Verification

All criteria are covered by Playwright tests in `tests/`, one `describe` block per behavior ID (B1 to B8). Run:

```bash
npx playwright test
```

A task is considered complete only when every test passes against the fixed clock.

## Resolved questions

- **Q1. Move snapping:** dragging an item to another time snaps to 15-minute steps, same as resizing. (Verified: B5.4)
- **Q2. Overlap with different start times:** same rule as B7. The item that starts first is drawn behind, aligned left; the one that starts later is drawn on top, shifted right. (Verified by B7)
- **Q3. Editing:** in the detail popup, editing is opened by clicking the title (there is no separate edit icon). (Verified: B4.1)
- **Q4. Type differences:** Event, Task and Appointment schedule each have a distinct color. (Verified: B4.3)
