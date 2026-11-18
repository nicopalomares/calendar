# Test contract

The tests drive the UI only through `data-testid`s and the attributes below.
Any implementation that honors this contract can pass them. Fixed clock: **Wed 2026-11-18 10:00**
(visible week: Sun 15 – Sat 21 Nov 2026, week starts on Sunday).

| testid | What | Notes |
| --- | --- | --- |
| `view-toggle-week` / `view-toggle-day` | Toolbar buttons | Day view shows "today" (2026-11-18) |
| `day-column-YYYY-MM-DD` | One per visible day | 7 in week view, 1 in day view |
| `slot-YYYY-MM-DD-HH:00` | Hourly slot, 24 per day (`00:00`…`23:00`) | Clickable; all slots equal height; column = stack of slots |
| `item-<id>` | Item root | Attributes `data-start` / `data-end` = `YYYY-MM-DDTHH:mm` (local). Must be a descendant of its `day-column-*` |
| `title` / `time-range` | Inside an item | Empty title renders `(Sin título)`; range like `9 – 9:30am`, `1 – 2pm` (en dash) |
| `resize-handle` | Inside an item, at the bottom edge | |
| `create-modal`, `title-input`, `type-select` (native `<select>`), `save-button`, `close-modal` | Create / edit modal | Same modal is reused for edit |
| `popup`, `popup-title`, `popup-delete` | Item detail popup | `Escape` closes it |

Visual rules checked by computed style: overlap z-index (top item higher), top item has a white `outline` or `border`,
top item's left edge ≈ 40–60 % across the column.

## Resolved assumptions

- Editing is opened by clicking `popup-title` (Q3).
- Moving and resizing snap to 15 minutes (Q1); overlap layout follows B7 for any start times (Q2); each type has its own color (Q4).
- **B1.2**: the "selected day" in day view is today.
