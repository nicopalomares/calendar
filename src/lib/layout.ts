import type { CalendarItem } from '../types';
import { minOf } from './time';

export interface Placement {
  /** 0 = drawn behind, aligned left; >0 = drawn on top, shifted right */
  lane: number;
  z: number;
}

/**
 * Overlap rule (B7): sort by start (longer first on ties). Each item takes the first lane
 * not used by an earlier overlapping item; later items are stacked above earlier ones.
 */
export function layoutDay(items: CalendarItem[]): Map<string, Placement> {
  const sorted = [...items].sort(
    (a, b) => minOf(a.start) - minOf(b.start) || minOf(b.end) - minOf(a.end),
  );
  const placed: { s: number; e: number; lane: number }[] = [];
  const out = new Map<string, Placement>();
  sorted.forEach((it, order) => {
    const s = minOf(it.start);
    const e = minOf(it.end);
    const used = new Set(placed.filter((p) => p.s < e && s < p.e).map((p) => p.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    placed.push({ s, e, lane });
    out.set(it.id, { lane, z: order + 1 });
  });
  return out;
}
