import { useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import type { CalendarItem } from '../types';
import { SNAP_MIN } from '../types';
import {
  HOUR_H, MINUTES_PER_DAY, dayLabel, dayOf, formatRange, makeTs, minOf, pad,
} from '../lib/time';
import { layoutDay } from '../lib/layout';

// True for the instant after a drag ends, so the click that follows mouseup is ignored.
let suppressClick = false;

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const hourLabel = (h: number) => (h === 0 ? '' : `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`);

interface Props {
  days: string[];
  today: string;
  items: CalendarItem[];
  onSlotClick: (day: string, time: string) => void;
  onItemClick: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<CalendarItem, 'id'>>) => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const snap = (min: number) => Math.round(min / SNAP_MIN) * SNAP_MIN;

/** Day (data-day) of the column closest to a horizontal position. */
function dayAtX(x: number, fallback: string) {
  let best = fallback;
  let bestDist = Infinity;
  document.querySelectorAll<HTMLElement>('[data-day]').forEach((col) => {
    const r = col.getBoundingClientRect();
    const dist = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
    if (dist < bestDist) {
      bestDist = dist;
      best = col.dataset.day!;
    }
  });
  return best;
}

export function Grid({ days, today, items, onSlotClick, onItemClick, onUpdate }: Props) {
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const d of days) map.set(d, []);
    for (const it of items) map.get(dayOf(it.start))?.push(it);
    return map;
  }, [days, items]);

  function begin(e: ReactMouseEvent, item: CalendarItem, mode: 'move' | 'resize') {
    if (e.button !== 0) return;
    e.preventDefault();
    if (mode === 'resize') e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const day0 = dayOf(item.start);
    const s0 = minOf(item.start);
    const e0 = minOf(item.end);
    let moved = false;

    const onMove = (ev: MouseEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4) return;
      moved = true;
      const dMin = snap(((ev.clientY - startY) / HOUR_H) * 60);
      if (mode === 'resize') {
        const end = clamp(e0 + dMin, s0 + SNAP_MIN, MINUTES_PER_DAY);
        onUpdate(item.id, { end: makeTs(day0, end) });
      } else {
        const dur = e0 - s0;
        const start = clamp(s0 + dMin, 0, MINUTES_PER_DAY - dur);
        const day = dayAtX(ev.clientX, day0);
        onUpdate(item.id, { start: makeTs(day, start), end: makeTs(day, start + dur) });
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (moved) {
        suppressClick = true;
        setTimeout(() => (suppressClick = false), 0);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  return (
    <div className="calendar" style={{ ['--cols' as string]: days.length }}>
      <div className="cal-head">
        <div className="gutter-spacer" />
        {days.map((d) => {
          const { weekday, date } = dayLabel(d);
          return (
            <div key={d} className={`day-head${d === today ? ' today' : ''}`}>
              <span className="dow">{weekday}</span>
              <span className="dom">{date}</span>
            </div>
          );
        })}
      </div>
      <div className="cal-body">
        <div className="gutter">
          {HOURS.map((h) => (
            <div key={h} className="hour-label" style={{ height: HOUR_H }}>
              <span>{hourLabel(h)}</span>
            </div>
          ))}
        </div>
        {days.map((d) => {
          const placements = layoutDay(byDay.get(d) ?? []);
          return (
            <div key={d} className="day-column" data-testid={`day-column-${d}`} data-day={d}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="slot"
                  style={{ height: HOUR_H }}
                  data-testid={`slot-${d}-${pad(h)}:00`}
                  onClick={() => onSlotClick(d, `${pad(h)}:00`)}
                />
              ))}
              {(byDay.get(d) ?? []).map((it) => {
                const s = minOf(it.start);
                const e = minOf(it.end);
                const { lane, z } = placements.get(it.id)!;
                const left = lane === 0 ? 0 : 50 + (lane - 1) * 10;
                return (
                  <div
                    key={it.id}
                    className={`item type-${it.type.split(' ')[0].toLowerCase()}`}
                    data-testid={`item-${it.id}`}
                    data-start={it.start}
                    data-end={it.end}
                    style={{
                      top: (s / 60) * HOUR_H,
                      height: ((e - s) / 60) * HOUR_H,
                      left: `${left}%`,
                      width: `${100 - left}%`,
                      zIndex: z,
                    }}
                    onMouseDown={(ev) => begin(ev, it, 'move')}
                    onClick={() => {
                      if (suppressClick) return;
                      onItemClick(it.id);
                    }}
                  >
                    <div className="item-text">
                      <span className="item-title" data-testid="title">{it.title.trim() || '(Sin título)'}</span>
                      <span className="item-time" data-testid="time-range">{formatRange(s, e)}</span>
                    </div>
                    <div className="resize-handle" data-testid="resize-handle" onMouseDown={(ev) => begin(ev, it, 'resize')} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
