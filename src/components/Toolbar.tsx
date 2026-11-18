import type { ViewMode } from '../types';
import { monthLabel } from '../lib/time';

interface Props {
  view: ViewMode;
  focusDay: string;
  onView: (v: ViewMode) => void;
  onToday: () => void;
  onShift: (dir: -1 | 1) => void;
}

export function Toolbar({ view, focusDay, onView, onToday, onShift }: Props) {
  return (
    <header className="toolbar">
      <button className="btn" onClick={onToday}>Today</button>
      <button className="icon-btn" aria-label="Previous" onClick={() => onShift(-1)}>‹</button>
      <button className="icon-btn" aria-label="Next" onClick={() => onShift(1)}>›</button>
      <h1>{monthLabel(focusDay)}</h1>
      <div className="segmented">
        <button
          data-testid="view-toggle-day"
          className={view === 'day' ? 'active' : ''}
          aria-pressed={view === 'day'}
          onClick={() => onView('day')}
        >
          Day
        </button>
        <button
          data-testid="view-toggle-week"
          className={view === 'week' ? 'active' : ''}
          aria-pressed={view === 'week'}
          onClick={() => onView('week')}
        >
          Week
        </button>
      </div>
    </header>
  );
}
