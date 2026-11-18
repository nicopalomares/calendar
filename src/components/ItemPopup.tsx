import { forwardRef } from 'react';
import type { CalendarItem } from '../types';
import { formatRange, minOf } from '../lib/time';

interface Props {
  item: CalendarItem;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ItemPopup = forwardRef<HTMLDivElement, Props>(function ItemPopup({ item, onEdit, onDelete, onClose }, ref) {
  return (
    <div className="popup" ref={ref} role="dialog" data-testid="popup">
      <div className="popup-actions">
        <button className="icon-btn" aria-label="Delete" data-testid="popup-delete" onClick={onDelete}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
        <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
      </div>
      <h2>
        <button type="button" className="popup-title" data-testid="popup-title" title="Edit" onClick={onEdit}>
          {item.title.trim() || '(Sin título)'}
        </button>
      </h2>
      <p className="muted">{item.start.slice(0, 10)} · {formatRange(minOf(item.start), minOf(item.end))}</p>
      <p className="muted">{item.type}</p>
    </div>
  );
});
